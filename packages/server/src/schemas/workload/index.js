export default {
    name: { type: String },
    orders: { type: Object, required: true },
    commits: { type: Array, default: [] },
    assigned: { type: Array, default: [] },
    region: { type: String, default: 0 },
    status: { type: String, default: 'pending' },
    created: { type: Number, required: true },
    expired: { type: Boolean, default: false },
    workshift: { type: String },
    scheduledStart: { type: String },
    scheduledFinish: { type: String },
}