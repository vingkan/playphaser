type PhaserSound = (
    Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound
)

type PositionDict = { x: number, y: number }

type Cell = {
    wx: number,
    wy: number,
    cx: number,
    cy: number
}

interface InteractiveScene extends Phaser.Scene {
    switchText: (seaText: string, sandText: string) => string
    showText: (text: string, ms: number) => Promise<void>
    teleportTo: (
        wx: number,
        wy: number,
        x: number,
        y: number,
        direction: any
    ) => Promise<void>
}

type Interaction = (scene: InteractiveScene) => Promise<void>

type Interactable = {
    cells: Cell[],
    action: Interaction
}

type InteractionMap = {
    [cellHash: string]: Interaction
}

type Tileset = {
    name: string,
    path: string
}

type TileConfig = {
    tilesets: Tileset[]
}

type Sound = {
    path: string
}

type MusicConfig = {
    on: boolean,
    sounds: {
        [key: string]: Sound
    }
}

type MusicOptions = {
    loop?: boolean,
    volume?: number
}

type SpriteConfig = {
    // Index in the sprite sheet file, left to right, top to bottom, zero-indexed.
    index: number,
    path: string,
    size: {
        frameWidth: number,
        frameHeight: number,
    }
}

type PlayerConfig = {
    key: string,
    scale: number,
    sprite: SpriteConfig
}

type StartConfig = {
    map: PositionDict,
    position: PositionDict,
    characterLayer: string
}

type WorldConfig = {
    path: string,
    tilesX: number,
    tilesY: number,
    width: number,
    height: number,
    pixelsPerTile: number,
    scale: number
}

type WorldMap = {
    fileName: string,
    height: number,
    width: number,
    x: number,
    y: number,
}

type WorldFile = {
    maps: WorldMap[],
    onlyShowAdjacentMaps: boolean,
    type: string
}