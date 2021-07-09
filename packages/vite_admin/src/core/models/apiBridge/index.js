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

    send = async () => {
        const res = await this.req(...this.payload)
            .then((data) => {
                this.cb(false, data.__proto__)
                return data
            })
            .catch((err) => {
                this.cb(err.response.data, err.response)
                return err
            })
            
        return res
    }

    cb = (...context) => {
        if (typeof this.callback === "function") {
            this.callback(...context)
        }
    }
}
