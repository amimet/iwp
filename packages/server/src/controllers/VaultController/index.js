import { Vault } from '../../models'
import generateESSC from '../../lib/generateESSC'

export const VaultController = {
    get: (req, res, next) => {
        Vault.findOne({ id: req.body.id }).then((response) => {
            if (response) {
                return res.json(response)
            } else {
                return res.status(404).send("No data found")
            }
        })
    },
    update: () => {

    },
    set: (req, res, next) => {
        const { type, region, chipset, manufacture, tier, stash, serial, active, title, state, currentLocation, comment, generatePrintLabel } = req.body

        generateESSC({ type, region, chipset, manufacture, tier, stash, serial }).then(async (uuid) => {
            const data = await Vault.findOne({ id: uuid })
            if (data) throw `Object exist, use 'update' instead.`
            let document = new Vault({
                id: uuid,
                created_date: new Date().toDateString(),
                current_location: currentLocation,
                item: {
                    title: title ?? "Device",
                    state: state ?? "Unknown",
                    comment: comment ?? null,
                    active: active ?? false,
                }
            })
            if (generatePrintLabel) {

            }
            return document.save()
        })
            .then(data => {
                return res.json(data)
            })
            .catch(err => {
                return res.status(500).send(err)
            })
    },
    remove: (req, res, next) => {

    },
    getAll: (req, res, next) => {
        Vault.find().then((data) => {
            return res.json(data)
        })
    }
}

export default VaultController