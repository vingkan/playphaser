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

type MapConfig =  {
    fileName: string,
    height: number,
    width: number,
    x: number,
    y: number
}
type WorldConfig = {
    maps: MapConfig[]
    onlyShowAdjacentMaps: boolean,
    type: string
}

type Flames = Phaser.GameObjects.Sprite[]