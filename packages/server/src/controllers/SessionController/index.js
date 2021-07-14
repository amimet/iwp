import { Session } from '../../models'
import jwt from 'jsonwebtoken'

export const SessionController = {
    validate: async (req, res) => {
        const session = req.body.session
        let result = {
            expired: false,
            valid: false
        }

        await jwt.verify(session, req.jwtStrategy.secretOrKey, (err, decoded) => {
            if (err) {
                result.valid = false
                result.error = err
            }

            result = {...result, ...decoded}
        })

        console.log(result)

        res.json(result)
    },
    set: (id, token) => {
        Session.findOne({ user_id: id }).then(async (sessiondata) => {
            if (sessiondata) {
                await Session.findOneAndDelete({ _id: sessiondata._id })
            }
            return SessionController.add(id, token)
        })
    },
    add: (id, token) => {
        let newSession = new Session({
            user_id: id,
            token
        })
        return newSession.save()
    },
    destroy: (req, res, next, id) => {
        let byid = req.session_id ?? id
        if (!byid) {
            return next(false)
        }

        Session.findOneAndDelete({ _id: byid }).then(() => {
            next(true)
        })
    }
}

export default SessionController