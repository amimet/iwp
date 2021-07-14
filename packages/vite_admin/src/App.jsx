import React from "react"
import { Helmet } from "react-helmet"
import ngProgress from "nprogress"
import { EventEmitter } from "events"

import { notification } from "antd"
import { createBrowserHistory } from "history"

import { objectToArrayMap } from "@corenode/utils"
import cloudlinkClient from "@ragestudio/cloudlink/dist/client"
import Jail from "corenode/dist/classes/Jail"

import { NotFound, AppLoading } from "components"
import BaseLayout from "./layout"
import config from "config"
import Routes from "@pages"

import { setLocation } from "core"
import builtInEvents from "core/events"

import * as session from "core/models/session"
import * as user from "core/models/user"

import SidebarController from "core/models/sidebar"
import SettingsController from "core/models/settings"

const classAggregation = (baseClass, ...mixins) => {
	class base extends baseClass {
		constructor(...args) {
			super(...args)
			mixins.forEach((mixin) => {
				copyProps(this, new mixin())
			})
		}
	}

	let copyProps = (target, source) => {
		// this function copies all properties and symbols, filtering out some special ones
		Object.getOwnPropertyNames(source)
			.concat(Object.getOwnPropertySymbols(source))
			.forEach((prop) => {
				if (!prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/))
					Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop))
			})
	}

	mixins.forEach((mixin) => {
		// outside contructor() to allow aggregation(A,B,C).staticFunction() to be called etc.
		copyProps(base.prototype, mixin.prototype)
		copyProps(base, mixin)
	})

	return base
}

class EviteApp {
	constructor() {
		this.appJail = new Jail()
		this.app = window.app = Object()

		// states
		this.loading = true

		// controllers
		this.history = window.app.history = createBrowserHistory()
		this.busEvent = window.app.busEvent = new EventEmitter()

		// global state
		this.globalStateContext = React.createContext()
		this.globalDispatchContext = React.createContext()
		this.globalState = {}
	}

	registerAppMethod = (key, method) => {
		if (typeof method === "function") {
			this.app[key] = method
		}
	}
}

function createEviteApp() {
	return class extends classAggregation(React.Component, EviteApp) {
		constructor(props) {
			super(props)

			// set events
			this.busEvent.on("app_init", async () => {
				this.toogleLoading(true)
			})

			this.busEvent.on("app_load_done", async () => {
				this.toogleLoading(false)
			})
		}

		toogleLoading = (to) => {
			if (typeof to !== "boolean") {
				to = !this.loading
			}

			if (typeof this.onToogleLoading === "function") {
				this.onToogleLoading(to)
			}

			this.loading = to
		}

		_init = async () => {
			this.busEvent.emit("app_init")

			//* preload tasks
			objectToArrayMap(builtInEvents).forEach((event) => {
				this.busEvent.on(event.key, event.value)
			})

			await this.initialization()

			this.busEvent.emit("app_load_done")
		}
	}
}

//* APP
export const GlobalBindingProvider = (props) => {
	const context = {}

	objectToArrayMap(props).forEach((prop) => {
		if (prop.key === "children") {
			return false
		}

		if (typeof prop.value === "function") {
			prop.value = prop.value()
		}

		context[prop.key] = prop.value
	})

	return React.cloneElement(props.children, { ...context })
}

export default class App extends createEviteApp() {
	constructor(props) {
		super(props)

		// overwrite history
		this.history._push = this.history.push
		this.history.push = (key) => {
			this.history._push(key)
			this.renderPagePath(key)
		}

		this.app.setLocation = setLocation

		// set controllers
		this.controllers = this.app.controllers = {}

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
		this.registerAppMethod("reloadAppState", this.reloadAppState)
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
		

		this.session = session.getSession()

		if (typeof this.session === "undefined") {
			this.busEvent.emit("not_session")
		}else {
			this.validSession = await session.validateCurrentSession(this.apiBridge)
			console.log(this.validSession)
		}

		
		this.user = await this.getCurrentUser()
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

	connectBridge() {
		console.log(`Trying to connect to API Bridge`)
		return new Promise((resolve, reject) => {
			cloudlinkClient
				.createInterface("http://localhost:3000", () => {
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
					this.apiBridge = api
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
		if (this.state.contentComponent) {
			return this.state.contentComponent
		}

		return () => {
			return <div></div>
		}
	}

	render() {
		if (this.state.loading) {
			return (
				<React.Fragment>
					<AppLoading />
				</React.Fragment>
			)
		}

		return (
			<React.Fragment>
				<Helmet>
					<title>{config.app.siteName}</title>
				</Helmet>
				<GlobalBindingProvider
					user={() => {
						return this.user
					}}
					withGlobalState={() => {
						const [state, dispatch] = React.useReducer(this.reducer, {})
						return () => [state, dispatch]
					}}
					apiBridge={() => {
						return this.apiBridge
					}}
				>
					<BaseLayout children={this.renderPageComponent()} />
				</GlobalBindingProvider>
			</React.Fragment>
		)
	}
}
