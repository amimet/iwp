export default {
    name: { type: String },
    orders: { type: Object, required: true },
    region: { type: String, default: 0 },
    workshift: { type: String },
    created: { type: Number, required: true },
    scheduledStart: { type: String },
    scheduledFinish: { type: String },
    status: { type: String, default: 'pending' },
    expired: { type: Boolean, default: false },
    assigned: { type: Array, default: [] },
    phase: { type: Number, default: false },
    nof: { type: Number, default: false},
}