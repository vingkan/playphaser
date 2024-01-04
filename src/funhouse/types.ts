type PhaserSound = (
    Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound
)

type PositionDict = { x: number, y: number }
type FacingDirection = "up" | "down" | "left" | "right"

type Interaction = (scene: Phaser.Scene) => Promise<void>
type SceneInteractionMap = { [id: string]: Interaction }

type TileSet = {
    name: string,
    path: string
}
type TileMap = {
    path: string
}
type TileConfig = {
    tileMaps: TileMap[],
    tileSets: TileSet[]
}
type MusicConfig = {
    path: string
}

type WorldConfig = {
    path: string,
    tilesX: number,
    tilesY: number,
    width: number,
    height: number,
    pixelsPerTile: number
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