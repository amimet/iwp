import store from 'store'
import { app } from 'config'
import { verbosity } from 'core/libs'
import axios from 'axios'
import * as ui from 'core/libs/ui'

export default {
    namespace: 'api',
    state: {
        api_hostname: app.api_hostname
    },
    effects: {
        *request({ payload, callback }, { put, call, select }) {
            const session_token = yield select(state => state.app.session_token)
            const state = yield select(state => state.api)
            const { method, endpoint, body } = payload

            if (!endpoint) {
                verbosity(`endpoint not defined`)
                return false
            }

            axios({
                method: method ?? "POST",
                url: `${state.api_hostname}/${endpoint}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${session_token ?? null}`
                },
                data: body
            })
                .then((res) => {
                    if (typeof (callback) !== "undefined") {
                        if (res.status !== 200) { // not successful request
                            return callback(true, res.data)
                        }
                        return callback(false, res.data)
                    }
                    return res.data
                })
                .catch((err) => {                   
                    ui.Notify.error({ 
                        title: "This request could not be completed",
                        message: err
                    })
                    verbosity(err)
                    if (typeof (callback) !== "undefined") {
                        return callback(true, err)
                    }
                    return null
                })
        }
    },
    reducers: {
        updateState(state, { payload }) {
            return {
                ...state,
                ...payload,
            };
        },
    }
}