import { Schema } from 'mongoose'

export const VaultSchema = Schema({
    id: String,
    created_date: String,
    current_location: String,
    item: Object
})