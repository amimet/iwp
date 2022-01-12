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
        if(typeof socket !== "string") {
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
            mutateContext: {
                async initializeDefaultBridge() {
                    this.apiBridge = await this.createBridge()
                    this.WSSockets = this.WSInterface.sockets

                    this.WSSockets.main.on("connect", () => {
                        window.app.eventBus.emit("websocket_connected")
                    })

                    this.WSSockets.main.on("disconnect", (...context) => {
                        window.app.eventBus.emit("websocket_disconnected", ...context)
                    })

                    this.WSSockets.main.on("connect_error", (...context) => {
                        window.app.eventBus.emit("websocket_connection_error", ...context)
                    })

                    window.app.ws = this.WSInterface
                    window.app.api = this.apiBridge
                    window.app.request = this.apiBridge.endpoints
                    window.app.handleWSListener = this.handleWSListener
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
                    }else if (typeof to === "object") {
                        ns = to.ns
                        event = to.event
                    }

                    return window.app.ws.sockets[ns].on(event, async (...context) => {
                        return await fn(...context)
                    })
                },
                createBridge: async () => {
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

                    const bridge = new Bridge({
                        origin: config.api.address,
                        onRequest: getSessionContext,
                    })

                    await bridge.initialize().catch((err) => {
                        throw {
                            message: "Failed to connect with API",
                            description: err.message,
                        }
                    })

                    return bridge
                },
                WSInterface: new WSInterface({
                    origin: config.ws.address,
                }),
            },
        },
    ],
}