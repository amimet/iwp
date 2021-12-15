import { Report } from "../../models"
import { Schematized } from "../../lib"

// TODO: Get reports from date range
// TODO: Get reports from assignments

export default {
    get: Schematized({
        select: ["_id", "name", "location", "status"],
    }, async (req, res) => {
        console.log(req.selection)

        const reports = await Report.find({ ...req.selection })

        return res.json(reports)
    }),
    new: async (req, res) => {

    },
    delete: async (req, res) => {

    },
}