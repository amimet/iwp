import { ComplexController } from "linebridge/dist/classes"
import { Workshift } from "../../models"
import { Schematized } from "../../lib"
import moment from 'moment'

const workableDays = ["M", "TU", "W", "TH", "F", "SU", "SA"]

export default class WorkshiftsController extends ComplexController {
    static refName = "WorkshiftController"

    get = {
        "/workshifts": {
            middlewares: ["withAuthentication"],
            fn: Schematized({
                select: ["name", "section", "start", "end", "periodicity", "_id"],
            }, async (req, res) => {
                let result = Array()

                if (typeof req.selection._id === "undefined") {
                    result = await Workshift.find(req.selection)
                } else {
                    result = await Workshift.findById(req.selection._id)
                }

                return res.json(result)
            }),
        },
    }

    put = {
        "/workshift": {
            middlewares: ["withAuthentication", "onlyAdmin"],
            fn: Schematized({
                required: ["name", "start", "end"],
                select: ["name", "sectionId", "start", "end", "periodicity"],
            }, async (req, res) => {
                if (await Workshift.findOne({ name: req.selection.name, start: req.selection.start, end: req.selection.end })) {
                    return res.status(400).json({ message: "Workshift already exists" })
                }
                // validate
                let { start, end, periodicity } = req.selection

                const startMoment = moment(start, "hh:mm")
                const endMoment = moment(end, "hh:mm")
                let days = Array()

                const workableHours = moment.duration(endMoment.diff(startMoment)).asHours()

                if (!startMoment.isValid() || !endMoment.isValid()) {
                    return res.status(400).json({ message: "Invalid date format" })
                }

                if (typeof periodicity !== "undefined") {
                    if (typeof periodicity === "string") {
                        periodicity = periodicity.toLocaleUpperCase()

                        periodicity.split(",").forEach((day) => {
                            workableDays[day] && days.push(workableDays[day])
                        })
                    }
                } else {
                    days = [0, 1, 2, 3, 4, 5, 6]
                }

                const workshift = new Workshift({ ...req.selection, workableHours, periodicity: days })
                await workshift.save()

                return res.json({ message: "Done" })
            }),
        }
    }

    del = {
        "/workshift": {
            middlewares: ["withAuthentication", "onlyAdmin"],
            fn: async (req, res) => {
                const { _id } = req.body

                if (typeof _id === "undefined") {
                    return res.status(400).json({ message: "Missing _id" })
                }

                const result = await Workshift.findOneAndDelete({ _id })
                    .catch((err) => {
                        return res.status(500).json({ message: err.message })
                    })

                if (!result) {
                    return res.status(404).json({ message: "Workshift not found" })
                }

                return res.json({ message: "Done" })
            },
        }
    }
}