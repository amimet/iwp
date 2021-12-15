import { Workload } from '../../models'
import { Schematized } from '../../lib'

export default {
    getMonthlyCompletedWorkloads: Schematized({
        select: ["region", "user_id", "section"],
    }, async (req, res) => {

    })
}