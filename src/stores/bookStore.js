// Pinia store de livros — gerencia listas, paginação, filtros e operações CRUD
import { defineStore } from 'pinia';
import { books_api } from '../services/api';
import { BOOK_STATUS_FALLBACK, BOOK_STATUS_MAP, DEFAULT_PAGE_SIZE } from '../constants/book';
import { extract_error_message, log_error } from '@/utils/errorHandler';

export const use_book_store = defineStore('books', {
  state: () => ({
    book_lists: { main: [], tbr: [], reading: [], thisYear: [] },
    loading_states: { main: false, tbr: false, reading: false, thisYear: false },
    stats: null, // Estatísticas agregadas dos livros
    stats_loading: false,
    error: null,
    // ===== PAGINAÇÃO (CURSOR-BASED) =====
    pagination: {
      page_size: DEFAULT_PAGE_SIZE,
      current_cursor: null,
      next_cursor: null,
      previous_cursors: [],
    },

    search_term: '',
    filter_status: 'all',
    book_options: null,
  }),

  getters: {
    all_books: (state) => state.book_lists.main,

    status_options: (state) => state.book_options?.Status || BOOK_STATUS_FALLBACK,

    book_count: (state) => state.book_lists.main.length,

    tbr_count: (state) => state.book_lists.tbr.length,

    has_next_page: (state) => state.pagination.next_cursor !== null,

    has_previous_page: (state) => state.pagination.previous_cursors.length > 0,

    // Busca livro por ID em todas as listas
    get_book_by_id: (state) => (book_id) => {
      return (
        state.book_lists.main.find((book) => book.id === book_id) ||
        state.book_lists.reading.find((book) => book.id === book_id) ||
        state.book_lists.tbr.find((book) => book.id === book_id)
      );
    },

    has_error: (state) => state.error !== null,

    this_year_count: (state) => state.book_lists.thisYear.length,
  },

  actions: {
    // Registra o erro no console e expõe a mensagem para as views via `has_error`
    _handle_error(action, error) {
      log_error(action, error);
      this.error = extract_error_message(error);
    },

    async fetch_book_by_id(book_id) {
      try {
        const response = await books_api.get(book_id);

        if (response?.data) {
          return response.data;
        }

        throw new Error('Livro não encontrado');
      } catch (error) {
        this._handle_error('fetch_book_by_id', error);
        throw error;
      }
    },

    // BUSCAR LIVROS (COM CURSOR PAGINATION)
    async fetch_books(start_cursor = undefined) {
      this.loading_states.main = true;
      this.error = null;

      try {
        const response = await books_api.list({
          pageSize: this.pagination.page_size,
          startCursor: start_cursor,
          search: this.search_term,
          status: this.filter_status,
        });

        if (response?.data) {
          this.book_lists.main = response.data.data || [];

          // Atualiza informações de paginação
          this.pagination.current_cursor = start_cursor || null;
          if (response.data.pagination) {
            this.pagination.next_cursor = response.data.pagination.hasMore
              ? response.data.pagination.nextCursor
              : null;
          }
        }
      } catch (error) {
        this._handle_error('fetch_books', error);
        this.book_lists.main = [];
      } finally {
        this.loading_states.main = false;
      }
    },

    async create_book(book_data) {
      try {
        const result = await books_api.create(book_data);

        // Volta para primeira página após criar
        this.pagination.previous_cursors = [];
        await this.fetch_books();

        // Atualiza lista TBR se necessário
        if (book_data.status === BOOK_STATUS_MAP.TO_BE_READ) {
          await this.fetch_books_by_status();
        }

        return result;
      } catch (error) {
        this._handle_error('create_book', error);
        throw error;
      }
    },

    async reload_current_page() {
      await Promise.allSettled([
        this.fetch_books(this.pagination.current_cursor),
        this.fetch_books_by_status(),
      ]);
    },

    async update_book(book_id, book_data) {
      if (!book_id || !book_data) throw new Error('bookId e bookData são obrigatórios');

      this.error = null;

      try {
        await books_api.update(book_id, book_data);
        await this.reload_current_page();
        return { success: true };
      } catch (error) {
        this._handle_error('update_book', error);
        throw error;
      }
    },

    async delete_book(book_id) {
      if (!book_id) throw new Error('bookId é obrigatório');

      this.error = null;

      try {
        await books_api.delete(book_id);
        await this.reload_current_page();
        return { success: true };
      } catch (error) {
        this._handle_error('delete_book', error);
        throw error;
      }
    },

    async fetch_books_by_status(start_cursor = undefined, status = BOOK_STATUS_MAP.TO_BE_READ) {
      // Cada status tem sua própria flag: TBR e leitura carregam em paralelo sem se sobrescrever
      const loading_key = status === BOOK_STATUS_MAP.READING ? 'reading' : 'tbr';
      this.loading_states[loading_key] = true;
      this.error = null;

      try {
        const response = await books_api.list({
          pageSize: 40,
          startCursor: start_cursor,
          search: this.search_term,
          status: status,
        });

        switch (status) {
          case BOOK_STATUS_MAP.TO_BE_READ:
            this.book_lists.tbr = response.data.data || [];
            break;
          case BOOK_STATUS_MAP.READING:
            this.book_lists.reading = response.data.data || [];
            break;
          default:
            break;
        }
      } catch (error) {
        this._handle_error('fetch_books_by_status', error);
        if (status === BOOK_STATUS_MAP.TO_BE_READ) {
          this.book_lists.tbr = [];
        } else if (status === BOOK_STATUS_MAP.READING) {
          this.book_lists.reading = [];
        }
      } finally {
        this.loading_states[loading_key] = false;
      }
    },

    /**
     * Busca livros com data de término no ano atual
     */
    async fetch_books_read_this_year() {
      this.loading_states.thisYear = true;
      this.error = null;
      try {
        const year = new Date().getFullYear();
        const response = await books_api.finished_this_year({
          year,
          pageSize: 100,
        });
        this.book_lists.thisYear = response.data.results || response.data.data || [];
      } catch (error) {
        this._handle_error('fetch_books_read_this_year', error);
        this.book_lists.thisYear = [];
      } finally {
        this.loading_states.thisYear = false;
      }
    },

    async fetch_book_options() {
      try {
        const response = await books_api.options();
        if (response?.data) {
          this.book_options = response.data;
        }
      } catch (error) {
        this._handle_error('fetch_book_options', error);
      }
    },

    async next_page() {
      if (!this.pagination.next_cursor) {
        return;
      }

      this.pagination.previous_cursors.push(this.pagination.next_cursor);

      await this.fetch_books(this.pagination.next_cursor);
    },

    async previous_page() {
      if (this.pagination.previous_cursors.length === 0) {
        return;
      }

      this.pagination.previous_cursors.pop();

      // Usa o cursor anterior (ou undefined se for a primeira página)
      const previous_cursor =
        this.pagination.previous_cursors[this.pagination.previous_cursors.length - 1];

      await this.fetch_books(previous_cursor);
    },

    async change_page_size(size) {
      this.pagination.page_size = size;
      this.pagination.previous_cursors = [];

      await this.fetch_books();
    },

    async search(term) {
      this.search_term = term;
      this.pagination.previous_cursors = [];

      await this.fetch_books();
    },

    async filter_by_status(status) {
      this.filter_status = status;
      this.pagination.previous_cursors = [];

      await this.fetch_books();
    },

    $reset() {
      this.book_lists.main = [];
      this.book_lists.tbr = [];
      this.book_lists.reading = [];
      this.book_lists.thisYear = [];
      this.loading_states.main = false;
      this.loading_states.tbr = false;
      this.loading_states.reading = false;
      this.loading_states.thisYear = false;
      this.stats = null;
      this.stats_loading = false;
      this.error = null;
      this.pagination = {
        page_size: DEFAULT_PAGE_SIZE,
        current_cursor: null,
        next_cursor: null,
        previous_cursors: [],
      };
      this.search_term = '';
      this.filter_status = 'all';
      this.book_options = null;
    },

    clear_error() {
      this.error = null;
    },
  },
});
