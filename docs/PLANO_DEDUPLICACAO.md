# Plano de deduplicação

Roteiro para eliminar as duplicações listadas em `../analise-melhorias.md` (seção *🟡 Duplicações*). 5 fases ordenadas **por risco crescente**: cada fase fecha um cluster e só é encerrada após `lint + format + build` + smoke manual, com atualização de `../analise-melhorias.md` (✅ + data) e do `KANBAN.md` (raiz).

> Fonte do retrato: varredura dos 42 arquivos de `src/` em 15/10/2026. Ao final de cada fase, marque aqui o status da fase.

## Status das fases

| Fase | Cluster | Risco | Esforço | Status |
|------|---------|-------|---------|--------|
| 1 | Corpos idênticos e código morto | ~zero | ~20 min | ✅ 15/10/2026 |
| 2 | Validação + formatters | baixo | ~1–2 h | ⬜ |
| 3 | Capa/placeholder + CSS compartilhado | visual | ~2–3 h | ⬜ |
| 4 | `FormSkeleton` × `BookForm` | médio | ~3 h + ADR | ⬜ |
| 5 | `bookStore` + `CardStackView` | alto | ~2–3 h | ⬜ |

---

## Fase 1 — Corpos idênticos e código morto ✅ (15/10/2026)

| # | Ação | Arquivos |
|---|------|----------|
| 1.1 | `closeModalWithAnimation` tinha corpo idêntico a `closeModal` → removido, usos apontam para `closeModal` | `composables/useAnimatedModal.js`, `BookCard.vue` |
| 1.2 | `flipToOpposite` (alias sem uso de `toggleFlip`) removido | `useAnimatedModal.js` |
| 1.3 | `handleCancel` === `handleEditSuccess` (ambos `router.push({ path: '/', query: { slide: '1' } })`) → único `goHome` | `views/CreateBookView.vue` |
| 1.4 | `handleSubmit` vazio removido, junto com `@submit` no template e `emit('submit')` no form (notificação já sai do `BookForm`) | `views/CreateBookView.vue`, `forms/BookForm/BookForm.vue` |

**Pendência de produto (não decidida aqui):** criar um livro não navega — o form limpa e fica na página. Se quiser navegar após criar, é decisão de produto.

## Fase 2 — Validação e formatters

### 2a. Validação

`BookForm.handleSubmit` reimplementa à mão o que `src/utils/validation.js` já faz — e as mensagens batem literalmente (`${fieldName} é obrigatório`, `deve ser um número positivo`, `deve ter 4 dígitos`).

- Substituir por `validateRequired('Título')`, `validatePositiveNumber(...)`, `validateYear(...)`; `parseCommaSeparated` já vem do mesmo arquivo.
- Faltam 2 casos → adicionar em `validation.js`: `validatePositiveInteger` (volume) e `validateDateRange` (endDate ≥ startDate).
- Orquestração continua no `BookForm` (só passa a chamar funções puras).
- **Teste manual:** título vazio, páginas negativas, ano com 3 dígitos, data fim anterior ao início.

### 2b. Formatters

`getPagesString`/`getAuthorString`/`getPublicationString` existem em `useBookFormatters` mas convivem com cópias manuais em 4 lugares.

- Adicionar `getPagesProgress(book)` ao composable; `getPagesString` passa a usá-lo.
- Trocar por composable: `ReadingList.calculateProgress` (L15), watch de % do `BookForm`, autor manual do `CardBack` e do `TBRList`.
- **⏸ Decisão pendente:** `getAuthorString` prefixa o `literaryAtlas`; `CardBack`/`TBRList` hoje não mostram. Recomendação: unificar com prefixo (coerente com a ReadingList) e validar visualmente.

## Fase 3 — Capa/placeholder + CSS compartilhado (exige QA visual)

1. **`BookCover.vue`** novo (`components/books/BookCover/` + barrel): recebe `src`, fallback `📖`. Substituir em `CardFront` (hoje usa `placehold.co` **externo** — recomendação: fallback local, elimina dependência de rede), `ReadingList`, `TBRList`, `ThisYearList` e o preview do `BookForm`.
2. **`.modal-overlay`** global (CSS não-scoped em `assets/css/style.css`): extrai o bloco de `BookCard` × `ConfirmDialog`. **Preservar `z-index`** (100 vs 2000 — o dialog precisa ficar acima do modal) e o `backdrop-filter` via modifier.
3. **Fita de status:** override do `ThisYearList` vira modifier do `CardStatus` (`.card-status--tight`), em vez de CSS duplicado.
- **QA visual:** modal (abrir/flip/fechar), delete dialog acima do modal, as listas com capa.

## Fase 4 — `FormSkeleton` × `BookForm` (exige ADR)

- **Recomendado:** criar `src/constants/formLayout.js` com as 5 seções + campos (altura, largura); `FormSkeleton` renderiza a partir dele e o `BookForm` passa a importar os **títulos** das seções → ~70% de sincronia sem reescrever um form de 703 linhas.
- **Não recomendado agora:** gerar o form inteiro do config (tipos variados: datalist, chips, rating, file) — refatoração de dias.
- Registrar a escolha em `DECISIONS.md`.

## Fase 5 — `bookStore` + `CardStackView` (maior risco — por último)

1. **`bookStore`:** extrair `_fetchPaged({ key, loader, params })` unificando `fetchBooks`, `fetchBooksByStatus` e `fetchBooksReadThisYear` (hoje repetem loading → token → try → `_handleError` → finally); `_applyFilters()` para `search`/`setSearchBy`/`filterByStatus` (corpos idênticos); `$reset()` reaproveita o mesmo initial-state do `state()`.
   - **Cuidado:** `searchToken` existe só em `fetchBooks` → generalizar no wrapper, senão some a proteção contra corrida de busca.
   - **Teste:** busca paginada, troca de aba, sem fetch duplo (aba Network).
2. **`CardStackView` (287 linhas):** registry dos 4 `defineAsyncComponent` em mapa + único `loadLists()` nos pontos de chamada.
   - **Teste:** build ainda gera os chunks separados (BookList/TBRList/ReadingList/ThisYearList) e o lazy-load ao trocar de aba.

---

## Governança

- **Após cada fase:** `npm run lint && npm run format && npm run build` + smoke em `npm run dev`; marcar ✅ com data em `../analise-melhorias.md` e mover o item no `KANBAN.md` (raiz).
- **Commits:** só quando pedido explicitamente — sugestão de 1 commit atômico por fase.
- **Não tocar** no que já está ✅ (`_handleError`, toast, reset) e respeitar os gotchas do `../AGENTS.md` (ex.: `publishedBy` é string, não array).
- **Estimativa total:** ~1 dia distribuído; ~60% do valor vem das Fases 1+2.
