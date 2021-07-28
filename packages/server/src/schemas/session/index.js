import { Schema } from 'mongoose'

export const SessionSchema = Schema({
    uuid: { type: String, required: true},
    token: { type: String, required: true},
    user_id: { type: String, required: true},
    date: { type: String, default: "Unknown" },
    location: { type: String, default: "Unknown" },
    geo: { type: String, default: "Unknown" },
})