import { Session } from '../../models'
import jwt from 'jsonwebtoken'

export const SessionController = {
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
            const sessionsTokens = sessions.map((session) => {
                if (session.user_id === result.id) {
                    return session.token
                }
            })

            if (!sessionsTokens.includes(token)) {
                result.valid = false
                result.error = "Session token not found"
            }else {
                result.valid = true
            } 
        })

        res.json(result)
    },
    get: async (req,res) => {
        // get current session user_id
        const { id } = req.user
        const sessions = await Session.find({ user_id: id })
        
        res.json(sessions)
    },
}

export default SessionController