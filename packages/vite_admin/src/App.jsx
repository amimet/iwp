import React from "react"
import { Helmet } from "react-helmet"
import { enquireScreen, unenquireScreen } from "enquire-js"
import ngProgress from "nprogress"
import { EventEmitter } from "events"
import { objectToArrayMap } from "@corenode/utils"

import { NotFound } from "components"
import Routes from "@pages"

import BaseLayout from "./layout"
import builtInEvents from "core/events"
import config from "config"

import SettingsController from "core/models/settings"
import SidebarController from "core/models/sidebar"
import { createBrowserHistory } from "history"

// *EVITE
const aggregation = (baseClass, ...mixins) => {
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

class EviteApp{
	constructor() {
		window.app = Object()

		// states
		this.loading = Boolean(false)
		this.loadedRoute = null
		this._renderContent = null


		// controllers
		this.history = window.app.history = createBrowserHistory()
		this.busEvent = window.app.busEvent = new EventEmitter()

		this.history._push = this.history.push
		this.history.push = (key) => {
			this.history._push(key)
			this.loadPage(key)
		}

		// global state
		this.globalStateContext = React.createContext()
		this.globalDispatchContext = React.createContext()
		this.globalState = {}

		// set events
		this.busEvent.on("app_init", () => {
			if (typeof this.onInitialization === "function") {
				this.onInitialization()
			}

			this.toogleLoading(true)
		})

		this.busEvent.on("app_load_done", () => {
			if (typeof this.onDone === "function") {
				this.onDone()
			}
			
			this.toogleLoading(false)
		})

		//initalization
		this.initialize()
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

	initialize() {
		this.busEvent.emit("app_init")
		//* preload tasks

		objectToArrayMap(builtInEvents).forEach((event) => {
			this.busEvent.on(event.key, event.value)
		})

		this.busEvent.emit("app_load_done")
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
			this._renderContent = Routes[key]
			this.loadedRoute =  `/${key}`
		} else {
			this._renderContent = NotFound
		}
	}
}

function createEviteApp() {
	return class extends aggregation(React.Component, EviteApp){}
}

//* APP
export const GlobalStateProvider = (props = {}) => {
	const [state, dispatch] = React.useReducer(props.reducer, props.initialState ?? {})
	const useGlobalState = () => [state, dispatch]

	const context = {
		...props.context,
		useGlobalState,
	}

	return React.cloneElement(props.children, { ...context })
}

export default class App extends createEviteApp() {
	constructor(props) {
		super(props)

		// set controllers
		this.controllers = window.app.controllers = {}

		// set params controllers
		this.paramsController = window.app.params = {}
		this.paramsController.settings = new SettingsController()
		this.paramsController.sidebar = new SidebarController()
	}

	loadBar = ngProgress.configure({ parent: "#root", showSpinner: false })
	state = {
		isMobile: false,
	}

	enquireHandler = enquireScreen((mobile) => {
		const { isMobile } = this.state

		if (isMobile !== mobile) {
			window.isMobile = mobile
			this.setState({ isMobile: mobile })
		}
	})

	onToogleLoading(to) {
		if (to === true) {
			this.loadBar.start()
		}
		else {
			this.loadBar.done()
		}
	}

	componentDidMount() {
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
		console.log(this._renderContent)
		if (this._renderContent) {
			return () => {return this._renderContent}
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
				<GlobalStateProvider reducer={this.reducer}>
					<BaseLayout children={this.renderPageComponent()} />
				</GlobalStateProvider>
			</React.Fragment>
		)
	}
}