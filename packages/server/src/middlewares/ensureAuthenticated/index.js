import passport from 'passport'
import { Session } from '../../models'

export default async (req, res, next) => {
    function fail() {
        return res.status(403).json(`This request needs authentication that you do not have`)
    }

    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        const token = req.headers.authorization.split(' ')[1]

        passport.authenticate('jwt', { session: false }, async (err, user, decoded) => {
            if (err) {
                return res.status(403).json(`An error occurred while trying to authenticate > ${err.message}`)
            }

            if (!user) {
                return fail()
            }

            const sessions = await Session.find({ user_id: decoded.user_id })
            const sessionsTokens = sessions.map(session => session.token)
            if (!sessionsTokens.includes(token)) {
                return fail()
            }

            req.user = user
            req.jwtToken = token
            req.decodedToken = decoded
            
            next()
        })(req, res, next)
    } else {
        return fail()
    }
}
