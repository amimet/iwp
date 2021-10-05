import { Role } from '../../models'

export const RolesController = {
    getAll: async (req, res, next) => {
        const roles = await Role.find()
        
        return res.json(roles)
    },
    get: (req, res, next) => {
        Role.find().then((data) => {
            if (!data) {
                return res.status(404).json("No roles founded")
            }
            return res.json(data)
        })
    },
    set: (req, res, next) => {
        const { name, description } = req.body
        Role.findOne({ name }).then((data) => {
            if (data) {
                return res.status(409).json("This role is already created")
            }
            let document = new Role({
                name,
                description
            })
            document.save()
            return res.json(true)
        })
    }
}

export default RolesController