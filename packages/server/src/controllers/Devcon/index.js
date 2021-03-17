import printer from '../../lib/printer'

export const Devcon = {
    sendPrinter: (req, res, next) => {
        const { data, type } = req.body
        console.log(data, type)
        printer.sendPrint({ data, type })
            .then((res) => {
                res.json(res)
            })
            .catch((err) => {
                res.json(err)
            })
    },
    get: (req, res, next) => {

    },
    update: (req, res, next) => {

    },
    remove: (req, res, next) => {

    },
    set: (req, res, next) => {

    }
}

export default Devcon