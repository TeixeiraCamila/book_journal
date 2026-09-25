// Camada de serviço — comunicação com o backend via Axios
// Dependência: axios para requisições HTTP

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

// Instância Axios configurada com URL base, timeout e headers padrão
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Anexa o token de sessão em toda requisição que possuir um
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('SESSION_TOKEN');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sessão expirada/inválida (401 fora do login): limpa e retorna ao login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const is_auth_call = url.startsWith('/api/auth/');
    const is_on_login_page = typeof window !== 'undefined' && window.location.pathname === '/login';

    if (status === 401 && !is_auth_call && !is_on_login_page) {
      localStorage.removeItem('SESSION_TOKEN');
      localStorage.removeItem('SESSION_USER');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export { api };

// ==== Books API ==== //
// Endpoints CRUD para livros com paginação baseada em cursor
export const books_api = {
  list(options = {}) {
    const { pageSize = 20, startCursor, search = '', status = 'all', wasReadIn } = options;

    const params = {
      pageSize: pageSize.toString(),
      search: search,
      status: status,
    };

    if (startCursor) {
      params.startCursor = startCursor;
    }
    if (wasReadIn) {
      params.wasReadIn = wasReadIn;
    }

    return api.get('/api/books', { params });
  },

  list_all() {
    return api.get('/api/books/all', { timeout: 60000 });
  },

  get(id) {
    return api.get(`/api/books/${id}`);
  },

  create(data) {
    return api.post('/api/books', data);
  },

  update(id, data) {
    return api.patch(`/api/books/${id}`, data);
  },

  delete(id) {
    return api.delete(`/api/books/${id}`);
  },

  options() {
    return api.get('/api/books/options');
  },

  stats() {
    return api.get('/api/books/stats');
  },
};

// ==== Auth API ==== //
// Endpoints de autenticação — login com código de acesso e revalidação de sessão
export const auth_api = {
  login(data) {
    return api.post('/api/auth/login', data);
  },

  me() {
    return api.get('/api/auth/me');
  },
};
