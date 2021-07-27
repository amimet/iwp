import { Session } from '../../models'
import jwt from 'jsonwebtoken'

export const SessionController = {
    deleteAll: async (req, res) => {
        const { user_id } = req.body

        if (typeof user_id === "undefined") {
            return res.status(400).send("No user_id provided")
        }

        const allSessions = await Session.deleteMany({ user_id })
        if (allSessions) {
            return res.send("done")
        }

        return res.status(404).send("not found")
    },
    delete: async (req, res) => {
        const { token, user_id } = req.body

        if (typeof user_id === "undefined") {
            return res.status(400).send("No user_id provided")
        }
        if (typeof token === "undefined") {
            return res.status(400).send("No token provided")
        }

        const session = await Session.findOneAndDelete({ user_id, token })
        if (session) {
            return res.send("done")
        }

        return res.status(404).send("not found")
    },
    validate: async (req, res) => {
        const token = req.body.session
        let result = {
            expired: false,
            valid: true
        }

        await jwt.verify(token, req.jwtStrategy.secretOrKey, async (err, decoded) => {
            if (err) {
                result.valid = false
                result.error = err.message

                if (err.message === "jwt expired") {
                    result.expired = true
                }
                return
            }

            result = { ...result, ...decoded }

            const sessions = await Session.find({ user_id: result.id })
            const sessionsTokens = sessions.map((session) => {
                if (session.user_id === result.id) {
                    return session.token
                }
            })

            if (!sessionsTokens.includes(token)) {
                result.valid = false
                result.error = "Session token not found"
            } else {
                result.valid = true
            }
        })

        res.json(result)
    },
    get: async (req, res) => {
        // get current session user_id
        const { id } = req.user
        const sessions = await Session.find({ user_id: id }, { token: 0 })

        res.json(sessions)
    },
}

export default SessionController