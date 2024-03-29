import { ComplexController } from "linebridge/dist/classes"
import { Workorder, User } from "../../models"
import { Schematized } from "../../lib"
import { nanoid } from "nanoid"
import moment from "moment"

const format = "DD-MM-YYYY hh:mm"

function stepWorkorderUpdate(workorder) {
    let multiple = false
    let queue = []

    if (Array.isArray(workorder)) {
        multiple = true
        queue = workorder
    } else {
        multiple = false
        queue.push(workorder)
    }

    queue = queue.map((workorder) => {
        // parse expiration status
        if (typeof workorder.expired !== "undefined") {
            // check if is expired
            const endDate = moment(workorder.scheduledFinish, format)
            const now = moment().format(format)

            if (endDate.isBefore(moment(now, format))) {
                workorder.expired = true
            }
        }

        if (workorder.payloads) {
            workorder.payloads = workorder.payloads.map((payload) => {
                payload.debtQuantity = calculateWorkorderQuantityLeft(workorder, payload)
                payload.quantityReached = payload.debtQuantity === 0
                payload.producedQuantity = countQuantityFromCommits(workorder.commits.filter(commit => commit.payloadUUID === payload.uuid))

                return payload
            })
        }

        // if all payloads are reached, mark workorder as finished
        if (workorder.payloads && workorder.payloads.every((payload) => payload.quantityReached)) {
            // mark workorder as finished only the first time
            if (!workorder.finished) {
                global.wsInterface.io.emit(`workorderFinished_${workorder._id.toString()}`, workorder)
                workorder.status = "finished"
            }

            workorder.finished = true
        }

        return workorder
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

function calculateWorkorderQuantityLeft(workorder, payload) {
    const quantity = payload.properties?.quantity
    const quantityCount = countQuantityFromCommits(workorder.commits.filter(commit => commit.payloadUUID === payload.uuid))

    let result = quantity - quantityCount

    if (result < 0) {
        result = 0
    }

    return result
}

const Methods = {
    finish: async (_id) => {
        let workorder = await Workorder.findById(_id)

        workorder.finished = true

        await workorder.save()

        global.wsInterface.io.emit(`workorderFinished_${_id}`, workorder)
    },
    update: async (_id, update) => {
        let workorder = await Workorder.findById(_id).catch(err => {
            throw new Error(err)
        })

        const allowedUpdates = ["commits", "payloads", "assigned", "expired", "finished", "status", "section", "name"]

        if (update.payloads) {
            if (update.payloads?.length !== workorder.payloads?.length) {
                update.payloads.forEach(payload => {
                    if (!payload.uuid) {
                        payload.uuid = nanoid()
                    }
                })
            }
        }

        allowedUpdates.forEach((key) => {
            if (update[key]) {
                workorder[key] = update[key]
            }
        })

        // this is important, here we are updating statement of the workorder
        workorder = stepWorkorderUpdate(workorder)

        await Workorder.findByIdAndUpdate(_id, workorder)

        global.wsInterface.io.emit(`workorderUpdate_${_id}`, workorder)
        global.wsInterface.io.emit(`workorderUpdate`, workorder)

        return workorder
    },
    joinWorkload: async (workloadUUID, workorder, user) => {
        const worker = {
            workloadUUID,
            userId: typeof user._id === "object" ? user._id.toString() : user._id,
            fullName: user.fullName,
            username: user.username,
            avatar: user.avatar,
        }

        workorder.payloads.forEach((payload) => {
            if (payload.uuid === workloadUUID) {
                if (!Array.isArray(payload.activeWorkers)) {
                    payload.activeWorkers = []
                }

                payload.activeWorkers.push(worker)
            }
        })

        workorder = await Methods.update(workorder._id, {
            payloads: workorder.payloads
        }).catch((err) => {
            console.log(err)
            return socket.emit("responseError", {
                message: err.message
            })
        })

        global.wsInterface.io.emit(`workerJoinWorkload`, worker)
        global.wsInterface.io.emit(`workerJoinWorkload_${worker.userId}`, worker)
        global.wsInterface.io.emit(`workerJoinWorkload_${workloadUUID}`, worker)

        return workorder
    },
    leaveWorkload: async (workloadUUID, workorder, user) => {
        const userId = typeof user._id === "object" ? user._id.toString() : user._id

        workorder.payloads.forEach((payload) => {
            if (payload.uuid === workloadUUID) {
                if (Array.isArray(payload.activeWorkers)) {
                    payload.activeWorkers = payload.activeWorkers.filter((worker) => (typeof worker.userId === "object" ? worker.userId.toString() : worker.userId) !== userId)
                }
            }
        })

        workorder = await Methods.update(workorder._id, {
            payloads: workorder.payloads
        }).catch((err) => {
            console.log(err)

            return socket.emit("responseError", {
                message: err.message
            })
        })

        global.wsInterface.io.emit(`workerLeaveWorkload`, {
            workloadUUID,
            userId
        })
        global.wsInterface.io.emit(`workerLeaveWorkload_${userId}`, {
            workloadUUID,
            userId
        })
        global.wsInterface.io.emit(`workerLeaveWorkload_${workloadUUID}`, {
            workloadUUID,
            userId
        })

        return workorder
    }
}

export default class WorkorderController extends ComplexController {
    static refName = "WorkorderController"
    static useMiddlewares = ["withAuthentication"]

    channels = {
        "payloadCommit": async (socket, data = {}) => {
            const { workorderId, payloadUUID, quantity, tooks } = data

            if (!workorderId || !payloadUUID) {
                return socket.emit("responseError", {
                    message: "Missing data"
                })
            }

            let workorder = await Workorder.findById(workorderId).catch(() => {
                return false
            })

            if (!workorder) {
                return socket.emit("responseError", {
                    message: "Workorder not found"
                })
            }

            if (typeof workorder.commits === "undefined" || !Array.isArray(workorder.commits)) {
                workorder.commits = Array()
            }

            const userId = global.wsInterface.findUserIdFromClientID(socket.id)

            let commit = {
                payloadUUID: payloadUUID,
                quantity: quantity ?? 1,
                user_id: userId,
                timestamp: new Date().getTime(),
                tooks: tooks ?? 0,
            }

            workorder.commits.push(commit)

            workorder = Methods.update(workorderId, {
                commits: workorder.commits,
            }).catch((err) => {
                console.log(err)
                return socket.emit("responseError", {
                    message: err.message
                })
            })

            global.wsInterface.io.emit(`newCommit_${commit.payloadUUID}`, {
                workorderId: workorderId,
                commit,
            })

            return socket.emit("response", workorder)
        },
        "joinWorkload": async (socket, workloadUUID) => {
            let workorder = await Workorder.findOne({
                "payloads.uuid": workloadUUID,
            })
            let workload = workorder.payloads.find(payload => payload.uuid === workloadUUID)

            if (!workorder) {
                return socket.err({
                    message: "Workorder not found",
                })
            }
            if (!workload) {
                return socket.err({
                    message: "Workload not found"
                })
            }

            const userId = global.wsInterface.findUserIdFromClientID(socket.id)
            const user = await User.findById(userId).catch(() => {
                return false
            })

            if (!userId || !user) {
                return socket.err({
                    message: "Cannot find your user"
                })
            }
            if (!Array.isArray(workload.activeWorkers)) {
                workload.activeWorkers = []
            }

            const existOnActiveWorkers = workload.activeWorkers.find((worker) => (typeof worker.userId === "object" ? worker.userId.toString() : worker.userId) === userId)

            if (existOnActiveWorkers) {
                return socket.err({
                    message: "You are already working on this workload"
                })
            }

            await Methods.joinWorkload(workloadUUID, workorder, user)

            return socket.res("ok")
        },
        "leaveWorkload": async (socket, workloadUUID) => {
            let workorder = await Workorder.findOne({
                "payloads.uuid": workloadUUID,
            })
            let workload = workorder.payloads.find(payload => payload.uuid === workloadUUID)

            if (!workorder) {
                return socket.err({
                    message: "Workorder not found"
                })
            }
            if (!workload) {
                return socket.err({
                    message: "Workload not found"
                })
            }

            const userId = global.wsInterface.findUserIdFromClientID(socket.id)
            const user = await User.findById(userId).catch(() => {
                return false
            })

            if (!userId || !user) {
                return socket.err({
                    message: "Cannot find your user"
                })
            }
            if (!Array.isArray(workload.activeWorkers)) {
                workload.activeWorkers = []
            }

            const existOnActiveWorkers = workload.activeWorkers.find((worker) => (typeof worker.userId === "object" ? worker.userId.toString() : worker.userId) === userId)

            if (!existOnActiveWorkers) {
                return socket.err({
                    message: "You are not working on this workload, so you cannot leave it"
                })
            }

            await Methods.leaveWorkload(workloadUUID, workorder, user)

            return socket.res("ok")
        },
    }

    get = {
        "/workorder": Schematized({
            select: ["_id", "section", "name", "finished"],
        }, async (req, res) => {
            let workorders = null

            if (req.selection._id) {
                const data = await Workorder.findById(req.selection._id)

                if (!data) {
                    return res.status(404).send({
                        error: "Workorder not found",
                    })
                }

                workorders = [data]
            } else {
                switch (req.selection.section) {
                    case "all":
                        delete req.selection.section
                        break
                    case "finished":
                        req.selection.finished = true
                        delete req.selection.section
                        break
                    case "archived":
                        req.selection.status = "archived"
                        delete req.selection.section
                        break
                    default:
                        req.selection.status = { $nin: ["archived", "finished"] }
                        break
                }

                workorders = await Workorder.find(req.selection)
            }

            return res.json(req.selection._id ? workorders[0] : workorders)
        }),
        "/workorder_payload_UUID": Schematized({
            required: ["uuid"],
            select: ["uuid"],
        }, async (req, res) => {
            let workorder = await Workorder.findOne({
                "payloads.uuid": req.selection.uuid,
            })

            if (!workorder) {
                return res.status(404).send({
                    error: "Workorder not found",
                })
            }

            return res.json(workorder)
        }),
        "/assigned_workorders": Schematized({
            select: ["_id"],
        }, async (req, res) => {
            // must exclude finished workorders
            let workorders = await Workorder.find({ finished: false })
            workorders = workorders.filter(workorder => workorder.assigned.includes(req.selection._id ?? req.user._id))

            return res.json(workorders)
        }),
        "/workorder_commits": Schematized({
            required: ["workorderId"],
            select: ["workorderId", "payloadUUID"],
        }, async (req, res) => {
            let workorder = await Workorder.findById(req.selection.workorderId)

            if (!workorder) {
                return res.status(404).send({
                    error: "Workorder not found",
                })
            }

            if (req.selection.payloadUUID) {
                return res.json(workorder.commits.filter(commit => commit.payloadUUID === req.selection.payloadUUID))
            }

            return res.json(workorder.commits)
        })
    }

    post = {
        "/regenerates_uuid": {
            middlewares: ["permissions"],
            fn: async (req, res) => {
                let workorders = await Workorder.find()

                workorders.forEach(async (workorder) => {
                    if (workorder.payloads.length > 0) {

                        workorder.payloads.forEach((item) => {
                            if (typeof item.uuid === "undefined") {
                                item.uuid = nanoid()
                            }
                        })

                        await Workorder.findByIdAndUpdate(workorder._id, workorder)
                    }
                })

                return res.json(workorders)
            },
        },
    }

    put = {
        "/workorder": {
            middlewares: ["useWS"],
            fn: Schematized({
                required: ["payloads", "section", "name"],
            }, async (req, res) => {
                const { payloads, section, name, assigned, scheduledStart, scheduledFinish } = req.body

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

                // initialize payloads
                payloads.forEach((payload) => {
                    if (!payload.uuid) {
                        payload.uuid = nanoid()
                    }
                    if (!payload.activeWorkers) {
                        payload.activeWorkers = Array()
                    }
                })

                const result = await Workorder.create(obj)

                // TODO: send update with WS (USE METHODS)
                if (Array.isArray(assigned) && assigned.length > 0) {
                    assigned.forEach((operator) => {
                        const userSockets = req.ws.getClientSockets(operator)

                        if (userSockets && Array.isArray(userSockets)) {
                            userSockets.forEach((socket) => {
                                socket.emit("workorderAssigned", result._id)
                            })
                        }
                    })
                }

                req.ws.io.emit("newWorkorder", result)

                return res.json(result)
            }),
        },
        "/workorder_operators": {
            middlewares: ["useWS"],
            fn: Schematized({
                required: ["_id", "operators"],
                select: ["_id", "operators"],
            }, async (req, res) => {
                let workorder = await Workorder.findById(req.selection._id)

                if (workorder) {
                    if (Array.isArray(req.selection.operators) && Array.isArray(workorder.assigned)) {
                        for await (const operator of req.selection.operators) {
                            if (!workorder.assigned.includes(operator)) {
                                workorder.assigned.push(operator)

                                const userSockets = req.ws.getClientSockets(operator)

                                if (userSockets && Array.isArray(userSockets)) {
                                    userSockets.forEach((socket) => {
                                        socket.emit("workorderAssigned", workorder._id)
                                    })
                                }
                            }
                        }
                    } else {
                        return res.status(400).json({ error: "Invalid operators type. Must be an array." })
                    }

                    await Workorder.findByIdAndUpdate(req.selection._id, workorder)
                }

                return res.json(workorder)
            }),
        },
        "/update_workorder": {
            middlewares: ["permissions"],
            fn: Schematized({
                required: ["_id", "update"],
                select: ["_id", "update"],
            }, async (req, res) => {
                let result = {
                    failed: [],
                    success: [],
                }
                let query = []

                if (Array.isArray(req.selection._id)) {
                    query = req.selection._id
                } else {
                    query.push(req.selection._id)
                }

                for await (const [index, _id] of query.entries()) {
                    let update = Array.isArray(req.selection._id) && Array.isArray(req.selection.update) ? req.selection.update[index] : req.selection.update

                    let workorder = await Workorder.findById(_id).catch((err) => {
                        return false
                    })

                    if (workorder) {
                        //FIXME: if update method fails, this will be added to the success array anyways
                        workorder = await Methods.update(_id, update).catch((err) => {
                            return false
                        })

                        result.success.push(workorder)
                    } else {
                        result.failed.push(_id)
                    }

                    continue
                }

                return res.json(result)
            }),
        },
    }

    delete = {
        "/workorder": {
            middlewares: ["permissions", "useWS"],
            fn: Schematized({
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
                    const result = await Workorder.findByIdAndDelete({ _id })

                    if (result != null) {
                        deleted.push(_id)
                    }
                }

                req.ws.io.emit("deletedWorkorder", deleted)

                return res.json({ deleted })
            }),
        },
        "/workorder_operators": {
            middlewares: ["useWS"],
            fn: Schematized({
                required: ["_id", "operators"],
                select: ["_id", "operators"],
            }, async (req, res) => {
                let workorder = await Workorder.findById(req.selection._id)

                if (workorder) {
                    if (Array.isArray(req.selection.operators) && Array.isArray(workorder.assigned)) {
                        for await (const operator of req.selection.operators) {
                            if (workorder.assigned.includes(operator)) {
                                workorder.assigned.splice(workorder.assigned.indexOf(operator), 1)
                            }

                            const userSockets = req.ws.getClientSockets(operator)

                            if (userSockets && Array.isArray(userSockets)) {
                                userSockets.forEach((socket) => {
                                    socket.emit("workorderUnassigned", workorder._id)
                                })
                            }
                        }
                    } else {
                        return res.status(400).json({ error: "Invalid operators type. Must be an array." })
                    }

                    await Workorder.findByIdAndUpdate(req.selection._id, workorder)
                }

                return res.json(workorder)
            }),
        },
    }
}