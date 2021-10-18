import config from 'config'
import linebridge from "linebridge/client"
import { notification } from "antd"
import * as session from "core/models/session"
import io from "socket.io-client"

export default {
    key: "apiBridge",
    expose: [
        {
            attachToInitializer: [
                async (self) => {
                    self.apiBridge = await self.createBridge()
                    self.ws = io("http://localhost:9001/main",{ transports: ["websocket"] })
                    
                    self.ws.on("connect", () => {
                        console.log(self.ws.id)
                    })

                    self.ws.on("connect_error", (...context) => {
                        console.log(...context)
                    })

                    self.appendToApp("wsApi", self.ws)
                    self.appendToApp("apiBridge", Object.freeze(self.apiBridge))
                },
            ],
            self: {
                createBridge: async () => {
                    const getSessionContext = () => {
                        const obj = {}
                        const thisSession = session.get()

                        if (typeof thisSession !== "undefined") {
                            obj.headers = {
                                Authorization: `Bearer ${thisSession ?? null}`,
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