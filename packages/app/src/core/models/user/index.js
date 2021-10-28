import { RequestAdaptor } from 'linebridge/client'
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

        return User.bridge.get.user(undefined, { username: token.username, user_id: token.user_id })
    }

    static get roles() {
        const token = Session.decodedToken

        if (!token || !User.bridge) {
            return false
        }
        
        return User.bridge.get.roles(undefined, { username: token.username })
    }

    getData = async (payload, callback) => {
        return await new RequestAdaptor(User.bridge.get.user, [undefined, { username: payload.username, user_id: payload.user_id }], callback).send()
    }
}