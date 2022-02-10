import { Howl } from "howler"
import config from "config"

export class SoundEngine {
    constructor() {
        this.sounds = {}
    }

    initialize = async () => {
        this.sounds = await this.getSounds()
    }

    getSounds = async () => {
        // TODO: Load custom soundpacks manifests
        let soundPack = config.defaultSoundPack ?? {}

        Object.keys(soundPack).forEach((key) => {
            const src = soundPack[key]

            soundPack[key] = new Howl({
                src: [src],
                volume: window.app.settings.get("audioVolume") ?? 0.2,
            })
        })

        return soundPack
    }

    play = (name) => {
        if (this.sounds[name]) {
            return this.sounds[name].play()
        } else {
            console.error(`Sound ${name} not found.`)
            return false
        }
    }
}

export const extension = {
    key: "soundEngine",
    expose: [
        {
            initialization: [
                async (app, main) => {
                    app.SoundEngine = new SoundEngine()
                    main.setToWindowContext("SoundEngine", app.SoundEngine)
                    await app.SoundEngine.initialize()
                }
            ]
        }
    ]
}