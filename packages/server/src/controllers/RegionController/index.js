import { GeoRegion } from '../../models'
import { selectValues } from "../../lib"

export const RegionController = {
    // TODO: Register new region
    new: selectValues(["name", "title", "geo"], async (req, res) => {
        const { name, title, cords } = req.selectValues

        const region = new GeoRegion({ name, title, cords })
        await region.save()

        return res.json(region)
    }),
    get: selectValues(["name", "title"], async (req, res) => {
        const region = await GeoRegion.findOne(req.selectValues)
        return res.json(region)
    }),
    getAll: (req, res) => {
        GeoRegion.find().then((data) => {
            return res.json(data)
        })
    }
}

export default RegionController