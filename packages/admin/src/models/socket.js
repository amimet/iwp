import { app } from 'config'
import axios from 'axios'
import * as ui from 'core/libs/ui'
import { objectToArrayMap, verbosity } from '@nodecorejs/utils'

export default {
    namespace: 'socket',
    state: {
        status: "disconnected"
    },
    effects: {
       
    },
    reducers: {
        updateState(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        },
    }
}