import passport from 'passport'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'

import { User, Session } from '../../models'
import SessionController from '../SessionController'
import { Token } from '../../lib'

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

        User.find(selector, { username: 1, fullName: 1, _id: 1, roles: 1, avatar: 1 })
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
                        fullName: req.body.fullName,
                        avatar: req.body.avatar,
                        email: req.body.email,
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
    denyRole: async (req, res) => {
        // check if issuer user is admin
        if (!req.isAdmin()) {
            return res.status(403).send("You do not have administrator permission")
        }

        let { user_id, username, roles } = req.body
        const userQuery = {
            username: username,
            user_id: user_id,
        }

        // parse requested roles
        if (typeof roles === "string") {
            roles = roles.split(",").map(role => role.trim())
        } else {
            return res.send("No effect")
        }

        // get current user roles
        const user = await User.findOne({ ...userQuery })
        if (typeof user === "undefined") {
            return res.status(404).send(`[${username}] User not found`)
        }

        // query all roles mutation
        let queryRoles = []
        if (Array.isArray(roles)) {
            queryRoles = roles
        } else if (typeof roles === 'string') {
            queryRoles.push(roles)
        }

        // mutate all roles
        if (queryRoles.length > 0 && Array.isArray(user.roles)) {
            queryRoles.forEach(role => {
                user.roles = user.roles.filter(_role => _role !== role)
            })
        }

        // update user roles
        await user.save()
        return res.send("done")
    },
    grantRole: async (req, res) => {
        // check if issuer user is admin
        if (!req.isAdmin()) {
            return res.status(403).send("You do not have administrator permission")
        }

        let { user_id, username, roles } = req.body
        const userQuery = {
            username: username,
            user_id: user_id,
        }

        // parse requested roles
        if (typeof roles === "string") {
            roles = roles.split(",").map(role => role.trim())
        } else {
            return res.send("No effect")
        }

        // get current user roles
        const user = await User.findOne({ ...userQuery })
        if (typeof user === "undefined") {
            return res.status(404).send(`[${username}] User not found`)
        }

        // query all roles mutation
        let queryRoles = []
        if (Array.isArray(roles)) {
            queryRoles = roles
        } else if (typeof roles === 'string') {
            queryRoles.push(roles)
        }


        // mutate all roles
        if (queryRoles.length > 0 && Array.isArray(user.roles)) {
            queryRoles.forEach(role => {
                if (!user.roles.includes(role)) {
                    user.roles.push(role)
                }
            })
        }

        // update user roles
        await user.save()
        return res.send("done")
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
                user_id: user._id,
                username: user.username,
                email: user.email
            }

            if (req.body.allowRegenerate) {
                payload.allowRegenerate = true
            }

            // generate token
            const token = Token.signNew(payload, options)

            // send result
            res.json({ token: token })
        })(req, res)
    },
    logout: async (req, res, next) => {
        req.body = {
            user_id: req.decodedToken.user_id,
            token: req.jwtToken
        }

        return SessionController.delete(req, res, next)
    },
}

export default UserController
