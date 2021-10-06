export default {
    name: { type: String },
    items: { type: Object, required: true },
    regionId: { type: String, default: 0 },
    workshift: { type: String },
    created: { type: Number, required: true },
    scheduledStart: { type: String },
    scheduledFinish: { type: String },
    status: { type: String, default: 'pending' },
    assigned: { type: Array, default: [] },
    phase: { type: Number, default: false },
    nof: { type: Number, default: false},
}