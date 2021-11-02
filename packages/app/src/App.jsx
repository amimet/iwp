import React from "react"
import { Helmet } from "react-helmet"
import progressBar from "nprogress"
import * as antd from "antd"

import { Sidebar, Header, Drawer, Sidedrawer } from "./layout"
import { NotFound, RenderError } from "components"
import { Icons } from "components/icons"

import config from "config"
import Session from "core/models/session"
import User from "core/models/user"
import SidebarController from "core/models/sidebar"
import SettingsController from "core/models/settings"

import { CreateEviteApp, BindPropsProvider } from "evite"
import { API, Render, Splash, Debug, connect, theme } from "extensions"

import "theme/index.less"

// append method to array prototype
Array.prototype.move = function (from, to) {
	this.splice(to, 0, this.splice(from, 1)[0])
	return this
}

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

class App {
	static initialize(props) {
		this.progressBar = progressBar.configure({ parent: "html", showSpinner: false })

		this.sessionController = new Session()
		this.userController = new User()

		this.configuration = {
			settings: new SettingsController(),
			sidebar: new SidebarController(),
		}

		this.eventBus = this.contexts.main.eventBus

		this.eventBus.on("top_loadBar_start", () => {
			this.progressBar.start()
		})
		this.eventBus.on("top_loadBar_stop", () => {
			this.progressBar.done()
		})

		this.eventBus.on("setLocation", () => {
			this.eventBus.emit("top_loadBar_start")
		})
		this.eventBus.on("setLocationDone", () => {
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
		this.eventBus.on("not_session", () => {
			window.app.setLocation("/login")
		})

		this.eventBus.on("invalid_session", (error) => {
			this.sessionController.forgetLocalSession()

			antd.notification.open({
				message: "Invalid Session",
				description: error,
				icon: <Icons.FieldTimeOutlined />,
			})
		})

		this.eventBus.on("setLocation", (to, delay) => {
			this.handlePageTransition("leave")
		})
		this.eventBus.on("setLocationDone", (to, delay) => {
			this.handlePageTransition("enter")
		})
		this.eventBus.on("cleanAll", () => {
			window.controllers["drawer"].closeAll()
		})
	}

	static windowContext() {
		return {
			configuration: this.configuration,
			isValidSession: this.isValidSession,
			getSettings: (...args) => this.contexts.app.configuration?.settings?.get(...args),
			HeaderController: this.headerController,
		}
	}

	static appContext() {
		return {
			sessionController: this.sessionController,
			userController: this.userController,
			configuration: this.configuration,
			progressBar: this.progressBar,
		}
	}

	static staticRenders = {
		on404: (props) => {
			return <NotFound />
		},
		onRenderError: (props) => {
			return <RenderError {...props} />
		},
		initialization: () => {
			return <Splash.SplashComponent logo={config.logo.alt} />
		}
	}

	state = {
		// app
		renderLoading: false,
		isMobile: false,

		// header
		headerVisible: true,

		// app session
		session: null,
		data: null,
	}

	layoutContentRef = React.createRef()

	headerController = {
		toogleVisible: (to) => {
			this.setState({ headerVisible: to ?? !this.state.headerVisible })
		},
		isVisible: () => this.state.headerVisible,
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

				window.app.eventBus.emit("invalid_session", this.session.error)

				if (window.location.pathname == "/login") {
					this.beforeLoginLocation = "/main"
				} else {
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

	handlePageTransition = (state, delay) => {
		const { current } = this.layoutContentRef

		if (state === "leave") {
			current.className = `fade-transverse-active fade-transverse-leave-to`
		} else {
			current.className = `fade-transverse-active fade-transverse-enter-to`
		}
	}

	render() {
		return (
			<React.Fragment>
				<Helmet>
					<title>{config.app.siteName}</title>
				</Helmet>
				<antd.Layout style={{ height: "100%" }}>
					<Drawer />

					<Sidebar user={this.state.user} />

					<antd.Layout className="app_layout">
						<Header visible={this.state.headerVisible} />

						<antd.Layout.Content className="app_wrapper">
							<div ref={this.layoutContentRef}>
								<BindPropsProvider
									user={this.state.user}
									session={this.state.session}
								>
									<Render.RenderController staticRenders={App.staticRenders} location={window.location.pathname} />
								</BindPropsProvider>
							</div>
						</antd.Layout.Content>
					</antd.Layout>

					<Sidedrawer />
				</antd.Layout>
			</React.Fragment>
		)
	}
}

export default CreateEviteApp(App, {
	extensions: [connect, theme, API, Render.extension, SplashExtension, Debug],
})