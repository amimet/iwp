import { clientInfo } from 'core'
var { verbosity } = require("@ragestudio/nodecore-utils")

if (clientInfo.os.family) {
    if (clientInfo.os.family !== ("Windows" || "Linux")) {
        verbosity = () =>{ return false } // disable verbosity for non-v8stackframe-compatible
    }
}

export {
    verbosity
}