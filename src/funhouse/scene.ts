import { Direction, GridEngine, GridEngineConfig } from "grid-engine"
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
    tiles: TileConfig
    startCharLayer: string
    startPosition: PositionDict = { x: 0, y: 0 }
    sceneInteractionMap: SceneInteractionMap = {}
    pressedKey: string | null = null
    playerSprite: Phaser.GameObjects.Sprite
    tileMap1: Phaser.Tilemaps.Tilemap

    constructor(config: {
        key: string,
        music?: MusicConfig,
        tiles: TileConfig,
        startCharLayer: string,
        startPosition: PositionDict,
        sceneInteractionMap: SceneInteractionMap
    }) {
        super({
            key: config.key,
            active: false,
            visible: false,
        })
        this.music = config.music
        this.tiles = config.tiles
        this.startCharLayer = config.startCharLayer
        this.startPosition = config.startPosition
        this.sceneInteractionMap = config.sceneInteractionMap
    }

    preload() {
        const scene = this
        scene.tiles.tileSets.forEach((ts) => scene.load.image(ts.path, ts.path))
        scene.tiles.tileMaps.forEach((tm) => scene.load.tilemapTiledJSON(tm.path, tm.path))

        scene.load.spritesheet(PLAYER_ID, PLAYER_SPRITE_SETTINGS.path, PLAYER_SPRITE_SETTINGS.size)

        if (scene.music) {
            scene.load.audio(scene.music.path, scene.music.path)
        }
        scene.preloadThen()
    }

    createTileMap(tm: TileMap, mapConfig: MapConfig): Phaser.Tilemaps.Tilemap {
        const scene = this
        const tileMap = scene.make.tilemap({ key: tm.path })
        scene.tiles.tileSets.forEach((ts) => tileMap.addTilesetImage(ts.name, ts.path))
        const tileSetNames = scene.tiles.tileSets.map((ts) => ts.name)

        tileMap.layers.forEach((layerData, i) => {
            const layer = tileMap.createLayer(i, tileSetNames, 0, 0)
            if (!layer) return
            layer.scale = SCALE
            layer.setPosition(SCALE * mapConfig.x, SCALE * mapConfig.y)
        })
        return tileMap
    }

    getGridEngineConfig(startPosition: PositionDict): GridEngineConfig {
        const scene = this
        return {
            characters: [
                {
                    id: PLAYER_ID,
                    sprite: scene.playerSprite,
                    walkingAnimationMapping: PLAYER_SPRITE_SETTINGS.index,
                    startPosition,
                    charLayer: scene.startCharLayer,
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

        const world: WorldConfig = {
            "maps": [
                {
                    "fileName": "map/0.json",
                    "height": 352,
                    "width": 352,
                    "x": 0,
                    "y": 0
                },
                {
                    "fileName": "map/1.json",
                    "height": 352,
                    "width": 352,
                    "x": 336,
                    "y": 0
                }
            ],
            "onlyShowAdjacentMaps": false,
            "type": "world"
        }
        
        const tileMap = scene.createTileMap(scene.tiles.tileMaps[0], world.maps[0])
        scene.tileMap1 = scene.createTileMap(scene.tiles.tileMaps[1], world.maps[1])
        scene.gridEngine.create(tileMap, scene.getGridEngineConfig(scene.startPosition))

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

    public update() {
        if (this.pressedKey === "ArrowLeft") {
            this.gridEngine.move(PLAYER_ID, Direction.LEFT)
        } else if (this.pressedKey === "ArrowRight") {
            this.gridEngine.move(PLAYER_ID, Direction.RIGHT)
        } else if (this.pressedKey === "ArrowUp") {
            this.gridEngine.move(PLAYER_ID, Direction.UP)
        } else if (this.pressedKey === "ArrowDown") {
            this.gridEngine.move(PLAYER_ID, Direction.DOWN)
        }

        const scene = this
        const { x, y } = scene.gridEngine.getPosition(PLAYER_ID)
        const direction = scene.gridEngine.getFacingDirection(PLAYER_ID)
        if (x === 20 && y >= 10 && y <= 11 && direction == Direction.RIGHT) {
            scene.gridEngine.create(scene.tileMap1, scene.getGridEngineConfig({ x: 0, y: y }))
            
        }

        if (this.pressedKey === "Space") {
            const dir = this.gridEngine.getFacingDirection(PLAYER_ID)
            const pos = this.gridEngine.getFacingPosition(PLAYER_ID)
            const facing = Facing(pos.x, pos.y, dir as FacingDirection)
            const doInteract = this.sceneInteractionMap?.[facing]
            if (doInteract) {
                doInteract(this)
            }
        }
    }
}

