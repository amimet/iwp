export default {
    workload: {
        icon: "MdWorkOutline",
    },
    product: {
        icon: "Box",
        defaultFields: [
            "description",
            "operations",
        ],
    },
    operation: {
        icon: "Settings",
        defaultFields: [
            "description",
            "operations",
        ],
    },
    phase: {
        icon: "GitCommit",
        defaultFields: [
            "description",
            "tasks",
        ],
    },
    task: {
        icon: "Tool",
        defaultFields: [
            "description",
            "tasks",
        ],
    },
    vaultItem: {
        icon: "Archive",
        label: "Vault item",
        submitPayload: {
            "additions": ["essc"]
        },
        defaultFields: [
            "vaultItemTypeSelector",
            "vaultItemSerial",
            "vaultItemManufacturer",
            "vaultItemManufacturedYear",
            "location",
        ],
    },
}