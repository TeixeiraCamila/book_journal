# Architecture

## 1. Visão Geral do Sistema

SPA Vue 3 100% client-side. Não possui backend próprio: consome o `notion_api` (repositório irmão, Express 5), que lê e escreve num database do Notion. O Notion é o CMS/ferramenta de dados; a API é a camada de tradução HTTP ↔ Notion.

---

## 2. Padrão de Arquitetura

Padrão:

SPA em camadas com stores como fachada de estado: `View → Store (Pinia) → services/api.js (Axios) → notion_api → Notion`.

Motivo:

Separa a lógica de UI do transporte HTTP; stores centralizam estado compartilhado entre slides/listas e evitam refetch duplicado.

---

## 3. Stack Tecnológica

Frontend:

Vue 3 (Composition API + `<script setup>`), Vue Router 4, Pinia 3, Vite 7

HTTP:

Axios (instância única em `services/api.js`, timeout 10s; `/all` com 60s; `/auth/me` com 5s)

Animações:

GSAP, VueUse Motion, Swiper (EffectCards)

UI:

lucide-vue-next (ícones), vue-toastification (toasts)

Backend (repositório `notion_api`):

Express 5 (ESM), Zod, @notionhq/client, node-cache

Banco de dados:

Notion API (database "Books" + usuários "person")

Hospedagem:

Vercel (front + API)

Pagamentos/Email/Analytics:

não se aplicam

---

## 4. Componentes do Sistema

### Frontend (este repo)

Responsabilidades:

- Renderizar UI e capturar intenção do usuário
- Validar formulários antes do envio (feedback imediato)
- Orquestrar chamadas via stores (paginasção, filtros, listas)
- Traduzir valores do backend para pt-BR (labels)

### Backend (`notion_api`)

Responsabilidades:

- Validar payloads (Zod) e autenticar (JWT HS256)
- Mapear propriedades do Notion para o objeto `book` e vice-versa
- Paginar com cursor do Notion, cachear `options` (300 s) e `stats` (300 s — só consumido pelo `dashboard__journal`)

### Notion

Responsabilidades:

- Fonte de verdade dos dados (schema + conteúdo)
- Soft delete (`archived: true`) no DELETE

---

## 5. Diagrama de Arquitetura

```text
Usuário
   ↓
Vue (views/components, CSS escopado BEM)
   ↓
Pinia stores (bookStore, userStore)
   ↓
services/api.js (Axios + interceptors)
   ↓  (proxy /api → localhost:3000 em dev; VITE_API_URL em prod)
notion_api (Express 5, Zod, require_auth nas escritas)
   ↓
Notion API (database Books / persons)
```

---

## 6. Fluxo de Dados

Exemplo — criar livro:

1. Usuário preenche `BookForm` e submete
2. Validação de campo roda no cliente (`fieldErrors`)
3. `bookStore.createBook()` chama `POST /api/books`
4. Axios anexa `Authorization: Bearer <token>` (interceptor)
5. Backend valida com Zod + JWT e escreve no Notion
6. Store refaz `fetchBooks()` + `fetchBooksByStatus()` se for TBR
7. Toast de sucesso e navegação para `/?slide=1`

Exemplo — busca:

1. Input dispara após debounce de 400 ms
2. `searchToken` é incrementado (invalida respostas em voo)
3. `GET /api/books?search=&searchBy=&status=`
4. Resposta só é aplicada se o token ainda casar

---

## 7. Estrutura do Projeto

```text
src/
├── App.vue
├── main.js                  # createApp + Pinia + Router + Toast
├── assets/css/              # vars.css (tokens), style.css, toast-override.css
├── components/
│   ├── books/               # BookCard (front/back/status), BookList
│   ├── features/            # Stack (CardIntro), ReadingList, TBRList, ThisYearList
│   ├── forms/               # BookForm, FormField, FormSection, FormActions
│   ├── ui/                  # Button, LoadingSpinner, StateHandler, Skeleton/
│   ├── navigation/          # Filters, Pagination
│   ├── feedback/            # ConfirmDialog
│   └── index.js             # barrel exports
├── composables/             # useAnimatedModal, useNotifications, useBookFormatters
├── constants/               # book.js (opções fallback), toast.js
├── router/index.js          # rotas lazy + guard de auth
├── services/api.js          # instância Axios + booksApi/authApi
├── stores/                  # bookStore.js, userStore.js
├── utils/                   # validation.js, errorHandler.js
└── views/                   # LoginView, CardStackView, CreateBookView (+ HomeView legado)
```

---

## 8. Regras de Dependência

- Views nunca chamam Axios direto — sempre via stores
- Componentes de UI não conhecem a API — recebem props/emit
- Só `services/api.js` fala com HTTP; só stores importam `services/api`
- `constants/` é fallback, nunca fonte primária quando o backend responde
- Identificadores próprios em camelCase; chaves de dados/API em camelCase (contrato do backend); constantes em SCREAMING_SNAKE_CASE

---

## 9. Decisões Técnicas Principais

Registradas em `DECISIONS.md` (001–007). Resumo:

- Paginação por cursor (Notion) em vez de páginas numéricas
- Token JWT em `localStorage` (com trade-off documentado; cookie HTTP-only no roadmap)
- Modo visitante simulado no cliente (backend não o conhece)
- Constantes locais como fallback do catálogo do Notion
- Prefetch de chunks em produção + slides dinâmicos

---

## 10. Considerações de Performance

- Lazy loading de rotas e `defineAsyncComponent` nas listas (chunk por slide)
- Prefetch dos próximos chunks após 1,5 s e ao trocar de slide (só `PROD`)
- Debounce de 400 ms na busca + descarte de respostas obsoletas
- `node-cache` no backend para `options`/`stats` (300 s; `stats` fora do escopo deste app — Decisão 009)
- `/api/books/all` com timeout estendido (60 s)

Risco conhecido:

Sem virtual scrolling — `BookList` degrada com bibliotecas muito grandes (`ROADMAP.md`).

---

## 11. Considerações de Escalabilidade

App single-user; escalabilidade de dados é do Notion (limite de ~100 itens/página da API). A paginação por cursor já absorve acervos grandes no lado da listagem.

---

## 12. Cenários de Falha

| Falha | Comportamento esperado |
|---|---|
| Backend indisponível | `extractErrorMessage` → "Erro de conexão. Verifique sua internet." + estado de erro com retry |
| Timeout (10 s) | Tratado como erro de conexão |
| Token expirado (401) | Interceptor limpa sessão e manda para `/login` |
| Notion fora do ar (5xx) | Mensagem "Erro no servidor" + retry; `options` caem em fallback local |
| Busca durante requisição em voo | Resposta obsoleta descartada (`searchToken`) |
| `/auth/me` falha por rede no boot | Sessão mantida (só 401 derruba) |
