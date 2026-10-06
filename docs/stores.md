# Stores (Pinia)

## bookStore

**Arquivo:** src/stores/bookStore.js

**Motivo:** Gerenciar o estado global dos livros (listas, paginação, filtros e operações CRUD) de forma centralizada e reativa.

**State:**
```js
book_lists: { main: [], tbr: [], reading: [], this_year: [] }
loading_states: { main: false, tbr: false, reading: false, this_year: false }
pagination: { page_size: 20, current_cursor: null, next_cursor: null, previous_cursors: [] }
search_term: ""
search_by: "title" // title | author | genre
filter_status: "all"
search_token: 0 // invalida respostas de buscas antigas
book_options: null
```

**Uso:**
```js
import { use_book_store } from "@/stores/bookStore"

const bookStore = use_book_store()

// Carregar livros
await bookStore.fetch_books()

// Paginação
await bookStore.next_page()
await bookStore.previous_page()
bookStore.has_previus_page // true/false

// Filtros
bookStore.search("harry")
bookStore.set_search_by("author") // refaz a busca no novo campo
bookStore.filter_by_status("Read")

// CRUD
await bookStore.create_book(formData)
await bookStore.update_book(id, data)
await bookStore.delete_book(id)

// Listas específicas
await bookStore.fetch_books_by_status(undefined, BOOK_STATUS_MAP.TO_BE_READ)
await bookStore.fetch_books_read_this_year()

// Reset
bookStore.$reset()
```

**Filtros e respostas obsoletas:** `search()`, `set_search_by()` e `filter_by_status()` invalidam
qualquer requisição em voo ao incrementar `search_token`; o fetch só aplica o resultado se o
token capturado no início ainda for o atual. Isso impede que uma resposta lenta de um termo
antigo sobrescreva a lista da busca atual.

## userStore

**Arquivo:** src/stores/userStore.js

**Motivo:** Gerenciar autenticação (login de usuários e sessão visitante), persistindo no localStorage.

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
