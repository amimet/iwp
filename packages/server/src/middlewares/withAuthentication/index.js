import passport from "passport"
import { Session } from "../../models"

export default (req, res, next) => {
    function unauthorized() {
        console.log("Returning failed session")
        return res.status(401).send({ error: "Invalid session" })
    }

    const authHeader = req.headers?.authorization?.split(" ")

    if (authHeader && authHeader[0] === "Bearer") {
        const token = authHeader[1]

        passport.authenticate("jwt", { session: false }, async (err, user, decodedToken) => {
            if (err) {
                return res.status(401).send({ error: err })
            }

            if (!user) {
                return res.status(404).send({ error: "No user data found" })
            }

            const sessions = await Session.find({ user_id: decodedToken.user_id })
            const sessionsTokens = sessions.map(session => session.token)

            if (!sessionsTokens.includes(token)) {
                return unauthorized()
            }

            req.user = user
            req.jwtToken = token
            req.decodedToken = decodedToken
            
            // try to regenerate jwt token if expired

            
            return next()
        })(req, res, next)
    } else {
        return unauthorized()
    }
}
