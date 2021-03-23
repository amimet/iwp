import mongoose, { mongo } from 'mongoose'
const Schema = mongoose.Schema

const RoleSchema = Schema({
    name: String,
    description: String,
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
    data: Object,
    sub: Object,
})

const VaultSchema = Schema({
    id: String,
    created_date: String,
    current_location: String,
    item: Object
})

const WorkloadSchema = Schema({
    id: String,
    created_date: String,
    current_location: String,
    item: Object
})

const FabricSchema = Schema({
    name: String,
    objects: Object,
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

const StreamingSchema = Schema({
    session_id: String,
    stream_key: String,
    stream_id: String,
    user_id: String,
})

const StreamKeysSchema = Schema({
    user_id: String,
    username: String,
    key: String,
})

const StreamingResolverSchema = Schema({
    stream_key: String,
    stream_id: String,
    user_id: String,
})

export const StreamingResolver = mongoose.model('StreamingResolver', StreamingResolverSchema, "streaming_resolvers")
export const StreamKey = mongoose.model('StreamKey', StreamKeysSchema, "stream_keys")
export const Streaming = mongoose.model('Streaming', StreamingSchema, "streamings")

export const Fabric = mongoose.model('Fabric', FabricSchema, "fabric")
export const Workload = mongoose.model('Workload', WorkloadSchema, "workload")
export const Role = mongoose.model('Role', RoleSchema, 'roles')
export const Vault = mongoose.model('Vault', VaultSchema, "vault")
export const GeoRegion = mongoose.model('GeoRegion', GeoRegionSchema, "regions")

export const Contract = mongoose.model('Contract', ContractSchema, "contracts")
export const User = mongoose.model('User', UserSchema, "accounts")
export const Session = mongoose.model('Session', SessionSchema, "sessions")
