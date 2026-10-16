# Roadmap

Prioridades do `book_journal`. Fonte complementar: `../KANBAN.md` (raiz, board dos 5 repositórios), `../analise-melhorias.md` (pendências técnicas detalhadas) e `PLANO_DEDUPLICACAO.md` (roteiro das 5 fases de deduplicação).

---

## AGORA

- **Executar `PLANO_DEDUPLICACAO.md`**: roteiro das 5 fases de deduplicação; Fase 1 ✅ em 15/10/2026 (corpos idênticos + código morto)
- ~~**Aplicar `StateHandler` nas 4 listas**~~ ✅ feito em 15/10/2026: `StateHandler` real aplicado em `BookList`, `ReadingList`, `TBRList`, `ThisYearList` e no erro do `CreateBookView`
- ~~**Remover `HomeView.vue` legado**~~ ✅ removido em 15/10/2026 (importava `@/components/BookList.vue`, inexistente)
- ~~**Limpar barrel exports fantasmas**~~ ✅ feito em 15/10/2026: os 5 `index.js` de `components/` exportam só arquivos existentes e os `export *` para diretórios sem `index.js` saíram
- **Asset quebrado**: `this-year__header.png` (caminho absoluto) em `ThisYearList.vue`
- **Commitar revalidação de sessão no boot** (`DECISIONS.md` 007): alterações em `router/index.js`, `services/api.js`, `userStore.js`

---

## PRÓXIMO

- **Suíte de testes**: Vitest + `@vue/test-utils` + `happy-dom`; começar por `validation.js`, `errorHandler.js`, `userStore` (`TESTING.md`)
- ~~**Deduplicar estados das 4 listas**~~ ✅ feito em 15/10/2026 (mesma entrega do `StateHandler`; ver `analise-melhorias.md`)
- **Componente `BookCover`**: capa com fallback, hoje repetida em 5+ componentes (Fase 3 do `PLANO_DEDUPLICACAO.md`)
- ~~**`EmptyState` padronizado**~~ ✅ absorvido em 15/10/2026 pelo `StateHandler` (ícone + título + texto configuráveis)
- **Composable `usePagination`**: extrair cursor pagination do `bookStore`
- ~~**Deduplicar `closeModal`/`closeModalWithAnimation`**~~ ✅ feito em 15/10/2026 (corpos idênticos; junto com `flipToOpposite` morto)
- ~~**Remover dependências não usadas**~~ ✅ `@vueuse/motion` e `@biomejs/biome` removidas em 15/10/2026 (`chart.js` já tinha saído com a Decisão 009)
- **Remover `tsconfig.json` órfão** (ou migrar de vez, ver DEPOIS)

---

## DEPOIS

- **Enxugar `BookForm.vue` (701 linhas)**: extrair validação/transformação/auto-cálculo Kindle para composables (Fase 2 do `PLANO_DEDUPLICACAO.md`)
- **Revisar `FormField.vue` (527 linhas)**: subcomponentes por tipo de campo; consertar emissão dupla de `v-model`
- **Enxugar `CardStackView.vue`**: extrair prefetch e data loading para composable
- **Virtual scrolling na `BookList`**: para acervos grandes
- **Blur-up placeholder nas capas**: lazy loading com placeholder desfocado
- **Sessão em cookie HTTP-only**: reduzir risco do `localStorage` (`SECURITY.md`, `DECISIONS.md` 002)
- **"Lembrar deste navegador"**: token curto + refresh
- **App mobile Android (Capacitor)**: plano completo já desenhado (APK via WSL2 + wireless adb); nada implementado
- **Migração incremental para TypeScript**: fase posterior ao APK
- **`FormSkeleton.vue` em `<script setup>`**

---

## ADIADO

- Nada adiado no momento

---

## NÃO PLANEJADO

- **Estatísticas / painel com gráficos**: fora de escopo definitivo deste app (Decisão 009, `DECISIONS.md`); o endpoint `/api/books/stats` e os gráficos são do `dashboard__journal`
- Multiusuário / perfis / convites
- Social (compartilhar, comentar, seguir)
- Integração com APIs externas de livros (Google Books, ISBN)
- Play Store / iOS
- SSR / Nuxt (SPA atende ao caso de uso)
