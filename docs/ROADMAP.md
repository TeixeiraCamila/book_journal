# Roadmap

Prioridades do `book_journal`. Fonte complementar: `../KANBAN.md` (raiz, board dos 5 repositórios) e `../analise-melhorias.md` (pendências técnicas detalhadas).

---

## AGORA

- **Aplicar `StateHandler` nas 4 listas** — componente criado; `BookList`, `ReadingList`, `TBRList` e `ThisYearList` ainda repetem templates próprios de loading/erro/vazio
- **Remover `HomeView.vue` legado** — importa componente inexistente; quebraria build se ativado
- **Limpar barrel exports fantasmas** em `components/index.js` (`Input`, `Modal`, `Card`, `Badge`, `BookDetails`, `ReadingProgress`, `Layout`, `Container`, `SearchBar`, `Notification`, `ToastContainer`)
- **Asset quebrado** `this-year__header.png` (caminho absoluto) em `ThisYearList.vue`
- **Commitar revalidação de sessão no boot** (`DECISIONS.md` 007) — alterações em `router/index.js`, `services/api.js`, `userStore.js`

---

## PRÓXIMO

- **Suíte de testes** — Vitest + `@vue/test-utils` + `happy-dom`; começar por `validation.js`, `errorHandler.js`, `userStore` (`TESTING.md`)
- **Deduplicar estados das 4 listas** (relacionado ao `StateHandler`)
- **Componente `BookCover`** — capa com fallback, hoje repetida em 5+ componentes
- **`EmptyState` padronizado** — ícone + texto reutilizável
- **Composable `usePagination`** — extrair cursor pagination do `bookStore`
- **Deduplicar `closeModal`/`closeModalWithAnimation`** em `useAnimatedModal.js`
- **Remover dependências não usadas** — `chart.js`, `@vueuse/motion`, `@biomejs/biome`
- **Remover `tsconfig.json` órfão** (ou migrar de vez — ver DEPOIS)

---

## DEPOIS

- **Enxugar `BookForm.vue` (726 linhas)** — extrair validação/transformação/auto-cálculo Kindle para composables
- **Revisar `FormField.vue` (544 linhas)** — subcomponentes por tipo de campo; consertar emissão dupla de `v-model`
- **Enxugar `CardStackView.vue`** — extrair prefetch e data loading para composable
- **Virtual scrolling na `BookList`** — para acervos grandes
- **Blur-up placeholder nas capas** — lazy loading com placeholder desfocado
- **Sessão em cookie HTTP-only** — reduzir risco do `localStorage` (`SECURITY.md`, `DECISIONS.md` 002)
- **"Lembrar deste navegador"** — token curto + refresh
- **App mobile Android (Capacitor)** — plano completo já desenhado (APK via WSL2 + wireless adb); nada implementado
- **Migração incremental para TypeScript** — fase posterior ao APK
- **`FormSkeleton.vue` em `<script setup>`**

---

## ADIADO

- **Painel de estatísticas com chart.js** — lib instalada sem uso; endpoint `/api/books/stats` pronto, mas o consumo é do `dashboard__journal` (repo irmão). Decidir se duplicamos aqui ou não
- **Consumo de `/books/stats` no book_journal** — depende da decisão acima

---

## NÃO PLANEJADO

- Multiusuário / perfis / convites
- Social (compartilhar, comentar, seguir)
- Integração com APIs externas de livros (Google Books, ISBN)
- Play Store / iOS
- SSR / Nuxt (SPA atende ao caso de uso)
