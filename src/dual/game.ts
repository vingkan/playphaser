import { GridEngine } from "grid-engine"
import * as Phaser from "phaser"
import { GameScene } from "./scene"

declare global {
    interface Window {
        VARIANT: string
    }
}

const variant = window.VARIANT

let setPressedKey: (key: string | null) => void = () => {}

class SeaScene extends GameScene {
    constructor() {
        super({
            key: `${variant}Scene`,
            variant,
            tileMap: {
                path: "../assets/dual.json",
                tileSets: [
                    { name: "Collisions", path: "../assets/common/collisions.png" },
                    { name: "Ground", path: `../assets/sea/ground-${variant}.png` },
                    { name: "Props", path: `../assets/sea/props-${variant}.png` },
                ]
            },
            startCharLayer: "Collisions",
            startPosition: { x: 3, y: 18 },
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

const title = `${variant[0].toUpperCase()}${variant.substring(1)}`
const parent = "game"
const gameConfig: Phaser.Types.Core.GameConfig = {
    title,
    parent,
    type: Phaser.AUTO,
    scene: [SeaScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent,
    },
    render: {
        antialias: false,
    },
    fps: {
        smoothStep: false,
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

window.addEventListener("message", (e) => {
    const isSameOrigin = window.origin === e.origin && e.isTrusted
    if (!isSameOrigin) return

    const key = e.data.key
    setPressedKey(key)
})
