import mongoose from 'mongoose'
const Schema = mongoose.Schema

const UserSchema = Schema({
    username: { type: String, required: true },
    fullName: String,
    avatar: String,
    email: String,
    password: { type: String, required: true },
    roles: [],
    login_count: Number
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

export const Vault = mongoose.model('Vault', VaultSchema, "vault")
export const GeoRegion = mongoose.model('GeoRegion', GeoRegionSchema, "regions")
export const User = mongoose.model('User', UserSchema, "accounts")
export const Session = mongoose.model('Session', SessionSchema, "sessions")
