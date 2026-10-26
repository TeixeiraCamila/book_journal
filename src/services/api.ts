// Camada de serviço: existe para ser o ÚNICO ponto que fala HTTP com o
// notion_api — concentra URL base, token de sessão (interceptors) e o shape
// de cada endpoint, para que stores e views nunca montem Axios por conta própria.

import axios from 'axios';
import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import type { LoginResponse } from '@/types/auth';
import type { Book, BookOptions, CreateBookInput, UpdateBookInput } from '@/types/book';
import type {
  DeleteResponse,
  Envelope,
  FinishedThisYearResponse,
  ListAllResponse,
  ListQuery,
  MeResponse,
} from '@/types/api';

// Env do Vite é string no runtime; o tipo explícito evita `any` propagando daí
const BASE_URL: string = import.meta.env.VITE_API_URL || '';

// Corpo de POST /api/auth/login (o backend valida email + código com Zod)
export interface LoginBody {
  email: string;
  codigo: string;
}

// Instância Axios configurada com URL base, timeout e headers padrão
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Anexa o token de sessão em toda requisição que possuir um
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('SESSION_TOKEN');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sessão expirada/inválida (401 fora do login): limpa e retorna ao login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthCall = url.startsWith('/api/auth/');
    const isOnLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

    if (status === 401 && !isAuthCall && !isOnLoginPage) {
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
export const booksApi = {
  // GET /:id devolve o book no topo (sem envelope); list/all usam envelope
  list(options: ListQuery = {}): Promise<AxiosResponse<Envelope<Book[]>>> {
    const {
      pageSize = 20,
      startCursor,
      search = '',
      searchBy = 'title',
      status = 'all',
      wasReadIn,
    } = options;

    const params: Record<string, string> = {
      pageSize: pageSize.toString(),
      search,
      searchBy,
      status,
    };

    if (startCursor) {
      params.startCursor = startCursor;
    }
    if (wasReadIn) {
      params.wasReadIn = wasReadIn;
    }

    return api.get('/api/books', { params });
  },

  listAll(): Promise<AxiosResponse<ListAllResponse>> {
    return api.get('/api/books/all', { timeout: 60000 });
  },

  // O book chega no topo da resposta, não dentro de `data` de envelope
  get(id: string): Promise<AxiosResponse<Book>> {
    return api.get(`/api/books/${id}`);
  },

  create(data: CreateBookInput): Promise<AxiosResponse<Book>> {
    return api.post('/api/books', data);
  },

  update(id: string, data: UpdateBookInput): Promise<AxiosResponse<Book>> {
    return api.patch(`/api/books/${id}`, data);
  },

  delete(id: string): Promise<AxiosResponse<DeleteResponse>> {
    return api.delete(`/api/books/${id}`);
  },

  options(): Promise<AxiosResponse<BookOptions>> {
    return api.get('/api/books/options');
  },

  finishedThisYear(
    options: {
      year?: number;
      pageSize?: number;
      startCursor?: string;
    } = {},
  ): Promise<AxiosResponse<FinishedThisYearResponse>> {
    const { year, pageSize, startCursor } = options;
    // year/pageSize entram como number (axios serializa; o list é só string)
    const params: Record<string, string | number> = {};

    if (year !== undefined && year !== null) {
      params.year = year;
    }
    if (pageSize !== undefined && pageSize !== null) {
      params.pageSize = pageSize;
    }
    if (startCursor) {
      params.startCursor = startCursor;
    }

    return api.get('/api/books/finished-this-year', { params });
  },
};

// ==== Auth API ==== //
// Endpoints de autenticação — login com código de acesso e revalidação de sessão
export const authApi = {
  login(data: LoginBody): Promise<AxiosResponse<LoginResponse>> {
    return api.post('/api/auth/login', data);
  },

  me(config: AxiosRequestConfig = {}): Promise<AxiosResponse<MeResponse>> {
    return api.get('/api/auth/me', config);
  },
};
