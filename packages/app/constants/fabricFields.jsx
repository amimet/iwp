import React from "react"
import * as antd from "antd"

export default {
    quantity: {
        mutability: true,
        mutabilityDefault: true,
        label: "Quantity",
        component: "inputNumber",
        updateEvent: "onChange",
        props: {
            min: 0,
            defaultValue: 1,
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
    operators: {
        label: "Operators",
        component: "select",
        updateEvent: "onChange",
        children: async () => {
            const api = window.app.request

            const operators = await api.get.users(undefined, { select: { roles: ["operator"] } }).catch((err) => {
                console.error(err)
                antd.message.error("Error fetching operators")
                return false
            })

            if (operators) {
                return operators.map(operator => {
                    return <antd.Select.Option value={operator._id}>{operator.fullName ?? operator.username}</antd.Select.Option>
                })
            }

            return null
        },
        props: {
            style: { width: "100%" },
            mode: "multiple",
            placeholder: "Select operators",
        },
    },
    description: {
        label: "Description",
        component: "textarea",
        updateEvent: "onChange",
        onUpdate: (update) => {
            return update.target.value
        },
        props: {
            autoSize: { minRows: 1, maxRows: 7 },
            placeholder: "Describe something...",
        }
    },
    operations: {
        label: "Operations",
        component: "select",
        updateEvent: "onChange",
        props: {
            placeholder: "Select operations",
        },
    },
    tasks: {
        label: "Tasks",
        component: "select",
        updateEvent: "onChange",
        props: {
            placeholder: "Select tasks",
        },
    },
    section: {
        label: "Section",
        component: "select",
        updateEvent: "onChange",
        children: async () => {
            const api = window.app.request
            const sections = await api.get.sections()

            return sections.map(section => {
                return <antd.Select.Option value={section.name}>{section.name}</antd.Select.Option>
            })
        },
        props: {
            placeholder: "Select a section",
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
    variants: {
        label: "Variants",
        component: "select",
        updateEvent: "onChange",
        // TODO: Fetch global variants from API
        props: {
            style: { width: "100%" },
            mode: "tags",
            placeholder: "Create variants",
            tokenSeparators: [','],
        },
    },
    imagePreview: {
        // TODO
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
        onUpdate: (update) => {
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
        onUpdate: (update) => {
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
        onUpdate: (update) => {
            return update.year()
        },
        props: {
            picker: "year"
        }
    },
}