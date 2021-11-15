import config from 'config'
import { Bridge } from "linebridge/client"
import { Session } from "models"
import io from "socket.io-client"

export default {
    key: "apiBridge",
    expose: [
        {
            initialization: [
                async (app, main) => {
                    app.apiBridge = await app.createBridge()
                    app.ws = io("http://localhost:9001/main", { transports: ["websocket"] })

                    app.ws.on("connect", () => {
                        console.log(app.ws.id)
                    })

                    app.ws.on("connect_error", (...context) => {
                        console.log(...context)
                    })

                    main.setToWindowContext("wsApi", app.ws)
                    main.setToWindowContext("apiBridge", Object.freeze(app.apiBridge))
                },
            ],
            mutateContext: {
                createBridge: async () => {
                    const getSessionContext = () => {
                        const obj = {}
                        const token = Session.token

                        if (typeof token !== "undefined") {
                            obj.headers = {
                                Authorization: `Bearer ${token ?? null}`,
                            }
                        }

                        return obj
                    }

                    const bridge = new Bridge({
                        origin: config.api.address,
                        onRequestContext: getSessionContext,
                    })

                    await bridge.initialize().catch((err) => {
                        window.app.eventBus.emit("crash", "Cannot connect with API", err.message)
                    })

                    return bridge.endpoints
                },
            },
        },
    ],
}