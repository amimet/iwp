import { genV1 } from "../../essc"

export default (obj) => {
    obj.essc = genV1({ type: obj.vaultItemTypeSelector, serial: obj.vaultItemSerial, manufacturer: obj.vaultItemManufacturer })

    return obj
}