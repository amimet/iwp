export default {
    product: {
        label: "Product",
        icon: "Box",
        defaultFields: [
            "description",
            "operations",
        ],
    },
    operation: {
        label: "Operation",
        icon: "Settings",
        defaultFields: [
            "description",
            "operations",
        ],
    },
    phase: {
        label: "Phase",
        icon: "GitCommit",
        defaultFields: [
            "description",
            "tasks",
        ],
    },
    task: {
        label: "Task",
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