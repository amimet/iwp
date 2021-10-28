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

			return window.app?.connect ? window.app.connect(render) : render
		})
	}

	render() {
		const Page = this.getRender((this.props.location ?? window.location.pathname), this.props.source)

		return <Page {...this.props}/>
	}
}

export const extension = {
	key: "customRender",
	expose: [
		{
			initialization: [
				async (app, main) => {
					const defaultTransitionDelay = 100

					main.history.listen((event) => {
						switch (event.action) {
							case "PUSH": {
								
							}
							default: {
								const to = event.location.pathname

								main.eventBus.emit("setLocation", to)
								
								main.forceUpdate()

								setTimeout(() => {
									main.eventBus.emit("setLocationDone", to)
								}, defaultTransitionDelay)
								break
							}
						}
					})

					main.history.setLocation = (to, delay) => {
						if (typeof to !== "string") {
							console.warn(`Invalid location`)
							return false
						}

						return main.history.push(to)
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