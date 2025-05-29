import { createStore } from 'vuex'
const userFromStorage = localStorage.getItem('user')
const user = (userFromStorage && userFromStorage !== 'undefined') ? JSON.parse(userFromStorage) : null

export default createStore({
  state: {
    user: user,
    token: localStorage.getItem('token') || ''
  },
  mutations: {
    setUser(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    setToken(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    clearAuth(state) {
      state.user = null
      state.token = ''
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user ? state.user.role : null
  }
})