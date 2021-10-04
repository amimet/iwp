export default {
    username: { type: String, required: true },
    password: { type: String, required: true, select: false },
    fullName: String,
    avatar: { type: String, default: "https://www.flaticon.com/svg/static/icons/svg/149/149071.svg" },
    email: String,
    roles: [],
    legal_id: Object,
    phone: Number,
}