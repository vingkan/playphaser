import { Direction, GridEngine } from "grid-engine"
import * as Phaser from "phaser"

type PhaserSound = (
  Phaser.Sound.NoAudioSound
  | Phaser.Sound.HTML5AudioSound
  | Phaser.Sound.WebAudioSound
)

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
type MusicConfig = {
  path: string
}

const PLAYER_ID = "player"
const PLAYER_SCALE = 1.5
const PLAYER_SPRITE_SHEET = "assets/common/sprite-characters.png"
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

function tileToPixels(t: number): number {
  return t * TILE_SIZE_SCALED
}

export class GameScene extends Phaser.Scene {
  private gridEngine!: GridEngine
  private tileMap!: TileMap
  private music: MusicConfig
  private startPosition: PositionDict = { x: 0, y: 0 }
  private sceneInteractionMap: SceneInteractionMap = {}

  constructor(config: {
    key: string,
    music: MusicConfig,
    tileMap: TileMap,
    startPosition: PositionDict,
    sceneInteractionMap: SceneInteractionMap
  }) {
    super({
      key: config.key,
      active: false,
      visible: false,
    })
    this.music = config.music
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

    this.game.sound.removeAll()
    const backgroundMusic = this.game.sound.add(this.music.path)
    backgroundMusic.setLoop(true)
    backgroundMusic.setVolume(0.5)
    backgroundMusic.play()

    this.createThen()
  }

  createThen() { }
  preloadThen() { }

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
    scene.load.audio(this.music.path, this.music.path)
    scene.preloadThen()
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
  const tX = TEXT_PAD + tileToPixels(x)
  const tY = TEXT_PAD + tileToPixels(y)
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

type Flames = Phaser.GameObjects.Sprite[]

class TorchesWrapper {

  SPRITE_ID = "fire"
  SPRITE_PATH = "assets/forest/sprite-fire.png"
  ANIMATION_ID = "fire-animation"
  SPRITE_DEPTH = 3
  SOUND_PATH = "assets/music/fire-big.mp3"

  SOUND_MIN_VOLUME = 0.5
  TORCHES_ANSWER: number[] = [4, 2, 3, 4]

  torches: Flames[] = []
  torchFlameCounts: number[] = [0, 0, 0, 0]

  successCallback: () => Promise<void> = async () => {}
  fireMusic: PhaserSound

  preload(scene: Phaser.Scene) {
    const wrapper = this
    scene.load.spritesheet(wrapper.SPRITE_ID, wrapper.SPRITE_PATH, {
      frameWidth: 24,
      frameHeight: 24
    })
    scene.load.audio(wrapper.SOUND_PATH, wrapper.SOUND_PATH)
  }

  create(scene: Phaser.Scene) {
    const wrapper = this

    wrapper.successCallback = async () => {
      const text = showText(
        scene,
        11,
        6,
        "Return now,\nto the heavens.",
        "#4F2912"
      )
      await sleep(3000)
      text.destroy()
      scene.scene.start("SkyCityScene")
    }

    const fireAnimation = {
      key: wrapper.ANIMATION_ID,
      frames: scene.anims.generateFrameNumbers(wrapper.SPRITE_ID, {
        start: 0,
        end: 6,
        first: 0,
      }),
      frameRate: 10,
      repeat: -1,
    }
    scene.anims.remove(wrapper.ANIMATION_ID)
    scene.anims.create(fireAnimation)

    const torchCords: PositionDict[][] = [
      wrapper.getFireCoords(3.5, 2),
      wrapper.getFireCoords(7.5, 2),
      wrapper.getFireCoords(11.5, 2),
      wrapper.getFireCoords(15.5, 2),
    ]
    const newTorches = []
    for (const coords of torchCords) {
      const flames: Phaser.GameObjects.Sprite[] = []
      for (const {x, y} of coords) {
        const fX = tileToPixels(x)
        const fY = tileToPixels(y)
        const fireSprite = scene.add.sprite(fX, fY, wrapper.SPRITE_ID)
        fireSprite.setDepth(wrapper.SPRITE_DEPTH)
        fireSprite.setVisible(false)
        flames.push(fireSprite)
      }
      newTorches.push(flames)
    }
    wrapper.torches = newTorches
    wrapper.torchFlameCounts = [0, 0, 0, 0]

    const fireMusic = scene.game.sound.add(wrapper.SOUND_PATH)
    fireMusic.setLoop(true)
    wrapper.fireMusic = fireMusic
  }

  setTorch(index: number, flameCount: number) {
    const wrapper = this
    const flames: Flames = wrapper.torches?.[index] || []
    for (let i = 0; i < flames.length; i++) {
      const flame = flames[i]
      const isVisible = (i + 1) <= flameCount
      flame.setVisible(isVisible)
      if (isVisible) {
        flame.play(wrapper.ANIMATION_ID)
      } else {
        flame.stop()
      }
    }
  }

  incrementTorch(index: number) {
    const wrapper = this
    const torchFlameCounts = wrapper.torchFlameCounts
    const size = torchFlameCounts.length
    if (index < 0 || index >= size) return
    torchFlameCounts[index] = (torchFlameCounts[index] + 1) % (size + 1)
    wrapper.setTorch(index, torchFlameCounts[index])
    wrapper.checkSound()
    wrapper.checkTorches()
  }

  checkSound() {
    const wrapper = this
    const sum = (agg: number, val: number) => (agg + val)
    const lit = wrapper.torchFlameCounts.reduce(sum, 0)
    const total = wrapper.TORCHES_ANSWER.reduce(sum, 0)
    const fraction = lit / total
    const minVol = wrapper.SOUND_MIN_VOLUME
    const volume = Math.min((fraction * (1 - minVol)) + minVol, 1)
    wrapper.fireMusic.setVolume(volume)
    if (lit > 0) {
      wrapper.fireMusic.play()
    } else {
      wrapper.fireMusic.pause()
    }
  }

  checkTorches() {
    const wrapper = this
    const isCorrect = wrapper.torchFlameCounts.reduce((agg, val, i) => {
      return agg && val === wrapper.TORCHES_ANSWER[i]
    }, true)
    if (isCorrect) {
      wrapper.successCallback()
    }
  }

  getFireCoords(x: number, y: number): PositionDict[] {
    const leftPos = 0.25
    const rightPos = 0.75
    const topPos = 0.1
    const bottomPos = 0.5
    return [
      {x: x + leftPos, y: y + topPos},
      {x: x + rightPos, y: y + topPos},
      {x: x + leftPos, y: y + bottomPos},
      {x: x + rightPos, y: y + bottomPos},
    ]
  }
}

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

const doReadTablet = interactIfNotStarted(readTablet)
const doSpeakStatue = interactIfNotStarted(speakStatue)
const doGoToForestTemple = interactIfNotStarted(goToForestTemple)
const doReadForestTablet = interactIfNotStarted(readForestTablet)
const doIncrementTorch0 = interactIfNotStarted((s) => incrementTorch(s, 0))
const doIncrementTorch1 = interactIfNotStarted((s) => incrementTorch(s, 1))
const doIncrementTorch2 = interactIfNotStarted((s) => incrementTorch(s, 2))
const doIncrementTorch3 = interactIfNotStarted((s) => incrementTorch(s, 3))

export class SkyCityScene extends GameScene {
  constructor() {
    super({
      key: "SkyCityScene",
      music: {
        path: "assets/music/fantascape-looping.mp3",
      },
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
  
  torches = new TorchesWrapper()

  constructor() {
    super({
      key: "ForestTempleScene",
      music: {
        path: "assets/music/lost-jungle-looping.mp3",
      },
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

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: "Curse of the Aztecs",
  render: {
    antialias: false,
  },
  fps: {
    smoothStep: false,
  },
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
