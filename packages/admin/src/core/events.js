import { verbosity } from '@corenode/utils'

export default {
    changeSetting: (payload) => {
        verbosity.log(`emitted event [${payload.id}]`, payload)
        
    },
    
}