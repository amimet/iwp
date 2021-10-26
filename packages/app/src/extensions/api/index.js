import config from 'config'
import linebridge from "linebridge/client"
import { notification } from "antd"
import Session from "core/models/session"
import io from "socket.io-client"

export default {
    key: "apiBridge",
    expose: [
        {
            initialization: [
                async (app, main) => {
                    app.apiBridge = await app.createBridge()
                    app.ws = io("http://localhost:9001/main",{ transports: ["websocket"] })
                    
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
                        const storagedToken = Session.storagedToken

                        if (typeof storagedToken !== "undefined") {
                            obj.headers = {
                                Authorization: `Bearer ${storagedToken ?? null}`,
                            }
                        }

                        return obj
                    }

                    return linebridge
                        .createInterface(config.api.address, getSessionContext)
                        .catch((err) => {
                            notification.error({
                                message: `Cannot connect with the API`,
                                description: err.toString(),
                            })
                            console.error(`CANNOT BRIDGE API > ${err}`)
                        })
                },
            },
        },
    ],
}