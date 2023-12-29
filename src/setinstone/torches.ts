import * as Phaser from "phaser"
import { showText, sleep, tileToPixels } from "./utils"

export class TorchesWrapper {

    SPRITE_ID = "fire"
    SPRITE_PATH = "assets/forest/sprite-fire.png"
    ANIMATION_ID = "fire-animation"
    SPRITE_DEPTH = 3
    SOUND_PATH = "assets/music/fire-big.mp3"

    SOUND_MIN_VOLUME = 0.5
    TORCHES_ANSWER: number[] = [4, 2, 3, 4]

    torches: Flames[] = []
    torchFlameCounts: number[] = [0, 0, 0, 0]

    successCallback: () => Promise<void> = async () => { }
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
            for (const { x, y } of coords) {
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
            { x: x + leftPos, y: y + topPos },
            { x: x + rightPos, y: y + topPos },
            { x: x + leftPos, y: y + bottomPos },
            { x: x + rightPos, y: y + bottomPos },
        ]
    }
}