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
        let objects = await FabricObject.find(req.selectedValues)
        let additions = req.body?.additions ?? req.query?.additions

        for await (let object of objects) {
            if (Array.isArray(object.properties)) {
                let processedProperties = {}

                object.properties.forEach(property => {
                    processedProperties[property.type] = property.value
                })

                object.properties = processedProperties
            }

            if (Array.isArray(additions)) {
                object.properties = await additionsHandler(additions, object.properties)
            }
        }

        return res.json(objects)
    }),
    update: selectValues(["_id", "mutation"], async (req, res) => {
        try {
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
        } catch (error) {
            return res.status(500).json({
                error: error.message
            })
        }
    }),
    create: Schematized(["type", "name", "properties"], async (req, res) => {
        try {
            const { type, name, properties, additions } = req.body
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
    import: Schematized(["data"], async (req, res) => {
        try {
            const { data, type, additions, } = req.body
            
            for await (let item of data) {
                let existentObj = item._id && await FabricObject.findById(item._id).catch(() => {
                    return false
                })

                if (existentObj) {
                    console.log(`[${item._id}] Existent: \n`, existentObj)
                    existentObj = overrideObjects(existentObj, item, mutableKeys)

                    await FabricObject.findByIdAndUpdate(item._id, {
                        name: item.name,
                        type: item.FabricType ?? type,
                        properties: _.omit(item, ["_id", "name"]),
                    })

                    continue
                }

                let craft = {
                    type: item.FabricType ?? type,
                    name: item.name,
                    properties: _.omit(item, ["_id", "name"]),
                }

                if (Array.isArray(additions)) {
                    craft.properties = await additionsHandler(additions, craft.properties)
                }

                const newObj = new FabricObject(craft)

                newObj.save()

                continue
            }

            const objects = await FabricObject.find({ type })

            return res.json(objects)
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }),
    delete: selectValues(["_id", "type"], async (req, res) => {
        let { _id, type } = req.selectedValues
        let query = []

        if (Array.isArray(_id)) {
            query = _id
        } else {
            query.push(_id)
        }

        for await (let id of query) {
            await FabricObject.findByIdAndDelete(id)
        }

        const result = await FabricObject.find({ type })

        return res.json(result)
    }),
}

export default FabricController