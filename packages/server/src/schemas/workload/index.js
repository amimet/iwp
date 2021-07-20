import { Schema } from 'mongoose'

export const WorkloadSchema = Schema({
    id: String,
    created_date: String,
    current_location: String,
    item: Object
})