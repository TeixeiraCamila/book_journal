# Análise de Melhorias — book_journal

## 🔴 Bugs Críticos

| Arquivo | Linha | Problema | Status |
|---------|-------|----------|--------|
| `ConfirmDialog.vue` | 28 | `await emit('confirm')` não espera nada — notificação dispara antes do delete | ✅ |
| `bookStore.js` | 275 | `$reset()` referencia `wasReadIn`/`wasRead` (inexistente), deveria ser `thisYear` | ✅ |
| `BookList.vue` | 84 | Passa `hasPreviousPage` como prop, mas o getter não existe no store | ✅ |
| `router/index.js` | 52-53 | Falta `return` no navigation guard — execução continua e chama `next()` múltiplas vezes | ✅ |
| `Header.vue` | 51 | `:to="to="{ name: 'home' }""` — sintaxe Vue malformada (aspas aninhadas) | ✅ (arquivo deletado) |
| `CardFront.vue` | 20 | `:alt="book.cover[0]"` — alt text é a URL da imagem | ✅ |

---

## 🟡 Duplicações

| Código duplicado | Ocorre em | Status |
|-----------------|-----------|--------|
| `getAuthorString`, `getPagesString`, `getPublicationString` | `CardBack.vue` + `ReadingList.vue` | ✅ |
| Loading/Error/Empty states (mesmo template) | `BookList`, `ReadingList`, `TBRList`, `ThisYearList` | ❌ |
| Toast config (timeout, position, etc.) | `main.js` + `useNotifications.js` | ✅ |
| `_handleError` (lógica similar) | `bookStore.js` + `userStore.js` | ✅ |
| Form reset `Object.keys(formData).forEach(...)` | `BookForm.vue` linhas 316 e 339 | ✅ |
| `closeModal` e `closeModalWithAnimation` | `useAnimatedModal.js` — funções idênticas | ❌ |

---

## 🟢 Oportunidades de Componentização

1. **`StateHandler`** — componente genérico para loading/error/empty (criado, falta aplicar nos componentes)
2. **`BookCover`** — exibição de capa com fallback placeholder (repetido em 5+ componentes)
3. **`useBookFormatters`** — composable com `getAuthorString`, `getPagesString`, etc. (✅ criado e aplicado)
4. **`EmptyState`** — estado vazio padronizado com ícone e texto
5. **`usePagination`** — extrair cursor-based pagination do `bookStore.js`

---

## 🔵 Refatorações

| Arquivo | Ação | Status |
|---------|------|--------|
| `BookForm.vue` (726 linhas) | Extrair validação, transformação de dados e auto-cálculo Kindle para composables | ❌ |
| `bookStore.js` (336 linhas) | Extrair pagination para composable, error handling para utilitário | ✅ (errorHandler.js) |
| `CardStackView.vue` (197 linhas) | Extrair lógica de prefetch e data loading para composable | ❌ |
| `FormField.vue` (544 linhas) | Consertar dual v-model emission; considerar subcomponentes por tipo | ❌ |
| `FormSkeleton.vue` | Converter para `<script setup>` (atualmente sem setup) | ❌ |
| `ConfirmDialog.vue` | Usar callback prop para confirm em vez de `await emit()` | ✅ |
| `HomeView.vue` | Remover (legacy, importa componente inexistente) | ❌ |

---

## 🟣 Código Morto

- **Barrel exports fantasmas** em `components/index.js`: `Input`, `Modal`, `Card`, `Badge`, `BookDetails`, `ReadingProgress`, `Layout`, `Container`, `SearchBar`, `Notification`, `ToastContainer` — **nenhum desses arquivos existe**
- `Notification.vue` e `ToastContainer.vue` — substituídos por `vue-toastification`
- `HomeView.vue` — view legacy não usada
- `Star` importado mas não usado em `CardStatus.vue`
- Dependências não usadas: `chart.js`, `@vueuse/motion`, `@biomejs/biome`

---

## ⚡ Upgrades Sugeridos

| Tipo | Sugestão |
|------|----------|
| Testes | Adicionar `vitest` + `@vue/test-utils` + `happy-dom` |
| Arquitetura | Criar `src/utils/errorHandler.js` compartilhado entre stores |
| Performance | Virtual scrolling para BookList se a biblioteca crescer |
| UX | Lazy loading com blur-up placeholder nas capas |
| Config | Remover `tsconfig.json` se não for migrar pra TS (ou migrar de vez) |
| Conformidade | Alinhar `.prettierrc.json` com AGENTS.md (semicolons = true, ou atualizar AGENTS.md) |

---

## 📐 Desvios do AGENTS.md

- `.prettierrc.json` define `"semi": false` — AGENTS.md exige ponto e vírgula ✅emi": false` — AGENTS.md exige ponto e vírgula
- `ThisYearList.vue` usa seletores ID (`#right-image`) em vez de BEM ✅
- `CardIntro.vue` encadeia elementos BEM (`card-intro__content__image`) — fora do padrão ✅
- `FormSkeleton.vue` usa `<script>` sem `setup` ✅
