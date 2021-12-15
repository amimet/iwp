import { Workload } from '../../models'
import { Schematized } from '../../lib'
import moment from "moment"

const format = "DD-MM-YYYY hh:mm"

export default {
    getAll: Schematized({
        select: ["region", "_id", "name"],
    }, async (req, res) => {
        let workloads = []

        if (req.selection.region === "all") {
            delete req.selection.region
            workloads = await Workload.find(req.selection)
        } else {
            workloads = await Workload.find(req.selection)
        }

        return res.json(workloads)
    }),
    appendOperators: Schematized({
        required: ["_id", "operators"],
        select: ["_id", "operators"],
    }, async (req, res) => {
        let workload = await Workload.findById(req.selection._id)

        if (workload) {
            if (Array.isArray(req.selection.operators) && Array.isArray(workload.assigned)) {
                req.selection.operators.forEach(operator => {
                    if (!workload.assigned.includes(operator)) {
                        workload.assigned.push(operator)
                    }
                })
            } else {
                return res.status(400).json({ error: "Invalid operators type. Must be an array." })
            }

            await Workload.findByIdAndUpdate(req.selection._id, workload)
        }

        return res.json(workload)
    }),
    removeOperators: Schematized({
        required: ["_id", "operators"],
        select: ["_id", "operators"],
    }, async (req, res) => {
        let workload = await Workload.findById(req.selection._id)

        if (workload) {
            if (Array.isArray(req.selection.operators) && Array.isArray(workload.assigned)) {
                req.selection.operators.forEach(operator => {
                    if (workload.assigned.includes(operator)) {
                        workload.assigned.splice(workload.assigned.indexOf(operator), 1)
                    }
                })
            } else {
                return res.status(400).json({ error: "Invalid operators type. Must be an array." })
            }

            await Workload.findByIdAndUpdate(req.selection._id, workload)
        }

        return res.json(workload)
    }),
    update: Schematized({
        required: ["_id"],
        select: ["_id"],
    }, async (req, res) => {
        // TODO: Update method
        let workload = await Workload.findById(req.selection._id)

        return res.json(workload)
    }),
    get: Schematized({
        select: ["region", "_id", "name"],
    }, async (req, res, next) => {
        let workload = await Workload.findOne(req.selection)

        // parse expiration status
        if (typeof workload.expired !== "undefined") {
            // check if is expired
            const endDate = moment(workload.scheduledFinish, format)
            const now = moment().format(format)

            if (endDate.isBefore(moment(now, format))) {
                workload.expired = true
            }
        }

        return res.json(workload)
    }),
    set: Schematized({
        required: ["items", "region", "name"],
    }, async (req, res) => {
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
    delete: Schematized({
        required: ["id"],
    }, async (req, res) => {
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