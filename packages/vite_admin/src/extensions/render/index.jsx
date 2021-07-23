import React from "react"
import config from "config"
import { NotFound } from "components"
import loadable from "@loadable/component"

export default {
	key: "customRender",
	expose: [
		{
			attachToInitializer: [
				async (self) => {
					self.history._push = self.history.push
					self.history.push = (key) => {
                        self.history._push(key)
						self.forceUpdate()
					}

					self.history.setLocation = (to, delay) => {
						function sendToBusEvent(...context) {
							if (typeof window.app.busEvent !== "undefined") {
								window.app.busEvent.emit(...context)
							} else {
								console.warn("busEvent is not available")
							}
						}

						if (typeof to !== "string") {
							console.warn(`Invalid location`)
							return false
						}

						sendToBusEvent("setLocation", to, delay)
						setTimeout(() => {
							self.history.push(to)
							window.app.busEvent.emit("setLocationReady")
						}, delay ?? 100)
					}

					self.appendToApp("setLocation", self.history.setLocation)
				},
			],
			self: {
				createPageRender: function (params) {
					return loadable((props) => {       
						return import(`${global.aliases["pages"]}${window.location.pathname}`).catch(
							() => {
								if (typeof params.on404 === "function") {
									return params.on404
								}

								return () => <div> NOT FOUND</div>
							},
						)
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
