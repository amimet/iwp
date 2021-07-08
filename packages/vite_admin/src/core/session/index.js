import cookies from 'js-cookie'
import store from 'store'
import config from 'config'

const tokenKey = config.app.storage?.token ?? "token"

export async function getAuth() {
    console.log(api)

    //try to login
    // const loginReq = await api.post.login({ username: "srgooglo", password: "cacatua123" }).catch((err) => {
    // 	console.error(`CANNOT LOGIN > ${err.response.data}`)
    // })

    // session.setSession(loginReq)
    //console.log(loginReq)

    const userData = await api.get.user(undefined, {username: "testuser"})
    console.log(userData)
}

export function setSession(payload = {}) {
    const { token, originKey } = payload

    if (typeof token === "undefined") {
        throw new Error(`Cannot set an new session without a token! (missing token)`)
    }

    if (typeof originKey !== "undefined") {
        cookies.set("originKey", originKey)
    }

    cookies.set(tokenKey, token)
}

export function getSession() {
    let obj = {}

    obj.token = cookies.get(tokenKey)

    return obj
}
