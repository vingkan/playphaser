import { GridEngine } from "grid-engine"
import * as Phaser from "phaser"
import { GameScene } from "./scene"


let setPressedKey: (key: string | null) => void = () => {}

class FunHouseScene extends GameScene {
    constructor() {
        super({
            key: "fun-house",
            tiles: {
                tileMaps: [
                    { path: "../assets/funhouse/map/0.json" },
                    { path: "../assets/funhouse/map/1.json" },
                ],
                tileSets: [
                    { name: "Collisions", path: "../assets/common/collisions.png" },
                    { name: "Basics", path: "../assets/funhouse/mystic-chroma-basics.png" },
                ],
            },
            startCharLayer: "Collisions",
            startPosition: { x: 9, y: 10 },
            sceneInteractionMap: {},
        })
    }

    preloadThen() {
        const scene = this
    }

    createThen() {
        const scene = this
        setPressedKey = (key) => scene.setPressedKey(key)
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