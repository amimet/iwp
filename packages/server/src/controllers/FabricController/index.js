import { FabricObject } from '../../models'
import { Schematized } from '../../lib'

export const FabricController = {
    get: async (req, res) => {
        const obj = await FabricObject.findOne({ ...req.query })

        return res.json(obj)
    },
    getAll: async (req, res) => {
        const objects = await FabricObject.find({ ...req.query })

        return res.json(objects)
    },
    create: Schematized({
        id: { required: true, type: String },
        title: { required: true, type: String },
        description: String,
    }, async (req, res) => {
        const { id, title, description, img, props, cost, timeSpend } = req.body

        let craft = { id, title, description, img, props, cost, timeSpend }

        try {
            const objects = await FabricObject.find({ id })

            if (objects.length > 0) {
                return res.status(409).send("Item already exists!")
            }

            const obj = new FabricObject(craft)
            obj.save()

            return res.json(obj)
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }),
    remove: (req, res) => {

    },
}

export default FabricController