
export const FONT = "Caudex"
export const TEXT_SIZE = 24
export const TEXT_PAD = 8

export function tileToPixels(t: number, world: WorldConfig): number {
    return t * world.scale * world.pixelsPerTile
}

export function showText(
    scene: Phaser.Scene,
    world: WorldConfig,
    x: number,
    y: number,
    text: string,
    color: string,
): Phaser.GameObjects.Text {
    const tX = TEXT_PAD + tileToPixels(x, world)
    const tY = TEXT_PAD + tileToPixels(y, world)
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