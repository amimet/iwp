import { Schema } from 'mongoose'

export const GeoRegionSchema = Schema({
    id: Number,
    geo: Object,
    data: Object,
    sub: Object,
})