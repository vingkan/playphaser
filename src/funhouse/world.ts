import { Direction, GridEngine, GridEngineConfig, CharacterData } from "grid-engine"
import * as Phaser from "phaser"

export class WorldScene extends Phaser.Scene {
    gridEngine!: GridEngine
    world: WorldConfig
    tiles: TileConfig
    start: StartConfig
    player: PlayerConfig
    music?: MusicConfig
    
    playerSprite!: Phaser.GameObjects.Sprite

    pressedKey: string | null = null
    currentMap: PositionDict
    currentTileMaps: Phaser.Tilemaps.Tilemap[] = []

    constructor(config: {
        key: string,
        music?: MusicConfig,
        world: WorldConfig,
        tiles: TileConfig,
        start: StartConfig,
        player: PlayerConfig,
    }) {
        super({
            key: config.key,
            active: false,
            visible: false,
        })
        this.music = config.music
        this.world = config.world
        this.tiles = config.tiles
        this.start = config.start
        this.player = config.player
        this.currentMap = config.start.map
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
            layer.scale = scene.world.scale
            const factor = scene.world.scale * scene.world.pixelsPerTile
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
        const player = scene.player
        return {
            characters: [
                {
                    id: player.key,
                    sprite: scene.playerSprite,
                    walkingAnimationMapping: player.sprite.index,
                    charLayer: scene.start.characterLayer,
                    ...characterData
                },
            ],
        }
    }

    updateWorldMap() {
        const scene = this
        const playerKey = scene.player.key
        const { x, y } = scene.gridEngine.getPosition(playerKey)
        const isXMin = x === 0
        const isYMin = y === 0
        const isXMax = x === (scene.world.tilesX - 1)
        const isYMax = y === (scene.world.tilesY - 1)
        if (!isXMin && !isYMin && !isXMax && !isYMax) return

        const newPosition = { x, y }
        const direction = scene.gridEngine.getFacingDirection(playerKey)
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

        scene.createTiles(newPosition, direction)
    }

    preloadTiles() {
        const scene = this
        scene.tiles.tileSets.forEach((ts) => scene.load.image(ts.path, ts.path))
        for (let x = 0; x < scene.world.width; x++) {
            for (let y = 0; y < scene.world.height; y++) {
                const key = `${x}-${y}`
                const path = `${scene.world.path}/${key}.json`
                scene.load.tilemapTiledJSON(key, path)
            }
        }
    }

    createTiles(position: PositionDict, direction?: Direction) {
        const scene = this
        scene.currentTileMaps.forEach((tm) => tm.destroy())
        scene.currentTileMaps = []
        const tileMap = scene.maybeCreateTileMapsAround(scene.currentMap.x, scene.currentMap.y)
        if (!tileMap) return
        scene.gridEngine.create(tileMap, scene.getGridEngineConfig({
            startPosition: position,
            facingDirection: direction,
        }))
    }

    preloadPlayer() {
        const scene = this
        const player = scene.player
        scene.load.spritesheet(player.key, player.sprite.path, player.sprite.size)
    }

    createPlayer() {
        const scene = this
        const player = scene.player
        const playerSprite = scene.add.sprite(0, 0, player.key)
        playerSprite.setScale(player.scale)
        scene.playerSprite = playerSprite

        scene.cameras.main.startFollow(playerSprite, true)
        scene.cameras.main.setFollowOffset(-1 * playerSprite.width, -1 * playerSprite.height)
    }

    preloadMusic() {
        const scene = this
        if (!scene.music) return
        scene.load.audio(scene.music.path, scene.music.path)
    }

    createMusic() {
        const scene = this
        scene.game.sound.removeAll()
        if (!scene.music) return
        const backgroundMusic = scene.game.sound.add(scene.music.path)
        backgroundMusic.setLoop(true)
        backgroundMusic.setVolume(0.5)
        backgroundMusic.play()
    }

    createThen() { }
    preloadThen() { }

    preload() {
        const scene = this
        scene.preloadTiles()
        scene.preloadPlayer()
        scene.preloadMusic()
        scene.preloadThen()
    }

    create() {
        const scene = this
        scene.createPlayer()
        scene.createTiles(scene.start.position)
        scene.createMusic()
        scene.createThen()
    }

    public setPressedKey(key: string | null) {
        this.pressedKey = key
    }

    public update() {
        const scene = this
        const playerKey = scene.player.key
        let moved = false
        if (scene.pressedKey === "ArrowLeft") {
            scene.gridEngine.move(playerKey, Direction.LEFT)
            moved = true
        } else if (scene.pressedKey === "ArrowRight") {
            scene.gridEngine.move(playerKey, Direction.RIGHT)
            moved = true
        } else if (scene.pressedKey === "ArrowUp") {
            scene.gridEngine.move(playerKey, Direction.UP)
            moved = true
        } else if (scene.pressedKey === "ArrowDown") {
            scene.gridEngine.move(playerKey, Direction.DOWN)
            moved = true
        } else {
            moved = false
        }

        if (moved) {
            scene.updateWorldMap()
        }

        if (scene.pressedKey === "Space") {
            const dir = scene.gridEngine.getFacingDirection(playerKey)
            const pos = scene.gridEngine.getFacingPosition(playerKey)
        }
    }
}
