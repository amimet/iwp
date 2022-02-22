import React from "react"
import * as antd from "antd"

export default {
    description: {
        label: "Description",
        description: "Description of the task. It should be a general description of the product. Do not include information that may vary. e.g. 'The product is a white shirt with a elastic red collar, size M'",
        icon: "MdDescription",
        component: "textarea",
        updateEvent: "onChange",
        onUpdate: (prev, update) => {
            return update.target.value
        },
        props: {
            size: "large",
            autoSize: { minRows: 1, maxRows: 7 },
            placeholder: "Describe something...",
        }
    },
    variants: {
        label: "Variants",
        description: "Define variants for this item. Only the types of variations that may exist of a product should be included. e.g. Size, Color, Material, etc.",
        icon: "MdSchema",
        component: "select",
        updateEvent: "onChange",
        props: {
            style: { width: "100%" },
            mode: "tags",
            size: "large",
            placeholder: "Type with your keyboard to create variants...",
            allowClear: true,
            defaultValue: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
            tokenSeparators: [','],
        },
    },
    images: {
        label: "Images",
        description: "Append some images to describe this item.",
        icon: "MdImage",
        component: "imageUploader",
        updateEvent: "onUploadDone",
        onUpdate: async (prev, update) => {
            return update
        },
    },
    operations: {
        label: "Operations",
        component: "select",
        updateEvent: "onChange",
        props: {
            placeholder: "Select operations",
        },
    },
    stockTarget: {
        label: "Stock Target",
        updateEvent: "onChange",
        props: {
            loadData: async (value) => {
                const api = window.app.request

                const data = await api.get.fabric(undefined, {
                    select: {
                        type: ["stockItem"],
                    }
                }).catch((err) => {
                    console.error(err)
                    return []
                })

                return data.map((item) => {
                    item.label = item.name
                    return item
                })
            },
            excludedSelectedKeys: true,
        },
        component: "addableSelectList",
        children: async () => {
            const api = window.app.request

            const data = await api.get.fabric(undefined, {
                select: {
                    type: ["stockItem"],
                }
            }).catch((err) => {
                console.error(err)
                return []
            })

            if (data) {
                return data.map((stockItem) => {
                    return <antd.Select.Option value={stockItem._id}>{stockItem.name}</antd.Select.Option>
                })
            }
            return data
        },
    },
    monetary_value: {
        label: "Monetary Value",
        component: "inputNumber",
        updateEvent: "onChange",
        onChange: (value) => {
            return value
        },
        props: {
            placeholder: "Enter monetary value",
        }
    },
    vaultItemTypeSelector: {
        label: "Type",
        component: "select",
        updateEvent: "onChange",
        children: async () => {
            let types = await import("schemas/vaultItemsTypes.json")

            types = types.default || types

            return Object.keys(types).map((group) => {
                return <antd.Select.OptGroup key={group} label={String(group).toTitleCase()}>
                    {types[group].map((type) => {
                        return <antd.Select.Option key={type} value={`${group}-${type}`}>{String(type).toTitleCase()}</antd.Select.Option>
                    })}
                </antd.Select.OptGroup>
            })
        },
        props: {
            placeholder: "Select a type",
        }
    },
    vaultItemSerial: {
        label: "Serial number",
        component: "input",
        updateEvent: "onChange",
        onUpdate: (prev, update) => {
            return update.target.value
        },
        props: {
            placeholder: "S/N 00000000X",
        }
    },
    vaultItemManufacturer: {
        label: "Manufacturer",
        component: "input",
        updateEvent: "onChange",
        onUpdate: (prev, update) => {
            return update.target.value
        },
        props: {
            placeholder: "e.g. Hewlett Packard",
        }
    },
    vaultItemManufacturedYear: {
        label: "Manufactured Year",
        component: "datepicker",
        updateEvent: "onChange",
        onUpdate: (prev, update) => {
            return update.year()
        },
        props: {
            picker: "year"
        }
    },
}