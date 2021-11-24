import { Workshift } from "../../models"
import { selectValues, Schematized } from "../../lib"
import moment from 'moment'

const workableDays = ["M", "TU", "W", "TH", "F", "SU", "SA"]

export const WorkshiftsController = {
    get: selectValues(["name", "region", "start", "end", "periodicity", "_id"], async (req, res) => {
        let result = Array()

        if (typeof req.selectedValues._id === "undefined") {
            result = await Workshift.find(req.selectedValues)
        } else {
            result = await Workshift.findById(req.selectedValues._id)
        }

        return res.json(result)
    }),
    set: Schematized(["name", "start", "end"], selectValues(["name", "regionId", "start", "end", "periodicity"], async (req, res) => {
        if (await Workshift.findOne({name: req.selectedValues.name, start: req.selectedValues.start, end: req.selectedValues.end})) {
            return res.status(400).json({ message: "Workshift already exists" })
        }
        // validate
        let { start, end, periodicity } = req.selectedValues

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

        const workshift = new Workshift({ ...req.selectedValues, workableHours, periodicity: days })
        await workshift.save()

        return res.json({ message: "Done" })
    })),
    del: async (req, res) => {
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
    }
}

export default WorkshiftsController