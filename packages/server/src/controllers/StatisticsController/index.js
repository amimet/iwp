import { Schematized } from '../../lib'

export default {
    getMonthlyCompletedWorkorders: Schematized({
        select: ["section", "user_id", "section"],
    }, async (req, res) => {

    })
}