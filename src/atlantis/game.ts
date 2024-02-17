import { GridEngine } from "grid-engine"
import * as Phaser from "phaser"
import { WorldScene } from "./world"
import { PLAYER_SPRITE_VARIANTS } from "./utils"

type GameVariant = {
    game: Phaser.Game,
    setPressedKey: (key: string | null) => void,
}

function GameFactory(variant: string): GameVariant {
    let setPressedKey: (key: string | null) => void = () => {}

    class SeaScene extends WorldScene {
        constructor() {
            super({
                key: variant,
                variant,
                tiles: {
                    tilesets: [
                        { name: "Collisions", path: "../assets/common/collisions.png" },
                        { name: "Ground", path: `../assets/sea/ground-${variant}.png` },
                        { name: "Props", path: `../assets/sea/props-${variant}.png` },
                        { name: "Stone", path: `../assets/sea/stone-${variant}.png` },
                    ]
                },
                music: {
                    on: false,
                    sounds: {},
                },
                world: {
                    path: "../assets/sea/map",
                    tilesX: 20,
                    tilesY: 20,
                    width: 3, // 6
                    height: 2, // 4
                    pixelsPerTile: 16,
                    scale: 3,
                },
                start: {
                    map: { x: 2, y: 1 },
                    position: { x: 10, y: 10 },
                    characterLayer: "Collisions",
                },
                player: {
                    key: "player",
                    scale: 1.5,
                    sprite: PLAYER_SPRITE_VARIANTS[variant],
                },
                interactables: [],
            })
        }

        preloadThen() {
            const scene = this
        }

        createThen() {
            const scene = this
            setPressedKey = (key) => scene.setPressedKey(key)
            console.log(`Ready: ${variant}`)
        }
    }

    const title = `${variant[0].toUpperCase()}${variant.substring(1)}`
    const parentEl = document.getElementById(variant)
    const gameConfig: Phaser.Types.Core.GameConfig = {
        title,
        parent: variant,
        type: Phaser.AUTO,
        scene: [SeaScene],
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