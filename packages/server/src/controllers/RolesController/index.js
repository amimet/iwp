import { Role, User } from "../../models"
import { Schematized } from "../../lib"

export default {
    get: Schematized({
        select: ["user_id", "username"],
    }, async (req, res) => {
        const roles = await Role.find()

        return res.json(roles)
    }),
    create: Schematized({
        required: ["name"],
        select: ["name", "description"],
    }, async (req, res) => {
        await Role.findOne(req.selection).then((data) => {
            if (data) {
                return res.status(409).json("This role is already created")
            }

            let role = new Role({
                name: req.selection.name,
                description: req.selection.description,
            })

            role.save()

            return res.json(role)
        })
    }),
    delete: Schematized({
        required: ["name"],
        select: ["name"],
    }, async (req, res) => {
        if (req.selection.name === "admin") {
            return res.status(409).json("You can't delete admin role")
        }

        await Role.findOne(req.selection).then((data) => {
            if (!data) {
                return res.status(404).json("This role is not found")
            }

            data.remove()

            return res.json(data)
        })
    }),
    getUserRoles: Schematized({
        select: ["user_id", "username"],
    }, async (req, res) => {
        const user = await User.findOne(req.selection)

        if (!user) {
            return res.status(404).json({ error: "No user founded" })
        }

        return res.json(user.roles)
    }),
    updateRoles: Schematized({
        required: ["update"],
        select: ["update"],
    }, async (req, res) => {
        // check if issuer user is admin
        if (!req.isAdmin()) {
            return res.status(403).send("You do not have administrator permission")
        }

        if (!Array.isArray(req.selection.update)) {
            return res.status(400).send("Invalid update request")
        }

        req.selection.update.forEach(async (update) => {
            const user = await User.findById(update._id).catch(err => {
                return false
            })

            if (user) {
                user.roles = update.roles

                await user.save()
            }
        })

        return res.send("done")
    }),
}