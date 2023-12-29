import { GridEngine } from "grid-engine"
import * as Phaser from "phaser"
import { SkyCityScene } from "./sky"
import { ForestTempleScene } from "./forest"

const gameConfig: Phaser.Types.Core.GameConfig = {
    title: "Set In Stone",
    parent: "game",
    type: Phaser.AUTO,
    scene: [SkyCityScene, ForestTempleScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "game",
        min: {
            width: 800,
            height: 600,
        },
        max: {
            width: 2400,
            height: 1800,
        }
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

export const game = new Phaser.Game(gameConfig)
