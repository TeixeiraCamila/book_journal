// Comunicação com backend

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export { api }

// ==== Books API ==== //
export const booksAPI = {
  list(options = {}) {
    const { pageSize = 20, startCursor, search = '', status = 'all' } = options

    const params = {
      pageSize: pageSize.toString(),
      search: search,
      status: status,
    }

    if (startCursor) {
      params.startCursor = startCursor
    }

    return api.get('/api/books', { params })
  },

  listAll() {
    return api.get('/api/books/all', { timeout: 60000 })
  },

  get(id) {
    return api.get(`/api/books/${id}`)
  },

  create(data) {
    return api.post('/api/books', data)
  },

  update(id, data) {
    return api.patch(`/api/books/${id}`, data)
  },

  delete(id) {
    return api.delete(`/api/books/${id}`)
  },

  options() {
    return api.get('/api/books/options')
  },

  stats() {
    return api.get('/api/books/stats')
  },
}

// ==== Users API ==== //
export const userAPI = {
  list(options = {}) {
    const { startCursor, pageSize = 100 } = options

    const params = {}
    if (startCursor) {
      params.start_cursor = startCursor
    }
    params.page_size = pageSize

    return api.get('/api/users', { params })
  },

  listAll() {
    return api.get('/api/users/all')
  },

  getById(userId) {
    return api.get(`/api/users/${userId}`)
  },
}
