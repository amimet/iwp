import config from 'config'
import axios from 'axios'
import { ui } from 'core/libs'
import { objectToArrayMap, verbosity } from '@corenode/utils'

const ignoreErrorCodes = [404, 403]

export default {
    namespace: 'api',
    state: {
        api_hostname: config.app.api_hostname
    },
    effects: {
        *request({ payload, callback }, { put, call, select }) {
            const state = yield select(states => states.api)
            const session_token = yield select(states => states.app.session_token)

            let { method, endpoint, body, params, ignoreErrorHandler } = payload

            if (typeof(ignoreErrorHandler) == "undefined") {
                ignoreErrorHandler = false
            }

            if (!endpoint) {
                verbosity.log(`endpoint not defined`)
                return false
            }

            if (params) {
                let mix = []
                objectToArrayMap(params).forEach((param) => {
                    mix.push(`${param.key}=${param.value}`)
                })
                endpoint = `${endpoint}?${mix.join('&')}`
            }

            const address = `${state.api_hostname}/${endpoint}`

            axios({
                method: method ?? "POST",
                url: address,
                data: body,
                params,
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${session_token ?? null}`
                },
            })
                .then((res) => {
                    if (typeof (callback) !== "undefined") {
                        let isError = false
                        if (res.status !== 200) isError = true

                        return callback(isError ?? false, res.data, res.status)
                    }
                })
                .catch((err) => {
                    if (!ignoreErrorCodes.includes(err.response?.status) && !ignoreErrorCodes) {
                        ui.Notify.error({
                            title: "This request could not be completed",
                            message: err.response
                        })
                        verbosity.log(err)
                    }
                    if (typeof (callback) !== "undefined") {
                        return callback(true, err.response, err.response?.status)
                    }
                })
        }
    },
    reducers: {
        updateState(state, { payload }) {
            return { ...state, ...payload }
        },
    }
}