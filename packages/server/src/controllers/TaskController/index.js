import { ComplexController } from "linebridge/dist/classes"
import { Workorder, User, Task } from "../../models"
import { Schematized } from "../../lib"

import moment from "moment"

export default class TaskController extends ComplexController {
    static refName = "TaskController"

    methods = {
        isTaskClosed: async (task) => {
            if (typeof task === "string") {
                task = await Task.findById(task).catch(err => null)
            }

            if (typeof task !== "object") {
                return null
            }

            return typeof task.start !== "undefined" && typeof task.end !== "undefined"
        },
        join: async (payload) => {
            const { user_id, target_id, user_data } = payload

            const tasks = await Task.find({ user_id, target_id })

            const openedExistentTasks = tasks.filter((task) => {
                const isStarted = typeof task.start !== "undefined"
                const isEnded = typeof task.end !== "undefined"

                return isStarted && !isEnded
            })

            if (openedExistentTasks.length > 0) {
                throw new Error("A new Task is already opened for this target_id, please close it first before open new one.")
            }

            const newTask = new Task({
                target_id,
                user_id,
                start: moment().toDate(),
            })

            await newTask.save()

            global.wsInterface.io.emit("task.join", {
                task: newTask,
                user_id,
                user_data,
            })

            global.wsInterface.io.emit(`task.join.target.${target_id}`, {
                task: newTask,
                user_id,
                user_data,
            })

            global.wsInterface.io.emit(`task.join.userId.${user_id}`, {
                task: newTask,
                user_id,
                user_data,
            })

            return newTask
        },
        leave: async (payload) => {
            const { user_id, target_id, user_data } = payload

            const tasks = await Task.find({ user_id, target_id })

            const openedExistentTasks = tasks.filter((task) => {
                const isStarted = typeof task.start !== "undefined"
                const isEnded = typeof task.end !== "undefined"

                return isStarted && !isEnded
            })

            if (openedExistentTasks.length === 0) {
                throw new Error("No Task is opened for this target_id, please open one first before close it.")
            }

            const task = openedExistentTasks[0]

            task.end = moment().toDate()

            await task.save()

            global.wsInterface.io.emit("task.leave", {
                task: task.toObject(),
                user_id,
                user_data,
            })

            global.wsInterface.io.emit(`task.leave.target.${target_id}`, {
                task: task.toObject(),
                user_id,
                user_data,
            })

            global.wsInterface.io.emit(`task.leave.userId.${user_id}`, {
                task: task.toObject(),
                user_id,
                user_data,
            })

            return task.toObject()
        },
    }

    channels = {
        join_task: async (socket, payload) => {
            const userId = global.wsInterface.findUserIdFromClientID(socket.id)
            const user = await User.findById(userId).catch(() => {
                return false
            })

            if (!userId || !user) {
                return socket.err({
                    message: "Cannot find your user"
                })
            }

            this.methods.join({
                ...payload,
                user_id: userId,
                user_data: user.toObject(),
            })
                .catch((error) => {
                    return socket.err({
                        message: error.message
                    })
                })
                .then((data) => {
                    return socket.res(data)
                })
        },
        leave_task: async (socket, payload) => {
            const userId = global.wsInterface.findUserIdFromClientID(socket.id)
            const user = await User.findById(userId).catch(() => {
                return false
            })

            if (!userId || !user) {
                return socket.err({
                    message: "Cannot find your user"
                })
            }

            this.methods.leave({
                ...payload,
                user_id: userId,
                user_data: user.toObject(),
            })
                .catch((error) => {
                    return socket.err({
                        message: error.message
                    })
                })
                .then((data) => {
                    return socket.res(data)
                })
        },
    }

    // put = {
    //     "/join_task/:id": async (req, res) => {
    //     },
    //     "/leave_task/:id": async (req, res) => {
    //     }
    // }

    get = {
        "/active_tasks": {
            middlewares: ["withAuthentication"],
            fn: Schematized({
                select: ["target_id", "user_id"]
            }, async (req, res) => {
                let tasks = await Task.find(req.selection).catch(() => {
                    return []
                })

                tasks = tasks.filter((task) => {
                    const isStarted = typeof task.start !== "undefined"
                    const isEnded = typeof task.end !== "undefined"

                    return isStarted && !isEnded
                })

                tasks = tasks.map(async (task) => {
                    const user = await User.findById(task.user_id).catch(() => {
                        return null
                    })

                    return {
                        ...task.toObject(),
                        user_data: user,
                    }
                })

                tasks = await Promise.all(tasks)

                return res.json(tasks)
            })
        },
        "/time_spent": Schematized({
            required: ["target_id"],
            select: ["target_id", "user_id"],
        }, async (req, res) => {
            const { target_id } = req.selection

            const tasks = await Task.find({ target_id })

            const seconds = tasks.reduce((acc, task) => {
                if (task.end) {
                    const start = moment(task.start)
                    const end = moment(task.end)

                    return acc + end.diff(start, "seconds")
                }

                return acc
            }, 0)

            return res.json({ seconds })
        })
    }
}