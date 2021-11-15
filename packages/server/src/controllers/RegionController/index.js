import { GeoRegion } from '../../models'
import { selectValues } from "../../lib"

export const RegionController = {
    new: selectValues(["name", "address"], async (req, res) => {
        const { name, address } = req.selectedValues

        const regions = await GeoRegion.find({ name })

        if (regions.length > 0) {
            return res.status(409).json({ error: "Region already exists" })
        }

        const region = new GeoRegion({ name, address })
        await region.save()

        return res.json(region)
    }),
    get: selectValues(["name", "address"], async (req, res) => {
        const region = await GeoRegion.findOne(req.selectedValues)
        return res.json(region)
    }),
    getAll: (req, res) => {
        GeoRegion.find().then((data) => {
            return res.json(data)
        })
    }
}

export default RegionController