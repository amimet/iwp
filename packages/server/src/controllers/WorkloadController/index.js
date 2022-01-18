import { Workload, } from "../../models"
import { Schematized } from "../../lib"
import { nanoid } from "nanoid"
import moment from "moment"

const format = "DD-MM-YYYY hh:mm"

export default {
    commit: Schematized({
        required: ["_id"],
        select: ["_id"],
    }, async (req, res) => {
        let commit = {
            _id: nanoid(),
            user_id: req.user._id,
            timestamp: new Date().getTime(),
        }

        const result = await Workload.findByIdAndUpdate(req.selection._id, {
            $push: {
                commits: commit,
            },
        }).catch(err => {
            return res.status(500).json({
                error: err,
            })
        })

        return res.json(result)
    }),
    appendOperators: Schematized({
        required: ["_id", "operators"],
        select: ["_id", "operators"],
    }, async (req, res) => {
        let workload = await Workload.findById(req.selection._id)

        if (workload) {
            if (Array.isArray(req.selection.operators) && Array.isArray(workload.assigned)) {
                for await (const operator of req.selection.operators) {
                    if (!workload.assigned.includes(operator)) {
                        workload.assigned.push(operator)

                        // send update with WS
                        const userSocket = req.getClientSocket(operator)

                        if (userSocket) {
                            userSocket.socket.emit("workloadAssigned", workload._id)
                        }
                    }
                }
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
                for await (const operator of req.selection.operators) {
                    if (workload.assigned.includes(operator)) {
                        workload.assigned.splice(workload.assigned.indexOf(operator), 1)
                    }

                    // send update with WS
                    const userSocket = req.getClientSocket(operator)

                    if (userSocket) {
                        userSocket.socket.emit("workloadUnassigned", workload._id)
                    }
                }
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
    set: Schematized({
        required: ["orders", "region", "name"],
    }, async (req, res) => {
        const { orders, region, name, assigned, scheduledStart, scheduledFinish, workshift } = req.body

        const obj = {
            created: new Date().getTime(),
            orders,
            assigned,
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

        if (result) {
            req.io.emit("newWorkload", result)
        }

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
    getWorkloadAssignedToUserID: Schematized({
        select: ["_id"],
    }, async (req, res) => {
        let workloads = await Workload.find()

        workloads = workloads.filter(workload => workload.assigned.includes(req.selection._id ?? req.user._id))

        return res.json(workloads)
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
}