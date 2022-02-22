export default {
    product: {
        label: "Product",
        icon: "Box",
        defaultFields: [
            "description",
            "variants",
            "images"
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
    stockItem: {
        label: "Stock item",
        icon: "Circle",
        defaultFields: [
            "description",
            "quantity",
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
            "section",
        ],
    },
}