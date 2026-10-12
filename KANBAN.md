# Kanban — book_journal

SPA Vue 3 (Composition API + Pinia) para catalogar e acompanhar leituras. Consome o `notion_api` (domínio **books**).

Colunas: **Completo** · **Em desenvolvimento** · **Em pausa** · **Pode ser útil**

## Completo

- **CRUD de livros** — criar/editar/arquivar via `POST/PATCH/DELETE /api/books` (`src/stores/bookStore.js`).
- **Formulário completo** — validação, auto-cálculo de progresso Kindle e auto-set "Read" ao preencher o fim (`BookForm.vue`).
- **Rastreio de progresso** — barra e % de páginas (atual/total) nas listas de leitura.
- **Avaliação com estrelas e favoritos** — nota e ❤ no card (`CardStatus.vue`, `constants/book.js`).
- **Busca e filtros** — título/autor/gênero com debounce (400 ms) + radios de status (`Filters.vue`).
- **Paginação cursor-based** — próxima/anterior e troca de `page_size` (`Pagination.vue`).
- **Card com flip 3D e modal animado** — respeitando `prefers-reduced-motion` (`use_animated_modal.js`).
- **Autenticação por código + JWT (30 dias)** — login em 2 etapas + interceptor 401 (`docs/auth-flow.md`).
- **Modo visitante** — leitura sem conta; escritas ocultas e 401 no backend (`userStore.js`).
- **Guard de rotas + sessão persistida + logout** — `SESSION_TOKEN` no `localStorage` restaurado no router.
- **Pilha de cartas vertical** — Swiper EffectCards com slides dinâmicos, prefetch de chunks e deep-link `?slide=`.
- **Listas Em Leitura / Para Ler (TBR)** — com estados loading/erro/vazio e retry.
- **Lista "Lidos no ano"** agrupada por mês (rota `finished-this-year`).
- **Skeletons e estados de erro** — `BookCardSkeleton`, `FormSkeleton`, `LoadingSpinner`.
- **Formatters, validação e erros centralizados** — `useBookFormatters`, `utils/validation`, `utils/errorHandler`.
- **Toasts unificados** — `useNotifications` + config única.
- **Responsivo e acessível** — media queries, contraste, foco visível, alt text.
- **Deploy na Vercel** — `vercel.json` com fallback de SPA.

## Em desenvolvimento

- **Aplicar `StateHandler` nas 4 listas** — componente genérico criado, mas as listas ainda repetem templates próprios.
- **Asset quebrado do header do ano** — `this-year__header.png` inexistente com caminho absoluto (`ThisYearList.vue`).
- **Remover `HomeView.vue` legado** — importa componente inexistente; quebraria o build se ativado.
- **Limpar barrel exports "fantasmas"** — `components/index.js` exporta itens que não existem (limpeza iniciada).
- **Sincronizar docs** — `docs/router.md` e `docs/stores.md` descrevem API antiga (pré-JWT).

## Em pausa

- **App mobile Android (Capacitor)** — plano completo em `docs/mobile-capacitor.md` (não commitado); nada implementado.
- **Migração incremental para TypeScript** — fase 5 do plano Capacitor; `tsconfig.json` é resíduo sem `typescript`/`vue-tsc`.
- **Painel de estatísticas com chart.js** — lib instalada e sem uso, endpoint `stats()` pronto, sem action nem consumidor.
- **Sessão em cookie HTTP-only** — discutido em `docs/auth-flow.md`; planejado, não iniciado.

## Pode ser útil

- **Virtual scrolling na `BookList`** — evitar degradação com bibliotecas grandes.
- **Lazy loading com blur-up nas capas** — placeholder desfocado até carregar.
- **Suíte de testes** — vitest + `@vue/test-utils` + happy-dom.
- **Componente genérico `BookCover`** — capa com fallback, repetida em 5+ componentes.
- **`EmptyState` padronizado** — estado vazio com ícone e texto reutilizável.
- **Composable `usePagination`** — extrair a paginação do `bookStore`.
- **Enxugar `BookForm.vue` (726 linhas)** — extrair validação/transformação para composables.
- **Enxugar `CardStackView.vue` (197 linhas)** — extrair prefetch e data loading.
- **Revisar `FormField.vue` (544 linhas)** — subcomponentes por tipo de campo.
- **Deduplicar `closeModal`/`closeModalWithAnimation`** — funções idênticas.
- **Rate limit de login** — `AUTH_LOGIN_MAX_ATTEMPTS`.
- **Revalidar token no boot** via `GET /api/auth/me`.
- **"Lembrar deste navegador"** — token curto + refresh.
- **Remover dependências não usadas** — `chart.js`, `@vueuse/motion`, `@biomejs/biome`.
