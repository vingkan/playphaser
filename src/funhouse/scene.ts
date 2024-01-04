import { Direction, GridEngine, GridEngineConfig, CharacterData } from "grid-engine"
import * as Phaser from "phaser"
import {
    PLAYER_ID,
    PLAYER_SCALE,
    SCALE,
    PLAYER_SPRITE_SETTINGS,
    Facing,
} from "./utils"

export class GameScene extends Phaser.Scene {
    gridEngine!: GridEngine
    music?: MusicConfig
    world: WorldConfig
    tiles: TileConfig
    startCharLayer: string
    startPosition: PositionDict = { x: 0, y: 0 }
    sceneInteractionMap: SceneInteractionMap = {}
    pressedKey: string | null = null
    playerSprite: Phaser.GameObjects.Sprite
    currentMap: PositionDict
    currentTileMaps: Phaser.Tilemaps.Tilemap[] = []

    constructor(config: {
        key: string,
        music?: MusicConfig,
        world: WorldConfig,
        tiles: TileConfig,
        startCharLayer: string,
        startPosition: PositionDict,
        startMap: PositionDict,
        sceneInteractionMap: SceneInteractionMap
    }) {
        super({
            key: config.key,
            active: false,
            visible: false,
        })
        this.music = config.music
        this.world = config.world
        this.tiles = config.tiles
        this.startCharLayer = config.startCharLayer
        this.startPosition = config.startPosition
        this.currentMap = config.startMap
        this.sceneInteractionMap = config.sceneInteractionMap
    }

    preload() {
        const scene = this

        scene.tiles.tileSets.forEach((ts) => scene.load.image(ts.path, ts.path))
        for (let x = 0; x < scene.world.width; x++) {
            for (let y = 0; y < scene.world.height; y++) {
                const key = `${x}-${y}`
                const path = `${scene.world.path}/${key}.json`
                scene.load.tilemapTiledJSON(key, path)
            }
        }

        scene.load.spritesheet(PLAYER_ID, PLAYER_SPRITE_SETTINGS.path, PLAYER_SPRITE_SETTINGS.size)

        if (scene.music) {
            scene.load.audio(scene.music.path, scene.music.path)
        }

        scene.preloadThen()
    }

    maybeCreateTileMap(x: number, y: number): Phaser.Tilemaps.Tilemap | null {
        const scene = this
        if (x < 0 || y < 0 || x >= scene.world.width || y >= scene.world.height) {
            return null
        }
        
        const key = `${x}-${y}`
        const tileMap = scene.make.tilemap({ key })
        const tileSetNames = scene.tiles.tileSets.map((ts) => ts.name)
        scene.tiles.tileSets.forEach((ts) => tileMap.addTilesetImage(ts.name, ts.path))
        tileMap.layers.forEach((layerData, i) => {
            const layer = tileMap.createLayer(i, tileSetNames, 0, 0)
            if (!layer) return
            layer.scale = SCALE
            const factor = SCALE * scene.world.pixelsPerTile
            const currX = scene.currentMap.x
            const currY = scene.currentMap.y
            const offsetX = factor * scene.world.tilesX * (x - currX)
            const offsetY = factor * scene.world.tilesY * (y - currY)
            layer.setPosition(offsetX, offsetY)
        })
        scene.currentTileMaps.push(tileMap)
        return tileMap
    }

    maybeCreateTileMapsAround(x: number, y: number): Phaser.Tilemaps.Tilemap | null {
        const scene = this
        const tileMap = scene.maybeCreateTileMap(x, y)
        if (!tileMap) return null
        scene.maybeCreateTileMap(x - 1, y - 1)
        scene.maybeCreateTileMap(x, y - 1)
        scene.maybeCreateTileMap(x + 1, y - 1)
        scene.maybeCreateTileMap(x - 1, y)
        scene.maybeCreateTileMap(x + 1, y)
        scene.maybeCreateTileMap(x - 1, y + 1)
        scene.maybeCreateTileMap(x, y + 1)
        scene.maybeCreateTileMap(x + 1, y + 1)
        return tileMap
    }

    getGridEngineConfig(characterData: Partial<CharacterData>): GridEngineConfig {
        const scene = this
        return {
            characters: [
                {
                    id: PLAYER_ID,
                    sprite: scene.playerSprite,
                    walkingAnimationMapping: PLAYER_SPRITE_SETTINGS.index,
                    charLayer: scene.startCharLayer,
                    ...characterData
                },
            ],
        }
    }

    create() {
        const scene = this

        const playerSprite = scene.add.sprite(0, 0, PLAYER_ID)
        playerSprite.setScale(PLAYER_SCALE)
        scene.playerSprite = playerSprite

        scene.cameras.main.startFollow(playerSprite, true)
        scene.cameras.main.setFollowOffset(-1 * playerSprite.width, -1 * playerSprite.height)

        const tileMap = scene.maybeCreateTileMapsAround(scene.currentMap.x, scene.currentMap.y)
        if (tileMap) {
            scene.gridEngine.create(tileMap, scene.getGridEngineConfig({
                startPosition: scene.startPosition
            }))
        }

        scene.game.sound.removeAll()
        if (scene.music) {
            const backgroundMusic = scene.game.sound.add(scene.music.path)
            backgroundMusic.setLoop(true)
            backgroundMusic.setVolume(0.5)
            backgroundMusic.play()
        }

        scene.createThen()
    }

    createThen() { }
    preloadThen() { }

    public setPressedKey(key: string | null) {
        this.pressedKey = key
    }

    updateWorldMap() {
        const scene = this
        const { x, y } = scene.gridEngine.getPosition(PLAYER_ID)
        const isXMin = x === 0
        const isYMin = y === 0
        const isXMax = x === (scene.world.tilesX - 1)
        const isYMax = y === (scene.world.tilesY - 1)
        if (!isXMin && !isYMin && !isXMax && !isYMax) return

        const newPosition = { x, y }
        const direction = scene.gridEngine.getFacingDirection(PLAYER_ID)
        if (direction === Direction.LEFT && isXMin) {
            scene.currentMap = {
                x: scene.currentMap.x - 1,
                y: scene.currentMap.y,
            }
            newPosition.x = scene.world.tilesX
        } else if (direction === Direction.RIGHT && isXMax) {
            scene.currentMap = {
                x: scene.currentMap.x + 1,
                y: scene.currentMap.y,
            }
            newPosition.x = -1
        } else if (direction === Direction.UP && isYMin) {
            scene.currentMap = {
                x: scene.currentMap.x,
                y: scene.currentMap.y - 1,
            }
            newPosition.y = scene.world.tilesY
        } else if (direction === Direction.DOWN && isYMax) {
            scene.currentMap = {
                x: scene.currentMap.x,
                y: scene.currentMap.y + 1,
            }
            newPosition.y = -1
        } else {
            return
        }

        scene.currentTileMaps.forEach((tm) => tm.destroy())
        scene.currentTileMaps = []
        const tileMap = scene.maybeCreateTileMapsAround(scene.currentMap.x, scene.currentMap.y)
        if (!tileMap) return
        scene.gridEngine.create(tileMap, scene.getGridEngineConfig({
            startPosition: newPosition,
            facingDirection: direction,
        }))
    }

    public update() {
        const scene = this
        let moved = false
        if (scene.pressedKey === "ArrowLeft") {
            scene.gridEngine.move(PLAYER_ID, Direction.LEFT)
            moved = true
        } else if (scene.pressedKey === "ArrowRight") {
            scene.gridEngine.move(PLAYER_ID, Direction.RIGHT)
            moved = true
        } else if (scene.pressedKey === "ArrowUp") {
            scene.gridEngine.move(PLAYER_ID, Direction.UP)
            moved = true
        } else if (scene.pressedKey === "ArrowDown") {
            scene.gridEngine.move(PLAYER_ID, Direction.DOWN)
            moved = true
        } else {
            moved = false
        }

        if (moved) {
            scene.updateWorldMap()
        }

        if (scene.pressedKey === "Space") {
            const dir = scene.gridEngine.getFacingDirection(PLAYER_ID)
            const pos = scene.gridEngine.getFacingPosition(PLAYER_ID)
            const facing = Facing(pos.x, pos.y, dir as FacingDirection)
            const doInteract = scene.sceneInteractionMap?.[facing]
            if (doInteract) {
                doInteract(scene)
            }
        }
    }
}
