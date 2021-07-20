import { Schema } from 'mongoose'

export const SessionSchema = Schema({
    user_id: String,
    token: String,
})