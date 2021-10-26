import React from "react"
import loadable from "@loadable/component"

export default {
	key: "customRender",
	expose: [
		{
			initialization: [
				async (app, main) => {
					function sendToEventBus(...context) {
						if (typeof window.app.eventBus !== "undefined") {
							window.app.eventBus.emit(...context)
						} else {
							console.warn("eventBus is not available")
						}
					}
			
					main.history._push = main.history.push
					main.history.push = (key) => {
						main.history._push(key)
						main.forceUpdate()
					}

					main.history.setLocation = (to, delay) => {
						if (typeof to !== "string") {
							console.warn(`Invalid location`)
							return false
						}

						sendToEventBus("setLocation", to, delay)

						setTimeout(() => {
							main.history.push(to)
							sendToEventBus("setLocationReady", to, delay)
						}, delay ?? 100)
					}

					main.setToWindowContext("setLocation", main.history.setLocation)
				},
			],
			mutateContext: {
				createPageRender: function (params) {
					return loadable((props) => {
						// TODO: Cache imported modules storaging on memory
						const pagePath = `${window.__evite.aliases["pages"]}${window.location.pathname}`
						
						const _page = import(pagePath).catch((err) => {
							const isNotFound = err.message.includes("Failed to fetch dynamically imported module")
							
							if (isNotFound) {
								if (typeof params.on404 === "function") {
									return () => React.createElement(params.on404, { path: pagePath })
								}
								
								return () => <div>NOT FOUND</div>
							} else {
								if (typeof params.onRenderError === "function") {
									return () => React.createElement(params.onRenderError, { error: err })
								}
								
								return () => <div>{err.toString()}</div>
							}
						})

						return _page
					})
				},
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
