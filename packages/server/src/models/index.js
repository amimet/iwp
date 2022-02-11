import mongoose from "mongoose"
import { Schema } from "mongoose"

function getSchemas() {
    const obj = Object()
    
    const _schemas = require("../schemas")
    Object.keys(_schemas).forEach(key => {
        obj[key] = Schema(_schemas[key])
    })

    return obj
}

const schemas = getSchemas()

export const FabricObject = mongoose.model("FabricObject", schemas.FabricObject, "fabricObjects")
export const Workorder = mongoose.model("Workorder", schemas.Workorder, "workorder")
export const Role = mongoose.model("Role", schemas.Role, "roles")
export const Vault = mongoose.model("Vault", schemas.VaultItem, "vault")
export const Section = mongoose.model("Section", schemas.Section, "sections")

export const User = mongoose.model("User", schemas.User, "accounts")
export const Session = mongoose.model("Session", schemas.Session, "sessions")
export const Workshift = mongoose.model("Workshift", schemas.Workshift, "workshifts")
export const Report = mongoose.model("Report", schemas.Report, "reports")