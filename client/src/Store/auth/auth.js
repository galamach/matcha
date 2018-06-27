import {
  AUTH_CHECKAUTH_REQUEST,
  AUTH_CHECKAUTH_ERROR,
  AUTH_CHECKAUTH_SUCCESS,
  AUTH_LOGIN_REQUEST,
  AUTH_LOGIN_ERROR,
  AUTH_LOGIN_SUCCESS,
  AUTH_LOGOUT,
  AUTH_PROFILE_REQUEST,
  AUTH_PROFILE_ERROR,
  AUTH_PROFILE_SUCCESS,
  AUTH_CONFIRM_REQUEST,
  AUTH_CONFIRM_ERROR,
  AUTH_CONFIRM_SUCCESS,
  AUTH_ASK_REQUEST,
  AUTH_ASK_ERROR,
  AUTH_ASK_SUCCESS,
  AUTH_PASSWORD_RESET_REQUEST,
  AUTH_PASSWORD_RESET_ERROR,
  AUTH_PASSWORD_RESET_SUCCESS,
  AUTH_NOTIFICATION_DELETE,
  AUTH_VISITADD
} from './mutation-types'
import mockApi from '../../Api/mockApi'
import callApi from '../../Api/callApi'
import Vue from 'vue'

function removeLocalStorage() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
}

function removeSessionStorage() {
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('username')
}

function removeStorage() {
  removeLocalStorage()
  removeSessionStorage()
}

const state = {
  status: '',
  token: '',
  username: '',
  profile: {},
  hasLoadedOnce: sessionStorage.getItem('token') ? true : false,
}

const getters = {
  isAuthenticated: state => !!state.token,
  authStatus: state => state.status,
  getProfile: state => state.profile,
  isProfileLoaded: state => !!state.profile.username
}

const actions = {
  [AUTH_CHECKAUTH_REQUEST]: ({commit, dispatch}) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_CHECKAUTH_REQUEST)
      // si l'utilisateur a un token, on tente de récupérer son profil
      if (state.token) {
        callApi.defaults.headers.common['Authorization'] = state.token
        dispatch(AUTH_PROFILE_REQUEST)
        .then((resp) => {
          commit(AUTH_CHECKAUTH_SUCCESS)
          resolve()
        }, (error) => {
          commit(AUTH_CHECKAUTH_ERROR)
          reject()
        })
      }
      resolve()
    })
  },
  [AUTH_LOGIN_REQUEST]: ({commit, dispatch}, user) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_LOGIN_REQUEST)
      // enregistrement du remember_me en localStorage
      if (user.remember_me) {
        localStorage.setItem('remember_me', true)
      } else {
        localStorage.removeItem('remember_me')
        removeLocalStorage()
      }
      callApi({url: 'auth/login', data: user, method: 'POST'})
      .then((resp, err) => {
        if (!resp.data.success) {
          commit(AUTH_LOGIN_ERROR)
          // suppression des variables dans les storages
          removeStorage()
          reject(resp.data.message)
        } else {
          const data = resp.data
          // enregistrement des variables dans les storages
          sessionStorage.setItem('token', data.token)
          if (localStorage.getItem('remember_me')) {
            localStorage.setItem('token', data.token)
          }
          callApi.defaults.headers.common['Authorization'] = data.token
          commit(AUTH_LOGIN_SUCCESS, data.token)
          dispatch(AUTH_PROFILE_REQUEST)
          resolve(resp)
        }
      })
      .catch((err) => {
        commit(AUTH_LOGIN_ERROR)
        // suppression des variables dans les storages
        removeStorage()
        reject(err)
      })
    })
  },
  [AUTH_LOGOUT]: ({commit, dispatch}, username) => {
    return new Promise((resolve, reject) => {
      callApi({url: '/auth/logout', data: {username: username}, method: 'POST'})
      .then((resp) => {
        commit(AUTH_LOGOUT)
        // suppression des variables dans les storages
        removeStorage()
        resolve()
      }, (err) => {
        reject()
      })
    })
  },
  [AUTH_PROFILE_REQUEST]: ({commit, dispatch}) => {
    commit(AUTH_PROFILE_REQUEST)
    callApi({url: 'auth/profile'})
      .then(resp => {
        // enregistrement des variables dans les storages
        const username = resp.data.data.username
        sessionStorage.setItem('username', username)
        if (localStorage.getItem('remember_me')) {
          localStorage.setItem('username', username)
        }
        commit(AUTH_PROFILE_SUCCESS, resp.data.data)
      })
      .catch(err => {
        commit(AUTH_PROFILE_ERROR)
        // suppression des variables dans les storages
        removeStorage()
        dispatch(AUTH_LOGOUT)
      })
  },
  [AUTH_CONFIRM_REQUEST]: ({commit, dispatch}, data) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_CONFIRM_REQUEST)
      callApi({url: 'auth/confirm', data, method: 'POST'})
      .then((resp) => {
        if (resp.data.success === 0) {
          let message = ''
          switch(resp.message) {
            case 'BAD TOKEN':
              message = 'Votre token est invalide.'
            break;
            case 'BAD USERNAME':
              message = 'Votre token ne correspond pas à votre pseudo.'
            break;
            case 'USER NOT FOUND':
              message = 'Votre pseudo ne correspond à aucun utilisateur enregistré.'
            break;
            default :
              message = 'La confirmation de votre inscription a échoué.'
            break;
          }
          commit(AUTH_CONFIRM_ERROR)
          reject(message)
        } else {
          commit(AUTH_CONFIRM_SUCCESS)
          resolve(resp)
        }
      }, (error) => {
          commit(AUTH_CONFIRM_ERROR)
          reject(message)
      })
      .catch(err => {
        commit(AUTH_CONFIRM_ERROR)
        reject(err)
      })
    })
  },
  [AUTH_ASK_REQUEST]: ({commit, dispatch}, data) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_ASK_REQUEST)
      callApi({url: 'auth/ask', data, method: 'POST'})
      .then((resp) => {
        if (!resp.data.success) {
          commit(AUTH_ASK_ERROR)
          reject(resp.data.message)
        }
        commit(AUTH_ASK_SUCCESS)
        resolve(resp)
      }, (error) => {
        commit(AUTH_ASK_ERROR)
        reject(error)
      })
      .catch(err => {
        commit(AUTH_ASK_ERROR)
        reject(error)
      })
    })
  },
  [AUTH_PASSWORD_RESET_REQUEST]: ({commit, dispatch}, data) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_PASSWORD_RESET_REQUEST)
      callApi({url: 'auth/passwordreset', data, method: 'POST'})
      .then((resp) => {
        if (!resp.data.success) {
          commit(AUTH_PASSWORD_RESET_ERROR)
          reject(resp.data.message)
        }
        commit(AUTH_PASSWORD_RESET_SUCCESS)
        resolve(resp)
      }, (error) => {
        commit(AUTH_PASSWORD_RESET_ERROR)
        reject(error)
      })
      .catch(err => {
        commit(AUTH_PASSWORD_RESET_ERROR)
        reject(error)
      })
    })
  },
}

const mutations = {
  [AUTH_CHECKAUTH_REQUEST]: (state) => {
    state.status = 'loading'
    Vue.set(state, 'token', sessionStorage.getItem('token')
        ? sessionStorage.getItem('token')
        : (localStorage.getItem('token') ? localStorage.getItem('token') : ''))
    Vue.set(state, 'username', sessionStorage.getItem('username')
        ? sessionStorage.getItem('username')
        : (localStorage.getItem('username') ? localStorage.getItem('username') : ''))
  },
  [AUTH_CHECKAUTH_SUCCESS]: (state) => {
    state.status = 'success'
    //Vue.set(state, 'token', token)
    state.hasLoadedOnce = true
  },
  [AUTH_CHECKAUTH_ERROR]: (state) => {
    state.status = 'error'
    state.hasLoadedOnce = true
  },
  [AUTH_LOGIN_REQUEST]: (state) => {
    state.status = 'loading'
  },
  [AUTH_LOGIN_SUCCESS]: (state, token) => {
    state.status = 'success'
    Vue.set(state, 'token', token)
    state.hasLoadedOnce = true
  },
  [AUTH_LOGIN_ERROR]: (state) => {
    state.status = 'error'
    state.hasLoadedOnce = true
  },
  [AUTH_LOGOUT]: (state) => {
    state.token = ''
  },
  [AUTH_PROFILE_REQUEST]: (state) => {
    state.status = 'loading'
  },
  [AUTH_PROFILE_SUCCESS]: (state, data) => {
    state.status = 'success'
    Vue.set(state, 'profile', data)
  },
  [AUTH_PROFILE_ERROR]: (state) => {
    state.status = 'error'
    state.profile = {}
  },
  [AUTH_CONFIRM_REQUEST]: (state) => {
    state.status = 'loading'
  },
  [AUTH_CONFIRM_SUCCESS]: (state) => {
    state.status = 'success'
  },
  [AUTH_CONFIRM_ERROR]: (state) => {
    state.status = 'error'
  },
  [AUTH_ASK_REQUEST]: (state) => {
    state.status = 'loading'
  },
  [AUTH_ASK_SUCCESS]: (state) => {
    state.status = 'success'
  },
  [AUTH_ASK_ERROR]: (state) => {
    state.status = 'error'
  },
  [AUTH_PASSWORD_RESET_REQUEST]: (state) => {
    state.status = 'loading'
  },
  [AUTH_PASSWORD_RESET_SUCCESS]: (state) => {
    state.status = 'success'
  },
  [AUTH_PASSWORD_RESET_ERROR]: (state) => {
    state.status = 'error'
  },
  [AUTH_NOTIFICATION_DELETE]: (state, id) => {
    state.profile.notifications.splice(state.profile.notifications.findIndex(n => n._id === id), 1)
  },
  [AUTH_VISITADD]: (state) => {
    state.profile.visited++
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
