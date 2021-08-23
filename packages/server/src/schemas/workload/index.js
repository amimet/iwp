import { Schema } from 'mongoose'

export const WorkloadSchema = Schema({
    created: { type: Number, required: true },
    items: { type: Object, required: true },
    location: String,
})