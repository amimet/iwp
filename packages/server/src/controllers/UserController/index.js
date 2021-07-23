import passport from 'passport'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { User, Session } from '../../models'

export const UserController = {
    isAuth: (req, res, next) => {
        return res.json(`You look nice today 😎`)
    },
    get: (req, res, next) => {
        User.find({}, { username: 1, fullName: 1, _id: 1, roles: 1, avatar: 1 })
            .then((response) => {
                if (response) {
                    return res.json(response)
                } else {
                    res.status(404)
                    return res.json("User not exists")
                }
            })
    },
    getOne: (req, res, next) => {
        const { id, username } = req.query

        let selector = {}

        if (typeof (id) !== "undefined") {
            selector = { id }
        } else if (typeof (username) !== "undefined") {
            selector = { username }
        }

        User.findOne(selector)
            .then((response) => {
                if (response) {
                    return res.json(response)
                } else {
                    res.status(404)
                    return res.json("User not exists")
                }
            })
    },
    register: (req, res, next) => {
        User.findOne({ username: req.body.username })
            .then((data) => {
                if (data) {
                    return res.status(409).json("Username is already exists")
                }
                else {
                    var hash = bcrypt.hashSync(req.body.password, parseInt(process.env.BCRYPT_ROUNDS))
                    let document = new User({
                        username: req.body.username,
                        fullName: req.body.fullName || null,
                        avatar: req.body.avatar || "https://www.flaticon.com/svg/static/icons/svg/149/149071.svg",
                        email: req.body.email || null,
                        roles: ["registered"],
                        password: hash
                    })
                    return document.save()
                }
            })
            .then(data => {
                return res.send(data)
            })
            .catch(err => {
                return next(err)
            })
    },
    login: (req, res, next) => {
        passport.authenticate("local", { session: false }, (error, user, options) => {
            if (error) {
                return res.status(500).json(`Error validating user > ${error.message}`)
            }

            if (!user) {
                return res.status(401).json("Invalid credentials")
            }

            const payload = {
                id: user._id,
                username: user.username,
                email: user.email
            }

            // generate token
            const token = jwt.sign(payload, options.secretOrKey, { expiresIn: options.expiresIn ?? "1h", algorithm: options.algorithm ?? "HS256" })

            // add the new session
            let newSession = new Session({
                user_id: user.id,
                token
            })

            newSession.save()

            // send result
            res.json({ token: token })
        })(req, res)
    },
    logout: async (req, res, next) => {
        const { token } = req.body

        Session.findOneAndDelete({ token: token })
    },
}

export default UserController
