// Prototype for nodecore module
import { verbosity } from '@nodecorejs/utils'
import store from 'store'

export class DSO {
    constructor(params) {
        this.storeKey = params.name
        this.voidMutation = params.voidMutation ?? false

        if (!this.storeKey) {
            throw new Error(`Invalid or missing store name`)
        }
    }

    getValue(key) {
        try {
            return this.get()[key]
        } catch (error) {
            verbosity.error(error)
            return false
        }
    }

    get(query) {
        try {
            let scope = []
            let parsed = {}
            const data = store.get(this.storeKey)

            if (Array.isArray(query)) {
                scope = query
            } else {
                scope.push(query)
            }

            scope.forEach((key) => {
                parsed[key] = data[key]
            })

            if (query) {
                return parsed
            }

            return data
        } catch (error) {
            verbosity.error(error)
            return false
        }
    }

    set(key, value) {
        let _settings = this.get() ?? {}

        try {
            if (typeof (value) == "undefined") {
                if (!this.voidMutation) {
                    verbosity.warn(`voidMutation is enabled, no changes on key [${key}]`)
                    return _settings
                }
                verbosity.warn(`voidMutation is not enabled, undefined values causes key removal`)
            }

            _settings[key] = value
            store.set(this.storeKey, _settings)
        } catch (error) {
            verbosity.error(error)
        }

        return _settings
    }

    remove(key) {
        let _settings = this.get() ?? {}

        try {
            delete _settings[key]
            store.set(this.storeKey, _settings)
        } catch (error) {
            verbosity.error(error)
        }

        return _settings
    }
}

export default DSO