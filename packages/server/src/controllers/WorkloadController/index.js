import { Workload } from "../../models"
import { Schematized } from "../../lib"
import { nanoid } from "nanoid"
import moment from "moment"

const format = "DD-MM-YYYY hh:mm"

export default {
    action: Schematized({
        required: ["_id", "event"],
        select: ["_id"], 
    }, async (req, res) => {
        const workload = await Workload.findById(req.selection._id)

        if (!workload) {
            return res.status(404).json({
                message: "Workload not found",
            })
        }

        const { user_id, action } = req.selection.event

        switch (action) {
            case "commit": {
                const { orderId } = req.selection.event
                const order = await workload.orders.findById(orderId)
            }
            default: {
                return res.status(400).json({
                    message: "Invalid action",
                })
            }
        }
       
    }),
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
    getWorkloadAssignedToUserID: Schematized({
        select: ["_id"],
    }, async (req, res) => {
        let workloads = await Workload.find()
        
        workloads = workloads.filter(workload => workload.assigned.includes(req.selection._id ?? req.user._id))

        return res.json(workloads)
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
    regeneratesUUID: async (req, res) => {
        let workloads = await Workload.find()

        workloads.forEach(async (workload) => {
            if (workload.orders.length > 0) {

                workload.orders.forEach((item) => {
                    if (typeof item.uuid === "undefined") {
                        item.uuid = nanoid()  
                    }
                })

                await Workload.findByIdAndUpdate(workload._id, workload)
            }
        })

        return res.json(workloads)
    },
    set: Schematized({
        required: ["orders", "region", "name"],
    }, async (req, res) => {
        const { orders, region, name, scheduledStart, scheduledFinish, workshift } = req.body

        const obj = {
            created: new Date().getTime(),
            orders,
            name,
            scheduledStart,
            scheduledFinish,
            workshift,
            region,
        }

        // create on each item an UUID property
        orders.forEach(item => {
            item.uuid = nanoid()
        })

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