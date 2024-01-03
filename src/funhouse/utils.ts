export const PLAYER_ID = "player"
export const PLAYER_SCALE = 1.5
export const PLAYER_SPRITE_SETTINGS = {
    // Index in the sprite sheet file, left to right, top to bottom, zero-indexed.
    index: 2,
    path: "../assets/sea/sprite-god-humans.png",
    size: {
        frameWidth: 52,
        frameHeight: 72,
    },
}

export const TILE_SIZE_PX = 16
export const SCALE = 3
export const TILE_SIZE_SCALED = TILE_SIZE_PX * SCALE

export const FONT = "Caudex"
export const TEXT_SIZE = 24
export const TEXT_PAD = 8

export function Facing(x: number, y: number, direction: FacingDirection): string {
    return `${x}_${y}_${direction}`
}

export function tileToPixels(t: number): number {
    return t * TILE_SIZE_SCALED
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function showText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    color: string
): Phaser.GameObjects.Text {
    const tX = TEXT_PAD + tileToPixels(x)
    const tY = TEXT_PAD + tileToPixels(y)
    const textObject = scene.add.text(tX, tY, text, {
        fontFamily: FONT,
        fontSize: TEXT_SIZE,
        color: color,
    })
    return textObject
}

export function interactIfNotStarted(doInteract: Interaction): Interaction {
    let isStarted = false
    return async (scene: Phaser.Scene) => {
        if (isStarted) return
        isStarted = true
        await doInteract(scene)
        isStarted = false
    }
}