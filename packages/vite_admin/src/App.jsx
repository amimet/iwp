import React from "react"
import { Helmet } from "react-helmet"
import ngProgress from "nprogress"

import { notification } from "antd"

import { objectToArrayMap } from "@corenode/utils"
import cloudlinkClient from "@ragestudio/cloudlink/dist/client"

import { NotFound, AppLoading } from "components"
import BaseLayout from "./layout"
import config from "config"
import Routes from "@pages"

import { setLocation } from "core"

import * as session from "core/models/session"
import * as user from "core/models/user"

import SidebarController from "core/models/sidebar"
import SettingsController from "core/models/settings"

import { createEviteApp, GlobalBindingProvider } from "evite"

const bruhExtension = {
	key: "bruhExtension",
	expose: [
		{
			name: "createBridge",

			self: {
				createBridge: () => {
					return new Promise((resolve, reject) => {
						cloudlinkClient
							.createInterface("http://192.168.1.36:3000", () => {
								const obj = {}
								const thisSession = session.getSession()
			
								if (typeof thisSession !== "undefined") {
									obj.headers = {
										Authorization: `Bearer ${thisSession ?? null}`,
									}
								}
			
								return obj
							})
							.then((api) => {
								return resolve()
							})
							.catch((err) => {
								notification.error({
									message: `Cannot connect with the API`,
									description: err.toString(),
								})
								console.error(`CANNOT BRIDGE API > ${err}`)
			
								return reject()
							})
					})
				}
			}
		}
	],
	self: {
		
	}
}

const extensions = [bruhExtension]

export default class App extends createEviteApp(extensions) {
	constructor(props) {
		super(props)

		// overwrite history
		this.history._push = this.history.push
		this.history.push = (key) => {
			this.history._push(key)
			this.renderPagePath(key)
		}
	
		this.app.setLocation = setLocation

		// set params controllers
		this.paramsController = this.app.params = {}
		this.paramsController.settings = new SettingsController()
		this.paramsController.sidebar = new SidebarController()

		// app statement
		this.user = null
		this.state = {
			loading: true,
			isMobile: false,
		}

		//
		this.appendToApp("reloadAppState", this.reloadAppState)

		this.appendToApp("about", {
			siteName: config.app.siteName,
			title: config.app.title,
			version: global.project.version,
			environment: process.env.NODE_ENV
		})
	}

	loadBar = ngProgress.configure({ parent: "#root", showSpinner: false })
	
	componentDidMount() {
		this._init()	
		
		document.addEventListener(
			"touchmove",
			(e) => {
				e.preventDefault()
			},
			false,
		)
	}

	reloadAppState = async () => {
		await this.initialization()
	}

	initialization = async () => {
		await this.connectBridge()

		this.session = await session.getSession()

		if (typeof this.session === "undefined") {
			this.busEvent.emit("not_session")
		}else {
			const validation = await session.getCurrentTokenValidation(this.apiBridge)
			this.validSession = validation.valid

			if (!this.validSession){
				this.busEvent.emit("not_valid_session", validation.error)
				await session.logout(this.apiBridge)
			}else {
				await user.setLocalBasics(this.apiBridge)
				this.user = await this.getCurrentUser()
			}
		}
		
		this.renderPagePath(window.location.pathname)
		if (typeof window.headerVisible !== "undefined" && !window.headerVisible) {
			window.toogleHeader(true)
		}	
	}

	getCurrentUser = () => {
		let currentUser = Object()

		const sessionData = session.decryptSession()
		const basicsData = user.getLocalBasics(this.apiBridge)

		if (sessionData) {
			currentUser = { ...currentUser, ...sessionData }
			currentUser["_id"] = currentUser.sub
			delete currentUser.sub
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

	onToogleLoading = (to) => {
		this.setState({ loading: to })

		if (to === true) {
			this.loadBar.start()
		} else {
			this.loadBar.done()
		}
	}

	validateLocationSlash = (location) => {
		let key = location ?? window.location.pathname

		while (key[0] === "/") {
			key = key.slice(1, key.length)
		}

		return key
	}

	renderPagePath = (key) => {
		if (typeof key !== "string") {
			return false
		}

		if (key === "/") {
			key = config.app?.mainPath ?? "index"
		}

		const validatedKey = this.validateLocationSlash(key)

		if (validatedKey !== key) {
			key = validatedKey
		}

		if (typeof Routes[key] !== "undefined") {
			this.setState({ contentComponent: Routes[key], loadedRoute: `/${key}` })
		} else {
			this.setState({ contentComponent: NotFound })
		}
	}

	reducer = (state, action) => {
		const { type, payload } = action
		switch (type) {
			case "UPDATE_CART": {
				return {
					...state,
					cart: {
						...state.cart,
						...payload,
					},
				}
			}

			default:
				return state
		}
	}

	renderPageComponent() {
		if (this.state.loading) {
			return () => {
				return <AppLoading />
			}
		}

		if (this.state.contentComponent) {
			return this.state.contentComponent
		}
		
		return () => {
			return <div></div>
		}
	}

	render() {
		return (
			<React.Fragment>
				<Helmet>
					<title>{config.app.siteName}</title>
				</Helmet>
				<GlobalBindingProvider
					user={() => {
						return this.user ?? {}
					}}
					withGlobalState={() => {
						const [state, dispatch] = React.useReducer(this.reducer, {})
						return () => [state, dispatch]
					}}
					api={() => {
						return this.apiBridge
					}}
				>
					<BaseLayout children={this.renderPageComponent()} />
				</GlobalBindingProvider>
			</React.Fragment>
		)
	}
}
