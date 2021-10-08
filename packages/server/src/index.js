import linebridge from 'linebridge/server'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import passport from 'passport'
import { User } from './models'
import uws from "uWebSockets.js"
import socketIo from 'socket.io'
import http from "http";

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

class WebSocket {
    constructor(params) {
        this.params = { ...params }

        this.listenPort = this.params.listenPort ?? 9001
        this.token = null

        this.endpoints = Object()
        this.server = uws.App()
    }

    register = (route, handlers = {}, options = {}) => {
        const fns = Object()

        const handlersKeys = {
            onOpen: "open",
            onMessage: "message",
            onClose: "close",
        }

        Object.keys(handlers).forEach(key => {
            const handler = handlers[key]

            if (typeof handler === "function") {
                fns[(handlersKeys[key] ?? key)] = (...context) => {
                    try {
                        handler(...context)
                    } catch (error) {
                        console.error(error)
                    }
                }
            }
        })

        this.server.ws(route, {
            idleTimeout: 10,
            maxBackpressure: 1024,
            maxPayloadLength: 512,
            ...options,
            ...fns
        })
    }

    _defaultListenCallback(token, port){
        if (token) {
            console.log('Listening to port ' + port);
        } else {
            console.log('Failed to listen to port ' + port);
        }
    }

    _listenCallback(token, port){
        if (typeof this.listenCallback !== "undefined") {
            this.listenCallback(token, port)
        }else {
            this._defaultListenCallback(token, port)
        }
    } 

    listen = (port = this.listenPort) => {
        return this.server.listen(port, (token) => {
            this.token = token
            return this._listenCallback(token, port)
        })
    }
}

class Server {
    constructor() {
        this.env = _env
        this.listenPort = this.env.listenPort ?? 3000

        this.middlewares = require("./middlewares")
        this.controllers = require("./controllers")
        this.endpoints = require("./endpoints")

        this.instance = new linebridge.HttpServer({
            listen: "0.0.0.0",
            middlewares: this.middlewares,
            controllers: this.controllers,
            endpoints: this.endpoints,
            port: this.listenPort
        })

        this.server = this.instance.httpServer
        this.ioHttp = http.createServer()
        this.io = new socketIo.Server(this.ioHttp, {
            maxHttpBufferSize: 100000000,
            connectTimeout: 5000,
            transports:['websocket','polling'],
            pingInterval: 25 * 1000,
            pingTimeout: 5000,
            allowEIO3: true,
            cors: {
                origin: "http://localhost:8000",
                methods: ["GET", "POST"],
            }
        }).of("/main")

        this.options = {
            jwtStrategy: {
                sessionLocationSign: this.instance.id,
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
            req.server_instance = this.instance

            next()
        })

        
        this.io.on("connection", (socket) => {
            console.log(socket.id)
        })

        this.ioHttp.listen(9001)

        this.instance.init()
    }

    getDBConnectionString() {
        const { db_user, db_driver, db_name, db_pwd, db_hostname, db_port } = _env
        return `${db_driver}://${db_user}:${db_pwd}@${db_hostname}:${db_port}/${db_name}`
    }

    connectToDB = () => {
        return new Promise((resolve, reject) => {
            try {
                console.log("🌐 Trying to connect to DB...")
                mongoose.connect(this.getDBConnectionString(), { useNewUrlParser: true, useFindAndModify: false })
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

    setWebsocketRooms = () => {
        this.ws.register("/test", {
            onOpen: (socket) => {
                console.log(socket)
                setInterval(() => {
                    socket.send("Hello")
                }, 1000)
            }
        })

        this.ws.listen()
    }

    initPassport() {
        passport.use(new LocalStrategy({
            usernameField: "username",
            passwordField: "password",
            session: false
        }, (username, password, done) => {
            User.findOne({ username: b64Decode(username) }).select('+password')
                .then(async (data) => {
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

        passport.use(new JwtStrategy(this.options.jwtStrategy, (token, done) => {
            User.findOne({ _id: token.user_id })
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