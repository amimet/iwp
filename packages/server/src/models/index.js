import mongoose from 'mongoose'
import * as schemas from '../schemas'

export const Fabric = mongoose.model('Fabric', schemas.FabricSchema, "fabric")
export const Workload = mongoose.model('Workload', schemas.WorkloadSchema, "workload")
export const Role = mongoose.model('Role', schemas.RoleSchema, 'roles')
export const Vault = mongoose.model('Vault', schemas.VaultSchema, "vault")
export const GeoRegion = mongoose.model('GeoRegion', schemas.GeoRegionSchema, "regions")

export const Contract = mongoose.model('Contract', schemas.ContractSchema, "contracts")
export const User = mongoose.model('User', schemas.UserSchema, "accounts")
export const Session = mongoose.model('Session', schemas.SessionSchema, "sessions")
