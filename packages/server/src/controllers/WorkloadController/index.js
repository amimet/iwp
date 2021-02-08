import { GeoRegion, Workload } from '../../models'

export const WorkloadController = {
    get: (req, res, next) => {
        const { region } = req.query

        GeoRegion.findOne({ region }).then((regionsData) => {
            if (!regionsData) return res.status(404).json(`No data finded`)
            const subRegions = regionsData.sub

            Workload.find({ region }).then((data) => {
                if (!data) return res.status(404).json(`No workloads for this region`)
                return res.json({ subRegions, data })
            })
        })

    },
    update: (req, res, next) => {

    },
    remove: (req, res, next) => {

    },
    set: (req, res, next) => {
        const { } = req.body
    }
}

export default WorkloadController