import { Schema } from 'mongoose'

export const FabricSchema = Schema({
    name: String,
    objects: Object,
})