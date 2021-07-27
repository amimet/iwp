import { Schema } from 'mongoose'

export const SessionSchema = Schema({
    user_id: String,
    token: String,
    date: { type: String, default: "Unknown" },
    location: { type: String, default: "Unknown" },
    geo: { type: String, default: "Unknown" },
})