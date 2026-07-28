# Constantes

## book.js

**Arquivo:** src/constants/book.js

**Motivo:** Centralizar valores fixos e fallbacks usados em múltiplos lugares (store, formulário, listas), evitando strings mágicas.

**O que tem:**

```js
export const DEFAULT_PAGE_SIZE = 20 // tamanho padrão da paginação

export const BOOK_STATUS_MAP = {
  TO_BE_READ: "To be read",
  READING: "Reading",
  READ: "Read",
  DNF: "DNF",
} // mapeamento interno dos status

export const BOOK_STATUS_LABELS = {
  "To be read": "Para Ler",
  Reading: "Lendo",
  Read: "Completo",
  DNF: "Abandonado",
} // tradução pt-BR para exibição

export const BOOK_RATE_LABELS = {
  "❤": "❤️",
  "⭐⭐⭐⭐⭐": "*****",
  // ...
} // labels de avaliação

export const BOOK_TYPES_FALLBACK = ["🎧 Audiobook", "📱 Kindle", "📔 Mangá", "📘 Paper"]

export const BOOK_TYPE_LABELS = {
  "🎧 Audiobook": "Audiobook 🎧",
  // ...
}
```

**Exemplo:**
```js
import { BOOK_STATUS_MAP } from "@/constants/book"

if (book.status === BOOK_STATUS_MAP.READ) {
  // livro completo
}
```

## toast.js

**Arquivo:** src/constants/toast.js

**Motivo:** A config do vue-toastification estava duplicada em main.js e useNotifications.js. Centralizada aqui.

**O que tem:**
```js
export const TOAST_CONFIG = {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  progress: true,
  icon: true,
}
```

**Exemplo:**
```js
// main.js
app.use(Toast, TOAST_CONFIG)

// useNotifications.js
const toastOptions = { ...TOAST_CONFIG, ...options }
toast.success(message, toastOptions)
```
