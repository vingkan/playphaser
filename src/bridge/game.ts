import { GridEngine } from "grid-engine"
import * as Phaser from "phaser"
import { GameScene } from "./scene"

export class BridgeScene extends GameScene {

    constructor() {
        super({
            key: "BridgeScene",
            tileMap: {
                path: "../assets/bridge.json",
                tileSets: [
                    { name: "Collisions", path: "../assets/common/collisions.png" },
                    { name: "Grass", path: "../assets/forest/tileset-grass.png" },
                    { name: "Wall", path: "../assets/forest/tileset-wall.png" },
                    { name: "Structures", path: "../assets/forest/structures.png" },
                    { name: "Props", path: "../assets/forest/props.png" },
                    { name: "Plant", path: "../assets/forest/plant.png" },
                ]
            },
            startCharLayer: "GrassCollisions",
            startPosition: { x: 9, y: 18 },
            sceneInteractionMap: {},
        })
    }

    preloadThen() {
        const scene = this
    }

    createThen() {
        const scene = this
        const fromLayer = "GrassCollisions"
        const toLayer = "BridgeCollisions"
        const coords: PositionDict[] = [
            { x: 8, y: 16 },
            { x: 9, y: 16 },
            { x: 10, y: 16 },
            { x: 11, y: 16 },
            { x: 28, y: 16 },
            { x: 29, y: 16 },
            { x: 30, y: 16 },
            { x: 31, y: 16 },
        ]
        for (const { x, y } of coords) {
            scene.gridEngine.setTransition({ x, y: y - 1 }, fromLayer, toLayer)
            scene.gridEngine.setTransition({ x, y }, toLayer, fromLayer)
        }
    }
}

const gameConfig: Phaser.Types.Core.GameConfig = {
    title: "Bridge",
    parent: "game",
    type: Phaser.AUTO,
    scene: [BridgeScene],
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
