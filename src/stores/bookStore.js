import { defineStore } from 'pinia'
import { booksAPI } from '../services/api'
import { DEFAULT_PAGE_SIZE } from '../constants/book'


export const useBookStore = defineStore('books', {
state: () => ({
    bookLists: {
      main: [],
      tbr: [],
      reading: [],
      all: [],
    },

    loadingStates: {
      main: false,
      tbr: false,
      all: false,
    },

    error: null,

    // ===== PAGINAÇÃO (CURSOR-BASED) =====
    pagination: {
      pageSize: DEFAULT_PAGE_SIZE,
      currentCursor: null,
      nextCursor: null,
      previousCursors: [],
    },

    // ===== FILTROS E BUSCA =====
    searchTerm: '',
    filterStatus: 'all',

    // ===== OPÇÕES DINÂMICAS (DO NOTION) =====
    bookOptions: null,
  }),

  getters: {

    allBooks: (state) => state.bookLists.main,

    bookCount: (state) => state.bookLists.main.length,

    tbrCount: (state) => state.bookLists.tbr.length,

    hasNextPage: (state) => state.pagination.nextCursor !== null,

    hasPreviousPage: (state) => state.pagination.previousCursors.length > 0,

    // Busca livro por ID em todas as listas
    getBookById: (state) => (id) => {
      return (
        state.bookLists.main.find((book) => book.id === id) ||
        state.bookLists.reading.find((book) => book.id === id) ||
        state.bookLists.tbr.find((book) => book.id === id)
      )
    },

    hasError: (state) => state.error !== null,

    // Estatísticas básicas da página atual (usado na view principal)
    readingStats: (state) => {
      const total = state.bookLists.main
      const read = state.bookLists.main.filter((book) => book.status === 'Read')
      const toBeRead = state.bookLists.main.filter((book) => book.status === 'To be read')
      return { total, read, toBeRead }
    },

    // ========================================
    // GETTERS - ESTATÍSTICAS DE LEITURA (uso: StatsList)
    // ========================================

    _cachedStatsByYear: (state) => state.bookLists.all,

    statsByYear() {
      const readBooks = this._cachedStatsByYear.filter(
        (book) => book.status === 'Read' && book.wasReadIn?.length,
      )
      const yearMap = {}

      readBooks.forEach((book) => {
        book.wasReadIn.forEach((yearStr) => {
          const year = yearStr.trim().slice(-4)
          if (/^\d{4}$/.test(year)) {
            yearMap[year] = (yearMap[year] || 0) + 1
          }
        })
      })

      return Object.entries(yearMap)
        .map(([year, count]) => ({ year: parseInt(year), count }))
        .sort((a, b) => b.year - a.year)
    },

    _cachedAllBooks: (state) => state.bookLists.all,

    totalPagesRead() {
      const readBooks = this._cachedAllBooks.filter(
        (book) => book.status === 'Read' && book.totalPages,
      )
      return readBooks.reduce((total, book) => total + (book.totalPages || 0), 0)
    },

    _cachedForStatus: (state) => state.bookLists.all,

    statusPercentages() {
      const total = this._cachedForStatus.length
      if (total === 0) return { read: 0, toBeRead: 0, dnf: 0, reading: 0 }

      const count = (status) => this._cachedForStatus.filter((b) => b.status === status).length

      return {
        read: Math.round((count('Read') / total) * 100),
        toBeRead: Math.round((count('To be read') / total) * 100),
        dnf: Math.round((count('DNF') / total) * 100),
        reading: Math.round((count('Reading') / total) * 100),
      }
    },

    _cachedForRating: (state) => state.bookLists.all,

    ratingDistribution() {
      const readBooks = this._cachedForRating.filter(
        (book) => book.status === 'Read' && book.rate && book.rate !== '❤',
      )
      const distribution = {}

      readBooks.forEach((book) => {
        const rate = book.rate
        distribution[rate] = (distribution[rate] || 0) + 1
      })

      return distribution
    },

    _cachedForAuthors: (state) => state.bookLists.all,

    authorsMostRead() {
      const readBooks = this._cachedForAuthors.filter(
        (book) => book.status === 'Read' && book.author?.length,
      )
      const authorMap = {}

      readBooks.forEach((book) => {
        book.author.forEach((a) => {
          authorMap[a] = (authorMap[a] || 0) + 1
        })
      })

      return Object.entries(authorMap)
        .map(([author, count]) => ({ author, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    },

    _cachedForGenres: (state) => state.bookLists.all,

    genresDistribution() {
      const readBooks = this._cachedForGenres.filter(
        (book) => book.status === 'Read' && book.genres?.length,
      )
      const genreMap = {}

      readBooks.forEach((book) => {
        book.genres.forEach((g) => {
          genreMap[g] = (genreMap[g] || 0) + 1
        })
      })

      return Object.entries(genreMap)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    },

    _cachedForAvgPages: (state) => state.bookLists.all,

    averagePagesRead() {
      const readBooks = this._cachedForAvgPages.filter(
        (book) => book.status === 'Read' && book.totalPages,
      )
      if (readBooks.length === 0) return 0
      const total = readBooks.reduce((sum, book) => sum + (book.totalPages || 0), 0)
      return Math.round(total / readBooks.length)
    },

    /**
     * Média de avaliação em estrelas
     * Converte ⭐ para número (⭐⭐⭐ = 3)
     * Ignora livros com rating '❤' (favorito)
     * Retorna string com 1 casa decimal (ex: "4.2")
     */
    averageRating: (state) => {
      const readBooks = state.bookLists.all.filter(
        (book) => book.status === 'Read' && book.rate && book.rate !== '❤',
      )
      if (readBooks.length === 0) return 0

      const total = readBooks.reduce((sum, book) => {
        const stars = (book.rate || '').match(/⭐/g)
        return sum + (stars ? stars.length : 0)
      }, 0)

      return (total / readBooks.length).toFixed(1)
    },

    /**
     * Livros em leitura (currently reading)
     * Retorna todos os livros com status 'Reading' da lista completa
     * Inclui cover (URL da capa) para exibição em miniatura
     */
    currentlyReading: (state) => {
      return state.bookLists.all.filter((book) => book.status === 'Reading')
    },
  },

  actions: {
    async fetchBookById(bookId) {
      this.loadingStates.main = true
      this.error = null

      try {
        const response = await booksAPI.get(bookId)

        if (response?.data) {
          return response.data
        }

        throw new Error('Livro não encontrado')
      } catch (error) {
        this._handleError('fetchBookById', error)
        throw error
      } finally {
        this.loadingStates.main = false
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
      this.loadingStates.main = true
      this.error = null

      try {
        const result = await booksAPI.create(bookData)

        // Volta para primeira página após criar
        this.pagination.previousCursors = []
        await this.fetchBooks()

        // Atualiza lista TBR se necessário
        if (bookData.status === 'To be read') {
          await this.fetchTbrBooks()
        }

        return result
      } catch (error) {
        this._handleError('createBook', error)
        throw error
      } finally {
        this.loadingStates.main = false
      }
    },

    async reloadCurrentPage() {
      await Promise.allSettled([
        this.fetchBooks(this.pagination.currentCursor),
        this.fetchTbrBooks()
      ])
    },

    async updateBook(bookId, bookData) {
      if (!bookId || !bookData) {
        throw new Error('bookId e bookData são obrigatórios')
      }

      this.loadingStates.main = true
      this.error = null

      try {
        await booksAPI.update(bookId, bookData)
        await this.reloadCurrentPage()
        return { success: true }
      } catch (error) {
        this._handleError('updateBook', error)
        throw error
      } finally {
        this.loadingStates.main = false
      }
    },

    async deleteBook(bookId) {
      if (!bookId) {
        throw new Error('bookId é obrigatório')
      }

      this.loadingStates.main = true
      this.error = null

      try {
        await booksAPI.delete(bookId)
        await this.reloadCurrentPage()
        return { success: true }
      } catch (error) {
        this._handleError('deleteBook', error)
        throw error
      } finally {
        this.loadingStates.main = false
      }
    },

    async fetchTbrBooks(startCursor = undefined, status = 'To be read') {
      this.loadingStates.tbr = true
      this.error = null

      try {
        const response = await booksAPI.list({
          pageSize: this.pagination.pageSize,
          startCursor: startCursor,
          search: this.searchTerm,
          status: status,
        })

        switch (status) {
          case 'To be read':
            this.bookLists.tbr = response.data.data || []
            break
          case 'Reading':
            this.bookLists.reading = response.data.data || []
            break
          default:
            break
        }
      } catch (error) {
        this._handleError('fetchTbrBooks', error)
        // Limpa apenas a lista correspondente ao status que estava sendo buscando
        if (status === 'To be read') {
          this.bookLists.tbr = []
        } else if (status === 'Reading') {
          this.bookLists.reading = []
        }
      } finally {
        this.loadingStates.tbr = false
      }
    },

    async fetchAllBooks() {
      this.loadingStates.all = true
      this.error = null

      try {
        const response = await booksAPI.listAll()

        if (response?.data) {
          this.bookLists.all = response.data.data || response.data || []
        }
      } catch (error) {
        this._handleError('fetchAllBooks', error)
        this.bookLists.all = []
      } finally {
        this.loadingStates.all = false
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
      this.loadingStates.main = false
      this.loadingStates.tbr = false
      this.error = null
      this.pagination = {
        pageSize: DEFAULT_PAGE_SIZE,
        currentCursor: null,
        nextCursor: null,
        previousCursors: [],
      }
      this.searchTerm = ''
      this.filterStatus = 'all'
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
