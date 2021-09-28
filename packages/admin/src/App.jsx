import React from "react"
import ReactDOM from "react-dom"
import { Helmet } from "react-helmet"
import ngProgress from "nprogress"

import { NotFound, RenderError, AppLoading } from "components"
import BaseLayout from "./layout"
import config from "config"

import * as session from "core/models/session"
import * as user from "core/models/user"

import SidebarController from "core/models/sidebar"
import SettingsController from "core/models/settings"

import { createEviteApp, GlobalBindingProvider, appendMethodToApp } from "evite"
import { API, Render, Splash } from "extensions"

import "theme/index.less"
import "antd/dist/antd.less"

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
export default class App extends createEviteApp({
	extensions: [API, Render, SplashExtension],
}) {
	constructor(props) {
		super(props)

		// set configuration controllers
		this.appConfiguration = this.app.configuration = {}
		this.appConfiguration.settings = new SettingsController()
		this.appConfiguration.sidebar = new SidebarController()

		// app statement
		this.user = null
		this.state = {
			loading: true,
			isMobile: false,
		}

		this.eventBus.on("destroyAllSessions", () => {
			session.destroyAll()
		})

		this.eventBus.on("forceReloadData", () => {
			// TODO
		})

		this.eventBus.on("forceReloadUser", async () => {
			console.log("forceReloadUser")
			await this.loadUser()
		})
	}

	loadBar = ngProgress.configure({ parent: "#root", showSpinner: false })

	reloadAppState = appendMethodToApp("reloadAppState", async () => {
		await this.initialization()
	})

	isValidSession = appendMethodToApp("isValidSession", () => {
		return this.session?.valid ?? false
	})

	componentDidMount() {
		this._init()
	}

	initialization = async () => {
		await this.sessionInitialization()
		if (typeof window.headerVisible !== "undefined" && !window.headerVisible) {
			window.toogleHeader(true)
		}
	}

	loadUser = async () => {
		await user.setLocalBasics(this.apiBridge)
		this.user = await this.getCurrentUser()
	}

	sessionInitialization = async () => {
		this.sessionToken = await session.get()

		if (typeof this.sessionToken === "undefined") {
			this.eventBus.emit("not_session")
		} else {
			const validation = await session.getCurrentTokenValidation(this.apiBridge)
			this.session = validation
			this.validSession = validation.valid

			if (!this.validSession) {
				// try to regenerate
				try {
					if (this.session.allowRegenerate) {
						await session.regenerate(this.apiBridge)
					} else {
						throw new Error(`Session cant be regenerated`)
					}
				} catch (error) {
					this.eventBus.emit("not_valid_session", validation.error)
					await session.clear()
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
		this.setState({ loading: to })

		if (to === true) {
			this.loadBar.start()
		} else {
			this.loadBar.done()
		}
	}

	render() {
		const { loading } = this.state

		const Page = this.createPageRender({
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

				<GlobalBindingProvider
					user={() => {
						return this.user ?? {}
					}}
					api={() => {
						return this.apiBridge
					}}
					session={() => {
						return this.session
					}}
				>
					<BaseLayout>{loading ? <AppLoading /> : <Page />}</BaseLayout>
				</GlobalBindingProvider>
			</React.Fragment>
		)
	}
}

ReactDOM.render(<App />, document.getElementById("root"))
