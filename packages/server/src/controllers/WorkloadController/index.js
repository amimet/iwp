import { GeoRegion, Workload } from '../../models'

export const WorkloadController = {
    get: (req, res, next) => {
        const { region } = req.query

        Workload.find({ regionId: region })
            .then((data) => {
                res.json(data)
            })
            .catch((err) => {
                res.status(500).res.json({ error: err})
            })

    },
    update: (req, res, next) => {

    },
    remove: (req, res, next) => {

    },
    set: (req, res, next) => {
        const { } = req.body
    }
}

export default WorkloadController