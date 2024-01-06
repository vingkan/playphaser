import { GridEngine } from "grid-engine"
import * as Phaser from "phaser"
import { WorldScene } from "./world"

let setPressedKey: (key: string | null) => void = () => {}

export class FunHouseScene extends WorldScene {
    constructor() {
        super({
            key: "fun-house",
            tiles: {
                tilesets: [
                    { name: "Collisions", path: "../assets/common/collisions.png" },
                    { name: "Basics", path: "../assets/funhouse/mystic-chroma-basics.png" },
                ],
            },
            music: {
                sounds: {
                    pixelspies: { path: "../assets/music/pixel-spies-looping.mp3" },
                    technotronic: { path: "../assets/music/technotronic.mp3" },
                },
            },
            world: {
                path: "../assets/funhouse/map",
                tilesX: 22,
                tilesY: 22,
                width: 4,
                height: 4,
                pixelsPerTile: 16,
                scale: 3,
            },
            start: {
                map: { x: 0, y: 0 },
                position: { x: 10, y: 11 },
                characterLayer: "Collisions",
            },
            player: {
                key: "player",
                scale: 1.5,
                sprite: {
                    index: 0,
                    path: "../assets/common/sprite-characters.png",
                    size: {
                        frameWidth: 52,
                        frameHeight: 72,
                    },
                },
            },
        })
    }

    preloadThen() {
        const scene = this
    }

    createThen() {
        const scene = this
        setPressedKey = (key) => scene.setPressedKey(key)
    }

    updateWorldThen() {
        const scene = this
        const { x, y } = scene.currentMap
        if (y > 1) {
            scene.changeBackgroundMusic("technotronic")
        } else {
            scene.changeBackgroundMusic("pixelspies")
        }
    }
}

const parentEl = document.getElementById("game")
const gameConfig: Phaser.Types.Core.GameConfig = {
    title: "Fun House",
    parent: "game",
    type: Phaser.AUTO,
    scene: [FunHouseScene],
    render: {
        antialias: false,
    },
    fps: {
        smoothStep: false,
    },
    scale: {
        width: parentEl?.offsetWidth,
        height: parentEl?.offsetHeight,
    },
    plugins: {
        scene: [
            {
                key: "gridEngine",
                plugin: GridEngine,
                mapping: "gridEngine",
            },
        ],
    },
}

const game = new Phaser.Game(gameConfig)

const ALLOWED_KEYS = {
    "ArrowUp": "ArrowUp",
    "ArrowDown": "ArrowDown",
    "ArrowLeft": "ArrowLeft",
    "ArrowRight": "ArrowRight",
    "Space": "Space",
    "w": "ArrowUp",
    "s": "ArrowDown",
    "a": "ArrowLeft",
    "d": "ArrowRight",
    "x": "Space",
}

let pressedKey = null

function maybeSendNewKey(newKey) {
    if (newKey === pressedKey) return
    pressedKey = newKey
    setPressedKey(pressedKey)
}

document.addEventListener("keydown", (e) => {
    const key = e.key
    const newKey = ALLOWED_KEYS?.[key] || null
    maybeSendNewKey(newKey)
})

document.addEventListener("keyup", (e) => {
    const newKey = null
    maybeSendNewKey(newKey)
})