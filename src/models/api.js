import store from 'store'
import { app } from 'config'
import { verbosity } from 'core/libs'
import axios from 'axios'
import * as ui from 'core/libs/ui'
import { objectToArrayMap } from '@nodecorejs/utils'
import qs from 'qs';

export default {
    namespace: 'api',
    state: {
        api_hostname: app.api_hostname
    },
    effects: {
        *request({ payload, callback }, { put, call, select }) {
            const session_token = yield select(state => state.app.session_token)
            const state = yield select(state => state.api)

            let { method, endpoint, body, params } = payload

            if (!endpoint) {
                verbosity(`endpoint not defined`)
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
            console.log(address, body)

            axios({
                method: method ?? "POST",
                url: address,
                data: qs.stringify(body),
                headers: {
                    'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'Authorization': `Bearer ${session_token ?? null}`
                },
            })
                .then((res) => {
                    console.log(res)
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