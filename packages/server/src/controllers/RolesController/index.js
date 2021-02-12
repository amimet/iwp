import { Role } from '../../models'

export const RolesController = {
    hasPermissions: (req, res, next) => {
        return res.json(`You are lucky today 🥳 > ${req.userPermissions}`)
    },
    get: (req, res, next) => {
        Role.find().then((data) => {
            if (!data) {
                return res.status(404).json("No roles finded")
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