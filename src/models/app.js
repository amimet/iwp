import store from 'store'
import { verbosity } from 'core/libs'
import { history } from 'umi'
import { objectToArrayMap } from '@nodecorejs/utils'
import { queryIndexer, config, setLocale } from 'core'
import jwt from 'jsonwebtoken'
import { defaults } from 'config'
import * as ui from 'core/libs/ui'

import * as path from 'node_modules/pn/path'
import * as fs from 'node_modules/pn/fs'

export default {
  namespace: 'app',
  state: {
    language: config.i18n.defaultLanguage,
    style_prefix: config.app.defaultStyleClass ?? "app_",
    queryDone: false,
    env_proccess: process.env,
    dispatcher: null,

    session_valid: false,
    session_token: null,
    session: {},

    account_data: [],

    notifications: [],
    activeTheme: "light"
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'updateState', payload: { dispatcher: dispatch } })
      dispatch({ type: 'initFrames' })
      dispatch({ type: 'query' })
    },
    setupHistory({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'updateState',
          payload: {
            locationPathname: location.pathname,
            locationQuery: location.query,
          },
        })
      })
    },
    setupRequestCancel({ history }) {
      history.listen(() => {
        const { cancelRequest = new Map() } = window
        cancelRequest.forEach((value, key) => {
          if (value.pathname !== window.location.pathname) {
            cancelRequest.delete(key);
          }
        })
      })
    },
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      const state = yield select(state => state.app)

      window.changeLocale = setLocale
      window.dispatcher = state.dispatcher
      window.Externals = []

      if (state.session) {
        let updated = {}

        const tryDefault = (key) => {
          if (typeof (defaults[key]) !== "undefined") {
            return defaults[key]
          }
          return null
        }
        const fromSessionFrame = ["username", "sub", "iat", "fullName", "avatar", "email"]

        fromSessionFrame.forEach((e) => {
          try {
            if (state.session[e] != null) { // if false try to catch from defaults in config
              return updated[e] = state.session[e]
            }
            return updated[e] = tryDefault(e)
          } catch (error) {
            return console.log(error)
          }
        })

        state.dispatcher({ type: "updateState", payload: { account_data: updated } })
      }

      queryIndexer([
        {
          match: '/s;:id',
          to: `/settings?key=:id`,
        },
        {
          match: '/@:id',
          to: `/@/:id`,
        }
      ], (callback) => {
        window.location = callback
      })

      window.classToStyle = (key) => {
        if (typeof (key) !== "string") {
          try {
            const toString = JSON.stringify(key)
            if (toString) {
              return toString
            } else {
              return null
            }
          } catch (error) {
            return null
          }
        }
        if (typeof (state.style_prefix) !== "undefined") {
          return `${state.style_prefix}${key}`
        }
        return key
      }

      window.requiresState = (conditions) => {
        let requirePass = false
        if (typeof (conditions) !== "undefined") {
          objectToArrayMap(conditions).forEach((condition) => {
            if (typeof (state[condition.key]) !== "undefined") {
              if (state[condition.key] == condition.value) {
                requirePass = true
              } else {
                requirePass = false
              }
            } else {
              requirePass = false
            }
          })
        }
        return requirePass
      }

      window.Externals.path = path
      window.Externals.fs = fs

      if (!state.session_valid) {
        history.push(`/login`)
      }

      const shouldRedirectFromLogin = () => {
        const force = JSON.parse(new URLSearchParams(window.location.search).get('force')) ?? false
        return (window.location.pathname == "/login" || window.location.pathname == "/") && !force
      }

      if (shouldRedirectFromLogin() && state.session_valid) {
        history.push(config.app.mainPath)
      }

    },
    *login({ payload, callback }, { call, put, select }) {
      const state = yield select(state => state.app)
      state.dispatcher({
        type: "api/request",
        payload: {
          endpoint: "login",
          body: payload
        },
        callback: (error, response) => {
          if (response.code == 100) {
            store.set(config.app.storage.signkey, response.data.originKey)
            store.set(config.app.storage.session_frame, response.data.token)
            location.reload()
            if (typeof (callback) !== "undefined") {
              if (error) {
                return callback(true, response)
              }
              return callback(false, null)
            }
          } else {
            if (typeof (callback) !== "undefined") {
              return callback(true, response)
            }
          }
        }
      })
    },
    *isAuth({ payload, callback }, { call, put, select }) {
      const state = yield select(state => state.app)
      state.dispatcher({
        type: "api/request",
        payload: {
          endpoint: "isAuth"
        },
        callback: (error, response) => {
          if (typeof (callback) !== "undefined") {
            if (error) {
              return callback(false)
            }
            callback(response)
          }
          if (response.code == 200 && response.data) {
            ui.Notify.success("You are authed")
          } else {
            ui.Notify.warn("Its seems like you are not authed")
          }
        }
      })
    },
    *initFrames({ payload }, { select }) {
      const state = yield select(state => state.app)

      const signkey = store.get(config.app.storage.signkey)
      const session = store.get(config.app.storage.session_frame)
      if (session) {
        try {
          if (config.app.certified_signkeys.includes(signkey)) {
            jwt.verify(session, signkey, (err, decoded) => {
              if (err) {
                verbosity([`Invalid token > `, err])
                state.dispatcher({ type: "logout" })
              }
              if (decoded) {
                state.dispatcher({
                  type: "updateState", payload: {
                    session_token: session,
                    session: decoded,
                    session_valid: true
                  }
                })
              }
            })
          } else {
            verbosity(`signed key is not an certifed signkey`)
          }
        } catch (error) {
          console.log(error)
        }
      }
    },
    *logout({ payload }, { select }) {
      const state = yield select(state => state.app)
      state.dispatcher({
        type: "api/request",
        payload: {
          endpoint: "logout"
        },
        callback: (error, response) => {
          if (error) {
            return console.error(`Falied to logout > ${response}`)
          }
          return console.log(response)
        }
      })
      state.dispatcher({ type: "destroySession" })
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    destroySession(state) {
      state.session = false
      state.session_valid = false
      store.remove(config.app.storage.session_frame)
      store.remove(config.app.storage.signkey)
    }
  }
}