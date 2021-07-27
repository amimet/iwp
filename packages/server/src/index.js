import cloudlink from '@ragestudio/cloudlink'
import { objectToArrayMap } from "@corenode/utils"
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import passport from 'passport'

import { User } from './models'

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const LocalStrategy = require('passport-local').Strategy
const { Buffer } = require("buffer")

function b64Decode(data) {
    return Buffer.from(data, 'base64').toString('utf-8')
}

function b64Encode(data) {
    return Buffer.from(data, 'utf-8').toString('base64')
}

const invalidKeys = ["password"]

class Server {
    constructor() {
        this.env = _env
        this.listenPort = this.env.listenPort ?? 3000

        this.middlewares = require("./middlewares")
        this.controllers = require("./controllers")
        this.endpoints = require("./endpoints")

        this.instance = new cloudlink.Server({
            listen: "0.0.0.0",
            middlewares: this.middlewares,
            controllers: this.controllers,
            endpoints: this.endpoints,
            port: this.listenPort
        })

        this.server = this.instance.httpServer

        this.options = {
            jwtStrategy: {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: this.instance.oskid,
                algorithms: ['sha1', 'RS256', 'HS256'],
                expiresIn: "1h"
            }
        }

        this.initialize()
    }

    async initialize() {
        await this.connectToDB()
        await this.initPassport()

        // register middlewares
        this.instance.middlewares["useJwtStrategy"] = (req, res, next) => {
            req.jwtStrategy = this.options.jwtStrategy
            next()
        }

        this.server.use((req, res, next) => {
            res.safeSend = (data, ...context) => {
                res.send(this.securizeData(data), ...context)
            }

            res.safeJson = (data, ...context) => {
                res.json(this.securizeData(data), ...context)
            }

            next()
        })

        this.server.use((req, res, next) => {
            req.server_instance = this.instance

            next()
        })

        this.instance.init()
    }

    securizeData(data) {
        if (typeof data === "object") {
            const values = Object.values(data)
            data = values[values.length - 2]

            invalidKeys.forEach((key) => {
                delete data[key]
            })
        }

        return data
    }

    getDBConnectionString() {
        const { db_user, db_driver, db_name, db_pwd, db_hostname, db_port } = _env
        return `${db_driver}://${db_user}:${db_pwd}@${db_hostname}:${db_port}/${db_name}`
    }

    connectToDB = () => {
        return new Promise((resolve, reject) => {
            try {
                console.log("🌐 Trying to connect to DB...")
                mongoose.connect(this.getDBConnectionString(), { useNewUrlParser: true })
                    .then((res) => { return resolve(true) })
                    .catch((err) => { return reject(err) })
            } catch (err) {
                return reject(err)
            }
        }).then(done => {
            console.log(`✅ Connected to DB`)
        }).catch((error) => {
            console.log(`❌ Failed to connect to DB, retrying...\n`)
            console.log(error)
            setTimeout(() => {
                this.connectToDB()
            }, 1000)
        })
    }

    initPassport() {
        passport.use(new LocalStrategy({
            usernameField: "username",
            passwordField: "password",
            session: false
        }, (username, password, done) => {
            User.findOne({ username: b64Decode(username) }).select('+password')
                .then((data) => {
                    if (data === null) {
                        return done(null, false, this.options.jwtStrategy)
                    } else if (!bcrypt.compareSync(b64Decode(password), data.password)) {
                        return done(null, false, this.options.jwtStrategy)
                    }

                    return done(null, data, this.options.jwtStrategy)
                })
                .catch(err => done(err, null, this.options.jwtStrategy))
        }))

        passport.use(new JwtStrategy(this.options.jwtStrategy, (token, done) => {
            User.findOne({ _id: token.id })
                .then(data => {
                    if (data === null) {
                        return done(null, false)
                    } else {
                        return done(null, data, token)
                    }
                })
                .catch(err => done(err, null))
        }))

        this.server.use(passport.initialize())
    }
}

new Server()