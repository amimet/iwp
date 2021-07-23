export class request {
    constructor(req, payload, callback) {
        this.callback = callback
        this.payload = payload
        this.req = req

        if (typeof this.req !== "function") {
            return this.cb("Invalid api request")
        }
        if (typeof this.payload === "undefined") {
            return this.cb("Payload not provided")
        }
    }

    send = async (params = {}) => {
        let payloads = {
            body: undefined,
            query: undefined,
        }

        if (Array.isArray(this.payload)) {
            if (typeof this.payload[0] === "object") {
                payloads.body = this.payload[0]
            }
            if (typeof this.payload[1] === "object") {
                payloads.query = this.payload[1]
            }
        }else if (typeof this.payload === "object"){
            payloads = {
                ...payloads,
                ...this.payload
            }
        }

        return await this.req(payloads.body, payloads.query, { parseData: false })
            .then((res) => {
                this.cb(false, res)
                return res.data
            })
            .catch((err) => {
                console.log(err)
                this.cb(err.response.data, err.response)
                return err
            })
    }

    cb = (...context) => {
        if (typeof this.callback === "function") {
            this.callback(...context)
        }
    }
}
