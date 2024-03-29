import { GridEngine } from "grid-engine"
import * as Phaser from "phaser"
import { INTERACTABLES } from "./interactions"
import { PLAYER_SPRITE_VARIANTS } from "./utils"
import { WorldScene } from "./world"

type GameVariant = {
    game: Phaser.Game,
    setPressedKey: (key: string | null) => void,
}

const GAME_VARIANTS = 2
let ACTIVE_GAMES: { [variant: string]: boolean } = {}

function GameFactory(variant: string): GameVariant {

    const parentEl: HTMLElement = document.getElementById(variant)!

    let setPressedKey: (key: string | null) => void = () => {}

    class SeaScene extends WorldScene {
        constructor() {
            super({
                key: variant,
                parentEl,
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
                    width: 7,
                    height: 5,
                    pixelsPerTile: 16,
                    scale: 3,
                },
                start: {
                    map: { x: 3, y: 2 },
                    // map: { x: 6, y: 2 },
                    position: { x: 10, y: 10 },
                    // position: { x: 0, y: 1 },
                    characterLayer: "Collisions",
                },
                player: {
                    key: "player",
                    scale: 1.5,
                    sprite: PLAYER_SPRITE_VARIANTS[variant],
                },
                interactables: INTERACTABLES,
            })
        }

        preloadThen() {
            const scene = this
        }

        createThen() {
            const scene = this
            setPressedKey = (key) => scene.setPressedKey(key)
            ACTIVE_GAMES[variant] = true
            console.log(`Ready: ${variant}`)
            scene.showText("Welcome to Atlantis.", 2000)
        }
    }

    const title = `${variant[0].toUpperCase()}${variant.substring(1)}`
    const gameConfig: Phaser.Types.Core.GameConfig = {
        title,
        parent: variant,
        type: Phaser.AUTO,
        transparent: true,
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
    " ": "Space",
    "w": "ArrowUp",
    "s": "ArrowDown",
    "a": "ArrowLeft",
    "d": "ArrowRight",
    "x": "Space",
}

let pressedKey: string | null = null

function maybeSendNewKey(newKey: string | null) {
    // Wait for both games to be ready before accepting control inputs.
    if (Object.keys(ACTIVE_GAMES).length !== GAME_VARIANTS) return
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