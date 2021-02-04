import passport from 'passport'

export const ensureAuthenticated = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.json({ code: 110, data: `An error occurred while trying to authenticate` })
        }

        if (!user) {
            return res.json({ code: 100, data: `This request needs authentication that you do not have` })
        }

        next()
    })(req, res, next)
}

export default ensureAuthenticated