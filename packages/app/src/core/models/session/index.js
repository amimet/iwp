import { RequestAdaptor } from 'linebridge/client'
import cookies from 'js-cookie'
import jwt_decode from "jwt-decode"
import config from 'config'

export default class Session {
    static get bridge() {
        return window.app?.apiBridge
    }

    static tokenKey = config.app?.storage?.token ?? "token"

    static get token() {
        return cookies.get(this.tokenKey)
    }

    static set token(token) {
        return cookies.set(this.tokenKey, token)
    }

    static get decodedToken() {
        return this.token && jwt_decode(this.token)
    }

    //* BASIC HANDLERS
    login = (payload, callback) => {
        const body = {
            username: window.btoa(payload.username),
            password: window.btoa(payload.password),
            allowRegenerate: payload.allowRegenerate
        }

        return this.generateNewToken(body, (err, res) => {
            if (typeof callback === 'function') {
                callback(err, res)
            }

            if (!err || res.status === 200) {
                let token = res.data

                if (typeof token === 'object') {
                    token = token.token
                }

                Session.token = token
                window.app.eventBus.emit("new_session")
            }
        })
    }

    logout = async () => {
        await this.destroyCurrentSession()
        this.forgetLocalSession()
    }

    //* GENERATORS
    generateNewToken = async (payload, callback) => {
        const endpoint = Session.bridge.post.login
        return await new RequestAdaptor(endpoint, [payload], callback).send()
    }

    regenerateToken = async () => {
        const endpoint = Session.bridge.post.regenerate

        return await new RequestAdaptor(endpoint).send()
    }

    //* GETTERS
    getAllSessions = async () => {
        const endpoint = Session.bridge.get.sessions

        return await new RequestAdaptor(endpoint, []).send()
    }

    getTokenInfo = async () => {
        const session = Session.token
        const endpoint = Session.bridge.post.validatesession

        return await endpoint({ session })
    }

    isCurrentTokenValid = async () => {
        const health = await this.getTokenInfo()

        return health.valid
    }

    forgetLocalSession = () => {
        cookies.remove(this.tokenKey)
    }

    destroyAllSessions = async () => {
        const session = Session.decodedToken
        const endpoint = Session.bridge.delete.sessions

        if (!session) {
            return false
        }

        const result = await new RequestAdaptor(endpoint, [{ user_id: session.user_id }]).send()
        this.forgetLocalSession()
        window.app.eventBus.emit("destroy_session")

        return result
    }

    destroyCurrentSession = async () => {
        const token = Session.token
        const session = Session.decodedToken
        const endpoint = Session.bridge.delete.session

        if (!session || !token) {
            return false
        }

        const result = await new RequestAdaptor(endpoint, [{ user_id: session.user_id, token: token }]).send()
        this.forgetLocalSession()
        window.app.eventBus.emit("destroy_session")

        return result
    }
}