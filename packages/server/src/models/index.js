import mongoose, { mongo } from 'mongoose'
const Schema = mongoose.Schema

const RoleSchema = Schema({
    name: String,
    apply: Object
})

const UserSchema = Schema({
    username: { type: String, required: true },
    fullName: String,
    avatar: String,
    email: String,
    password: { type: String, required: true },
    roles: [],
    login_count: Number,
    legal_id: String,
    legal_id_type: String,
    contact_phone: String,
})

const SessionSchema = Schema({
    user_id: String, // Unique Session Identificator
    token: String,
})

const GeoRegionSchema = Schema({
    id: Number,
    geo: Object,
    data: Object
})

const VaultSchema = Schema({
    id: String,
    created_date: String,
    current_location: String,
    item: Object
})

const ContractSchema = Schema({
    user_id: String,
    issuer: String,
    created: String,
    valid_date: String,
    expire_date: String,
    conditions: String,
    monetary_value: String,
})

export const Role = mongoose.model('Role', RoleSchema, 'roles')
export const Vault = mongoose.model('Vault', VaultSchema, "vault")
export const GeoRegion = mongoose.model('GeoRegion', GeoRegionSchema, "regions")

export const Contract = mongoose.model('Contract', ContractSchema, "contracts")
export const User = mongoose.model('User', UserSchema, "accounts")
export const Session = mongoose.model('Session', SessionSchema, "sessions")
