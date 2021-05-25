import axios from 'axios'
import config from 'config'

export const api = {
    request: (payload) => {
        const { method, endpoint, body, params, hostname } = payload
        const apiHostname = config.api.hostname ?? hostname

        if (typeof(payload.endpoint) == "undefined") {
            verbosity.error(`endpoint not defined`)
            return false
        }
        if (!apiHostname) {
            verbosity.error(`Api hostname is not available`)
            return false
        }

        let opts = {
            method: method ?? "POST",
            url: `${apiHostname}/${endpoint}`,
            data: body,
            params,
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        }

        try {
            opts.headers['Authorization'] = `Bearer ${session_token ?? null}`
        } catch (error) {
            
        }
        if (params) {
            let mix = []
            objectToArrayMap(params).forEach((param) => {
                mix.push(`${param.key}=${param.value}`)
            })
            endpoint = `${endpoint}?${mix.join('&')}`
        }

        axios(opts)
            .then((res) => {
                if (typeof (callback) !== "undefined") {
                    let isError = false
                    if (res.status !== 200) isError = true
                    if (typeof (res.data?.code) !== "undefined" && res.data?.code !== 200) isError = true

                    return callback(isError ?? false, res.data)
                }
                return res.data
            })
            .catch((err) => {
                ui.Notify.error({
                    title: "This request could not be completed",
                    message: err
                })
                verbosity.log(err)
                if (typeof (callback) !== "undefined") {
                    return callback(true, err)
                }
                return null
            })
    }
}