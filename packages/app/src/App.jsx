import React from "react"
import { Helmet } from "react-helmet"
import ngProgress from "nprogress"

import { NotFound, RenderError, AppLoading } from "components"
import BaseLayout from "./layout"
import config from "config"

import Session from "core/models/session"
import * as user from "core/models/user"

import SidebarController from "core/models/sidebar"
import SettingsController from "core/models/settings"

import { CreateEviteApp, BindPropsProvider, SetToWindowContext } from "evite"
import { API, Render, Splash, Debug, connect, theme } from "extensions"

import "theme/index.less"

// append method to array prototype
Array.prototype.move = function (from, to) {
	this.splice(to, 0, this.splice(from, 1)[0])
	return this
}

const SplashExtension = Splash({
	logo: config.logo.alt,
	preset: "fadeOut",
	velocity: 1000,
	props: {
		logo: {
			style: {
				marginBottom: "10%",
				stroke: "black",
			},
		},
	},
})

class App extends React.Component {
	constructor(props) {
		super(props)

		// load bar
		window.app.eventBus.on("top_loadBar_start", () => {
			this.loadBar.start()
		})

		window.app.eventBus.on("top_loadBar_stop", () => {
			this.loadBar.done()
		})

		window.app.eventBus.on("destroyAllSessions", () => {
			session.destroyAll()
		})

		window.app.eventBus.on("forceReloadData", () => {
			// TODO
		})

		window.app.eventBus.on("forceReloadUser", async () => {
			await this.loadUser()
		})

		// emit loadbar on setLocation
		window.app.eventBus.on("setLocation", () => {
			window.app.eventBus.emit("top_loadBar_start")
		})
		window.app.eventBus.on("setLocationReady", () => {
			window.app.eventBus.emit("top_loadBar_stop")
		})
	}

	static get initialize() {
		return async (app, main, self) => {
			console.log(main)
			app.sessionController = new Session()
			app.configuration = SetToWindowContext("configuration", {
				settings: new SettingsController(),
				sidebar: new SidebarController(),
			})
			app.loadBar = ngProgress.configure({ parent: "#root", showSpinner: false })
		}
	}

	state = {
		renderLoading: false,
		isMobile: false
	}

	isValidSession = SetToWindowContext("isValidSession", async () => {
		return await this.app.sessionController.isCurrentTokenValid()
	})

	reloadAppState = SetToWindowContext("reloadAppState", async () => {
		await this.initialization()
	})

	componentDidMount = async () => {
		await this.initialization()
	}

	initialization = async () => {
		await this.sessionInitialization()
	}

	loadUser = async () => {
		await user.setLocalBasics()
		this.user = await this.getCurrentUser()
	}

	sessionInitialization = async () => {
		this.sessionToken = await Session.storagedToken

		if (typeof this.sessionToken === "undefined") {
			window.app.eventBus.emit("not_session")
		} else {
			const health = await this.sessionController.getTokenHealth()

			console.log(health)

			this.session = health
			this.validSession = health.valid

			if (!this.validSession) {
				// try to regenerate
				try {
					// if (this.session.allowRegenerate) {
					// 	await session.regenerate()
					// } else {
					// 	throw new Error(`Session cant be regenerated`)
					// }
				} catch (error) {
					window.app.eventBus.emit("not_valid_session", health.error)
					session.forgetLocalSession()
				}
			} else {
				await user.setLocalBasics(this.apiBridge)
				this.user = await this.getCurrentUser()
			}
		}
	}

	getCurrentUser = () => {
		let currentUser = Object()

		const sessionData = session.decodeSession()
		const basicsData = user.getLocalBasics(this.apiBridge)

		if (sessionData) {
			currentUser = { ...currentUser, session: sessionData }
		}
		if (basicsData) {
			currentUser = { ...currentUser, ...basicsData }
		}

		if (!currentUser.avatar) {
			currentUser.avatar = config.defaults.avatar
		}
		if (!currentUser.username) {
			currentUser.username = "Guest"
		}

		return currentUser
	}

	handleLoading = (to) => {
		this.setState({ renderLoading: to ?? !this.state.renderLoading })
	}

	render() {
		const { renderLoading } = this.state

		const Page = this.app.createPageRender({
			on404: (props) => {
				return <NotFound />
			},
			onRenderError: (props) => {
				return <RenderError {...props} />
			},
		})

		return (
			<React.Fragment>
				<Helmet>
					<title>{config.app.siteName}</title>
				</Helmet>

				<BindPropsProvider
					app={() => {
						return this.app
					}}
				>
					<BaseLayout>{renderLoading ? <AppLoading /> : <Page />}</BaseLayout>
				</BindPropsProvider>
			</React.Fragment>
		)
	}
}

export default CreateEviteApp(App, {
	extensions: [connect, theme, API, Render, SplashExtension, Debug],
})
