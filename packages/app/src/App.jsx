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
import { CreateEviteApp, BindPropsProvider } from "evite"
import { Helmet } from "react-helmet"
import * as antd from "antd"
import { ActionSheet } from "antd-mobile"
import { StatusBar, Style } from "@capacitor/status-bar"

import { Session, User, SidebarController, SettingsController } from "models"
import { API, Render, Splash, Theme, Sound } from "extensions"
import config from "config"

import { NotFound, RenderError, Settings, Workload, Fabric } from "components"
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

class App {
	static initialize() {
		this.configuration = {
			settings: new SettingsController(),
			sidebar: new SidebarController(),
		}

		this.mainSocket = this.contexts.app.WSInterface.sockets.main
		this.loadingMessage = false
		this.isAppCapacitor = () => navigator.userAgent === "capacitor"
	}

	static eventsHandlers = {
		"new_session": async function () {
			await this.flushState()
			await this.initialization()

			if (window.location.pathname == "/login") {
				window.app.setLocation(this.beforeLoginLocation ?? "/main")
				this.beforeLoginLocation = null
			}
		},
		"destroyed_session": async function () {
			await this.flushState()
			this.eventBus.emit("forceToLogin")
		},
		"forceToLogin": function () {
			if (window.location.pathname !== "/login") {
				this.beforeLoginLocation = window.location.pathname
			}

			window.app.setLocation("/login")
		},
		"invalid_session": async function (error) {
			await this.sessionController.forgetLocalSession()
			await this.flushState()

			if (window.location.pathname !== "/login") {
				this.eventBus.emit("forceToLogin")

				antd.notification.open({
					message: "Invalid Session",
					description: error,
					icon: <Icons.MdOutlineAccessTimeFilled />,
				})
			}
		},
		"cleanAll": function () {
			window.app.DrawerController.closeAll()
		},
		"websocket_disconnected": function () {
			if (!this.loadingMessage) {
				this.loadingMessage = antd.message.loading("Trying to reconnect...", 0)
			}
		},
		"websocket_connected": async function () {
			const token = await Session.token

			this.mainSocket.emit("authenticate", token)

			this.mainSocket.on("authenticated", () => {
				console.log("[WS] Authenticated")
			})
			this.mainSocket.on("authenticateFailed", (error) => {
				console.error("[WS] Authenticate Failed", error)
			})

			if (typeof this.loadingMessage === "function") {
				setTimeout(() => {
					this.loadingMessage()
					antd.message.success("Reconnected")
				}, 500)
			}
		},
	}

	static windowContext() {
		return {
			openCreateNew: () => {
				const handler = React.createRef()

				handler.current = ActionSheet.show({
					extra: "Select a option",
					cancelText: "Cancel",
					actions: [
						{
							key: "workload",
							text: "Workload",
							onClick: () => {
								window.app.openWorkloadCreator()
								handler.current.close()
							}
						},
						{
							key: "fabric",
							text: "Fabric",
							onClick: () => {
								window.app.openFabric()
								handler.current.close()
							}
						}
					],
				})
			},
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
			openWorkloadDetails: (id) => {
				window.app.DrawerController.open("workload_details", Workload.Details, {
					componentProps: {
						id,
					},
					props: {
						width: "fit-content",
					},
					onDone: (drawer) => {
						drawer.close()
					},
				})
			},
			openWorkloadCreator: () => {
				window.app.DrawerController.open("workload_creator", Workload.Creator, {
					props: {
						width: "55%",
					},
				})
			},
			openFabric: (defaultType) => {
				window.app.DrawerController.open("FabricCreator", Fabric.Creator, {
					props: {
						width: "70%",
					},
					componentProps: {
						defaultType,
						submitToCatalog: true,
					}
				})
			},
			openFabricInspector: (id) => {
				window.app.DrawerController.open("FabricCreator", Fabric.Inspector, {
					props: {
						width: "70%",
					},
					componentProps: {
						id,
					}
				})
			},
			goMain: () => {
				return window.app.setLocation(config.app.mainPath)
			},
			goToAccount: (username) => {
				return window.app.setLocation(`/account`, { username })
			},
			setStatusBarStyleDark: async () => {
				if (!this.isAppCapacitor()) {
					console.warn("[App] setStatusBarStyleDark is only available on capacitor")
					return false
				}
				return await StatusBar.setStyle({ style: Style.Dark })
			},
			setStatusBarStyleLight: async () => {
				if (!this.isAppCapacitor()) {
					console.warn("[App] setStatusBarStyleLight is not supported on this platform")
					return false
				}
				return await StatusBar.setStyle({ style: Style.Light })
			},
			hideStatusBar: async () => {
				if (!this.isAppCapacitor()) {
					console.warn("[App] hideStatusBar is not supported on this platform")
					return false
				}
				return await StatusBar.hide()
			},
			showStatusBar: async () => {
				if (!this.isAppCapacitor()) {
					console.warn("[App] showStatusBar is not supported on this platform")
					return false
				}
				return await StatusBar.show()
			},
			configuration: this.configuration,
			isAppCapacitor: this.isAppCapacitor,
			getSettings: (...args) => this.contexts.app.configuration?.settings?.get(...args),
		}
	}

	static appContext() {
		return {
			renderRef: this.renderRef,
			sessionController: this.sessionController,
			userController: this.userController,
			configuration: this.configuration,
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

	sessionController = new Session()

	userController = new User()

	state = {
		// app
		initialized: false,
		crash: false,

		// app session
		session: null,
		user: null,
	}

	flushState = async () => {
		await this.setState({ session: null, user: null })
	}

	componentDidMount = async () => {
		await this.setState({ initialized: false })

		await this.contexts.app.initializeDefaultBridge()
		await this.initialization()

		await this.setState({ initialized: true })
	}

	initialization = async () => {
		try {
			await this.__SessionInit()
			await this.__UserInit()

			if (this.state.session) {
				await this.contexts.app.WSInterface.sockets.main.connect()
			}

			if (this.isAppCapacitor()) {
				window.addEventListener("statusTap", () => {
					this.eventBus.emit("statusTap")
				})

				StatusBar.setOverlaysWebView({ overlay: true })
				window.app.hideStatusBar()
			}
		} catch (error) {
			window.app.eventBus.emit("crash", `Cannot validate initialization`, error.message)
		}
	}

	__SessionInit = async () => {
		const token = await Session.token

		if (typeof token === "undefined") {
			window.app.eventBus.emit("forceToLogin")
		} else {
			const session = await this.sessionController.getCurrentSession()
			await this.setState({ session })
		}
	}

	__UserInit = async () => {
		if (!this.state.session) {
			return false
		}

		try {
			const user = await User.data()
			await this.setState({ user })
		} catch (error) {
			console.error(error)
			this.eventBus.emit("crash", "Cannot initialize user data", error)
		}
	}

	render() {
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
							<Render.RouteRender staticRenders={App.staticRenders} />
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