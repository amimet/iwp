import { Workload } from '../../models'
import { Schematized, selectValues } from '../../lib'
import moment from "moment"

const format = "DD-MM-YYYY hh:mm"

export const WorkloadController = {
    getAll: selectValues(["regionId", "_id", "name"], async (req, res) => {
        const workloads = await Workload.find({ ...req.selectedValues })

        return res.json(workloads)
    }),
    get: selectValues(["regionId", "_id", "name"], async (req, res, next) => {
        let workload = await Workload.findOne({ ...req.selectedValues })
        
        // parse expiration status
        if (typeof workload.expired !== "undefined") {
            // check if is expired
            const endDate = moment(workload.scheduledFinish, format)
            const now = moment().format(format)

            if (moment(now, format).isAfter(endDate)) {
                workload.expired = true
            }
        }

        return res.json(workload)
    }),
    set: Schematized(["items", "region", "name"], async (req, res) => {
        const { items, region, name, scheduledStart, scheduledFinish, workshift } = req.body

        const obj = {
            created: new Date().getTime(),
            items,
            name,
            scheduledStart,
            scheduledFinish,
            workshift,
            region,
        }

        const result = await Workload.create(obj)

        return res.json(result)
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