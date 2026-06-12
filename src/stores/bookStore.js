import { defineStore } from 'pinia'
import { booksAPI } from '../services/api'
import { BOOK_STATUS_FALLBACK, BOOK_STATUS_MAP, DEFAULT_PAGE_SIZE } from '../constants/book'

export const useBookStore = defineStore('books', {
  state: () => ({
    bookLists: { main: [], tbr: [], reading: [] },
    loadingStates: { main: false, tbr: false },
    stats: null,
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

    // Busca livro por ID em todas as listas
    getBookById: (state) => (id) => {
      return (
        state.bookLists.main.find((book) => book.id === id) ||
        state.bookLists.reading.find((book) => book.id === id) ||
        state.bookLists.tbr.find((book) => book.id === id)
      )
    },

    hasError: (state) => state.error !== null,
  },

  actions: {
    async fetchBookById(bookId) {
      try {
        const response = await booksAPI.get(bookId)

        if (response?.data) {
          return response.data
        }

        throw new Error('Livro não encontrado')
      } catch (error) {
        this._handleError('fetchBookById', error)
        throw error
      }
    },

    // BUSCAR LIVROS (COM CURSOR PAGINATION)
    async fetchBooks(startCursor = undefined) {
      this.loadingStates.main = true
      this.error = null

      try {
        const response = await booksAPI.list({
          pageSize: this.pagination.pageSize,
          startCursor: startCursor,
          search: this.searchTerm,
          status: this.filterStatus,
        })

        if (response?.data) {
          this.bookLists.main = response.data.data || []

          // Atualiza informações de paginação
          this.pagination.currentCursor = startCursor || null
          if (response.data.pagination) {
            this.pagination.nextCursor = response.data.pagination.hasMore
              ? response.data.pagination.nextCursor
              : null
          }
        }
      } catch (error) {
        this._handleError('fetchBooks', error)
        this.bookLists.main = []
      } finally {
        this.loadingStates.main = false
      }
    },


    async createBook(bookData) {
      try {
        const result = await booksAPI.create(bookData)

        // Volta para primeira página após criar
        this.pagination.previousCursors = []
        await this.fetchBooks()

        // Atualiza lista TBR se necessário
        if (bookData.status === BOOK_STATUS_MAP.TO_BE_READ) {
          await this.fetchBooksByStatus()
        }

        return result
      } catch (error) {
        this._handleError('createBook', error)
        throw error
      }
    },

    async reloadCurrentPage() {
      await Promise.allSettled([
        this.fetchBooks(this.pagination.currentCursor),
        this.fetchBooksByStatus(),
      ])
    },

    async updateBook(bookId, bookData) {
      if (!bookId || !bookData) throw new Error('bookId e bookData são obrigatórios')

      this.error = null

      try {
        await booksAPI.update(bookId, bookData)
        await this.reloadCurrentPage()
        return { success: true }
      } catch (error) {
        this._handleError('updateBook', error)
        throw error
      }
    },

    async deleteBook(bookId) {
      if (!bookId) throw new Error('bookId é obrigatório')

      this.error = null

      try {
        await booksAPI.delete(bookId)
        await this.reloadCurrentPage()
        return { success: true }
      } catch (error) {
        this._handleError('deleteBook', error)
        throw error
      }
    },

    async fetchBooksByStatus(startCursor = undefined, status = BOOK_STATUS_MAP.TO_BE_READ) {
      this.loadingStates.tbr = true
      this.error = null

      try {
        const response = await booksAPI.list({
          pageSize: 40, // Busca mais itens para preencher melhor as listas de status
          startCursor: startCursor,
          search: this.searchTerm,
          status: status,
        })

        switch (status) {
          case BOOK_STATUS_MAP.TO_BE_READ:
            this.bookLists.tbr = response.data.data || []
            break
          case BOOK_STATUS_MAP.READING:
            this.bookLists.reading = response.data.data || []
            break
          default:
            break
        }
      } catch (error) {
        this._handleError('fetchBooksByStatus', error)
        // Limpa apenas a lista correspondente ao status que estava sendo buscando
        if (status === BOOK_STATUS_MAP.TO_BE_READ) {
          this.bookLists.tbr = []
        } else if (status === BOOK_STATUS_MAP.READING) {
          this.bookLists.reading = []
        }
      } finally {
        this.loadingStates.tbr = false
      }
    },

    async fetchBookOptions() {
      try {
        const response = await booksAPI.options()
        if (response?.data) {
          this.bookOptions = response.data
        }
      } catch (error) {
        this._handleError('fetchBookOptions', error)
      }
    },

    async nextPage() {
      if (!this.pagination.nextCursor) {
        return
      }

      this.pagination.previousCursors.push(this.pagination.nextCursor)

      await this.fetchBooks(this.pagination.nextCursor)
    },

    async previousPage() {
      if (this.pagination.previousCursors.length === 0) {
        return
      }

      this.pagination.previousCursors.pop()

      // Usa o cursor anterior (ou undefined se for a primeira página)
      const previousCursor =
        this.pagination.previousCursors[this.pagination.previousCursors.length - 1]

      await this.fetchBooks(previousCursor)
    },

    async changePageSize(size) {
      this.pagination.pageSize = size
      this.pagination.previousCursors = []

      await this.fetchBooks()
    },

    async search(term) {
      this.searchTerm = term
      this.pagination.previousCursors = []

      await this.fetchBooks()
    },

    async clearSearch() {
      this.searchTerm = ''
      this.pagination.previousCursors = []

      await this.fetchBooks()
    },

    async filterByStatus(status) {
      this.filterStatus = status
      this.pagination.previousCursors = []

      await this.fetchBooks()
    },

    $reset() {
      this.bookLists.main = []
      this.bookLists.tbr = []
      this.bookLists.reading = []
      this.loadingStates.main = false
      this.loadingStates.tbr = false
      this.stats = null
      this.statsLoading = false
      this.error = null
      this.pagination = {
        pageSize: DEFAULT_PAGE_SIZE,
        currentCursor: null,
        nextCursor: null,
        previousCursors: [],
      }
      this.searchTerm = ''
      this.filterStatus = 'all'
      this.bookOptions = null
    },

    clearError() {
      this.error = null
    },

    // ========================================
    // TRATAMENTO DE ERROS (PRIVADO)
    // ========================================
    _handleError(action, error) {
      console.error(`❌ Erro em ${action}:`, error)

      // Extrai mensagem de erro apropriada
      if (error.response) {
        // Erro da API
        const status = error.response.status
        const message = error.response.data?.message || error.message

        switch (status) {
          case 400:
            this.error = 'Dados inválidos. Verifique as informações enviadas.'
            break
          case 401:
            this.error = 'Não autorizado. Verifique suas credenciais.'
            break
          case 404:
            this.error = 'Recurso não encontrado.'
            break
          case 500:
            this.error = 'Erro no servidor. Tente novamente mais tarde.'
            break
          default:
            this.error = message || 'Erro ao processar requisição'
        }
      } else if (error.request) {
        // Erro de rede
        this.error = 'Erro de conexão. Verifique sua internet.'
      } else {
        // Outro erro
        this.error = error.message || 'Erro desconhecido'
      }
    },
  },
})
