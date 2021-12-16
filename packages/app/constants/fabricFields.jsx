export default {
    description: {
        label: "Description",
        component: "input",
        updateEvent: "onChange",
        onUpdate: (update) => {
            return update.target.value
        },
        style: {
            minWidth: "300px",
        },
        props: {
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
    variants: {
        label: "Variants",
        component: "select",
        updateEvent: "onChange",
        onUpdate: (update) => {
            console.log(update)
            return update
        },
        // TODO: Fetch global variants from API
        props: {
            mode: "tags",
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