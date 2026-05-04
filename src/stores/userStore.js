import { defineStore } from 'pinia'
import { userAPI } from '@/services/api'

const GUEST_USER = {
  id: 'guest',
  name: 'Visitante',
  type: 'guest'
}

const STORAGE_KEYS = {
  USER: 'USER_LOGADO',
  IS_GUEST: 'IS_GUEST',
}

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    userActive: null,
    loading: false,
    error: null,
    isGuest: false,
  }),

  getters: {
    allUsers: (state) => state.users,

    getUserById: (state) => (userId) => {
      return state.users.find((user) => user.id === userId)
    },

    getUsersByType: (state) => (type) => {
      return state.users.filter((user) => user.type === type)
    },
  },

  actions: {
    async fetchUsers(startCursor = undefined, pageSize = 100) {
      this.loading = true
      this.error = null

      try {
        const response = await userAPI.list({ startCursor, pageSize })
        this.users = response.data.results

        return response.data
      } catch (error) {
        this._handleError('fetchUsers', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAllUsers() {
      this.loading = true
      this.error = null

      try {
        const response = await userAPI.listAll()
        this.users = response.data.results || response.data || []

        return this.users
      } catch (error) {
        this._handleError('fetchAllUsers', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUser(userId) {
      if (!userId) {
        throw new Error('User ID is required')
      }

      this.loading = true
      this.error = null

      try {
        const response = await userAPI.getById(userId)
        const data = response.data

        const index = this.users.findIndex((u) => u.id === userId)
        if (index !== -1) {
          this.users[index] = data
        } else {
          this.users.push(data)
        }

        this.userActive = data
        return data
      } catch (error) {
        this._handleError('fetchUser', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    _saveActiveUser(userId) {
      localStorage.setItem(STORAGE_KEYS.USER, userId)
    },

    async loadActiveUser() {
      const userId = localStorage.getItem(STORAGE_KEYS.USER)

      if (!userId) {
        return false
      }

      if (userId === 'guest') {
        this.setGuestUser()
        return true
      }

      const user = this.users.find((u) => u.id === userId)
      if (user) {
        this.userActive = user
        this.isGuest = false
        return true
      }

      try {
        await this.fetchUser(userId)
        this.isGuest = false
        return true
      } catch {
        return false
      }
    },

    setActiveUser(userId) {
      const user = this.users.find((u) => u.id === userId)
      if (user) {
        this.userActive = user
        this.isGuest = false
        this._saveActiveUser(userId)
      }
    },

    setGuestUser() {
      this.userActive = { ...GUEST_USER }
      this.isGuest = true
      this._saveActiveUser('guest')
      localStorage.setItem(STORAGE_KEYS.IS_GUEST, 'true')
    },

    checkIfGuest() {
      const isGuest = localStorage.getItem(STORAGE_KEYS.IS_GUEST) === 'true'
      const userId = localStorage.getItem(STORAGE_KEYS.USER)

      if (isGuest && userId === 'guest') {
        this.isGuest = true
        this.userActive = { ...GUEST_USER }
        return true
      }
      return false
    },

    clearActiveUser() {
      this.userActive = null
      this.isGuest = false
      localStorage.removeItem(STORAGE_KEYS.USER)
      localStorage.removeItem(STORAGE_KEYS.IS_GUEST)
    },

    _handleError(action, error) {
      console.error(`❌ Erro em ${action}:`, error)

      if (error.response) {
        this.error = error.response.data?.message || error.message
      } else if (error.request) {
        this.error = 'Erro de conexão. Verifique sua internet.'
      } else {
        this.error = error.message || 'Erro desconhecido'
      }
  },
  },
})
