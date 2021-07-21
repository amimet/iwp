import { request } from '../apiBridge'
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
            window.app.reloadAppState()
        }
    })
}

export async function getAuth(bridge, payload, callback) {
    return new request(bridge.post.login, [{ username: window.btoa(payload.username), password: window.btoa(payload.password) }], callback).send()
}

export function setSession(payload = {}) {
    if (typeof payload.token === "undefined") {
        throw new Error(`Cannot set an new session without a token! (missing token)`)
    }

    cookies.set(tokenKey, payload.token)
}

export function getSession() {
    return cookies.get(tokenKey)
}

// gets all sessions from current user id
export function getAll(bridge, callback) {
    return new request(bridge.get.sessions, [], callback).send()
}

export function decryptSession(){
    let data = null
    const session = getSession()

    if (typeof session !== "undefined") {
        data = jwt_decode(session)
    }

    return data
}

export function getCurrentTokenValidation(bridge, callback) {
    const session = getSession()

    return new request(bridge.post.validatesession, [{ session: session }], callback).send()
}

export async function validateCurrentSession(bridge) {
    const validation = await getCurrentTokenValidation(bridge)
    return validation.valid
}

export async function logout(bridge) {
    const session = getSession()

    cookies.remove(tokenKey)
    return new request(bridge.post.logout, [{ session: session }]).send()
}