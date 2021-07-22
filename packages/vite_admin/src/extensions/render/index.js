import config from 'config'
import { setLocation } from "core"
import Routes from "@pages"
import { NotFound } from "components"

export default {
    key: "customRender",
    expose: [
        {
            attachToInitializer: [
                async (self) => {
                    self._render = (key) => {
                        if (typeof key !== "string") {
                            return false
                        }

                        if (key === "/") {
                            key = config.app?.mainPath ?? "index"
                        }

                        const validatedKey = self.validateLocationSlash(key)

                        if (validatedKey !== key) {
                            key = validatedKey
                        }

                        if (typeof Routes[key] !== "undefined") {
                            self.setState({ contentComponent: Routes[key], loadedRoute: `/${key}` })
                        } else {
                            self.setState({ contentComponent: NotFound })
                        }
                    }
                },
                async (self) => {
                    self.history._push = self.history.push
                    self.history.push = (key) => {
                        self.history._push(key)
                        self._render(key)
                    }
                },
                async (self) => {
                    self.appendToApp("setLocation", setLocation)
                }
            ],
            self: {
                validateLocationSlash: (location) => {
                    let key = location ?? window.location.pathname

                    while (key[0] === "/") {
                        key = key.slice(1, key.length)
                    }

                    return key
                },
            }
        }
    ],
}