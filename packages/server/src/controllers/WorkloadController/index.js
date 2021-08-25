import { GeoRegion, Workload } from '../../models'
import { Schematized } from '../../lib'

export const WorkloadController = {
    getAll: async (req, res, next) => {
        let query = {}

        Object.keys(req.query).forEach(key => {
            query[key] = req.query[key]
        })

        const workloads = await Workload.find({ ...query })
        return res.json(workloads)
    },
    get: async (req, res, next) => {
        let query = {}

        Object.keys(req.query).forEach(key => {
            query[key] = req.query[key]
        })

        const workload = await Workload.findOne({ ...query })
        return res.json(workload)
    },
    set: Schematized(["items"], async (req, res, next) => {
        const { items, region } = req.body

        const obj = {
            created: new Date().getTime(),
            items,
            region,
        }

        // check with DB



        return res.json(obj)
    }),
    remove: (req, res, next) => {

    },
}

export default WorkloadController