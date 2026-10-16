// Pinia store de livros — gerencia listas, paginação, filtros e operações CRUD
import { defineStore } from 'pinia';
import { booksApi } from '../services/api';
import {
  BOOK_STATUS_FALLBACK,
  BOOK_STATUS_MAP,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SEARCH_MODE,
} from '../constants/book';
import { extractErrorMessage, logError } from '@/utils/errorHandler';

// Estado inicial — fonte única de state() e $reset() (evita os dois divergirem)
const createInitialState = () => ({
  bookLists: { main: [], tbr: [], reading: [], thisYear: [] },
  loadingStates: { main: false, tbr: false, reading: false, thisYear: false },
  error: null,
  // ===== PAGINAÇÃO (CURSOR-BASED) =====
  pagination: {
    pageSize: DEFAULT_PAGE_SIZE,
    currentCursor: null,
    nextCursor: null,
    previousCursors: [],
  },

  searchTerm: '',
  searchBy: DEFAULT_SEARCH_MODE,
  filterStatus: 'all',
  searchToken: 0,
  bookOptions: null,
});

export const useBookStore = defineStore('books', {
  state: () => createInitialState(),

  getters: {
    allBooks: (state) => state.bookLists.main,

    statusOptions: (state) => state.bookOptions?.Status || BOOK_STATUS_FALLBACK,

    bookCount: (state) => state.bookLists.main.length,

    tbrCount: (state) => state.bookLists.tbr.length,

    hasNextPage: (state) => state.pagination.nextCursor !== null,

    hasPreviousPage: (state) => state.pagination.previousCursors.length > 0,

    // Busca livro por ID em todas as listas
    getBookById: (state) => (bookId) => {
      return (
        state.bookLists.main.find((book) => book.id === bookId) ||
        state.bookLists.reading.find((book) => book.id === bookId) ||
        state.bookLists.tbr.find((book) => book.id === bookId)
      );
    },

    hasError: (state) => state.error !== null,

    thisYearCount: (state) => state.bookLists.thisYear.length,
  },

  actions: {
    // Registra o erro no console e expõe a mensagem para as views via `hasError`
    _handleError(action, error) {
      logError(action, error);
      this.error = extractErrorMessage(error);
    },

    // Esqueleto comum de fetch: loading → token anti-corrida → aplicação → erro → finally
    async _fetchPaged({ key, action, loader, apply, onError, useToken = true }) {
      this.loadingStates[key] = true;
      this.error = null;
      const token = this.searchToken;

      try {
        const response = await loader();
        if (useToken && token !== this.searchToken) return; // Busca mudou no meio: descarta resposta obsoleta
        apply(response);
      } catch (error) {
        this._handleError(action, error);
        if (onError) onError();
      } finally {
        // Só a requisição mais recente desliga o loading: uma resposta obsoleta
        // que retornasse agora apagaria o indicador enquanto a nova segue em voo
        if (!useToken || token === this.searchToken) this.loadingStates[key] = false;
      }
    },

    async fetchBookById(bookId) {
      try {
        const response = await booksApi.get(bookId);

        if (response?.data) {
          return response.data;
        }

        throw new Error('Livro não encontrado');
      } catch (error) {
        this._handleError('fetchBookById', error);
        throw error;
      }
    },

    // BUSCAR LIVROS (COM CURSOR PAGINATION)
    async fetchBooks(startCursor = undefined) {
      await this._fetchPaged({
        key: 'main',
        action: 'fetchBooks',
        loader: () =>
          booksApi.list({
            pageSize: this.pagination.pageSize,
            startCursor: startCursor,
            search: this.searchTerm,
            searchBy: this.searchBy,
            status: this.filterStatus,
          }),
        apply: (response) => {
          if (!response?.data) return;
          this.bookLists.main = response.data.data || [];

          // Atualiza informações de paginação
          this.pagination.currentCursor = startCursor || null;
          if (response.data.pagination) {
            this.pagination.nextCursor = response.data.pagination.hasMore
              ? response.data.pagination.nextCursor
              : null;
          }
        },
        onError: () => {
          this.bookLists.main = [];
        },
      });
    },

    async createBook(bookData) {
      try {
        const result = await booksApi.create(bookData);

        // Volta para primeira página após criar
        this.pagination.previousCursors = [];
        await this.fetchBooks();

        // Atualiza lista TBR se necessário
        if (bookData.status === BOOK_STATUS_MAP.TO_BE_READ) {
          await this.fetchBooksByStatus();
        }

        return result;
      } catch (error) {
        this._handleError('createBook', error);
        throw error;
      }
    },

    async reloadCurrentPage() {
      await Promise.allSettled([
        this.fetchBooks(this.pagination.currentCursor),
        this.fetchBooksByStatus(),
      ]);
    },

    async updateBook(bookId, bookData) {
      if (!bookId || !bookData) throw new Error('bookId e bookData são obrigatórios');

      this.error = null;

      try {
        await booksApi.update(bookId, bookData);
        await this.reloadCurrentPage();
        return { success: true };
      } catch (error) {
        this._handleError('updateBook', error);
        throw error;
      }
    },

    async deleteBook(bookId) {
      if (!bookId) throw new Error('bookId é obrigatório');

      this.error = null;

      try {
        await booksApi.delete(bookId);
        await this.reloadCurrentPage();
        return { success: true };
      } catch (error) {
        this._handleError('deleteBook', error);
        throw error;
      }
    },

    async fetchBooksByStatus(startCursor = undefined, status = BOOK_STATUS_MAP.TO_BE_READ) {
      // Cada status tem sua própria flag: TBR e leitura carregam em paralelo sem se sobrescrever
      const loadingKey = status === BOOK_STATUS_MAP.READING ? 'reading' : 'tbr';
      // Só TBR e leitura têm lista própria; outros status apenas giram o loading
      const listKey =
        status === BOOK_STATUS_MAP.READING || status === BOOK_STATUS_MAP.TO_BE_READ
          ? loadingKey
          : null;

      await this._fetchPaged({
        key: loadingKey,
        action: 'fetchBooksByStatus',
        loader: () =>
          booksApi.list({
            pageSize: 40,
            startCursor: startCursor,
            search: this.searchTerm,
            searchBy: this.searchBy,
            status: status,
          }),
        apply: (response) => {
          if (listKey) this.bookLists[listKey] = response.data.data || [];
        },
        onError: () => {
          if (listKey) this.bookLists[listKey] = [];
        },
      });
    },

    /**
     * Busca livros com data de término no ano atual
     */
    async fetchBooksReadThisYear() {
      await this._fetchPaged({
        key: 'thisYear',
        action: 'fetchBooksReadThisYear',
        // Esta busca não recebe o termo de busca: não precisa do token anti-corrida
        useToken: false,
        loader: () =>
          booksApi.finishedThisYear({
            year: new Date().getFullYear(),
            pageSize: 100,
          }),
        apply: (response) => {
          this.bookLists.thisYear = response.data.results || response.data.data || [];
        },
        onError: () => {
          this.bookLists.thisYear = [];
        },
      });
    },

    async fetchBookOptions() {
      try {
        const response = await booksApi.options();
        if (response?.data) {
          this.bookOptions = response.data;
        }
      } catch (error) {
        this._handleError('fetchBookOptions', error);
      }
    },

    async nextPage() {
      if (!this.pagination.nextCursor) {
        return;
      }

      this.pagination.previousCursors.push(this.pagination.nextCursor);

      await this.fetchBooks(this.pagination.nextCursor);
    },

    async previousPage() {
      if (this.pagination.previousCursors.length === 0) {
        return;
      }

      this.pagination.previousCursors.pop();

      // Usa o cursor anterior (ou undefined se for a primeira página)
      const previousCursor =
        this.pagination.previousCursors[this.pagination.previousCursors.length - 1];

      await this.fetchBooks(previousCursor);
    },

    async changePageSize(size) {
      this.pagination.pageSize = size;
      this.pagination.previousCursors = [];

      await this.fetchBooks();
    },

    // Recarrega a lista principal com os filtros atualizados (corpo comum de search/setSearchBy/filterByStatus)
    async _applyFilters(patches) {
      this.searchToken += 1; // Invalida respostas antigas
      Object.assign(this, patches);
      this.pagination.previousCursors = [];

      await this.fetchBooks();
    },

    async search(term) {
      await this._applyFilters({ searchTerm: term });
    },

    async setSearchBy(mode) {
      await this._applyFilters({ searchBy: mode });
    },

    async filterByStatus(status) {
      await this._applyFilters({ filterStatus: status });
    },

    $reset() {
      Object.assign(this, createInitialState());
    },

    clearError() {
      this.error = null;
    },
  },
});
