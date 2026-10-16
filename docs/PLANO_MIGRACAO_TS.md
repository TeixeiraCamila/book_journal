# Plano de migração para TypeScript

Roteiro incremental para migrar o `book_journal` de JS para TS, camada por camada. Cada fase fecha um bloco e só é encerrada após `lint + type-check + build` + smoke manual, com atualização de `../analise-melhorias.md` (✅ + data) e do `KANBAN.md` (raiz).

> Retrato: varredura de `src/` em 15/10/2026 — **25 `.vue` + 18 `.js`** (43 arquivos, 6.321 linhas de código; 1.003 linhas são JS puro). Ao final de cada fase, marque o status aqui.

## Decisões já fechadas

1. **Prioridade:** a migração sai de `DEPOIS` no `ROADMAP.md` e passa para `PRÓXIMO` (ação 0.2 abaixo) — deixa de esperar o APK.
2. **Type check no build:** `build` vira `vue-tsc -b && vite build` (padrão dos 2 repos irmãos já em TS). Erro de tipo derruba o deploy na Vercel — por isso o gate local é obrigatório antes de todo push.
3. **Ritmo:** incremental por camada, ferramenta primeiro, `.vue` por último. Sem big bang.

Registrar estas escolhas em `DECISIONS.md` como **ADR 010** na Fase 7.

## Status das fases

| Fase | Escopo | Risco | Esforço | Status |
|------|--------|-------|---------|--------|
| 0 | Pré-condições (árvore limpa + prioridade) | ~zero | ~15 min | ⬜ |
| 1 | Ferramenta (deps, tsconfig, scripts, ESLint) | baixo | ~1–2 h | ⬜ |
| 2 | Tipos de contrato (`src/types/`) | baixo | ~1–2 h | ⬜ |
| 3 | Folhas: `utils`, `constants`, composables, router, barrels | baixo | ~1–2 h | ⬜ |
| 4 | Camada de serviço (`services/api.ts`) | médio | ~1 h | ⬜ |
| 5 | Stores Pinia | médio | ~2 h | ⬜ |
| 6 | 25 componentes `.vue` + `main.ts` | alto | ~4–6 h | ⬜ |
| 7 | Endurecimento + docs + ADR 010 | baixo | ~1 h | ⬜ |

**Total: ~2 dias.** Fase 6 concentra ~50% do esforço.

---

## Fase 0 — Pré-condições

| # | Ação | Detalhe |
|---|------|---------|
| 0.1 | Limpar a árvore | Hoje há dezenas de arquivos modificados não commitados (`git status`). Terminar/commitar esse trabalho antes — **migração não pode misturar** com refatoração pendente. Commits só quando pedido. |
| 0.2 | Repriorizar | Mover "Migração incremental para TypeScript" de `DEPOIS` para `PRÓXIMO` em `docs/ROADMAP.md`; marcar ✅ o item "Remover `tsconfig.json` órfão (ou migrar de vez)". |
| 0.3 | Confirmar ordem com a deduplicação | `PLANO_DEDUPLICACAO.md` Fases 2–5 mexem em `BookForm`/`bookStore`/`CardStackView`. **Não há bloqueio:** a Fase 6 migra o `BookForm` por último de qualquer forma. Se as dedups rodarem antes, menos código para tipar. |

---

## Fase 1 — Ferramenta (não mexe em `src/`)

Nenhum arquivo de código muda. Objetivo: `npm run type-check` e `npm run build` existem e passam **com o JS atual dentro**.

### 1.1 Dependências

```bash
npm i -D typescript@~6.0.2 vue-tsc@^3.3.13 @vue/tsconfig@^0.9.1 \
  @vue/eslint-config-typescript@^14.9.0 @types/node@^24
```

- `typescript`/`@types/node` na mesma versão dos irmãos (`dashboard__journal`, `sobrevivendo_ao_mes`).
- `@vue/eslint-config-typescript` já embute `typescript-eslint` + `vue-eslint-parser` (não instalar `typescript-eslint` avulso).

### 1.2 `tsconfig` (substituir os órfãos)

Hoje: `tsconfig.json` resquício (referencia `vite.config.ts` **inexistente**, tem `baseUrl` + `ignoreDeprecations: "6.0"`) e `tsconfig.node.json` quebrado.

Criar o padrão solução dos irmãos:

- **`tsconfig.json`** — `{"files": [], "references": [app, node]}`
- **`tsconfig.app.json`** — `extends: "@vue/tsconfig/tsconfig.dom.json"`, `include: ["src/**/*", "src/**/*.vue"]`, `paths: {"@/*": ["./src/*"]}` (sem `baseUrl` — deprecado no TS 6), `tsBuildInfoFile` em `node_modules/.tmp/`, **`allowJs: true` + `checkJs: false`** (transição) e `strict: true`.
- **`tsconfig.node.json`** — `include: ["vite.config.ts"]`, `types: ["node"]`, `noEmit: true`.

### 1.3 Arquivos de ambiente e config

| Ação | Arquivo |
|------|---------|
| Criar `/// <reference types="vite/client" />` (habilita `import.meta.env`, usado em 3 pontos) | `src/vite-env.d.ts` |
| Renomear `vite.config.js` → `vite.config.ts` (mesmo caminho dos irmãos) | `vite.config.ts` |
| Manter (remover só na Fase 7) | `jsconfig.json` |

### 1.4 Scripts

```json
"type-check": "vue-tsc -b",
"build": "vue-tsc -b && vite build"
```

`vercel-build` já chama `npm run build` → **o gate herda automaticamente**, sem mexer nele.

### 1.5 ESLint

- `files: ['**/*.{js,mjs,jsx,vue}']` → adicionar `ts,mts,tsx`.
- Envolver com `defineConfigWithVueTs` + `vueTsConfigs.recommended` de `@vue/eslint-config-typescript` (ele resolve o parser `vue-eslint-parser` + TS em `<script lang="ts">` — conferir a ordem dos blocos na instalação).
- Manter `js.configs.recommended`, `pluginVue.configs['flat/essential']` e `skipFormatting`.
- Depois da troca: `rm .eslintcache`.

### 1.6 Validação da fase

`npm run lint` · `npm run type-check` · `npm run build` · smoke `npm run dev` (login → acervo → criar → editar).

**Risco:** `vue-tsc` acusa o que o Vite ignora (`noUnusedLocals`, import órfão, tipo de props). Resolver na hora — a fase só fecha com **0 erros**. Erro pré-existente descoberto vira item de `analise-melhorias.md`, não desculpa para afrouxar `strict`.

---

## Fase 2 — Tipos de contrato (`src/types/`)

Fonte da verdade: **`docs/API.md`** (lado consumidor) espelhando `notion_api/lib/domains/books/schema.js` (Zod). **Espelhar, não importar** — os 5 repos são independentes, não há monorepo compartilhando tipos.

| Arquivo | Conteúdo |
|---------|----------|
| `src/types/book.ts` | `Book` (contrato agrupado: `pages`, `seriesInfo`, `startEnd` — Decisão 005), `BookStatus`, `BookType`, `BookOptions`, `CreateBookInput`, `UpdateBookInput` |
| `src/types/auth.ts` | `SessionUser`, `LoginResponse`, `GuestUser` |
| `src/types/api.ts` | `Envelope<T>`, `Pagination`, `ApiError` (`{ code, message }`), `ListQuery` (`pageSize`, `startCursor`, `search`, `searchBy`, `status`, `wasReadIn`) |

- Opcional no mesmo passo: `src/types/store.ts` com `BookLists`/`LoadingStates` (usado na Fase 5).
- **Sem enums** — os mapas já são literais (`BOOK_STATUS_MAP`, `BOOK_STATUS_LABELS`): usar `as const` + `satisfies Record<...>` (compatível com `erasableSyntaxOnly` dos irmãos).
- **Validação:** `lint + type-check + build` (nenhum consumidor ainda — fase silenciosa).

---

## Fase 3 — Folhas (mais fáceis, sem dependência de estado)

Ordem sugerida, `git mv` para preservar histórico:

| Ordem | Arquivos | Cuidado |
|-------|----------|---------|
| 1 | `utils/validation.js` → `.ts` | funções puras — assinaturas fáceis, ganho imediato |
| 2 | `utils/errorHandler.js` → `.ts` | `extractErrorMessage(error)` e `logError(action, error)` devem aceitar **`unknown`** (padrão TS para erro) |
| 3 | `constants/book.js`, `constants/toast.js` → `.ts` | `as const`; `TOAST_CONFIG` tipado como `PluginOptions` do vue-toastification |
| 4 | `composables/useNotifications`, `useBookNavigation`, `useBookFormatters`, `useAnimatedModal` → `.ts` | `useAnimatedModal` é o maior (83 linhas) — tipar refs e callbacks |
| 5 | `router/index.js` → `.ts` | guard de auth: tipar `to`/`from` de `RouteLocationNormalized` |
| 6 | Barrels `index.js` → `index.ts` (5 arquivos) | só renomear |

**Validação por lote:** `lint + type-check + build`.

---

## Fase 4 — Camada de serviço (`services/api.js` → `api.ts`)

O contrato inteiro passa por aqui — mais valor por linha migrada.

| Item | Ação |
|------|------|
| `booksApi.list(options)` | tipar `options: ListQuery`; devolver `Promise<AxiosResponse<Envelope<Book[]>>>` |
| `listAll` / `get` / `create` / `update` / `delete` / `options` / `finishedThisYear` | genéricos `api.get<...>` por endpoint (espelhar `docs/API.md`: `GET /:id` devolve o book **no topo**, `/all` tem `{data,total}`) |
| `authApi.login` / `me` | `LoginResponse` e `{ user: SessionUser }` |
| Interceptors | `error` em TS não é `any`: tipar como `AxiosError` (response interceptor) e `InternalAxiosRequestConfig` (request) |
| `params` dinâmico | objeto montado condicionalmente → declarar `Record<string, string>` antes de atribuir chaves |
| `import.meta.env.VITE_API_URL` | já coberto pelo `vite-env.d.ts` da Fase 1 |

**Validação:** `lint + type-check + build` + smoke de busca/paginação (os interceptors de 401 e anexo de token têm que continuar funcionando).

---

## Fase 5 — Stores Pinia

`defineStore` com `state` tipado (padrão options API que o projeto já usa — não converter para `setup store` no mesmo passo).

| Store | Pontos de atenção |
|-------|-------------------|
| `bookStore.js` | `bookLists: Record<ListKey, Book[]>`, `pagination` (`currentCursor`/`nextCursor: string \| null`, `previousCursors: string[]`), `searchToken: number`, `bookOptions: BookOptions \| null`, `error: string \| null`; getters `getBookById` com retorno `Book \| undefined` |
| `userStore.js` | `userActive: SessionUser \| GuestUser \| null`, `token: string \| null`; `GUEST_USER` com `satisfies` (hoje tem `type: 'guest'`, diferente do `SessionUser` do backend — tipar a união direito expõe isso) |

- Actions que consomem `api` herdam os tipos da Fase 4 — se `store` reclamar, o problema quase sempre está no serviço.
- **Validação:** smoke completo (login, visitante, CRUD, busca com debounce, paginação, 401 → `/login`).

---

## Fase 6 — 25 componentes `.vue` (maior bloco)

Em cada componente: `<script setup lang="ts">`, props runtime → tipo, emits array → tipo, e **nada de mudança de comportamento**.

### Ordem (primitivas → composição → telas)

| Lote | Arquivos | Esforço |
|------|----------|---------|
| 6a — primitivas | `Button`, `LoadingSpinner`, `StateHandler`, `BookCardSkeleton`, `FormSkeleton`, `FormSection`, `FormActions`, `ConfirmDialog`, `CardStatus` | pequeno |
| 6b — formulário | `FormField.vue` (527 linhas — **sem mexer no bug de emissão dupla do v-model**, é item separado), `Filters`, `Pagination` | médio |
| 6c — listas | `BookList`, `ReadingList`, `TBRList`, `ThisYearList` | médio |
| 6d — cartão | `BookCard`, `CardFront`, `CardBack` (props aninhadas + flip 3D — GSAP) | médio |
| 6e — telas | `BookForm.vue` (701 linhas — maior arquivo do repo, por último de propósito), `LoginView`, `CardStackView`, `App.vue` | alto |
| 6f — entry | `main.js` → `main.ts`; conferir `app.use(Toast, TOAST_CONFIG)` | pequeno |

### Regras de conversão

- **Props:** `defineProps({ x: { type: String, default: '' } })` → `withDefaults(defineProps<{ x?: string }>(), { x: '' })`. **Só migrar o formato se os defaults continuarem idênticos** — default que muda é bug visual silencioso.
- **Emits:** `defineEmits(['edit', 'delete'])` → `defineEmits<{ edit: [id: string]; delete: [id: string] }>()` (9 componentes); manter kebab-case no template.
- Um comentário de 1 linha no topo continua obrigatório (regra do repo).
- **Validação por lote:** `lint + type-check + build` + smoke visual do lote (modais, flip, listas com capa).

---

## Fase 7 — Endurecimento e documentação

| # | Ação |
|---|------|
| 7.1 | Sem `.js` em `src/` → derrubar `allowJs`/`checkJs` do `tsconfig.app.json` e apagar `jsconfig.json` |
| 7.2 | (Opcional) ativar `noUncheckedIndexedAccess` — **adiado de propósito**: quebra `BOOK_STATUS_LABELS[status]` e `BOOK_SEARCH_PLACEHOLDERS[mode]`; se ativar, corrigir com lookup tipado, não com `!` |
| 7.3 | Conferir `npm run lint && npm run type-check && npm run build` + smoke dos 6 fluxos de `TESTING.md` §5 |
| 7.4 | **ADR 010** em `DECISIONS.md`: migração incremental por camada, gating de tipo no build, tipos espelhados (não compartilhados) com o `notion_api` |
| 7.5 | Docs: `AGENTS.md` raiz (Stack → TypeScript; Comandos → `type-check`; Estrutura → `*.ts`), `CODE_STYLE.md` §10 (Type Checking deixa de ser "Nenhum"), `TESTING.md` §7 (linha do type check), `ARCHITECTURE.md`, `README.md` |
| 7.6 | `ROADMAP.md` (item da TS ✅ com data) + `../analise-melhorias.md` (linha "Remover `tsconfig.json`" ✅) + `KANBAN.md` (raiz) |

---

## Riscos e gotchas

- **Deploy:** com gate no build, `push` com erro de tipo falha na Vercel → rodar `npm run build` local antes de todo push.
- **Nenhum shim de tipos esperado:** axios, pinia, vue-router, gsap, swiper, lucide-vue-next e vue-toastification (`dist/types/index.d.ts`) publicam tipos próprios. Se algo reclamar, criar `src/types/<lib>.d.ts` dedicado — **nunca `any` contornando o erro**.
- **`vue-toastification` é `2.0.0-rc.5`** — a lib menos estável do stack; se `TOAST_CONFIG` não casar com `PluginOptions`, ajustar o objeto (não ignorar o erro).
- **TS 6:** seguir o padrão dos irmãos — `verbatimModuleSyntax`/`erasableSyntaxOnly` (usar `import type`, sem enums) e `paths` **sem** `baseUrl`.
- **Não misturar refatoração com migração:** `lang="ts"` muda só a tipagem. Quiser mexer na lógica (ex.: emissão dupla do `FormField`), abrir item separado em `analise-melhorias.md`.
- **Não tocar** no que já está resolvido (`_handleError`, toast, reset, `searchToken`) e respeitar os gotchas do `../AGENTS.md`.
- **`PLANO_DEDUPLICACAO.md` continua valendo** — as duas frentes não conflitam, mas commitar uma antes de começar a outra.

## Governança

- **Após cada fase:** `npm run lint && npm run type-check && npm run format && npm run build` + smoke em `npm run dev`; marcar ✅ com data nesta tabela e em `../analise-melhorias.md`.
- **Commits:** só quando pedido explicitamente — sugestão de 1 commit atômico por fase (`refactor(ts): ...`).
- **Fase 1 primeiro, sempre:** sem a ferramenta passando, nenhuma migração de arquivo começa.
