import { GeoRegion } from '../../models'
import { Schematized } from "../../lib"

// TODO: Support for child objects
export default {
    new: Schematized({
        select: ["name", "address"],
    }, async (req, res) => {
        const { name, address } = req.selection

        const regions = await GeoRegion.find({ name })

        if (regions.length > 0) {
            return res.status(409).json({ error: "Region already exists" })
        }

        const region = new GeoRegion({ name, address })
        await region.save()

        return res.json(region)
    }),
    get: Schematized({
        select: ["name", "address"],
    }, async (req, res) => {
        const region = await GeoRegion.findOne(req.selection)
        return res.json(region)
    }),
    getAll: (req, res) => {
        GeoRegion.find().then((data) => {
            return res.json(data)
        })
    }
}