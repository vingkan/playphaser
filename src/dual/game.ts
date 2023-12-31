import { GridEngine } from "grid-engine"
import * as Phaser from "phaser"
import { GameScene } from "./scene"

type GameVariant = {
    game: Phaser.Game,
    setPressedKey: (key: string | null) => void,
}

function GameFactory(variant: string): GameVariant {
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
                startPosition: { x: 15, y: 10 },
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
    const parent = variant
    const gameConfig: Phaser.Types.Core.GameConfig = {
        title,
        parent,
        type: Phaser.AUTO,
        scene: [SeaScene],
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
    return {
        game,
        setPressedKey: (key) => setPressedKey(key),
    }
}

const seaGame = GameFactory("sea")
const sandGame = GameFactory("sand")

const ALLOWED_KEYS = {
    "ArrowUp": "ArrowUp",
    "ArrowDown": "ArrowDown",
    "ArrowLeft": "ArrowLeft",
    "ArrowRight": "ArrowRight",
    "Space": "Space",
}

let pressedKey = null

function maybeSendNewKey(newKey) {
    if (newKey === pressedKey) return
    pressedKey = newKey
    seaGame.setPressedKey(pressedKey)
    sandGame.setPressedKey(pressedKey)
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