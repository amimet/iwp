import { Schema } from 'mongoose'

export const RoleSchema = Schema({
    name: String,
    description: String,
    apply: Object
})
