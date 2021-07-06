import React from "react"
import { Helmet } from "react-helmet"
import { enquireScreen, unenquireScreen } from "enquire-js"
import ngProgress from "nprogress"
import { EventEmitter } from "events"
import { objectToArrayMap } from "@corenode/utils"
import { BrowserRouter } from "react-router-dom"

import { NotFound } from "components"
import Routes from "@pages"

import BaseLayout from "./layout"
import builtInEvents from "core/events"
import config from "config"

import SettingsController from "core/models/settings"
import SidebarController from "core/models/sidebar"
import { createBrowserHistory } from "history"

const RenderPage = (props = {}) => {
	const [state, dispatch] = React.useReducer(props.reducer, props.initialState ?? {})
	const useGlobalState = () => [state, dispatch]

	const context = {
		...props.context,
		useGlobalState,
	}

	if (!props.component) {
		props.component = <div>EMPTY PAGE</div>
	}

	return React.createElement(props.component, { ...context })
}

export default class App extends React.Component {
	constructor(props) {
		super(props)

		this.history = createBrowserHistory()
		this.busEvent = window.busEvent = new EventEmitter()

		this.globalStateContext = React.createContext()
		this.globalDispatchContext = React.createContext()
		this.globalState = {}

		this.busEvent.on("app_init", () => {
			this.toogleLoading(true)
		})

		this.busEvent.on("app_load_done", () => {
			this.toogleLoading(false)
		})
	}

	loadBar = ngProgress.configure({ parent: "#root", showSpinner: false })
	state = {
		contentComponent: null,
		page: window.location.pathname,
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

	toogleLoading = (to) => {
		if (typeof to !== "boolean") {
			to = !this.state.loading
		}

		if (to === true) {
			this.loadBar.start()
		} else {
			this.loadBar.done()
		}

		this.setState({ loading: to })
	}

	async initialize() {
		this.busEvent.emit("app_init")
		//* preload tasks

		global.settingsController = new SettingsController()
		global.sidebarController = new SidebarController()

		objectToArrayMap(builtInEvents).forEach((event) => {
			this.busEvent.on(event.key, event.value)
		})

		this.busEvent.emit("app_load_done")
	}

	componentDidMount() {
		this.initialize()
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

		if (window.location.pathname !== key) {
			this.history.push(`/${validatedKey}`)
		}

		if (typeof Routes[key] !== "undefined") {
			this.setState({ contentComponent: Routes[key] })
		} else {
			this.setState({ contentComponent: NotFound })
		}
	}

	reducer = (state, action) => {
		const { type, payload } = action
		switch (type) {
			case "SET_CART_ITEMS": {
				return {
					...state,
					cart: payload,
				}
			}
			// Add more here!
			default:
				return state
		}
	}

	render() {
		if (this.state.loading) {
			return <div>Loading</div>
		}

		return (
			<React.Fragment>
				<Helmet>
					<title>{config.app.siteName}</title>
				</Helmet>
				<RenderPage component={this.state.contentComponent} reducer={this.reducer} />
			</React.Fragment>
		)
	}
}
