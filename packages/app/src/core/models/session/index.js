import { RequestAdaptor } from 'linebridge/client'
import cookies from 'js-cookie'
import jwt_decode from "jwt-decode"
import config from 'config'

export default class Session {
    constructor(bridge = window.app.apiBridge) {
        this.bridge = bridge
    }

    static tokenKey = config.app.storage?.token ?? "token"

    static get token() {
        return cookies.get(this.tokenKey)
    }

    static set token(token) {
        return cookies.set(this.tokenKey, token)
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

            if (!err) {
                this.token = res.data
                window.app.eventBus.emit("new_session")
            }
        })
    }

    logout = async () => {
        await this.destroyCurrentSession(this.bridge)
        this.forgetLocalSession()
    }

    //* TOKEN UTILS
    decodeToken = (token) => {
        return jwt_decode(token)
    }

    decodeCurrentToken = () => {
        return this.decodeToken(Session.storagedToken)
    }

    //* GENERATORS
    generateNewToken = (payload, callback) => {
        const endpoint = this.bridge.post.login
        return new RequestAdaptor(endpoint, [payload], callback).send()
    }

    regenerateToken = () => {
        const endpoint = this.bridge.post.regenerate

        return new RequestAdaptor(endpoint).send()
            .then((err, data) => {
                if (!err) {
                    return storage(data)
                }
            })
    }

    //* GETTERS
    getAllSessions = async () => {
        const endpoint = this.bridge.post.sessions

        return new RequestAdaptor(endpoint, [], callback).send()
    }

    getTokenHealth = async () => {
        const session = this.storagedToken
        const endpoint = this.bridge.post.validatesession

        return await endpoint({ session })
    }

    isCurrentTokenValid = async () => {
        const health = await this.getTokenHealth()

        return health.valid
    }

    forgetLocalSession = () => {
        cookies.remove(this.tokenKey)
        window.app.eventBus.emit("session_deleted")
    }

    destroyAllSessions = async () => {
        const session = decodeSession()
        const endpoint = this.bridge.delete.sessions

        if (session) {
            new RequestAdaptor(endpoint, [{ user_id: session.user_id }]).send()
            this.forgetLocalSession()
        }
        return false
    }

    destroyCurrentSession = async () => {
        const session = decodeSession()
        const endpoint = this.bridge.delete.session

        if (session) {
            const token = this.storagedToken
            return new RequestAdaptor(endpoint, [{ user_id: session.user_id, token: token }]).send()
        }

        return false
    }
}