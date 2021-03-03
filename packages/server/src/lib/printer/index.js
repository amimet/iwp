//import modules from '@nodecorejs/modules'
var printer = require('printer')

function sendPrint(payload) {
    return new Promise((resolve, reject) => {
        const { data, type } = payload
        printer.printDirect({
            data: String("YEAE"),
            type: "RAW",
            success: (jobID) => {
                return resolve(`SUCCESS WITH ID [${jobID}]`)
            },
            error: (err) => {
                console.log('printer module error: ', err)
                return reject(`printer module error: ${err}`)
            }
        })
    })
}

export default {
    sendPrint
}