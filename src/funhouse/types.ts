type PhaserSound = (
    Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound
)

type PositionDict = { x: number, y: number }

type Interaction = (scene: Phaser.Scene) => Promise<void>

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
    sounds: {
        [key: string]: Sound
    }
}

type MusicOptions = {
    loop?: boolean,
    volume?: number
}

type PlayerConfig = {
    key: string,
    scale: number,
    sprite: {
        // Index in the sprite sheet file, left to right, top to bottom, zero-indexed.
        index: number,
        path: string,
        size: {
            frameWidth: number,
            frameHeight: number,
        }
    }
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