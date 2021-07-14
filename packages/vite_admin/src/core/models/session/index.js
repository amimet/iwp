import { request } from '../apiBridge'
import * as user from 'core/models/user'
import cookies from 'js-cookie'
import jwt_decode from "jwt-decode"
import config from 'config'

const tokenKey = config.app.storage?.token ?? "token"

export async function handleLogin(bridge, payload, callback) {
    getAuth(bridge, payload, (err, res) => {
        if (typeof callback === 'function') {
            callback(err, res)
        }
        if (!err) {
            setSession(res.data)
            user.setLocalBasics(bridge)
            window.app.reloadAppState()
        }
    })
}

export async function getAuth(bridge, payload, callback) {
    return new request(bridge.post.login, [{ username: window.btoa(payload.username), password: window.btoa(payload.password) }], callback).send()
}

export function setSession(payload = {}) {
    const { token, originKey, } = payload

    if (typeof token === "undefined") {
        throw new Error(`Cannot set an new session without a token! (missing token)`)
    }

    if (typeof originKey !== "undefined") {
        cookies.set("originKey", originKey)
    }

    cookies.set(tokenKey, token)
}

export function getSession() {
    return cookies.get(tokenKey)
}

export function decryptSession(){
    let data = null
    const session = getSession()

    if (typeof session !== "undefined") {
        data = jwt_decode(session)
    }

    return data
}

export function validateCurrentSession(bridge, callback) {
    const session = getSession()

    return new request(bridge.post.validatesession, [{ session: session }], callback).send()
}