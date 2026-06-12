// Camada de serviço — comunicação com o backend via Axios
// Dependência: axios para requisições HTTP

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

// Instância Axios configurada com URL base, timeout e headers padrão
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export { api }

// ==== Books API ==== //
// Endpoints CRUD para livros com paginação baseada em cursor
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
// Endpoints para listar e buscar usuários do Notion
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
