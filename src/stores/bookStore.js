// Pinia store de livros — gerencia listas, paginação, filtros e operações CRUD
import { defineStore } from 'pinia';
import { booksAPI } from '../services/api';
import { BOOK_STATUS_FALLBACK, BOOK_STATUS_MAP, DEFAULT_PAGE_SIZE } from '../constants/book';
import { extractErrorMessage } from '@/utils/errorHandler';

const { _handleError } = extractErrorMessage();

export const useBookStore = defineStore('books', {
  state: () => ({
    bookLists: { main: [], tbr: [], reading: [], thisYear: [] },
    loadingStates: { main: false, tbr: false, reading: false, thisYear: false },
    stats: null, // Estatísticas agregadas dos livros
    statsLoading: false,
    error: null,
    // ===== PAGINAÇÃO (CURSOR-BASED) =====
    pagination: {
      pageSize: DEFAULT_PAGE_SIZE,
      currentCursor: null,
      nextCursor: null,
      previousCursors: [],
    },

    searchTerm: '',
    filterStatus: 'all',
    bookOptions: null,
  }),

  getters: {
    allBooks: (state) => state.bookLists.main,

    statusOptions: (state) => state.bookOptions?.Status || BOOK_STATUS_FALLBACK,

    bookCount: (state) => state.bookLists.main.length,

    tbrCount: (state) => state.bookLists.tbr.length,

    hasNextPage: (state) => state.pagination.nextCursor !== null,

    hasPreviusPage: (state) => state.pagination.previousCursors.length > 0,

    // Busca livro por ID em todas as listas
    getBookById: (state) => (id) => {
      return (
        state.bookLists.main.find((book) => book.id === id) ||
        state.bookLists.reading.find((book) => book.id === id) ||
        state.bookLists.tbr.find((book) => book.id === id)
      );
    },

    hasError: (state) => state.error !== null,

    thisYearCount: (state) => state.bookLists.thisYear.length,
  },

  actions: {
    async fetchBookById(bookId) {
      try {
        const response = await booksAPI.get(bookId);

        if (response?.data) {
          return response.data;
        }

        throw new Error('Livro não encontrado');
      } catch (error) {
        _handleError('fetchBookById', error);
        throw error;
      }
    },

    // BUSCAR LIVROS (COM CURSOR PAGINATION)
    async fetchBooks(startCursor = undefined) {
      this.loadingStates.main = true;
      this.error = null;

      try {
        const response = await booksAPI.list({
          pageSize: this.pagination.pageSize,
          startCursor: startCursor,
          search: this.searchTerm,
          status: this.filterStatus,
        });

        if (response?.data) {
          this.bookLists.main = response.data.data || [];

          // Atualiza informações de paginação
          this.pagination.currentCursor = startCursor || null;
          if (response.data.pagination) {
            this.pagination.nextCursor = response.data.pagination.hasMore
              ? response.data.pagination.nextCursor
              : null;
          }
        }
      } catch (error) {
        _handleError('fetchBooks', error);
        this.bookLists.main = [];
      } finally {
        this.loadingStates.main = false;
      }
    },

    async createBook(bookData) {
      try {
        const result = await booksAPI.create(bookData);

        // Volta para primeira página após criar
        this.pagination.previousCursors = [];
        await this.fetchBooks();

        // Atualiza lista TBR se necessário
        if (bookData.status === BOOK_STATUS_MAP.TO_BE_READ) {
          await this.fetchBooksByStatus();
        }

        return result;
      } catch (error) {
        _handleError('createBook', error);
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
        await booksAPI.update(bookId, bookData);
        await this.reloadCurrentPage();
        return { success: true };
      } catch (error) {
        _handleError('updateBook', error);
        throw error;
      }
    },

    async deleteBook(bookId) {
      if (!bookId) throw new Error('bookId é obrigatório');

      this.error = null;

      try {
        await booksAPI.delete(bookId);
        await this.reloadCurrentPage();
        return { success: true };
      } catch (error) {
        _handleError('deleteBook', error);
        throw error;
      }
    },

    async fetchBooksByStatus(startCursor = undefined, status = BOOK_STATUS_MAP.TO_BE_READ) {
      this.loadingStates.tbr = status === BOOK_STATUS_MAP.TO_BE_READ;
      this.loadingStates.reading = status === BOOK_STATUS_MAP.READING;
      this.error = null;

      try {
        const response = await booksAPI.list({
          pageSize: 40,
          startCursor: startCursor,
          search: this.searchTerm,
          status: status,
        });

        switch (status) {
          case BOOK_STATUS_MAP.TO_BE_READ:
            this.bookLists.tbr = response.data.data || [];
            break;
          case BOOK_STATUS_MAP.READING:
            this.bookLists.reading = response.data.data || [];
            break;
          default:
            break;
        }
      } catch (error) {
        _handleError('fetchBooksByStatus', error);
        if (status === BOOK_STATUS_MAP.TO_BE_READ) {
          this.bookLists.tbr = [];
        } else if (status === BOOK_STATUS_MAP.READING) {
          this.bookLists.reading = [];
        }
      } finally {
        this.loadingStates.tbr = false;
        this.loadingStates.reading = false;
      }
    },

    /**
     * Busca livros com status "Read" e wasReadIn igual ao ano atual
     */
    async fetchBooksReadThisYear() {
      this.loadingStates.thisYear = true;
      this.error = null;
      try {
        const year = String(new Date().getFullYear());
        const response = await booksAPI.list({
          pageSize: 100,
          search: this.searchTerm,
          status: BOOK_STATUS_MAP.READ,
          wasReadIn: year,
        });
        this.bookLists.thisYear = response.data.data || [];
      } catch (error) {
        _handleError('fetchBooksReadThisYear', error);
        this.bookLists.thisYear = [];
      } finally {
        this.loadingStates.thisYear = false;
      }
    },

    async fetchBookOptions() {
      try {
        const response = await booksAPI.options();
        if (response?.data) {
          this.bookOptions = response.data;
        }
      } catch (error) {
        _handleError('fetchBookOptions', error);
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

    async search(term) {
      this.searchTerm = term;
      this.pagination.previousCursors = [];

      await this.fetchBooks();
    },

    async filterByStatus(status) {
      this.filterStatus = status;
      this.pagination.previousCursors = [];

      await this.fetchBooks();
    },

    $reset() {
      this.bookLists.main = [];
      this.bookLists.tbr = [];
      this.bookLists.reading = [];
      this.bookLists.thisYear = [];
      this.loadingStates.main = false;
      this.loadingStates.tbr = false;
      this.loadingStates.reading = false;
      this.loadingStates.thisYear = false;
      this.stats = null;
      this.statsLoading = false;
      this.error = null;
      this.pagination = {
        pageSize: DEFAULT_PAGE_SIZE,
        currentCursor: null,
        nextCursor: null,
        previousCursors: [],
      };
      this.searchTerm = '';
      this.filterStatus = 'all';
      this.bookOptions = null;
    },

    clearError() {
      this.error = null;
    },
  },
});
