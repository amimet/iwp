import { Workload } from "../../models"
import { Schematized } from "../../lib"
import { nanoid } from "nanoid"
import moment from "moment"

const format = "DD-MM-YYYY hh:mm"

function stepWorkloadUpdate(workload) {
    let multiple = false
    let queue = []

    if (Array.isArray(workload)) {
        multiple = true
        queue = workload
    } else {
        multiple = false
        queue.push(workload)
    }

    queue = queue.map((workload) => {
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

        // if all payloads are reached, mark workload as finished
        if (workload.payloads && workload.payloads.every(payload => payload.quantityReached)) {
            workload.status = "finished"
            workload.finished = true
        }

        return workload
    })

    if (multiple) {
        return queue
    }

    return queue[0]
}

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

const Methods = {
    finish: async (_id) => {
        let workload = await Workload.findById(_id)

        workload.finished = true

        await workload.save()

        global.wsInterface.io.emit(`workloadFinished_${_id}`, workload)
    },
    update: async (_id, update) => {
        let workload = await Workload.findById(_id)

        const allowedUpdates = ["commits", "payloads", "assigned", "expired", "finished", "status", "section", "name"]

        allowedUpdates.forEach((key) => {
            if (update[key]) {
                workload[key] = update[key]
            }
        })

        // this is important, here we are updating statement of the workload
        workload = stepWorkloadUpdate(workload)

        await Workload.findByIdAndUpdate(_id, workload)

        global.wsInterface.io.emit(`workloadUpdate_${_id}`, workload)
        global.wsInterface.io.emit(`workloadUpdate`, workload)

        return workload
    },
}

export default {
    pushCommit: Schematized({
        required: ["workloadId", "payloadUUID", "quantity"],
        select: ["workloadId", "payloadUUID", "quantity", "tooks"],
    }, async (req, res) => {
        let workload = await Workload.findById(req.selection.workloadId).catch(() => {
            return false
        })

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
            tooks: req.selection.tooks ?? 0,
        }

        workload.commits.push(commit)

        workload = Methods.update(req.selection.workloadId, {
            commits: workload.commits,
        }).catch((err) => {
            return res.status(500).json({
                error: err,
            })
        })

        req.ws.io.emit(`newCommit_${commit.payloadUUID}`, {
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

                        // TODO: send update with WS (USE METHODS)
                        // const userSockets = req.ws.getClientSockets(operator)
                        // console.log(userSockets)
                        // if (userSockets) {
                        //     userSockets.forEach(socket => {
                        //         socket.emit("workloadAssigned", result._id)
                        //     })
                        // }
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

                    // TODO: send update with WS (USE METHODS)
                    // const userSocket = req.ws.getClientSocket(operator)

                    // if (userSocket) {
                    //     userSocket.emit("workloadUnassigned", workload._id)
                    // }
                }
            } else {
                return res.status(400).json({ error: "Invalid operators type. Must be an array." })
            }

            await Workload.findByIdAndUpdate(req.selection._id, workload)
        }

        return res.json(workload)
    }),
    update: Schematized({
        required: ["_id", "update"],
        select: ["_id", "update"],
    }, async (req, res) => {
        let workload = await Workload.findById(req.selection._id).catch((err) => {
            return res.status(404).json({
                error: "Workload not found",
            })
        })

        workload = Methods.update(workload, req.selection.update).catch((err) => {
            return res.status(500).json({
                error: err,
            })
        })

        return res.json(workload)
    }),
    set: Schematized({
        required: ["payloads", "section", "name"],
    }, async (req, res) => {
        const { payloads, section, name, assigned, scheduledStart, scheduledFinish, workshift } = req.body

        const obj = {
            created: new Date().getTime(),
            commits: [],
            payloads,
            assigned,
            name,
            scheduledStart,
            scheduledFinish,
            section,
        }

        // create on each payload an UUID property
        payloads.forEach(item => {
            item.uuid = nanoid()
        })

        const result = await Workload.create(obj)

        // TODO: send update with WS (USE METHODS)
        // if (Array.isArray(assigned) && assigned.length > 0) {
        //     assigned.forEach((operator) => {
        //         const userSockets = req.ws.getClientSockets(operator)
        //         console.log(userSockets)

        //         if (userSockets) {
        //             userSockets.forEach(socket => {
        //                 socket.emit("workloadAssigned", result._id)
        //             })
        //         }
        //     })
        // }

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
        select: ["_id", "section", "name", "finished"],
    }, async (req, res) => {
        let workloads = null

        if (req.selection.section === "all") {
            delete req.selection.section
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

        return res.json(req.selection._id ? workloads[0] : workloads)
    }),
    getWorkloadWithPayloadUUID: Schematized({
        required: ["uuid"],
        select: ["uuid"],
    }, async (req, res) => {
        let workload = await Workload.findOne({
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
        // must exclude finished workloads
        let workloads = await Workload.find({ finished: false })
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