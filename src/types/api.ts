// Tipos dos envelopes HTTP consumidos do notion_api (espelhados de docs/API.md)

import type { Book, BookOptions, BookSearchMode } from './book';

// Paginação por cursor de GET /books
export interface Pagination {
  pageSize: number;
  hasMore: boolean;
  nextCursor: string | null;
}

// Envelope padrão das listagens com paginação
export interface Envelope<T> {
  data: T;
  pagination: Pagination;
}

// Formato de erro do backend (lib/errors.js); details só aparece em validação Zod (400)
export interface ApiError {
  code: string;
  message: string;
  error?: string;
  details?: { path: string; message: string }[];
}

// Query de GET /books (a de finished-this-year é menor: year, pageSize, startCursor)
export interface ListQuery {
  pageSize?: number;
  startCursor?: string;
  search?: string;
  searchBy?: BookSearchMode;
  status?: string;
  wasReadIn?: string;
  genres?: string | string[];
}

// Shapes por endpoint — documentados no API.md para a camada de serviço
export interface ListAllResponse {
  data: Book[];
  total: number;
}

// Único endpoint em snake_case (diferente do list camelCase)
export interface FinishedThisYearResponse {
  results: Book[];
  has_more: boolean;
  next_cursor: string | null;
  total_count: number;
  year: number;
}

export type { BookOptions };
