import { Workload } from '../../models'
import { Schematized } from '../../lib'

export const WorkloadController = {
    getAll: async (req, res) => {
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
    set: Schematized(["items"], async (req, res) => {
        const { items, region } = req.body

        const obj = {
            created: new Date().getTime(),
            items,
            region,
        }

        Workload.create(obj)

        return res.json(obj)
    }),
    delete: Schematized(["id"], async (req, res) => {
        let deleted = []
        let queue = []

        const { id } = req.body

        if (Array.isArray(id)) {
            queue = id
        } else {
            queue.push(id)
        }

        for await (let _id of queue) {
            const result = await Workload.findByIdAndDelete({ _id })
            if (result != null) {
                deleted.push(_id)
            }
        }

        return res.json({ deleted })
    }),
}

export default WorkloadController