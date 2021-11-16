import Session from '../session'

export default class User {
    static get bridge() {
        return window.app?.apiBridge
    }

    static get data() {
        const token = Session.decodedToken

        if (!token || !User.bridge) {
            return false
        }

        return User.bridge.get.user({ username: token.username, user_id: token.user_id })
    }

    static get roles() {
        const token = Session.decodedToken

        if (!token || !User.bridge) {
            return false
        }

        return User.bridge.get.roles({ username: token.username })
    }

    getData = async (payload, callback) => {
        const request = await User.bridge.get.user({ username: payload.username, user_id: payload.user_id }, undefined, {
            parseData: false
        })

        if (typeof callback === "function") {
            callback(request.error, request.response)
        }

        return request.response.data
    }
}