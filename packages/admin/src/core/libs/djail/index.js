// Prototype for nodecore module
import { verbosity } from '@corenode/utils'
import store from 'store'

export class DJail {
    constructor(params) {
        this.storeKey = params.name
        this.voidMutation = params.voidMutation ?? false
        this.data = {}

        if (!this.storeKey) {
            throw new Error(`Invalid or missing store name`)
        }
    }

    _pull() {
        this.data = store.get(this.storeKey)   
    }

    _push(update) { 
        if (typeof update !== "undefined") {
            this.data = { ...this.data, ...update}
        }
        store.set(this.storeKey, this.data)   
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
            this._pull()
            let scope = []
            let parsed = {}
            
            if (Array.isArray(query)) {
                scope = query
            } else {
                scope.push(query)
            }

            scope.forEach((key) => {
                if (typeof this.data[key] !== "undefined") {
                    parsed[key] = this.data[key]
                }
            })

            if (query) {
                return parsed
            }

            return this.data
        } catch (error) {
            verbosity.error(error)
            return false
        }
    }

    set(key, value) {
        this._pull()
        let settings = this.get() ?? {}

        try {
            if (typeof (value) == "undefined") {
                if (!this.voidMutation) {
                    verbosity.warn(`voidMutation is enabled, no changes on key [${key}]`)
                    return settings
                }
                verbosity.warn(`voidMutation is not enabled, undefined values causes key removal`)
            }

            settings[key] = value
            this._push(settings)
        } catch (error) {
            verbosity.error(error)
        }

        return settings
    }

    remove(key) {
        let settings = this.get() ?? {}

        try {
            delete settings[key]
            this._push(settings)
        } catch (error) {
            verbosity.error(error)
        }

        return settings
    }
}

export default DJail