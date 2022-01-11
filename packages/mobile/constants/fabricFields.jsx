import React from "react"
import * as antd from "antd"

export default {
    quantity: {
        label: "Quantity",
        component: "inputNumber",
        updateEvent: "onChange",
        props: {
            min: 0,
            defaultValue: 1,
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
    location: {
        label: "Location",
        component: "select",
        updateEvent: "onChange",
        children: async () => {
            const api = window.app.request
            const regions = await api.get.regions()

            return regions.map(region => {
                return <antd.Select.Option value={region.name}>{region.name}</antd.Select.Option>
            })
        },
        props: {
            placeholder: "Select a location",
        },
    },
    sections: {
        label: "Sections",
        component: "select",
        updateEvent: "onChange",
        props: {
            mode: "tags",
            placeholder: "Select sections",
            tokenSeparators: [','],
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