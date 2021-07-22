import React from "react"
import { Helmet } from "react-helmet"
import ngProgress from "nprogress"

import { AppLoading } from "components"
import BaseLayout from "./layout"
import config from "config"

import * as session from "core/models/session"
import * as user from "core/models/user"

import SidebarController from "core/models/sidebar"
import SettingsController from "core/models/settings"

import { createEviteApp, GlobalBindingProvider } from "evite"
import { API, Render } from "extensions"
export default class App extends createEviteApp({
	extensions: [API, Render],
}) {
	constructor(props) {
		super(props)

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
			environment: process.env.NODE_ENV,
		})
	}

	loadBar = ngProgress.configure({ parent: "#root", showSpinner: false })

	componentDidMount() {
		this._init()
	}

	reloadAppState = async () => {
		await this.initialization()
	}

	initialization = async () => {
		this.sessionToken = await session.getSession()

		if (typeof this.sessionToken === "undefined") {
			this.busEvent.emit("not_session")
		} else {
			const validation = await session.getCurrentTokenValidation(this.apiBridge)
			this.session = validation
			this.validSession = validation.valid

			if (!this.validSession) {
				this.busEvent.emit("not_valid_session", validation.error)
				await session.logout(this.apiBridge)
			} else {
				await user.setLocalBasics(this.apiBridge)
				this.user = await this.getCurrentUser()
			}
		}

		this._render(window.location.pathname)
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

	handleLoading = (to) => {
		this.setState({ loading: to })

		if (to === true) {
			this.loadBar.start()
		} else {
			this.loadBar.done()
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
					session={() => {
						return this.session
					}}
				>
					<BaseLayout children={this.renderPageComponent()} />
				</GlobalBindingProvider>
			</React.Fragment>
		)
	}
}
