import { Schema } from 'mongoose'

export const FabricObjectSchema = Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    img: String,
    props: Object,
    timeSpend: Number,
    cost: Number,
})