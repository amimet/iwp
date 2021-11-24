import { FabricObject } from '../../models'
import { Schematized, selectValues, additionsHandler } from '../../lib'
import _ from "lodash"

const mutableKeys = ["type", "name", "properties"]

function overrideObjects(origin, to, keys) {
    keys.forEach(key => {
        if (typeof to[key] !== "undefined") {
            if (typeof to[key] === "object" && typeof origin[key] === "object") {
                origin[key] = _.merge(origin[key], to[key])
            } else {
                origin[key] = to[key]
            }
        }
    })

    return origin
}

export const FabricController = {
    // TODO: Allow to filter by properties
    get: selectValues(["type", "name", "_id"], async (req, res) => {
        let objects = (await FabricObject.find({ ...req.selectedValues })).map(object => {
            if (Array.isArray(object.properties)) {
                let processedProperties = {}

                object.properties.forEach(property => {
                    processedProperties[property.type] = property.value
                })

                object.properties = processedProperties
            }

            return object
        })

        return res.json(objects)
    }),
    update: selectValues(["_id", "mutation"], async (req, res) => {
        const { _id, mutation } = req.selectedValues

        let obj = await FabricObject.findOne({ _id })

        if (!obj) {
            return res.status(404).json({
                error: "Object not found"
            })
        }

        obj = overrideObjects(obj, mutation, mutableKeys)

        await FabricObject.findByIdAndUpdate(_id, obj)

        return res.json(obj)
    }),
    create: Schematized(["type", "name", "properties"], async (req, res) => {
        const { type, name, properties, additions } = req.body

        try {
            let craft = { type, name, properties }

            // handle additions
            if (Array.isArray(additions)) {
                craft.properties = await additionsHandler(additions, craft.properties)
            }

            let obj = new FabricObject(craft)

            obj.save()

            return res.json(obj)
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }),
    delete: selectValues(["_id"], async (req, res) => {
        let { _id } = req.selectedValues
        let query = []

        if (Array.isArray(_id)) {
            query = _id
        } else {
            query.push(_id)
        }

        for await (let id of query) {
            await FabricObject.findByIdAndDelete(id)
        }

        const result = await FabricObject.find()

        return res.json(result)
    }),
}

export default FabricController