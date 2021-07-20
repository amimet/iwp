import { Schema } from 'mongoose'

export const ContractSchema = Schema({
    user_id: String,
    issuer: String,
    created: String,
    valid_date: String,
    expire_date: String,
    conditions: String,
    monetary_value: String,
})