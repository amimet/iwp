import { Section } from '../../models'
import { Schematized } from "../../lib"

// TODO: Support for child objects
export default {
    new: Schematized({
        select: ["name", "address"],
    }, async (req, res) => {
        const { name, address } = req.selection

        const sections = await Section.find({ name })

        if (sections.length > 0) {
            return res.status(409).json({ error: "Section already exists" })
        }

        const section = new Section({ name, address })
        await section.save()

        return res.json(section)
    }),
    get: Schematized({
        select: ["name", "address"],
    }, async (req, res) => {
        const section = await Section.findOne(req.selection)
        return res.json(section)
    }),
    getAll: (req, res) => {
        Section.find().then((data) => {
            return res.json(data)
        })
    }
}