import store from 'store'
import { history } from 'umi'
import jwt from 'jsonwebtoken'
import { EventEmitter } from 'events'

import { objectToArrayMap, verbosity } from '@corenode/utils'

import config from 'config'
import { queryIndexer, setLocale } from 'core'
import builtInEvents from 'core/events'
import { settings } from 'core/libs'

import SettingsController from 'core/models/settings'
import SidebarController from 'core/models/sidebar'

export default {
  namespace: 'app',
  state: {
    loadDone: false,

    language: config.i18n.defaultLanguage,
    style_prefix: config.app.defaultStyleClass ?? "app_",
    env_proccess: process.env,
    dispatcher: null,

    session_valid: false,
    session_token: null,
    session: {},

    account_data: [],

    enabledSidebarItems: [],
    notifications: [],
    activeTheme: "light"
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'updateState', payload: { dispatcher: dispatch } })
      dispatch({ type: 'earlyInit' })
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
    *earlyInit({ payload }, { call, put, select }) {
      const state = yield select(state => state.app)

      global.settingsController = new SettingsController()
      global.sidebarController = new SidebarController()
      global.applicationEvents = new EventEmitter()

      objectToArrayMap(builtInEvents).forEach((event) => {
        global.applicationEvents.on(event.key, event.value)
      })

      window.controllers = {}
      window.changeLocale = setLocale
      window.dispatcher = state.dispatcher

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
    },
    *isStateKey({ payload, callback }, { select }) {
      const state = yield select(state => state.app)
      const result = state[payload.key] === payload.value ? true : false
      if (typeof callback === "function") {
        callback(result)
      }
    },
    *query({ payload }, { call, put, select }) {
      const state = yield select(state => state.app)

      if (state.session) {
        let updated = {}

        const tryDefault = (key) => {
          if (typeof (config.defaults[key]) !== "undefined") {
            return config.defaults[key]
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

      queryIndexer(config.indexer ?? [], (callback) => {
        window.location = callback
      })

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

      try {
        const sidebarCustom = settings.getValue("sidebarItems")

        if (sidebarCustom) {
          state.dispatcher({
            type: "updateState",
            payload: { sidebar: JSON.parse(sidebarCustom) }
          })
        }
      } catch (error) {
        verbosity.error(`Failed to proccess sidebar items >`, error.message)
      }

      state.dispatcher({
        type: "updateState",
        payload: { loadDone: true }
      })

    },
    *login({ payload, callback }, { call, put, select }) {
      const state = yield select(state => state.app)
      state.dispatcher({
        type: "api/request",
        payload: {
          endpoint: "login",
          body: payload
        },
        callback: (error, response, status) => {
          if (error) {
            return callback(true, response)
          }

          store.set(config.app.storage.signkey, response.originKey)
          store.set(config.app.storage.session_frame, response.token)
          location.reload()

          return callback(false, status)
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
        callback: (error, response, status) => {
          if (typeof (callback) !== "undefined") {
            if (error) {
              return callback(true)
            }
            return callback(false, response)
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
                verbosity.log([`Invalid token > `, err])
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
            verbosity.log(`signed key is not an certifed signkey`)
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