# Análise de Melhorias: book_journal

## 🔴 Bugs Críticos

| Arquivo | Linha | Problema | Status |
|---------|-------|----------|--------|
| `ConfirmDialog.vue` | `await emit('confirm')` não espera nada: notificação dispara antes do delete | ✅ (virou prop `onConfirm`; em 15/10/2026 passou a emitir `confirm` após sucesso, para o `BookCard` fechar o modal — antes o `@confirm` do card era listener morto e o `handleDelete` chamava `deleteBook` 2×) |
| `bookStore.js` | 275 | `$reset()` referencia `wasReadIn`/`wasRead` (inexistente), deveria ser `thisYear` | ✅ |
| `BookList.vue` | 84 | Passa `hasPreviousPage` como prop, mas o getter não existe no store | ✅ |
| `router/index.js` | 52-53 | Falta `return` no navigation guard: execução continua e chama `next()` múltiplas vezes | ✅ |
| `Header.vue` | 51 | `:to="to="{ name: 'home' }""`: sintaxe Vue malformada (aspas aninhadas) | ✅ (arquivo deletado) |
| `CardFront.vue` | 20 | `:alt="book.cover[0]"`: alt text é a URL da imagem | ✅ |

---

## 🟡 Duplicações

Retrato revisado em 15/10/2026 (varredura dos 42 arquivos de `src/`, 6,5 mil linhas). Plano de ataque em 5 fases: `docs/PLANO_DEDUPLICACAO.md` — fases 1–5 executadas em 15–16/10/2026.

| Código duplicado | Ocorre em | Status |
|-----------------|-----------|--------|
| Estados loading/erro/vazio (mesmo template + CSS) | `BookList`, `ReadingList`, `TBRList`, `ThisYearList` + erro do `CreateBookView` | ✅ unificados no `StateHandler` (15/10/2026) |
| `navigateToEdit` (`router.push('/editar/:id')`) | `BookList`, `ReadingList`, `TBRList`, `ThisYearList` | ✅ extraído para `useBookNavigation` (15/10/2026) |
| Toast config (timeout, position, etc.) | `main.js` + `useNotifications.js` (ambos usam `constants/toast.js`) | ✅ |
| `_handleError` (lógica similar) | `bookStore.js` + `userStore.js` (delegam a `utils/errorHandler`) | ✅ |
| Form reset `Object.keys(formData).forEach(...)` | `BookForm.vue` (hoje só existe `resetFormData`) | ✅ |
| `closeModal` e `closeModalWithAnimation` (corpo idêntico) | `useAnimatedModal.js`; usos no `BookCard.vue` | ✅ unificado em `closeModal` (15/10/2026, Fase 1 do plano) |
| Formatters de autor/páginas/tipo usados pela metade | `useBookFormatters` × cópias manuais: `CardBack` (autor, páginas), `TBRList` (autor), `ReadingList.calculateProgress`, watch de % do `BookForm` | ✅ Fase 2 (16/10/2026): `CardBack`/`TBRList` usam `getAuthorString` (agora com prefixo do `literaryAtlas`), páginas/progresso via `getPagesProgress`+`getPagesString`, tipo via `getTypeString`, `ReadingList` e o watch do Kindle via composable |
| Validação inline × utilitário | `BookForm.handleSubmit` × `utils/validation.js` (`validateRequired`/`validatePositiveNumber`/`validateYear` sem uso) | ✅ Fase 2 (16/10/2026): `handleSubmit` delega às funções puras + `validatePositiveInteger`/`validateDateRange` novos |
| `FormSkeleton` espelha o layout do form à mão | `FormSkeleton.vue` × `BookForm.vue` (5 seções + campos hardcoded) | ✅ Fase 4 (16/10/2026): `constants/formLayout.js` virou fonte única (seções, campos, ações); skeleton renderiza dele e o form importa os títulos (Decisão 010) |
| Capa ou placeholder | `CardFront` (placehold.co) × `ReadingList`/`TBRList`/`ThisYearList` (📖) | ✅ Fase 3 (16/10/2026): componente `BookCover` com fallback local (SVG data-URI) em CardFront, ReadingList, TBRList, ThisYearList e preview do `BookForm` |
| Overlay de modal (fixed + backdrop + flex center) | `BookCard.vue` × `ConfirmDialog.vue` | ✅ Fase 3 (16/10/2026): base `.modal-overlay` global em `assets/css/style.css`; `z-index` 100/2000 e blur continuam por componente |
| Posicionamento do texto da fita de status | `CardStatus.vue` × `ThisYearList.vue` | ✅ Fase 3 (16/10/2026): virou modifier `card-status--tight` no `CardStatus` |
| Esqueleto de fetch (loading/token/try-catch-finally) | `bookStore.js`: `fetchBooks`, `fetchBooksByStatus`, `fetchBooksReadThisYear` | ✅ Fase 5 (16/10/2026): `_fetchPaged` unifica os 3 fetches (token anti-corrida generalizado via flag `useToken`) |
| `search`/`setSearchBy`/`filterByStatus` idênticos + `$reset` × `state()` | `bookStore.js` | ✅ Fase 5 (16/10/2026): `_applyFilters()` comum e `$reset()` reaproveita `createInitialState()` |
| Sequência de fetch e blocos `defineAsyncComponent` ×4 | `CardStackView.vue` | ✅ Fase 5 (16/10/2026): registry `listComponents` + `loadLists()` único nos pontos de chamada (chunks separados mantidos no build) |
| Handlers vazios/idênticos (`handleSubmit`; `handleCancel` = `handleEditSuccess`) | `CreateBookView.vue` | ✅ viraram um único `goHome` e o `emit('submit')` morto saiu do `BookForm` (15/10/2026, Fase 1 do plano) |

---

## 🟢 Oportunidades de Componentização

1. **`StateHandler`**: ✅ criado e aplicado nas 4 listas + `CreateBookView` em 15/10/2026 (suporta slot `#loading` para skeletons)
2. **`BookCover`**: exibição de capa com fallback placeholder — ✅ criado em `components/books/BookCover/` e aplicado em 5 lugares (16/10/2026)
3. **`useBookFormatters`**: composable com `getAuthorString`, `getPagesString`, etc. (✅ criado e aplicado)
4. **`EmptyState`**: estado vazio padronizado com ícone e texto
5. **`usePagination`**: extrair cursor-based pagination do `bookStore.js`

---

## 🔵 Refatorações

| Arquivo | Ação | Status |
|---------|------|--------|
| `BookForm.vue` (703 linhas) | Extrair validação, transformação de dados e auto-cálculo Kindle para composables | ❌ parcial (validação → `utils/validation` e Kindle → `useBookFormatters` em 16/10/2026; transformação de dados segue no form) |
| `bookStore.js` (336 linhas) | Extrair pagination para composable, error handling para utilitário | ✅ (errorHandler.js) |
| `CardStackView.vue` (197 linhas) | Extrair lógica de prefetch e data loading para composable | ✅ (16/10/2026: viraram `registry listComponents` + `loadLists()` internos — composable à parte dispensado, a lógica é específica do Swiper) |
| `FormField.vue` (527 linhas) | Consertar dual v-model emission; considerar subcomponentes por tipo | ❌ |
| `FormSkeleton.vue` | Converter para `<script setup>` (atualmente sem setup) | ✅ (já estava em `<script setup>` — status defasado; em 16/10/2026 o markup passou a renderizar de `constants/formLayout.js`) |
| `ConfirmDialog.vue` | Usar callback prop para confirm em vez de `await emit()` | ✅ |
| `HomeView.vue` | Remover (legacy, importa componente inexistente) | ✅ (removido em 15/10/2026) |

---

## 🟣 Código Morto

- **Barrel exports fantasmas** em `components/index.js`: `Input`, `Modal`, `Card`, `Badge`, `BookDetails`, `ReadingProgress`, `Layout`, `Container`, `SearchBar`, `Notification`, `ToastContainer`: **nenhum desses arquivos existe** — ✅ removidos dos 5 `index.js` em 15/10/2026
- `Notification.vue` e `ToastContainer.vue`: substituídos por `vue-toastification`
- `HomeView.vue`: view legacy não usada — ✅ removida em 15/10/2026
- `flipToOpposite` em `useAnimatedModal.js`: alias de `toggleFlip`, sem uso — ✅ removido em 15/10/2026 (Fase 1)
- Validadores de `utils/validation.js`: sem uso até 16/10/2026 — hoje todos importados pelo `BookForm` (`validateRequired`, `validatePositiveNumber`, `validateYear`, `validatePositiveInteger`, `validateDateRange`)
- `handleDelete` do `BookCard.vue`: morto até 15/10/2026 (o `ConfirmDialog` não emitia `confirm`) — virou `handleDeleteConfirmed` (só fecha o modal)
- Dependências não usadas: `@vueuse/motion`, `@biomejs/biome` — ✅ removidas em 2026-10-15 (`chart.js` já tinha saído com a Decisão 009)

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

- `.prettierrc.json` define `"semi": false`: AGENTS.md exige ponto e vírgula ✅
- `ThisYearList.vue` usa seletores ID (`#right-image`) em vez de BEM ✅
- `CardIntro.vue` encadeia elementos BEM (`card-intro__content__image`): fora do padrão ✅
- `FormSkeleton.vue` usa `<script>` sem `setup` ✅
