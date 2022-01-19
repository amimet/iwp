import LinebridgeServer from 'linebridge/server'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import passport from 'passport'
import { User, Session } from './models'
import socketIo from 'socket.io'
import jwt from 'jsonwebtoken'

const b64Decode = global.b64Decode = (data) => {
    return Buffer.from(data, 'base64').toString('utf-8')
}

const b64Encode = global.b64Encode = (data) => {
    return Buffer.from(data, 'utf-8').toString('base64')
}

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const LocalStrategy = require('passport-local').Strategy
const { Buffer } = require("buffer")

function parseConnectionString(obj) {
    const { db_user, db_driver, db_name, db_pwd, db_hostname, db_port } = obj
    return `${db_driver}://${db_user}:${db_pwd}@${db_hostname}:${db_port}/${db_name}`
}

class Server {
    constructor() {
        this.env = _env
        this.listenPort = this.env.listenPort ?? 3000

        this.middlewares = require("./middlewares")
        this.controllers = require("./controllers")
        this.endpoints = require("./endpoints")

        this.instance = new LinebridgeServer({
            listen: "0.0.0.0",
            middlewares: this.middlewares,
            controllers: this.controllers,
            endpoints: this.endpoints,
            port: this.listenPort
        })

        this.server = this.instance.httpServer
        this.io = new socketIo.Server(3001,)

        this.options = {
            jwtStrategy: {
                sessionLocationSign: this.instance.id,
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: this.instance.oskid,
                algorithms: ['sha1', 'RS256', 'HS256'],
                expiresIn: "1h"
            }
        }

        this.WSClients = []

        this.initialize()
    }

    async initialize() {
        await this.connectToDB()
        await this.initPassport()
        await this.initWebsockets()

        await this.instance.init()
    }

    connectToDB = () => {
        return new Promise((resolve, reject) => {
            try {
                console.log("🌐 Trying to connect to DB...")
                mongoose.connect(parseConnectionString(this.env), { useNewUrlParser: true, useFindAndModify: false })
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
        this.instance.middlewares["useJwtStrategy"] = (req, res, next) => {
            req.jwtStrategy = this.options.jwtStrategy
            next()
        }

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

                    // create a token
                    return done(null, data, this.options.jwtStrategy, { username, password })
                })
                .catch(err => done(err, null, this.options.jwtStrategy))
        }))

        passport.use(new JwtStrategy(this.options.jwtStrategy, (token, callback) => {
            if (!token) {
                return callback("Invalid or missing token")
            }

            User.findOne({ _id: token.user_id })
                .then((data) => {
                    if (data === null) {
                        return callback(null, false)
                    } else {
                        return callback(null, data, token)
                    }
                })
                .catch((err) => {
                    return callback(err.message, null)
                })
        }))

        this.server.use(passport.initialize())
    }

    initWebsockets() {
        this.instance.middlewares["useWS"] = (req, res, next) => {
            req.ws = {
                io: this.io,
                clients: this.WSClients,
                getClientSocket: (userId) => {
                    return this.WSClients.find(c => c.userId === userId).socket
                },
                broadcast: async (channel, ...args) => {
                    for await (const client of this.WSClients) {
                        client.socket.emit(channel, ...args)
                    }
                },
            }

            next()
        }

        this.io.on("connection", async (socket) => {
            console.log(`[${socket.id}] connected`)

            const onAuthenticated = (user_id) => {
                this.attachClientSocket(socket, user_id)
                socket.emit("authenticated")
            }

            const onAuthenticatedFailed = (error) => {
                this.detachClientSocket(socket)
                socket.emit("authenticateFailed", {
                    error,
                })
            }

            socket.on("authenticate", async (token) => {
                const session = await Session.findOne({ token }).catch(err => {
                    return false
                })

                if (!session) {
                    return onAuthenticatedFailed("Session not found")
                }

                this.verifyJwt(token, (err, decoded) => {
                    if (err) {
                        return onAuthenticatedFailed(err)
                    } else {
                        return onAuthenticated(decoded.user_id)
                    }
                })
            })

            socket.on("disconnect", () => {
                console.log(`[${socket.id}] disconnected`)
                this.detachClientSocket(socket)
            })
        })
    }

    attachClientSocket = async (client, userId) => {
        const socket = this.WSClients.find(c => c.id === client.id)

        if (socket) {
            socket.socket.disconnect()
        }

        this.WSClients.push({
            id: client.id,
            socket: client,
            userId,
        })
    }

    detachClientSocket = async (client) => {
        const socket = this.WSClients.find(c => c.id === client.id)

        if (socket) {
            socket.socket.disconnect()
            this.WSClients = this.WSClients.filter(c => c.id !== client.id)

        }
    }

    verifyJwt = (token, callback) => {
        jwt.verify(token, this.options.jwtStrategy.secretOrKey, async (err, decoded) => {
            if (err) {
                return callback(err)
            }

            return callback(null, decoded)
        })
    }
}

new Server()