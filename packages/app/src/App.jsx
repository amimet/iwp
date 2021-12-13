// Patch global prototypes
Array.prototype.move = function (from, to) {
	this.splice(to, 0, this.splice(from, 1)[0])
	return this
}

String.prototype.toTitleCase = function () {
	return this.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	})
}

import React from "react"
import { CreateEviteApp, BindPropsProvider } from "evite-react-lib"
import { Helmet } from "react-helmet"
import * as antd from "antd"
import progressBar from "nprogress"

import { Session, User, SidebarController, SettingsController } from "models"
import { API, Render, Splash, Theme, Sound } from "extensions"
import config from "config"

import { NotFound, RenderError, FabricCreator, Settings } from "components"
import Layout from "./layout"
import { Icons } from "components/Icons"

import "theme/index.less"

const SplashExtension = Splash.extension({
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

class ThrowCrash {
	constructor(message, description) {
		this.message = message
		this.description = description

		antd.notification.error({
			message: "Fatal error",
			description: message,
		})

		window.app.eventBus.emit("crash", this.message, this.description)
	}
}

class App {
	static initialize() {
		this.progressBar = progressBar.configure({ parent: "html", showSpinner: false })

		this.sessionController = new Session()
		this.userController = new User()

		this.configuration = {
			settings: new SettingsController(),
			sidebar: new SidebarController(),
		}

		this.eventBus = this.contexts.main.eventBus

		this.eventBus.on("app_ready", () => {
			this.setState({ initialized: true })
		})
		this.eventBus.on("top_loadBar_start", () => {
			this.progressBar.start()
		})
		this.eventBus.on("top_loadBar_stop", () => {
			this.progressBar.done()
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
		this.eventBus.on("forceToLogin", () => {
			if (window.location.pathname !== "/login") {
				this.beforeLoginLocation = window.location.pathname
			}
			window.app.setLocation("/login")
		})

		this.eventBus.on("destroyAllSessions", async () => {
			await this.sessionController.destroyAllSessions()
		})
		this.eventBus.on("new_session", () => {
			this.eventBus.emit("forceInitialize")

			if (window.location.pathname == "/login") {
				window.app.setLocation(this.beforeLoginLocation ?? "/main")
				this.beforeLoginLocation = null
			}
		})
		this.eventBus.on("destroyed_session", () => {
			this.flushState()
			this.eventBus.emit("forceToLogin")
		})

		this.eventBus.on("invalid_session", (error) => {
			if (window.location.pathname !== "/login") {
				this.sessionController.forgetLocalSession()

				antd.notification.open({
					message: "Invalid Session",
					description: error,
					icon: <Icons.MdOutlineAccessTimeFilled />,
				})

				this.eventBus.emit("forceToLogin")
			}
		})

		this.eventBus.on("setLocation", () => {
			this.eventBus.emit("top_loadBar_start")
		})
		this.eventBus.on("setLocationDone", () => {
			this.eventBus.emit("top_loadBar_stop")

			// render controller needs an better method for update render, this is a temporary solution
			this.forceUpdate()
		})

		this.eventBus.on("cleanAll", () => {
			window.app.DrawerController.closeAll()
		})

		this.eventBus.on("crash", (message, error) => {
			this.setState({ crash: { message, error } })
			this.contexts.app.SoundEngine.play("crash")
		})
	}

	static windowContext() {
		return {
			openSettings: (goTo) => {
				window.app.DrawerController.open("settings", Settings, {
					props: {
						width: "fit-content",
					},
					componentProps: {
						goTo,
					}
				})
			},
			openFabric: (defaultType) => {
				window.app.DrawerController.open("FabricCreator", FabricCreator, {
					props: {
						width: "70%",
					},
					componentProps: {
						defaultType,
					}
				})
			},
			goMain: () => {
				return window.app.setLocation(config.app.mainPath)
			},
			goToAccount: (username) => {
				return window.app.setLocation(`/account`, { username })
			},
			configuration: this.configuration,
			isValidSession: this.sessionController.isCurrentTokenValid(),
			getSettings: (...args) => this.contexts.app.configuration?.settings?.get(...args),
		}
	}

	static appContext() {
		return {
			renderRef: this.renderRef,
			sessionController: this.sessionController,
			userController: this.userController,
			configuration: this.configuration,
			progressBar: this.progressBar,
		}
	}

	static staticRenders = {
		NotFound: (props) => {
			return <NotFound />
		},
		RenderError: (props) => {
			return <RenderError {...props} />
		},
		initialization: () => {
			return <Splash.SplashComponent logo={config.logo.alt} />
		}
	}

	state = {
		// app
		initialized: false,
		crash: false,

		// app session
		session: null,
		data: null,
	}

	flushState = () => {
		this.setState({ session: null, data: null })
	}

	componentDidMount = async () => {
		this.eventBus.emit("splash_show")
		await this.initialization()

		this.eventBus.emit("app_ready")
		this.eventBus.emit("splash_close")
	}

	initialization = async () => {
		try {
			await this.contexts.app.initializeDefaultBridge()
			await this.__SessionInit()
			await this.__UserInit()
		} catch (error) {
			throw new ThrowCrash(error.message, error.description)
		}
	}

	__SessionInit = async () => {
		if (typeof Session.token === "undefined") {
			window.app.eventBus.emit("forceToLogin")
		} else {
			this.session = await this.sessionController.getTokenInfo().catch((error) => {
				window.app.eventBus.emit("invalid_session", error)
			})

			if (!this.session.valid) {
				// try to regenerate
				//const regeneration = await this.sessionController.regenerateToken()
				//console.log(regeneration)

				window.app.eventBus.emit("invalid_session", this.session.error)
			}
		}

		this.setState({ session: this.session })
	}

	__UserInit = async () => {
		if (!this.session || !this.session.valid) {
			return false
		}

		try {
			this.user = await User.data
			this.setState({ user: this.user })
		} catch (error) {
			console.error(error)
			this.eventBus.emit("crash", "Cannot initialize user data", error)
		}
	}

	render() {
		if (this.state.crash) {
			return <div className="app_crash">
				<div className="header">
					<Icons.MdOutlineError />
					<h1>Crash</h1>
				</div>
				<h2>{this.state.crash.message}</h2>
				<pre>{this.state.crash.error}</pre>
			</div>
		}

		if (!this.state.initialized) {
			return null
		}

		return (
			<React.Fragment>
				<Helmet>
					<title>{config.app.siteName}</title>
				</Helmet>
				<antd.ConfigProvider>
					<Layout user={this.state.user} >
						<BindPropsProvider
							user={this.state.user}
							session={this.state.session}
						>
							<Render.RenderRouter staticRenders={App.staticRenders} />
						</BindPropsProvider>
					</Layout>
				</antd.ConfigProvider>
			</React.Fragment>
		)
	}
}

export default CreateEviteApp(App, {
	extensions: [Sound.extension, Render.extension, Theme.extension, API, SplashExtension],
})