import { Report } from "../../models"
import { selectValues } from "../../lib"

// TODO: Get reports from date range
// TODO: Get reports from assignments

export default {
    get: selectValues(["_id", "name", "location", "status"], async (req, res) => {
        console.log(req.selectedValues)
        
        const reports = await Report.find({ ...req.selectedValues })

        return res.json(reports)
    }),
    new: async (req, res) => {

    },
    delete: async (req, res) => {

    },
}