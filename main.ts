import { Direction, GridEngine } from "grid-engine";
import * as Phaser from "phaser";

const PLAYER_SPRITE_INDEX = 7

const TILE_SIZE_PX = 16
const SCALE = 3
const TILE_SIZE_SCALED = TILE_SIZE_PX * SCALE

const FONT = "Caudex"
const TEXT_COLOR = "#625E69"
const TEXT_SIZE = 24
const TEXT_PAD = 8

type PositionDict = {x: number, y: number}
type FacingDirection = "up" | "down" | "left" | "right"

function Facing(x: number, y: number, direction: FacingDirection): string {
  return `${x}_${y}_${direction}`
}

type Interaction = (scene: Phaser.Scene) => Promise<void>
type SceneInteractionMap = { [id: string]: Interaction }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function showText(scene: Phaser.Scene, x: number, y: number, text: string): Phaser.GameObjects.Text {
  const tX = TEXT_PAD + (x * TILE_SIZE_SCALED)
  const tY = TEXT_PAD + (y * TILE_SIZE_SCALED)
  const textObject = scene.add.text(tX, tY, text, {
    fontFamily: FONT,
    fontSize: TEXT_SIZE,
    color: TEXT_COLOR,
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
  const text = showText(scene, 11, 13, "You would go behind\nmy back?")
  await sleep(3000)
  text.destroy()
}

async function speakStatue(scene: Phaser.Scene): Promise<void> {
  const text = showText(scene, 11, 6, "I wake.")
  await sleep(3000)
  text.destroy()
}

async function goToForestTemple(scene: Phaser.Scene): Promise<void> {
  scene.scene.start("ForestTempleScene")
  await sleep(1000)
}

const doReadTablet = interactIfNotStarted(readTablet)
const doSpeakStatue = interactIfNotStarted(speakStatue)
const doGoToForestTemple = interactIfNotStarted(goToForestTemple)

export class SkyCityScene extends Phaser.Scene {
  private gridEngine!: GridEngine
  private startPosition: PositionDict = { x: 10, y: 14 }
  private sceneInteractionMap: SceneInteractionMap = {
    [Facing(9, 13, 'up')]: doReadTablet,
    [Facing(10, 13, 'up')]: doReadTablet,
    [Facing(9, 6, 'down')]: doSpeakStatue,
    [Facing(10, 6, 'down')]: doSpeakStatue,
    [Facing(8, 10, 'up')]: doGoToForestTemple,
    [Facing(9, 10, 'up')]: doGoToForestTemple,
    [Facing(10, 10, 'up')]: doGoToForestTemple,
    [Facing(10, 10, 'up')]: doGoToForestTemple,
  }

  constructor() {
    super({
      key: "SkyCityScene",
      active: false,
      visible: false,
    });
  }

  create() {
    const cloudCityTilemap = this.make.tilemap({ key: "sky-city-map" });
    cloudCityTilemap.addTilesetImage("Cloud City", "tiles");
    for (let i = 0; i < cloudCityTilemap.layers.length; i++) {
      const layer = cloudCityTilemap.createLayer(i, "Cloud City", 0, 0);
      layer.scale = 3;
    }
    const playerSprite = this.add.sprite(0, 0, "player");
    playerSprite.scale = 1.5;
    this.cameras.main.startFollow(playerSprite, true);
    this.cameras.main.setFollowOffset(
      -playerSprite.width,
      -playerSprite.height
    );

    const gridEngineConfig = {
      characters: [
        {
          id: "player",
          sprite: playerSprite,
          walkingAnimationMapping: PLAYER_SPRITE_INDEX,
          startPosition: this.startPosition,
        },
      ],
    };

    this.gridEngine.create(cloudCityTilemap, gridEngineConfig);
  }

  public update() {
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
      this.gridEngine.move("player", Direction.LEFT);
    } else if (cursors.right.isDown) {
      this.gridEngine.move("player", Direction.RIGHT);
    } else if (cursors.up.isDown) {
      this.gridEngine.move("player", Direction.UP);
    } else if (cursors.down.isDown) {
      this.gridEngine.move("player", Direction.DOWN);
    }

    if (cursors.space.isDown) {
      const dir = this.gridEngine.getFacingDirection("player")
      const pos = this.gridEngine.getFacingPosition("player")
      const facing = Facing(pos.x, pos.y, dir as FacingDirection)
      const doInteract = this.sceneInteractionMap?.[facing]
      if (doInteract) {
        doInteract(this)
      }
    }

  }

  preload() {
    this.load.image("tiles", "assets/cloud_tileset.png");
    this.load.tilemapTiledJSON("sky-city-map", "assets/sky-city.json");

    this.load.spritesheet("player", "assets/characters.png", {
      frameWidth: 52,
      frameHeight: 72,
    });
  }
}

export class ForestTempleScene extends Phaser.Scene {
  private gridEngine!: GridEngine
  private startPosition: PositionDict = { x: 9, y: 17 }
  private sceneInteractionMap: SceneInteractionMap = {
    // [Facing(9, 13, 'up')]: doReadTablet,
  }

  constructor() {
    super({
      key: "ForestTempleScene",
      active: false,
      visible: false,
    });
  }

  create() {
    const forestTempleTilemap = this.make.tilemap({ key: "forest-temple-map" });
    forestTempleTilemap.addTilesetImage("Grass", "grass");
    forestTempleTilemap.addTilesetImage("Wall", "wall")
    forestTempleTilemap.addTilesetImage("Structures", "structures")
    forestTempleTilemap.addTilesetImage("Props", "props")
    forestTempleTilemap.addTilesetImage("Collisions", "collisions")
    const tilesetNames = [
      "Grass",
      "Wall",
      "Structures",
      "Props",
      "Collisions",
    ]
    for (let i = 0; i < forestTempleTilemap.layers.length; i++) {
      const layer = forestTempleTilemap.createLayer(i, tilesetNames, 0, 0);
      layer.scale = 3;
    }
    const playerSprite = this.add.sprite(0, 0, "player");
    playerSprite.scale = 1.5;
    this.cameras.main.startFollow(playerSprite, true);
    this.cameras.main.setFollowOffset(
      -playerSprite.width,
      -playerSprite.height
    );

    const gridEngineConfig = {
      characters: [
        {
          id: "player",
          sprite: playerSprite,
          walkingAnimationMapping: PLAYER_SPRITE_INDEX,
          startPosition: this.startPosition,
        },
      ],
    };

    this.gridEngine.create(forestTempleTilemap, gridEngineConfig);
  }

  public update() {
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
      this.gridEngine.move("player", Direction.LEFT);
    } else if (cursors.right.isDown) {
      this.gridEngine.move("player", Direction.RIGHT);
    } else if (cursors.up.isDown) {
      this.gridEngine.move("player", Direction.UP);
    } else if (cursors.down.isDown) {
      this.gridEngine.move("player", Direction.DOWN);
    }

    if (cursors.space.isDown) {
      const dir = this.gridEngine.getFacingDirection("player")
      const pos = this.gridEngine.getFacingPosition("player")
      const facing = Facing(pos.x, pos.y, dir as FacingDirection)
      const doInteract = this.sceneInteractionMap?.[facing]
      if (doInteract) {
        doInteract(this)
      }
    }

  }

  preload() {
    this.load.image("grass", "assets/forest/tileset_grass.png");
    this.load.image("wall", "assets/forest/tileset_wall.png");
    this.load.image("stone", "assets/forest/tileset_stone.png");
    this.load.image("structures", "assets/forest/structures.png");
    this.load.image("props", "assets/forest/props.png");
    this.load.image("collisions", "assets/collisions.png");
    this.load.tilemapTiledJSON("forest-temple-map", "assets/forest-temple.json");

    this.load.spritesheet("player", "assets/characters.png", {
      frameWidth: 52,
      frameHeight: 72,
    });
  }
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: "Sample",
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
};

export const game = new Phaser.Game(gameConfig);
