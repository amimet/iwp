import { Workload } from '../../models'
import { Schematized, selectValues } from '../../lib'

const StatisticsController = {
    getMonthlyCompletedWorkloads: selectValues(["region", "user_id", "section"], async (req, res) => {
        const { selectedValues } = req

        const {  } = selectedValues
    })
}

export default StatisticsController