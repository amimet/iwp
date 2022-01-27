import config from "config"
import { Bridge } from "linebridge/client"
import { Session } from "models"
import io from "socket.io-client"

class WSInterface {
    constructor(params = {}) {
        this.params = params
        this.manager = new io.Manager(this.params.origin, {
            autoConnect: true,
            ...this.params.managerOptions,
        })
        this.sockets = {}

        this.register("/", "main")
    }

    register = (socket, as) => {
        if (typeof socket !== "string") {
            console.error("socket must be string")
            return false
        }

        socket = this.manager.socket(socket)
        return this.sockets[as ?? socket] = socket
    }
}

export default {
    key: "apiBridge",
    expose: [
        {
            initialization: [
                async (app, main) => {
                    app.WSInterface = await app.createWSBridge()
                    app.WSSockets = app.WSInterface.sockets

                    app.WSSockets.main.on("connect", () => {
                        window.app.eventBus.emit("websocket_connected")
                    })

                    app.WSSockets.main.on("disconnect", (...context) => {
                        window.app.eventBus.emit("websocket_disconnected", ...context)
                    })

                    app.WSSockets.main.on("connect_error", (...context) => {
                        window.app.eventBus.emit("websocket_connection_error", ...context)
                    })

                    window.app.ws = app.WSInterface
                    window.app.handleWSListener = app.handleWSListener
                },
                async (self) => {
                    self.apiBridge = await self.createApiBridge()

                    window.app.api = self.apiBridge
                    window.app.request = self.apiBridge.endpoints
                },
            ],
            mutateContext: {
                async attachWSConnection() {
                    await this.WSInterface.sockets.main.connect()
                },
                async attachAPIConnection() {
                    await this.apiBridge.initialize()
                },
                handleWSListener: (to, fn) => {
                    if (typeof to === "undefined") {
                        console.error("handleWSListener: to must be defined")
                        return false
                    }
                    if (typeof fn !== "function") {
                        console.error("handleWSListener: fn must be function")
                        return false
                    }

                    let ns = "main"
                    let event = null

                    if (typeof to === "string") {
                        event = to
                    } else if (typeof to === "object") {
                        ns = to.ns
                        event = to.event
                    }

                    return window.app.ws.sockets[ns].on(event, async (...context) => {
                        return await fn(...context)
                    })
                },
                createWSBridge: async () => {
                    return new WSInterface({
                        origin: config.ws.address,
                        managerOptions: {
                            autoConnect: false
                        }
                    })
                },
                createApiBridge: async () => {
                    const getSessionContext = async () => {
                        const obj = {}
                        const token = await Session.token

                        if (typeof token !== "undefined") {
                            // append token to context
                            obj.headers = {
                                Authorization: `Bearer ${token ?? null}`,
                            }
                        }

                        return obj
                    }

                    const handleResponse = async (data) => {
                        if (data.headers?.regenerated_token) {
                            Session.token = data.headers.regenerated_token
                            console.debug("[REGENERATION] New token generated")
                        }

                        if (data instanceof Error) {
                            if (data.response.status === 401) {
                                window.app.eventBus.emit("invalid_session")
                            }
                        }
                    }

                    const bridge = new Bridge({
                        origin: config.api.address,
                        onRequest: getSessionContext,
                        onResponse: handleResponse,
                    })

                    return bridge
                },

            },
        },
    ],
}