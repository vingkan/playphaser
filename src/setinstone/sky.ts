import * as Phaser from "phaser"
import { GameScene } from "./scene"
import { sleep, showText, interactIfNotStarted, Facing } from "./utils"

async function readTablet(scene: Phaser.Scene): Promise<void> {
    const text = showText(scene, 11, 13, "You would stab\nmy back?", "#625E69")
    await sleep(3000)
    text.destroy()
}

async function speakStatue(scene: Phaser.Scene): Promise<void> {
    scene.scene.pause()
    const text = showText(scene, 11, 6, "I banish you.", "#625E69")
    await sleep(1500)
    scene.scene.resume()
    text.destroy()
    scene.scene.start("ForestTempleScene")
}

async function goToForestTemple(scene: Phaser.Scene): Promise<void> {
    scene.scene.pause()
    const text = showText(scene, 12, 9, "You slipped\nand fell...", "#625E69")
    await sleep(1500)
    scene.scene.resume()
    text.destroy()
    scene.scene.start("ForestTempleScene")
}

const doReadTablet = interactIfNotStarted(readTablet)
const doSpeakStatue = interactIfNotStarted(speakStatue)
const doGoToForestTemple = interactIfNotStarted(goToForestTemple)

export class SkyCityScene extends GameScene {
    constructor() {
        super({
            key: "SkyCityScene",
            music: {
                path: "../assets/music/fantascape-looping.mp3",
            },
            tileMap: {
                path: "../assets/sky-city.json",
                tileSets: [
                    { name: "Collisions", path: "../assets/common/collisions.png" },
                    { name: "Cloud City", path: "../assets/clouds/tileset-clouds.png" },
                ]
            },
            startPosition: { x: 9, y: 15 },
            sceneInteractionMap: {
                [Facing(9, 13, 'up')]: doReadTablet,
                [Facing(10, 13, 'up')]: doReadTablet,

                [Facing(9, 6, 'down')]: doSpeakStatue,
                [Facing(10, 6, 'down')]: doSpeakStatue,

                [Facing(9, 9, 'down')]: doGoToForestTemple,
                [Facing(10, 9, 'down')]: doGoToForestTemple,
                [Facing(9, 10, 'up')]: doGoToForestTemple,
                [Facing(10, 10, 'up')]: doGoToForestTemple,
                [Facing(9, 9, 'right')]: doGoToForestTemple,
                [Facing(9, 10, 'right')]: doGoToForestTemple,
                [Facing(10, 9, 'left')]: doGoToForestTemple,
                [Facing(10, 10, 'left')]: doGoToForestTemple,
            },
        })
    }

    createThen() {
        const scene = this
        showText(scene, 6, 16, "Press space to interact with things.", "#625E69")
    }
}