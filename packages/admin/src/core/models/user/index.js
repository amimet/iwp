import { RequestAdaptor } from '@ragestudio/cloudlink/dist/client'
import * as session from '../session'
import store from 'store'
import config from 'config'

const basicsKey = config.app.storage?.basics ?? "user"
const getDefaultBridge = () => window.app.apiBridge

export function updateData() {
    // update to api
}

export async function fetchData(bridge = getDefaultBridge(), payload = {}, callback) {
    return new RequestAdaptor(bridge.get.user, [undefined, { username: payload.username, user_id: payload.user_id }], callback).send()
}

export function getLocalBasics(bridge = getDefaultBridge(), callback) {
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

export function setLocalBasics(bridge = getDefaultBridge(), callback) {
    const sessionData = session.decodeSession()
    
    if (sessionData) {
        fetchData(bridge, { username: sessionData.username }, (err, res) => {
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