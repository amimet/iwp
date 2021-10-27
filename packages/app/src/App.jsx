import React from "react"
import { Helmet } from "react-helmet"
import ngProgress from "nprogress"

import { NotFound, RenderError, AppLoading } from "components"
import BaseLayout from "./layout"
import config from "config"

import Session from "core/models/session"
import User from "core/models/user"

import SidebarController from "core/models/sidebar"
import SettingsController from "core/models/settings"

import { CreateEviteApp, BindPropsProvider } from "evite"
import { Subscribe, createStateContainer } from "evite/client/statement"
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

const AppStatement = createStateContainer({})

class App {
	static initialize(props) {
		this.loadBar = ngProgress.configure({ parent: "#root", showSpinner: false })

		this.sessionController = new Session()
		this.userController = new User()

		this.configuration = {
			settings: new SettingsController(),
			sidebar: new SidebarController(),
		}

		this.eventBus = this.contexts.main.eventBus

		this.eventBus.on("top_loadBar_start", () => {
			this.loadBar.start()
		})
		this.eventBus.on("top_loadBar_stop", () => {
			this.loadBar.done()
		})

		this.eventBus.on("setLocation", () => {
			this.eventBus.emit("top_loadBar_start")
		})
		this.eventBus.on("setLocationReady", () => {
			this.eventBus.emit("top_loadBar_stop")
		})

		this.eventBus.on("forceInitialize", async () => {
			await this.initialization()
		})
		this.eventBus.on("forceReloadUser", async () => {
			await this.__init_user()
		})
		this.eventBus.on("forceReloadSession", async () => {
			await this.__init_session()
		})

		this.eventBus.on("destroyAllSessions", async () => {
			await this.sessionController.destroyAllSessions()
		})
		this.eventBus.on("new_session", () => {
			this.eventBus.emit("forceInitialize")

			if (this.beforeLoginLocation) {
				window.app.setLocation(this.beforeLoginLocation)
				this.beforeLoginLocation = null
			}
		})
		this.eventBus.on("destroy_session", () => {
			this.eventBus.emit("forceInitialize")
		})
		this.eventBus.on("invalid_session", () => {
			this.sessionController.destroySession()
		})
	}

	static windowContext() {
		return {
			configuration: this.configuration,
			isValidSession: this.isValidSession,
			getSettings: (...args) => this.contexts.app.configuration?.settings?.get(...args)
		}
	}

	static appContext() {
		return {
			sessionController: this.sessionController,
			userController: this.userController,
			configuration: this.configuration,
			loadBar: this.loadBar,
		}
	}

	state = {
		renderLoading: false,
		isMobile: false,
		session: null,
		data: null
	}

	isValidSession = async () => {
		return await this.sessionController.isCurrentTokenValid()
	}

	componentDidMount = async () => {
		await this.initialization()
	}

	initialization = async () => {
		await this.__init_session()
		await this.__init_user()
	}

	__init_session = async () => {
		if (typeof Session.token === "undefined") {
			window.app.eventBus.emit("not_session")
		} else {
			this.session = await this.sessionController.getTokenInfo()

			if (!this.session.valid) {
				// try to regenerate
				try {
					// if (this.session.allowRegenerate) {
					// 	await session.regenerate()
					// } else {
					// 	throw new Error(`Session cant be regenerated`)
					// }
				} catch (error) {
					window.app.eventBus.emit("invalid_session", this.session.error)
				}

				if (window.location.pathname == "/login") {
					this.beforeLoginLocation = "/main"
				}else {
					this.beforeLoginLocation = window.location.pathname
				}

				window.app.setLocation("/login")
			}
		}

		this.setState({ session: this.session })
	}

	__init_user = async () => {
		if (!this.session || !this.session.valid) {
			return false
		}

		try {
			this.user = await User.data
			this.setState({ user: this.user })
		} catch (error) {
			console.log(error)
		}
	}

	handleLoading = (to) => {
		this.setState({ renderLoading: to ?? !this.state.renderLoading })
	}

	render = () => {
		const Render = this.contexts.app.createPageRender({
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
					user={this.state.user}
					session={this.state.session}
				>
					<BaseLayout>
						<Render />
					</BaseLayout>
				</BindPropsProvider>
			</React.Fragment>
		)
	}
}

export default CreateEviteApp(App, {
	extensions: [connect, theme, API, Render, SplashExtension, Debug],
})
