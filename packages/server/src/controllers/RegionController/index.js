import { GeoRegion } from '../../models'

export const RegionController = {
    // TODO: Register new region
    get: (req, res, next) => {
        GeoRegion.findOne({ id: req.query.id }).then((response) => {
            if (response) {
                return res.json(response)
            } else {
                return res.status(404).send("No data found")
            }
        })
    },
    getAll: (req, res, next) => {
        GeoRegion.find().then((data) => {
            return res.json(data)
        })
    }
}

export default RegionController