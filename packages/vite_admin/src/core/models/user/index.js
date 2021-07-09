import { request } from '../apiBridge'
import * as session from '../session'
import store from 'store'
import config from 'config'

const basicsKey = config.app.storage?.basics ?? "user"

export function updateData() {
    // update to api
}

export async function fetchBasics(bridge, payload = {}, callback) {
    return new request(bridge.get.user, [undefined, { username: payload.username, id: payload.id }], callback).send()
}

export function getLocalBasics(bridge, callback) {
    const storagedData = store.get(basicsKey)

    if (typeof storagedData === "undefined") {
        setLocalBasics(bridge, (err, res) => {
            if (!err) {
                if (typeof callback === "function") {
                    callback(false, res.data)
                }
                return res.data
            }
        })
    } else {
        const data = JSON.parse(window.atob(storagedData))

        if (typeof callback === "function") {
            callback(false, data)
        }
        return data
    }
}

export function setLocalBasics(bridge, callback) {
    const sessionData = session.decryptSession()
    if (sessionData) {
        fetchBasics(bridge, { username: sessionData.username }, (err, res) => {
            if (typeof callback === 'function') {
                console.error(err)
                callback(err, res)
            }
            if (!err) {
                store.set(basicsKey, window.btoa(JSON.stringify(res.data)))
            }
        })
    }else {
        console.warn("Cannot setLocalBasic without an valid session")
    }
}