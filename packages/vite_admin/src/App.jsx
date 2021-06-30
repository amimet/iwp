import React from "react"
import { Helmet } from "react-helmet"
import { enquireScreen, unenquireScreen } from "enquire-js"
import ngProgress from "nprogress"
import { EventEmitter } from "events"
import { objectToArrayMap } from "@corenode/utils"
import { BrowserRouter } from "react-router-dom"

import BaseLayout from "./layout"
import builtInEvents from "core/events"
import config from "config"

import SettingsController from "core/models/settings"
import SidebarController from "core/models/sidebar"

const defaultGlobalState = {
	num: 0,
	text: "foo",
	bool: false,
}

const globalStateContext = React.createContext(defaultGlobalState)
const dispatchStateContext = React.createContext(undefined)

const GlobalStateProvider = ({ children }) => {
	const [state, dispatch] = React.useReducer((state, newValue) => ({ ...state, ...newValue }), defaultGlobalState)

	return (
		<globalStateContext.Provider value={state}>
			<dispatchStateContext.Provider value={dispatch}>{children}</dispatchStateContext.Provider>
		</globalStateContext.Provider>
	)
}

export default class App extends React.Component {
	constructor(props) {
		super(props)

		this.busEvent = window.busEvent = new EventEmitter()

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

	loadPage = (key) => {
		if (typeof key !== "string") {
			return false
		}

		if (key[0] === "/") {
			key = key.slice(1, key.length)
		}

		import(`./pages/${key}/index.jsx`)
			.then((content) => {
				this.setState({ contentComponent: content.default })
			})
			.catch((error) => {
				console.error(error)
			})
	}

    renderPage() {
        if (this.state.contentComponent) {
            return React.createElement(this.state.contentComponent, this)
        }
        return <div></div>
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
				<GlobalStateProvider>
                    {this.renderPage()}
				</GlobalStateProvider>
			</React.Fragment>
		)
	}
}
