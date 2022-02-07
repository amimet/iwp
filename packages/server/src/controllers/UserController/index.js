import passport from 'passport'
import bcrypt from 'bcrypt'

import { User } from '../../models'
import SessionController from '../SessionController'
import { Token, Schematized } from '../../lib'
import AvatarController from 'dicebar_lib'
import _ from 'lodash'

export default {
    isAuth: (req, res) => {
        return res.json(`You look nice today 😎`)
    },
    getSelf: (req, res) => {
        return res.json(req.user)
    },
    get: Schematized({
        select: ["_id", "username"],
    }, async (req, res) => {
        let result = []
        let selectQueryKeys = []

        if (Array.isArray(req.selection._id)) {
            for await (let _id of req.selection._id) {
                const user = await User.findById(_id).catch(err => {
                    return false
                })
                if (user) {
                    result.push(user)
                }
            }
        } else {
            result = await User.find(req.selection, { username: 1, fullName: 1, _id: 1, roles: 1, avatar: 1 })
        }

        if (req.query?.select) {
            try {
                req.query.select = JSON.parse(req.query.select)
            } catch (error) {
                req.query.select = {}
            }

            selectQueryKeys = Object.keys(req.query.select)
        }

        if (selectQueryKeys.length > 0) {
            result = result.filter(user => {
                let pass = false
                const selectFilter = req.query.select

                selectQueryKeys.forEach(key => {
                    if (Array.isArray(selectFilter[key]) && Array.isArray(user[key])) {
                        // check if arrays includes any of the values
                        pass = selectFilter[key].some(val => user[key].includes(val))
                    } else if (typeof selectFilter[key] === 'object' && typeof user[key] === 'object') {
                        // check if objects includes any of the values
                        Object.keys(selectFilter[key]).forEach(objKey => {
                            pass = user[key][objKey] === selectFilter[key][objKey]
                        })
                    }

                    // check if strings includes any of the values
                    if (typeof selectFilter[key] === 'string' && typeof user[key] === 'string') {
                        pass = selectFilter[key].split(',').some(val => user[key].includes(val))
                    }
                })

                return pass
            })
        }

        if (!result) {
            return res.status(404).json({ error: "Users not found" })
        }

        return res.json(result)
    }),
    getOne: Schematized({
        select: ["_id", "username"],
    }, async (req, res) => {
        const user = await User.findOne(req.selection)

        if (!user) {
            return res.status(404).json({ error: "User not exists" })
        }

        return res.json(user)
    }),
    register: (req, res) => {
        User.findOne({ username: req.body.username })
            .then((data) => {
                if (data) {
                    return res.status(409).json("Username is already exists")
                }

                const avatar = AvatarController.generate({ seed: req.body.username, type: "initials" })
                const hash = bcrypt.hashSync(req.body.password, parseInt(process.env.BCRYPT_ROUNDS))

                let document = new User({
                    username: req.body.username,
                    fullName: req.body.fullName,
                    avatar: avatar.uri,
                    email: req.body.email,
                    password: hash
                })

                return document.save()
            })
            .then(data => {
                return res.send(data)
            })
            .catch(err => {
                return res.json(err)
            })
    },
    updatePassword: async (req, res) => {
        //TODO
    },
    updateSelf: async (req, res) => {
        Object.keys(req.body).forEach(key => {
            req.user[key] = req.body[key]
        })

        User.findOneAndUpdate({ _id: req.user._id }, req.user)
            .then(() => {
                return res.send(req.user)
            })
            .catch((err) => {
                return res.send(500).send(err)
            })
    },
    update: async (req, res) => {
        // TODO
    },
    login: async (req, res) => {
        passport.authenticate("local", { session: false }, async (error, user, options) => {
            if (error) {
                return res.status(500).json(`Error validating user > ${error.message}`)
            }

            if (!user) {
                return res.status(401).json("Invalid credentials")
            }

            const token = await Token.createNewAuthToken(user, options)

            return res.json({ token: token })
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