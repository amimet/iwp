import config from "config"
import store from "store"
import { ConfigProvider } from "antd"

async function GetDefaultTheme() {
	// TODO: Use evite CONSTANTS_API
}

class ThemeController {
	constructor(params) {
		this.params = { ...params }
		this.storageKey = "theme"
		this.defaultTheme = this.getDefault()

		this.init()
	}

	init = () => {
		const storagedTheme = this.getFromStorage()

		if (storagedTheme) {
			this.set(storagedTheme)
		} else {
			this.set(this.defaultTheme)
		}
	}

	getDefault = () => {
		return config.defaultTheme
	}

	getFromStorage = () => {
		return store.get(this.storageKey)
	}

	resetDefault = () => {
		return this.update(this.defaultTheme)
	}

	update = (theme) => {
		store.set(this.storageKey, theme)
		return this.set(theme)
	}

	set = (theme = this.defaultTheme) => {
		return ConfigProvider.config({ theme })
	}
}

export default {
	key: "theme",
	expose: [
		{
			initialization: [
				async (app, main) => {
					app.ThemeController = new ThemeController()

					main.eventBus.on("updateTheme", (payload) => {
						if (payload.to) {
							app.ThemeController.update(payload.to)
						}else {
							app.ThemeController.update(payload)
						}
					})
					main.eventBus.on("resetTheme", () => {
						app.ThemeController.resetDefault()
					})

					main.setToWindowContext("ThemeController", app.ThemeController)
				},
			],
		},
	],
}
