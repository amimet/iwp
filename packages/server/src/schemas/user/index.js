import { Schema } from 'mongoose'

export const UserSchema = Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    fullName: String,
    avatar: String,
    email: String,
    roles: [],
    login_count: Number,
    legal_id: String,
    legal_id_type: String,
    contact_phone: String,
})