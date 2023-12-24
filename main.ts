import { Direction, GridEngine } from "grid-engine"
import * as Phaser from "phaser"

type PositionDict = { x: number, y: number }
type FacingDirection = "up" | "down" | "left" | "right"

type Interaction = (scene: Phaser.Scene) => Promise<void>
type SceneInteractionMap = { [id: string]: Interaction }

type TileSet = {
  name: string,
  path: string
}
type TileMap = {
  path: string,
  tileSets: TileSet[]
}

const PLAYER_ID = "player"
const PLAYER_SCALE = 1.5
const PLAYER_SPRITE_SHEET = "assets/common/characters.png"
// Index in the sprite sheet file, left to right, top to bottom, zero-indexed.
const PLAYER_SPRITE_INDEX = 7
const PLAYER_SPRITE_SIZE = {
  frameWidth: 52,
  frameHeight: 72,
}

const TILE_SIZE_PX = 16
const SCALE = 3
const TILE_SIZE_SCALED = TILE_SIZE_PX * SCALE

const FONT = "Caudex"
const TEXT_SIZE = 24
const TEXT_PAD = 8

function Facing(x: number, y: number, direction: FacingDirection): string {
  return `${x}_${y}_${direction}`
}

export class GameScene extends Phaser.Scene {
  private gridEngine!: GridEngine
  private tileMap!: TileMap
  private startPosition: PositionDict = { x: 0, y: 0 }
  private sceneInteractionMap: SceneInteractionMap = {}

  constructor(config: {
    key: string,
    tileMap: TileMap,
    startPosition: PositionDict,
    sceneInteractionMap: SceneInteractionMap
  }) {
    super({
      key: config.key,
      active: false,
      visible: false,
    })
    this.tileMap = config.tileMap
    this.startPosition = config.startPosition
    this.sceneInteractionMap = config.sceneInteractionMap
  }

  create() {
    const tileData = this.tileMap
    const tileMap = this.make.tilemap({ key: tileData.path })
    tileData.tileSets.forEach((ts) => tileMap.addTilesetImage(ts.name, ts.path))
    const tileSetNames = tileData.tileSets.map((ts) => ts.name)

    tileMap.layers.forEach((layerData, i) => {
      const layer = tileMap.createLayer(i, tileSetNames, 0, 0)
      layer.scale = SCALE
    })

    const playerSprite = this.add.sprite(0, 0, PLAYER_ID)
    playerSprite.scale = PLAYER_SCALE
    this.cameras.main.startFollow(playerSprite, true)
    this.cameras.main.setFollowOffset(
      -playerSprite.width,
      -playerSprite.height
    )

    const gridEngineConfig = {
      characters: [
        {
          id: PLAYER_ID,
          sprite: playerSprite,
          walkingAnimationMapping: PLAYER_SPRITE_INDEX,
          startPosition: this.startPosition,
        },
      ],
    }
    this.gridEngine.create(tileMap, gridEngineConfig)
    this.createThen()
  }

  createThen() { }

  public update() {
    const cursors = this.input.keyboard.createCursorKeys()
    if (cursors.left.isDown) {
      this.gridEngine.move(PLAYER_ID, Direction.LEFT)
    } else if (cursors.right.isDown) {
      this.gridEngine.move(PLAYER_ID, Direction.RIGHT)
    } else if (cursors.up.isDown) {
      this.gridEngine.move(PLAYER_ID, Direction.UP)
    } else if (cursors.down.isDown) {
      this.gridEngine.move(PLAYER_ID, Direction.DOWN)
    }

    if (cursors.space.isDown) {
      const dir = this.gridEngine.getFacingDirection(PLAYER_ID)
      const pos = this.gridEngine.getFacingPosition(PLAYER_ID)
      const facing = Facing(pos.x, pos.y, dir as FacingDirection)
      const doInteract = this.sceneInteractionMap?.[facing]
      if (doInteract) {
        doInteract(this)
      }
    }

  }

  preload() {
    const scene = this
    const tileData = scene.tileMap
    tileData.tileSets.forEach((ts) => scene.load.image(ts.path, ts.path))
    scene.load.tilemapTiledJSON(tileData.path, tileData.path)

    scene.load.spritesheet(PLAYER_ID, PLAYER_SPRITE_SHEET, PLAYER_SPRITE_SIZE)
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function showText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  color: string
): Phaser.GameObjects.Text {
  const tX = TEXT_PAD + (x * TILE_SIZE_SCALED)
  const tY = TEXT_PAD + (y * TILE_SIZE_SCALED)
  const textObject = scene.add.text(tX, tY, text, {
    fontFamily: FONT,
    fontSize: TEXT_SIZE,
    color: color,
  })
  return textObject
}

function interactIfNotStarted(doInteract: Interaction): Interaction {
  let isStarted = false
  return async (scene: Phaser.Scene) => {
    if (isStarted) return
    isStarted = true
    await doInteract(scene)
    isStarted = false
  }
}

async function readTablet(scene: Phaser.Scene): Promise<void> {
  const text = showText(scene, 11, 13, "You would stab\nmy back?", "#625E69")
  await sleep(3000)
  text.destroy()
}

async function speakStatue(scene: Phaser.Scene): Promise<void> {
  const text = showText(scene, 11, 6, "I wake.", "#625E69")
  await sleep(3000)
  text.destroy()
}

async function goToForestTemple(scene: Phaser.Scene): Promise<void> {
  scene.scene.pause()
  const text = showText(scene, 12, 9, "You slipped\nand fell...", "#625E69")
  await sleep(2000)
  scene.scene.resume()
  text.destroy()
  scene.scene.start("ForestTempleScene")
}

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

const doReadTablet = interactIfNotStarted(readTablet)
const doSpeakStatue = interactIfNotStarted(speakStatue)
const doGoToForestTemple = interactIfNotStarted(goToForestTemple)
const doReadForestTablet = interactIfNotStarted(readForestTablet)

export class SkyCityScene extends GameScene {
  constructor() {
    super({
      key: "SkyCityScene",
      tileMap: {
        path: "assets/sky-city.json",
        tileSets: [
          { name: "Collisions", path: "assets/common/collisions.png" },
          { name: "Cloud City", path: "assets/clouds/tileset-clouds.png" },
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

export class ForestTempleScene extends GameScene {
  constructor() {
    super({
      key: "ForestTempleScene",
      tileMap: {
        path: "assets/forest-temple.json",
        tileSets: [
          { name: "Collisions", path: "assets/common/collisions.png" },
          { name: "Grass", path: "assets/forest/tileset-grass.png" },
          { name: "Wall", path: "assets/forest/tileset-wall.png" },
          { name: "Structures", path: "assets/forest/structures.png" },
          { name: "Props", path: "assets/forest/props.png" },
        ]
      },
      startPosition: { x: 9, y: 17 },
      sceneInteractionMap: {
        [Facing(9, 7, 'up')]: doReadForestTablet,
        [Facing(10, 7, 'up')]: doReadForestTablet,
      },
    })
  }
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: "Curse of the Aztecs",
  render: {
    antialias: false,
  },
  type: Phaser.AUTO,
  scene: [SkyCityScene, ForestTempleScene],
  scale: {
    width: 800,
    height: 600,
    autoCenter: Phaser.Scale.CENTER_BOTH,
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
  parent: "game",
}

export const game = new Phaser.Game(gameConfig)
