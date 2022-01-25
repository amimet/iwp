import jwt from "jsonwebtoken"
import { nanoid } from "nanoid"
import { Session, User } from "../../models"

export async function createNewAuthToken(user, options = {}) {
    const payload = {
        user_id: user._id,
        username: user.username,
        email: user.email,
        refreshToken: nanoid(),
    }

    await User.findByIdAndUpdate(user._id, { refreshToken: payload.refreshToken })

    return await signNew(payload, options)
}

export async function signNew(payload, options = {}) {
    let session_uuid = null

    if (options.updateSession) {
        session_uuid = options.updateSession
    } else {
        session_uuid = nanoid()
    }

    const token = jwt.sign({
        ...payload,
        session_uuid,
    }, options.secretOrKey, {
        expiresIn: options.expiresIn ?? "1h",
        algorithm: options.algorithm ?? "HS256"
    })

    if (options.updateSession) {
        await Session.findByIdAndUpdate(options.updateSession, { token })
    } else {
        let newSession = new Session({
            session_uuid,
            token: token,
            user_id: payload.user_id,
            date: new Date().getTime(),
            location: global.signLocation ?? "rs-auth",
        })

        newSession.save()
    }

    return token
}