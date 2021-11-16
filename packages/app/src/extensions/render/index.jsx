import React from "react"
import loadable from "@loadable/component"

export class RenderController extends React.PureComponent {
	getStaticRenders = (cause, props) => {
		let render = null
		const staticRenders = this.props.staticRenders

		switch (cause) {
			case "notFound": {
				render = staticRenders.on404 ?? <div>
					Not Found
				</div>
				break
			}
			default: {
				render = staticRenders.onRenderError ?? <div>
					Render Error
				</div>
				break
			}
		}

		return () => React.createElement(render, props)
	}

	loadRender = async (from, source) => {
		// TODO: Cache imported modules storaged on memory

		//const isEmpty = window.location.pathname === "/"
		const aliaser = window.__evite?.aliases["pages"]

		const pagePath = `${source ?? aliaser}${from}`

		/* @vite-ignore */
		let render = await import(pagePath).catch((err) => {
			const isNotFound = err.message.includes("Failed to fetch dynamically imported module")
			console.log(err)

			return this.getStaticRenders(isNotFound ? "notFound" : err)
		})

		return render.default || render
	}

	getRender = (key, source) => {
		return loadable(async () => {
			let render = await this.loadRender(key, source)

			return window.app?.bindContexts ? window.app.bindContexts(render) : render
		})
	}

	shouldComponentUpdate(){
		return true
	}

	render() {
		const location = this.props.location ?? window.app.history.location.pathname
		const Page = this.getRender(location, this.props.source)

		return <Page {...this.props} />
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
						switch (event.action) {
							default: {
								main.eventBus.emit("setLocationDone")
							}
						}
					})

					main.history.setLocation = (to, state) => {
						if (typeof to !== "string") {
							console.warn(`Invalid location`)
							return false
						}

						main.eventBus.emit("setLocation")

						setTimeout(() => {
							main.history.push({
								pathname: to,
							}, state)
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