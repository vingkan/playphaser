import { Direction, GridEngine, GridEngineConfig, CharacterData } from "grid-engine"
import * as Phaser from "phaser"
import { CAMERA_Y_OFFSET, isSea } from "./utils"

function hashCell(cell: Cell): string {
    const { wx, wy, cx, cy } = cell
    return `${wx}-${wy}-${cx}-${cy}`
}

function getInteractionMap(interactables: Interactable[]): InteractionMap {
    return interactables.reduce((agg, val) => ({
        ...agg,
        ...val.cells.reduce((cellMap, cell) => ({
            ...cellMap,
            [hashCell(cell)]: val.action,
        }), {})
    }), {})
}

const SECOND_MS = 1000
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export class WorldScene extends Phaser.Scene {
    gridEngine: GridEngine

    parentEl: HTMLElement
    textWrapper: HTMLElement
    textContent: HTMLElement

    variant: string
    tiles: TileConfig
    music: MusicConfig
    world: WorldConfig
    start: StartConfig
    player: PlayerConfig
    interactables: Interactable[]
    
    playerSprite: Phaser.GameObjects.Sprite
    interactionMap: InteractionMap = {}
    isInteracting: boolean = false

    pressedKey: string | null = null
    currentMap: PositionDict
    currentTileMaps: Phaser.Tilemaps.Tilemap[] = []
    currentBackgroundMusic: string | null = null

    constructor(config: {
        key: string,
        parentEl: HTMLElement,
        variant: string,
        tiles: TileConfig,
        music: MusicConfig,
        world: WorldConfig,
        start: StartConfig,
        player: PlayerConfig,
        interactables: Interactable[],
    }) {
        super({
            key: config.key,
            active: false,
            visible: false,
        })

        this.parentEl = config.parentEl
        this.variant = config.variant
        this.tiles = config.tiles
        this.music = config.music
        this.world = config.world
        this.start = config.start
        this.player = config.player
        this.interactables = config.interactables

        this.interactionMap = getInteractionMap(this.interactables)
        this.currentMap = config.start.map

        this.textWrapper = this.parentEl.querySelector(".text-wrapper")!
        this.textContent = this.textWrapper.querySelector(".text-content")!
    }

    switchText(seaText: string, sandText: string): string {
        const scene = this
        return isSea(this.variant) ? seaText : sandText
    }

    async maybeDoActionAt(cell: Cell) {
        const scene = this
        const cellHash = hashCell(cell)
        const doAction = scene.interactionMap?.[cellHash]
        if (doAction && !scene.isInteracting) {
            scene.isInteracting = true
            await doAction(scene)
            await sleep(SECOND_MS)
            scene.isInteracting = false
        }
    }
    
    async showText(text: string, ms: number) {
        const scene = this
        if (!scene.textWrapper || !scene.textContent) return
        scene.scene.pause()
        scene.textWrapper.style.display = "block"
        scene.textContent.innerText = text
        await sleep(ms)
        scene.textWrapper.style.display = "none"
        scene.scene.resume()
    }

    maybeCreateTileMap(x: number, y: number): Phaser.Tilemaps.Tilemap | null {
        const scene = this
        if (x < 0 || y < 0 || x >= scene.world.width || y >= scene.world.height) {
            return null
        }
        
        const key = `${x}-${y}`
        const tileMap = scene.make.tilemap({ key })
        const tileSetNames = scene.tiles.tilesets.map((ts) => ts.name)
        scene.tiles.tilesets.forEach((ts) => tileMap.addTilesetImage(ts.name, ts.path))
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
        // We have not reached any map boundary, so no need to update world map.
        if (!isXMin && !isYMin && !isXMax && !isYMax) return

        const { x: wx, y: wy } = scene.currentMap
        const isWorldXMin = wx === 0
        const isWorldYMin = wy === 0
        const isWorldXMax = wx === (scene.world.width - 1)
        const isWorldYMax = wy === (scene.world.height - 1)

        const newPosition = { x, y }
        const direction = scene.gridEngine.getFacingDirection(playerKey)
        if (direction === Direction.LEFT && isXMin && !isWorldXMin) {
            scene.currentMap = {
                x: wx - 1,
                y: wy,
            }
            newPosition.x = scene.world.tilesX
        } else if (direction === Direction.RIGHT && isXMax && !isWorldXMax) {
            scene.currentMap = {
                x: wx + 1,
                y: wy,
            }
            newPosition.x = -1
        } else if (direction === Direction.UP && isYMin && !isWorldYMin) {
            scene.currentMap = {
                x: wx,
                y: wy - 1,
            }
            newPosition.y = scene.world.tilesY
        } else if (direction === Direction.DOWN && isYMax && !isWorldYMax) {
            scene.currentMap = {
                x: wx,
                y: wy + 1,
            }
            newPosition.y = -1
        } else {
            return
        }

        scene.createTiles(newPosition, direction)
    }

    async teleportTo(
        wx: number,
        wy: number,
        x: number,
        y: number,
        direction: Direction
    ) {
        const scene = this
        scene.currentMap = { x: wx, y: wy }
        scene.createTiles({ x, y }, direction)
    }

    preloadTiles() {
        const scene = this
        scene.tiles.tilesets.forEach((ts) => scene.load.image(ts.path, ts.path))
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
        scene.updateWorldThen()
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

        const cameraOffsetY = (
            isSea(this.variant) ? CAMERA_Y_OFFSET : -1 * playerSprite.height
        )
        this.cameras.main.startFollow(playerSprite, true)
        this.cameras.main.setFollowOffset(-1 * playerSprite.width, cameraOffsetY)
    }

    preloadMusic() {
        const scene = this
        for (const [ key, sound ] of Object.entries(scene.music.sounds)) {
            scene.load.audio(key, sound.path)
        }     
    }

    changeBackgroundMusic(key: string, options: MusicOptions = {}) {
        const scene = this
        const isOn = scene.music.on
        const isAlreadyPlaying = key === scene.currentBackgroundMusic
        const isValidSound = key in scene.music.sounds
        if (!isOn || isAlreadyPlaying || !isValidSound) return

        scene.game.sound.removeAll()
        const sound = scene.game.sound.add(key)
        const loop = options?.loop || true
        const volume = options?.volume || 0.5
        sound.setLoop(loop)
        sound.setVolume(volume)
        sound.play()
        scene.currentBackgroundMusic = key
    }

    createThen() { }
    preloadThen() { }
    updateWorldThen() { }

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
            const { x: wx, y: wy } = scene.currentMap
            const { x: cx, y: cy } = scene.gridEngine.getFacingPosition(playerKey)
            const cell = { wx, wy, cx, cy }
            scene.maybeDoActionAt(cell)
        }
    }
}
