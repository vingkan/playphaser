import * as Phaser from "phaser"
import { GameScene } from "./scene"
import { TorchesWrapper } from "./torches"
import { sleep, showText, interactIfNotStarted, Facing } from "./utils"

async function readForestTablet(scene: Phaser.Scene): Promise<void> {
    const text = showText(
        scene,
        11,
        6,
        "Light the torches to\nmatch the stones at the\nfoot of the temple.",
        "#4F2912"
    )
    await sleep(3000)
    text.destroy()
}

async function incrementTorch(scene: Phaser.Scene, index: number): Promise<void> {
    if (scene instanceof ForestTempleScene) {
        scene.torches.incrementTorch(index)
    }
    await sleep(100)
}

const doReadForestTablet = interactIfNotStarted(readForestTablet)
const doIncrementTorch0 = interactIfNotStarted((s) => incrementTorch(s, 0))
const doIncrementTorch1 = interactIfNotStarted((s) => incrementTorch(s, 1))
const doIncrementTorch2 = interactIfNotStarted((s) => incrementTorch(s, 2))
const doIncrementTorch3 = interactIfNotStarted((s) => incrementTorch(s, 3))

export class ForestTempleScene extends GameScene {

    torches = new TorchesWrapper()

    constructor() {
        super({
            key: "ForestTempleScene",
            music: {
                path: "../assets/music/lost-jungle-looping.mp3",
            },
            tileMap: {
                path: "../assets/forest-temple.json",
                tileSets: [
                    { name: "Collisions", path: "../assets/common/collisions.png" },
                    { name: "Grass", path: "../assets/forest/tileset-grass.png" },
                    { name: "Wall", path: "../assets/forest/tileset-wall.png" },
                    { name: "Structures", path: "../assets/forest/structures.png" },
                    { name: "Props", path: "../assets/forest/props.png" },
                ]
            },
            startPosition: { x: 9, y: 17 },
            sceneInteractionMap: {
                [Facing(9, 7, 'up')]: doReadForestTablet,
                [Facing(10, 7, 'up')]: doReadForestTablet,

                [Facing(3, 5, 'up')]: doIncrementTorch0,
                [Facing(4, 5, 'up')]: doIncrementTorch0,
                [Facing(3, 4, 'right')]: doIncrementTorch0,
                [Facing(3, 5, 'right')]: doIncrementTorch0,
                [Facing(4, 4, 'left')]: doIncrementTorch0,
                [Facing(4, 5, 'left')]: doIncrementTorch0,
                [Facing(3, 4, 'down')]: doIncrementTorch0,
                [Facing(4, 4, 'down')]: doIncrementTorch0,

                [Facing(7, 5, 'up')]: doIncrementTorch1,
                [Facing(8, 5, 'up')]: doIncrementTorch1,
                [Facing(7, 4, 'right')]: doIncrementTorch1,
                [Facing(7, 5, 'right')]: doIncrementTorch1,
                [Facing(8, 4, 'left')]: doIncrementTorch1,
                [Facing(8, 5, 'left')]: doIncrementTorch1,
                [Facing(7, 4, 'down')]: doIncrementTorch1,
                [Facing(8, 4, 'down')]: doIncrementTorch1,

                [Facing(11, 5, 'up')]: doIncrementTorch2,
                [Facing(12, 5, 'up')]: doIncrementTorch2,
                [Facing(11, 4, 'right')]: doIncrementTorch2,
                [Facing(11, 5, 'right')]: doIncrementTorch2,
                [Facing(12, 4, 'left')]: doIncrementTorch2,
                [Facing(12, 5, 'left')]: doIncrementTorch2,
                [Facing(11, 4, 'down')]: doIncrementTorch2,
                [Facing(12, 4, 'down')]: doIncrementTorch2,

                [Facing(15, 5, 'up')]: doIncrementTorch3,
                [Facing(16, 5, 'up')]: doIncrementTorch3,
                [Facing(15, 4, 'right')]: doIncrementTorch3,
                [Facing(15, 5, 'right')]: doIncrementTorch3,
                [Facing(16, 4, 'left')]: doIncrementTorch3,
                [Facing(16, 5, 'left')]: doIncrementTorch3,
                [Facing(15, 4, 'down')]: doIncrementTorch3,
                [Facing(16, 4, 'down')]: doIncrementTorch3,
            },
        })
    }

    preloadThen() {
        const scene = this
        scene.torches.preload(scene)
    }

    createThen() {
        const scene = this
        scene.torches.create(scene)
    }
}