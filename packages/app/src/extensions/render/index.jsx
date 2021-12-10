import React from "react"
import loadable from "@loadable/component"
import routes from "virtual:generated-pages"

import NotFound from "./statics/404"

export const ConnectWithApp = (component) => {
	return window.app.bindContexts(component)
}

export function GetRoutesMap() {
	return routes.map((route) => {
		const { path } = route
		route.name =
			path
				.replace(/^\//, "")
				.replace(/:/, "")
				.replace(/\//, "-")
				.replace("all(.*)", "not-found") || "home"

		route.path = route.path.includes("*") ? "*" : route.path

		return route
	})
}

const routesComponentMap = routes.reduce((acc, route) => {
	const { path, component } = route

	acc[path] = component

	return acc
}, {})

export const LazyRouteRender = (props) => {
	const component = loadable(async () => {
		const location = window.location

		let path = props.path ?? location.pathname
		let componentModule = routesComponentMap[path] ?? props.staticRenders.NotFound ?? NotFound

		// TODO: Support evite async component initializations

		return class extends React.PureComponent {
			state = {
				error: null
			}

			componentDidCatch(info, stack) {
				this.setState({ error: { info, stack } })
			}

			render() {
				if (this.state.error) {
					if (props.staticRenders?.RenderError) {
						return React.createElement(props.staticRenders?.RenderError, { error: this.state.error })
					}

					return JSON.stringify(this.state.error)
				}

				return React.createElement(ConnectWithApp(componentModule), props)
			}
		}
	})

	return React.createElement(component)
}

export class RenderRouter extends React.Component {
	render() {
		return LazyRouteRender({ ...this.props, path: this.lastPathname })
	}
}

export const extension = {
	key: "customRender",
	expose: [
		{
			initialization: [
				async (app, main) => {
					app.bindContexts = (component) => {
						let contexts = {
							main: {},
							app: {},
						}

						if (typeof component.bindApp === "string") {
							if (component.bindApp === "all") {
								Object.keys(app).forEach((key) => {
									contexts.app[key] = app[key]
								})
							}
						} else {
							if (Array.isArray(component.bindApp)) {
								component.bindApp.forEach((key) => {
									contexts.app[key] = app[key]
								})
							}
						}

						if (typeof component.bindMain === "string") {
							if (component.bindMain === "all") {
								Object.keys(main).forEach((key) => {
									contexts.main[key] = main[key]
								})
							}
						} else {
							if (Array.isArray(component.bindMain)) {
								component.bindMain.forEach((key) => {
									contexts.main[key] = main[key]
								})
							}
						}

						return (props) => React.createElement(component, { ...props, contexts })
					}

					main.setToWindowContext("bindContexts", app.bindContexts)
				},
				async (app, main) => {
					const defaultTransitionDelay = 150

					main.history.listen((event) => {
						main.eventBus.emit("setLocationDone")
					})

					main.history.setLocation = (to, state) => {
						const lastLocation = main.history.lastLocation

						if (typeof lastLocation !== "undefined" && lastLocation?.pathname === to && lastLocation?.state === state) {
							return false
						}

						main.eventBus.emit("setLocation")

						setTimeout(() => {
							main.history.push({
								pathname: to,
							}, state)
							main.history.lastLocation = main.history.location
						}, defaultTransitionDelay)
					}

					main.setToWindowContext("setLocation", main.history.setLocation)
				},
			],
			mutateContext: {
				validateLocationSlash: (location) => {
					let key = location ?? window.location.pathname

					while (key[0] === "/") {
						key = key.slice(1, key.length)
					}

					return key
				},
			},
		},
	],
}

export default extension