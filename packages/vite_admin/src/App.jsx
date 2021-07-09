import React from "react"
import { Helmet } from "react-helmet"
import { enquireScreen, unenquireScreen } from "enquire-js"
import ngProgress from "nprogress"
import { EventEmitter } from "events"
import { objectToArrayMap } from "@corenode/utils"
import cloudlinkClient from "@ragestudio/cloudlink/dist/client"

import { NotFound, AppLoading } from "components"
import Routes from "@pages"

import BaseLayout from "./layout"
import builtInEvents from "core/events"
import config from "config"

import SettingsController from "core/models/settings"
import SidebarController from "core/models/sidebar"

import { createBrowserHistory } from "history"

import * as session from "core/session"

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
		window.app = Object()

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
}

function createEviteApp() {
	return class extends classAggregation(React.Component, EviteApp) {
		constructor(props) {
			super(props)

			// set events
			this.busEvent.on("app_init", async () => {
				if (typeof this.onInitialization === "function") {
					await this.onInitialization()
				}

				this.toogleLoading(true)
			})

			this.busEvent.on("app_load_done", async () => {
				if (typeof this.onDone === "function") {
					await this.onDone()
				}

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

			await this.onInitialization()

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
			this.loadPage(key)
		}

		// set controllers
		this.controllers = window.app.controllers = {}

		// set params controllers
		this.paramsController = window.app.params = {}
		this.paramsController.settings = new SettingsController()
		this.paramsController.sidebar = new SidebarController()
	}

	loadBar = ngProgress.configure({ parent: "#root", showSpinner: false })

	state = {
		loading: true,
		isMobile: false,
	}

	enquireHandler = enquireScreen((mobile) => {
		const { isMobile } = this.state

		if (isMobile !== mobile) {
			window.isMobile = mobile
			this.setState({ isMobile: mobile })
		}
	})

	onInitialization = async () => {
		await this.setApiBridge()
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

	loadPage = (key) => {
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

	setApiBridge() {
		return new Promise((resolve, reject) => {
			cloudlinkClient
			.createInterface("http://localhost:3000", () => {
				const obj = {}
				const sessionData = session.getSession()

				if (typeof sessionData.token !== "undefined") {
					obj.headers = {
						Authorization: `Bearer ${sessionData.token ?? null}`,
					}
				}

				return obj
			})
			.then((api) => {
				this.apiBridge = api
				return resolve()
			})
			.catch((err) => {
				console.error(`CANNOT BRIDGE API > ${err}`)
				return reject()
			})
		})
	}

	async componentDidMount() {
		await this._init()
		this.loadPage(window.location.pathname)

		document.addEventListener(
			"touchmove",
			(e) => {
				e.preventDefault()
			},
			false,
		)
	}

	componentWillUnmount() {
		unenquireScreen(this.enquireHandler)
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
			return <React.Fragment>
				<AppLoading />
			</React.Fragment>
		}

		return (
			<React.Fragment>
				<Helmet>
					<title>{config.app.siteName}</title>
				</Helmet>
				<GlobalBindingProvider
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