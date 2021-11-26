export default (obj) => {
    const fixedKeys = {
        vaultItemManufacturer: "manufacturer",
        vaultItemSerial: "serial",
        vaultItemTypeSelector: "type"
    }

    Object.keys(obj).forEach(key => {
        if (fixedKeys[key]) {
            obj[fixedKeys[key]] = obj[key]
            delete obj[key]
        }
    })

    return obj
}