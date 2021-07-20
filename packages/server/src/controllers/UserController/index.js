import passport from 'passport'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { User } from '../../models'
import SessionController from '../SessionController'

export const UserController = {
    isAuth: (req, res, next) => {
        return res.json(`You look nice today 😎`)
    },
    get: (req, res, next) => {
        const { id, username } = req.query

        let selector = {}

        if (typeof (id) !== "undefined") {
            selector = { id }
        } else if (typeof (username) !== "undefined") {
            selector = { username }
        }

        User.find(selector)
            .then((response) => {
                if (response) {
                    return res.safeJson(response)
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
                    return res.safeJson(response)
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
                sub: user._id,
                exp: Date.now() + parseInt(options.signLifetime ?? 300),
                username: user.username,
                fullName: user.fullName,
                avatar: user.avatar,
                email: user.email
            }

            const token = jwt.sign(JSON.stringify(payload), options.secretOrKey)
            SessionController.set(user._id, token)

            res.cookie('st', token, { maxAge: 900000, httpOnly: true })
            res.json({ token: token, originKey: options.secretOrKey })
        })(req, res)
    },
    logout: (req, res, next) => {
        try {
            SessionController.destroy(req, res, next)
        } catch (err) {

        }
    }
}

export default UserController
