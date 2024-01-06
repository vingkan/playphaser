function makeZeroAt(topLeft: Cell): Cell[] {
    const { wx, wy, cx, cy } = topLeft
    return [
        { wx, wy, cx, cy },
        { wx, wy, cx: cx + 1, cy },
        { wx, wy, cx: cx + 2, cy },
        { wx, wy, cx, cy: cy + 1 },
        { wx, wy, cx: cx + 2, cy: cy + 1 },
        { wx, wy, cx, cy: cy + 2 },
        { wx, wy, cx: cx + 2, cy: cy + 2 },
        { wx, wy, cx, cy: cy + 3 },
        { wx, wy, cx: cx + 2, cy: cy + 3 },
        { wx, wy, cx, cy: cy + 4 },
        { wx, wy, cx: cx + 1, cy: cy + 4 },
        { wx, wy, cx: cx + 2, cy: cy + 4 },
    ]
}

function makeOneAt(topLeft: Cell): Cell[] {
    const { wx, wy, cx, cy } = topLeft
    return [
        { wx, wy, cx, cy },
        { wx, wy, cx: cx + 1, cy },
        { wx, wy, cx: cx + 1, cy: cy + 1 },
        { wx, wy, cx: cx + 1, cy: cy + 2 },
        { wx, wy, cx: cx + 1, cy: cy + 3 },
        { wx, wy, cx, cy: cy + 4 },
        { wx, wy, cx: cx + 1, cy: cy + 4 },
        { wx, wy, cx: cx + 2, cy: cy + 4 },
    ]
}

function makeTwoAt(topLeft: Cell): Cell[] {
    const { wx, wy, cx, cy } = topLeft
    return [
        { wx, wy, cx, cy },
        { wx, wy, cx: cx + 1, cy },
        { wx, wy, cx: cx + 2, cy },
        { wx, wy, cx: cx + 2, cy: cy + 1 },
        { wx, wy, cx, cy: cy + 2 },
        { wx, wy, cx: cx + 1, cy: cy + 2 },
        { wx, wy, cx: cx + 2, cy: cy + 2 },
        { wx, wy, cx, cy: cy + 3 },
        { wx, wy, cx, cy: cy + 4 },
        { wx, wy, cx: cx + 1, cy: cy + 4 },
        { wx, wy, cx: cx + 2, cy: cy + 4 },
    ]
}

function makeThreeAt(topLeft: Cell): Cell[] {
    const { wx, wy, cx, cy } = topLeft
    return [
        { wx, wy, cx, cy },
        { wx, wy, cx: cx + 1, cy },
        { wx, wy, cx: cx + 2, cy },
        { wx, wy, cx: cx + 2, cy: cy + 1 },
        { wx, wy, cx: cx + 1, cy: cy + 2 },
        { wx, wy, cx: cx + 2, cy: cy + 2 },
        { wx, wy, cx: cx + 2, cy: cy + 3 },
        { wx, wy, cx, cy: cy + 4 },
        { wx, wy, cx: cx + 1, cy: cy + 4 },
        { wx, wy, cx: cx + 2, cy: cy + 4 },
    ]
}

export function makeNumberAt(n: number, topLeft: Cell): Cell[] {
    if (n === 0) return makeZeroAt(topLeft)
    if (n === 1) return makeOneAt(topLeft)
    if (n === 2) return makeTwoAt(topLeft)
    if (n === 3) return makeThreeAt(topLeft)
    throw new Error(`Unsupported number: ${n}`)
}