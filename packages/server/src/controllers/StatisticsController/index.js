import { Schematized } from '../../lib'

export default {
    getMonthlyCompletedWorkloads: Schematized({
        select: ["section", "user_id", "section"],
    }, async (req, res) => {

    })
}