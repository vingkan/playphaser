import { Direction, GridEngine } from "grid-engine"
import * as Phaser from "phaser"
import {
    PLAYER_ID,
    PLAYER_SCALE,
    SCALE,
    PLAYER_SPRITE_VARIANTS,
    CAMERA_Y_OFFSET,
    Facing,
} from "./utils"

export class GameScene extends Phaser.Scene {
    gridEngine!: GridEngine
    tileMap!: TileMap
    music?: MusicConfig
    variant: string
    startCharLayer: string
    startPosition: PositionDict = { x: 0, y: 0 }
    sceneInteractionMap: SceneInteractionMap = {}
    pressedKey: string | null = null

    constructor(config: {
        key: string,
        variant: string,
        music?: MusicConfig,
        tileMap: TileMap,
        startCharLayer: string,
        startPosition: PositionDict,
        sceneInteractionMap: SceneInteractionMap
    }) {
        super({
            key: config.key,
            active: false,
            visible: false,
        })
        this.variant = config.variant
        this.music = config.music
        this.tileMap = config.tileMap
        this.startCharLayer = config.startCharLayer
        this.startPosition = config.startPosition
        this.sceneInteractionMap = config.sceneInteractionMap
    }

    create() {
        const tileData = this.tileMap
        const tileMap = this.make.tilemap({ key: tileData.path })
        tileData.tileSets.forEach((ts) => tileMap.addTilesetImage(ts.name, ts.path))
        const tileSetNames = tileData.tileSets.map((ts) => ts.name)

        tileMap.layers.forEach((layerData, i) => {
            const layer = tileMap.createLayer(i, tileSetNames, 0, 0)
            if (layer) {
                layer.scale = SCALE
            }
        })

        const playerSprite = this.add.sprite(0, 0, PLAYER_ID)
        playerSprite.setScale(PLAYER_SCALE)

        const cameraOffsetY = this.variant === "sand" ? -1 * playerSprite.height : CAMERA_Y_OFFSET
        this.cameras.main.startFollow(playerSprite, true)
        this.cameras.main.setFollowOffset(-1 * playerSprite.width, cameraOffsetY)

        const spriteVariant = PLAYER_SPRITE_VARIANTS?.[this.variant]
        const gridEngineConfig = {
            characters: [
                {
                    id: PLAYER_ID,
                    sprite: playerSprite,
                    walkingAnimationMapping: spriteVariant.index,
                    startPosition: this.startPosition,
                    charLayer: this.startCharLayer,
                },
            ],
        }
        this.gridEngine.create(tileMap, gridEngineConfig)

        this.game.sound.removeAll()
        if (this.music) {
            const backgroundMusic = this.game.sound.add(this.music.path)
            backgroundMusic.setLoop(true)
            backgroundMusic.setVolume(0.5)
            backgroundMusic.play()
        }

        this.createThen()
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

    preload() {
        const scene = this
        const tileData = scene.tileMap
        tileData.tileSets.forEach((ts) => scene.load.image(ts.path, ts.path))
        scene.load.tilemapTiledJSON(tileData.path, tileData.path)
        const spriteVariant = PLAYER_SPRITE_VARIANTS?.[this.variant]
        scene.load.spritesheet(PLAYER_ID, spriteVariant.path, spriteVariant.size)
        if (scene.music) {
            scene.load.audio(scene.music.path, scene.music.path)
        }
        scene.preloadThen()
    }
}

