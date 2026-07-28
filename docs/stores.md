# Stores (Pinia)

## bookStore

**Arquivo:** src/stores/bookStore.js

**Motivo:** Gerenciar o estado global dos livros — listas, paginação, filtros e operações CRUD — de forma centralizada e reativa.

**State:**
```js
bookLists: { main: [], tbr: [], reading: [], thisYear: [] }
loadingStates: { main: false, tbr: false, reading: false, thisYear: false }
pagination: { pageSize: 20, currentCursor: null, nextCursor: null, previousCursors: [] }
searchTerm: ""
filterStatus: "all"
bookOptions: null
```

**Uso:**
```js
import { useBookStore } from "@/stores/bookStore"

const bookStore = useBookStore()

// Carregar livros
await bookStore.fetchBooks()

// Paginação
await bookStore.nextPage()
await bookStore.previousPage()
bookStore.hasPreviusPage // true/false

// Filtros
bookStore.search("harry")
bookStore.filterByStatus("Read")

// CRUD
await bookStore.createBook(formData)
await bookStore.updateBook(id, data)
await bookStore.deleteBook(id)

// Listas específicas
await bookStore.fetchBooksByStatus(undefined, BOOK_STATUS_MAP.TO_BE_READ)
await bookStore.fetchBooksReadThisYear()

// Reset
bookStore.$reset()
```

## userStore

**Arquivo:** src/stores/userStore.js

**Motivo:** Gerenciar autenticação — login de usuários e sessão visitante — persistindo no localStorage.

**State:**
```js
users: []
userActive: null
isGuest: false
```

**Uso:**
```js
import { useUserStore } from "@/stores/userStore"

const userStore = useUserStore()

// Login
await userStore.fetchAllUsers()
userStore.setActiveUser("user-id")

// Modo visitante
userStore.setGuestUser()
userStore.isGuest // true

// Logout
userStore.clearActiveUser()
```
