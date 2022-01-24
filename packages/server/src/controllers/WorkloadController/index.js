import { Workload, } from "../../models"
import { Schematized } from "../../lib"
import { nanoid } from "nanoid"
import moment from "moment"

const format = "DD-MM-YYYY hh:mm"

function countQuantityFromCommits(commits) {
    return commits.reduce((acc, commit) => {
        return acc + commit.quantity
    }, 0)
}

function calculateWorkloadQuantityLeft(workload, payload) {
    const quantity = payload.properties?.quantity
    const quantityCount = countQuantityFromCommits(workload.commits.filter(commit => commit.payloadUUID === payload.uuid))

    let result = quantity - quantityCount

    if (result < 0) {
        result = 0
    }

    return result
}

export default {
    pushCommit: Schematized({
        required: ["workloadId", "payloadUUID", "quantity"],
        select: ["workloadId", "payloadUUID", "quantity"],
    }, async (req, res) => {
        let workload = await Workload.findById(req.selection.workloadId)

        if (!workload) {
            return res.status(404).send({
                error: "Workload not found",
            })
        }

        if (typeof workload.commits === "undefined" || !Array.isArray(workload.commits)) {
            workload.commits = Array()
        }

        let commit = {
            payloadUUID: req.selection.payloadUUID,
            quantity: req.selection.quantity,
            user_id: req.user._id,
            timestamp: new Date().getTime(),
        }

        workload.commits.push(commit)

        await Workload.findByIdAndUpdate(req.selection.workloadId, workload).catch(err => {
            return res.status(500).json({
                error: err,
            })
        })

        req.ws.io.emit("workloadCommit", {
            workloadId: req.selection.workloadId,
            commit,
        })

        return res.json(workload.commits)
    }),
    getCommits: Schematized({
        required: ["workloadId"],
        select: ["workloadId", "payloadUUID"],
    }, async (req, res) => {
        let workload = await Workload.findById(req.selection.workloadId)

        if (!workload) {
            return res.status(404).send({
                error: "Workload not found",
            })
        }

        if (req.selection.payloadUUID) {
            return res.json(workload.commits.filter(commit => commit.payloadUUID === req.selection.payloadUUID))
        }

        return res.json(workload.commits)
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
                        const userSocket = req.ws.getClientSocket(operator)

                        if (userSocket) {
                            userSocket.emit("workloadAssigned", workload._id)
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
                    const userSocket = req.ws.getClientSocket(operator)

                    if (userSocket) {
                        userSocket.emit("workloadUnassigned", workload._id)
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
        required: ["payloads", "region", "name"],
    }, async (req, res) => {
        const { payloads, region, name, assigned, scheduledStart, scheduledFinish, workshift } = req.body

        const obj = {
            created: new Date().getTime(),
            payloads,
            assigned,
            name,
            scheduledStart,
            scheduledFinish,
            workshift,
            region,
        }

        // create on each payload an UUID property
        payloads.forEach(item => {
            item.uuid = nanoid()
        })

        const result = await Workload.create(obj)

        req.ws.io.emit("newWorkload", result)

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

        req.ws.io.emit("deletedWorkload", deleted)

        return res.json({ deleted })
    }),
    get: Schematized({
        select: ["_id", "region", "name"],
    }, async (req, res) => {
        let workloads = null

        if (req.selection.region === "all") {
            delete req.selection.region
        }

        if (req.selection._id) {
            const data = await Workload.findById(req.selection._id)

            if (!data) {
                return res.status(404).send({
                    error: "Workload not found",
                })
            }

            workloads = [data]
        } else {
            workloads = await Workload.find(req.selection)
        }

        for await (const workload of workloads) {
            // parse expiration status
            if (typeof workload.expired !== "undefined") {
                // check if is expired
                const endDate = moment(workload.scheduledFinish, format)
                const now = moment().format(format)

                if (endDate.isBefore(moment(now, format))) {
                    workload.expired = true
                }
            }

            if (workload.payloads) {
                workload.payloads = workload.payloads.map((payload) => {
                    payload.debtQuantity = calculateWorkloadQuantityLeft(workload, payload)
                    payload.quantityReached = payload.debtQuantity === 0
                    payload.producedQuantity = countQuantityFromCommits(workload.commits.filter(commit => commit.payloadUUID === payload.uuid))

                    return payload
                })
            }
        }

        return res.json(req.selection._id ? workloads[0] : workloads)
    }),
    getWorkloadWithPayloadUUID: Schematized({
        required: ["uuid"],
        select: ["uuid"],
    }, async (req, res) => {
        const workload = await Workload.findOne({
            "payloads.uuid": req.selection.uuid,
        })

        if (!workload) {
            return res.status(404).send({
                error: "Workload not found",
            })
        }

        return res.json(workload)
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
            if (workload.payloads.length > 0) {

                workload.payloads.forEach((item) => {
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