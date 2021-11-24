export default {
    region: { type: String, default: 0 },
    name: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    workableHours: { type: Number, default: 0 },
    days: { type: Array, default: [0, 1, 2, 3, 4, 5, 6] },
}