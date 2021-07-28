import { RequestAdaptor } from '@ragestudio/cloudlink/dist/client'
import cookies from 'js-cookie'
import jwt_decode from "jwt-decode"
import config from 'config'

const tokenKey = config.app.storage?.token ?? "token"

export async function regenerate(bridge) {
    return new RequestAdaptor(bridge.post.regenerate, []).send()
        .then((err, data) => {
            if (!err) {
                return storage(data)
            }
        })
}

export async function handleLogin(bridge, payload, callback) {
    genToken(bridge, payload, (err, res) => {
        if (typeof callback === 'function') {
            callback(err, res)
        }
        if (!err) {
            storage(res.data)
        }
    })
}

export async function genToken(bridge, payload, callback) {
    return new RequestAdaptor(bridge.post.login, [{ username: window.btoa(payload.username), password: window.btoa(payload.password), allowRegenerate: payload.allowRegenerate }], callback).send()
}

// Gets the current session storaged
export function get() {
    return cookies.get(tokenKey)
}

export function storage(payload = {}) {
    if (typeof payload.token === "undefined") {
        throw new Error(`Cannot set an new session without a token! (missing token)`)
    }

    cookies.set(tokenKey, payload.token)
    window.app.reloadAppState()
}

export async function clear() {
    cookies.remove(tokenKey)
    window.app.reloadAppState()
}

// [API] Get all sessions for current user
export function getAll(bridge, callback) {
    return new RequestAdaptor(bridge.get.sessions, [], callback).send()
}

export function decodeSession() {
    let data = null
    const session = get()

    if (typeof session !== "undefined") {
        data = jwt_decode(session)
    }

    return data
}

export function getCurrentTokenValidation(bridge, callback) {
    const session = get()

    return new RequestAdaptor(bridge.post.validatesession, [{ session: session }], callback).send()
}

export async function validateCurrentSession(bridge) {
    const validation = await getCurrentTokenValidation(bridge)
    return validation.valid
}

export async function logout(bridge) {
    await destroySession(bridge)
    clear()
}

// [API] Destroy session for current storaged session
export async function destroySession(bridge) {
    const session = decodeSession()

    if (session) {
        const token = get()
        return new RequestAdaptor(bridge.delete.session, [{ user_id: session.user_id, token: token }]).send()
    }

    return false
}

// [API] Destroy all session for current user
export async function destroyAll(bridge) {
    const session = decodeSession()

    if (session) {
        new RequestAdaptor(bridge.delete.sessions, [{ user_id: session.user_id }]).send()
        await clear()
    }

    return false
}