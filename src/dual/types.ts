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
    path: string,
    tileSets: TileSet[]
}
type MusicConfig = {
    path: string
}

type Flames = Phaser.GameObjects.Sprite[]