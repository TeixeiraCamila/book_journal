# Plano de migração para TypeScript

Roteiro incremental: migrar o `book_journal` de JS para TS, camada por camada, **sem big bang e sem mudança de comportamento**. 6 fases; cada fecha um bloco e só encerra com o gate verde + smoke + docs.

> Retrato (22/10/2026, pós-Fase 2): **26 .vue + 4 .js + 19 .ts** = 49 arquivos em `src/`, 6.508 linhas. No início da migração eram 26 `.vue` + 19 `.js` = 45 arquivos (1.098 linhas em JS puro); sobraram `main.js`, `services/api.js` e as 2 stores para as Fases 3–4.

## Como funciona (vale para todas as fases)

- **Gate padrão** — rodar no fim de cada fase; só fecha com **0 erros**:
  ```bash
  npm run lint && npm run type-check && npm run build
  ```
- **Smoke** mínimo por fase: `npm run dev` → login → acervo → criar → editar.
- **Ao fechar a fase:** marcar ✅ + data nesta tabela, em `../analise-melhorias.md` e no `KANBAN.md` (raiz).
- **Commits:** só quando pedido; 1 commit atômico por fase (`refactor(ts): ...`).
- **Erro pré-existente** que o `vue-tsc` descobrir vira item de `analise-melhorias.md` — nunca afrouxar `strict` para passar pano.

## Decisões já fechadas

1. **Prioridade:** a migração sai de `DEPOIS` para `PRÓXIMO` no `ROADMAP.md` (Fase 0); deixa de esperar o APK.
2. **Type check no build:** `build` vira `vue-tsc -b && vite build` (padrão dos irmãos). Erro de tipo derruba o deploy na Vercel → gate local obrigatório antes de todo push.
3. **Ritmo:** ferramenta primeiro, `.vue` por último.
4. **ADR 011** (não 010 — o 010 já foi consumido pela dedup/`formLayout.js`): registrar na Fase 5.
5. **Transição dos `.vue` em JS:** o ESLint ganha um bloco transitório `app/transicao-script-js` (Fase 1) mantendo `vue/block-lang` com `allowNoLang: true` até a Fase 5. A alternativa `scriptLangs: ['ts', 'js']` foi descartada: faria o `scriptLangs` mentir sobre o repo e afetaria a classificação de type-check do helper.

## Status das fases

| Fase | Escopo | Risco | Esforço | Status |
|------|--------|-------|---------|--------|
| 0 | Pré-condições (árvore limpa + ROADMAP) | ~zero | ~15 min | ✅ 25/10/2026 |
| 1 | Ferramenta (deps, tsconfig, scripts, ESLint) | baixo | ~1–2 h | ✅ 22/10/2026 |
| 2 | Tipos de contrato + folhas (`utils`, `constants`, composables, router, barrels) | baixo | ~2–3 h | ✅ 22/10/2026 |
| 3 | Dados: `services/api.ts` + stores Pinia | médio | ~2–3 h | ⬜ **próxima** |
| 4 | 26 componentes `.vue` + `main.ts` | alto | ~4–6 h | ⬜ |
| 5 | Endurecimento + docs + ADR 011 | baixo | ~1 h | ⬜ |

**Total: ~2 dias.** A Fase 4 concentra ~50% do esforço.

---

## Fase 0 — Pré-condições (~15 min)

| # | Ação | Detalhe |
|---|------|---------|
| 0.1 | Árvore limpa | ✅ verificado em 22/10 (working tree limpo, dedup commitada). Se aparecer trabalho no meio da migração, commitar antes de continuar. |
| 0.2 | Repriorizar | ✅ feito em 25/10/2026: "Migração incremental para TypeScript" saiu de `DEPOIS` para `PRÓXIMO` em `docs/ROADMAP.md` (com status das fases) e o item "Remover `tsconfig.json` órfão" foi marcado ✅. |
| 0.3 | Deduplicação | ✅ concluída (fases 1–5, 15–16/10/2026). Nenhum bloqueio remanescente. |

---

## Fase 1 — Ferramenta (não mexe em `src/`)

**Objetivo:** `npm run type-check` e `npm run build` existem e passam **com o JS atual dentro**.

### 1.1 Rename do vite config (antes de tudo)

```bash
git mv vite.config.js vite.config.ts
```

- Mesmo caminho dos irmãos; **nenhum ajuste de código** (o conteúdo já é ESM + `import.meta.url`).
- É pré-requisito, não consequência: o `tsconfig.node.json` nasce com `include: ["vite.config.ts"]` — sem o rename, o primeiro `vue-tsc -b` aborta com *"No inputs were found"*.

### 1.2 Dependências

```bash
npm i -D typescript@~6.0.2 vue-tsc@^3.3.13 @vue/eslint-config-typescript@^14.9.0 @types/node@^24
```

- `typescript`/`@types/node` na mesma versão dos irmãos (`dashboard__journal`: `~6.0.0` / `^24`). **O pin não é cosmético:** o `latest` do npm já é o TypeScript **7.0.2** (port nativo) — sem `~6.0.2`, um `npm i -D typescript` puxa o 7.
- `vue-tsc` é o único que typea `.vue` (`tsc` puro não resolve o formato).
- `@vue/eslint-config-typescript` já embute `typescript-eslint` + `vue-eslint-parser` (não instalar avulso).
- Smoke cedo: `npx vue-tsc -b` logo após o `npm i` isola incompatibilidade `vue-tsc × TS 6` do resto da fase.

### 1.3 `tsconfig` — substituir os 2 órfãos

Hoje: `tsconfig.json` resquício (tem `baseUrl` + `ignoreDeprecations: "6.0"` + `jsx: "preserve"`) e `tsconfig.node.json` quebrado (inclui `vite.config.ts` inexistente). **Copiar o trio comprovado do `dashboard__journal`** e adaptar.

`tsconfig.json` (raiz, solução):

```jsonc
{
  "files": [],
  "compilerOptions": {
    "target": "es2023",
    "module": "esnext",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "noEmit": true,
    "skipLibCheck": true
  },
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

Referência lateral a partir de uma raiz `files: []` **não exige `composite`** (comportamento confirmado no `tsc -b` dos irmãos).

`tsconfig.app.json` (cópia do irmão adaptada):

```jsonc
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Transição: remove na Fase 5, junto com o bloco de transição do ESLint */
    "allowJs": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "paths": { "@/*": ["./src/*"] },

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- **Sem `jsx`** (não há TSX aqui), **sem `baseUrl`**, `allowJs: true` só na transição (`checkJs` fica no default `false`), `tsBuildInfoFile` em `node_modules/.tmp/` e `include: ["src"]`.
- `DOM.Iterable` é a única adição em relação ao irmão (React não usa): paridade com o tsconfig atual do repo, evitando TS2802 se algum dia iterar `NodeList`/`HTMLCollection` (hoje não há `for..of` sobre `NodeList` — só `CardIntro` passando `querySelectorAll` ao GSAP, que aceita `ArrayLike`).

`tsconfig.node.json`: idêntico ao do irmão (`include: ["vite.config.ts"]`, `types: ["node"]` — cobre `node:url` e `import.meta.url` no vite config).

- `types: ["vite/client"]` no `tsconfig.app.json` habilita `import.meta.env` (usado em 3 pontos: `router`, `services/api`, `CardStackView`) **e** os módulos de asset (`*.webp`/`*.png` em `CardIntro` e `CardStatus`) → **não precisa criar `vite-env.d.ts`**.
- `resolveJsonModule` não faz falta: nenhum import de JSON no repo.
- `jsconfig.json`: manter por enquanto (o VS Code segue resolvendo `@/*` nos `.js`; apagar na Fase 5).

### 1.4 Scripts

| Ação | Detalhe |
|------|---------|
| `"type-check": "vue-tsc -b"` | novo script |
| `"build": "vue-tsc -b && vite build"` | gate herda o `vercel-build` automaticamente (ele chama `npm run build`; o `vercel.json` não sobrescreve `buildCommand`) |

### 1.5 ESLint

Config final da fase (a ordem abaixo é fechada — ver nota):

```js
import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,ts,mts,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: { globals: { ...globals.browser } },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  // Transição (Fases 1–4): os 26 .vue ainda têm <script setup> sem lang.
  // Voltar ao default (allowNoLang: false) na Fase 5, junto com o allowJs.
  {
    name: 'app/transicao-script-js',
    files: ['**/*.vue'],
    rules: {
      'vue/block-lang': ['error', { script: { lang: 'ts', allowNoLang: true } }],
    },
  },

  skipFormatting,
)
```

Por quê assim:

- **`ts,mts` no `files` é obrigatório, não cosmético:** as configs do `typescript-eslint` vêm **sem** `files`; se nenhum config casar o padrão, o ESLint nem considera `.ts` lintável (os `.vue` já entram pelo `pluginVue`).
- **`vue/block-lang`** vem ligada pelo helper com `allowNoLang: false` e derrubaria os 26 `.vue` atuais de uma vez (a regra **não é autofixável** — o `--fix` não salva). O override mantém a regra viva: aceita "sem atributo" (estado atual) e `lang="ts"` (estado da Fase 4), rejeita `lang="js"` — e passa a ser o guarda automático de que a conversão da Fase 4 foi feita com `lang="ts"` de verdade.
- **Ordem garantida pelo helper** (`insertAndReorderConfigs`): ele injeta `pluginVue flat/base` + `@vue/typescript/setup` **logo depois** do último bloco `vueTs`; o que vier depois disso cai no tail e vence.

  ```
  [marker files] [globalIgnores] [globals] [js.recommended] [pluginVue essential]
    [vueTsConfigs.recommended...]              ← último bloco "estendido"
  --- injetado pelo helper ---
  [pluginVue flat/base] [@vue/typescript/setup]
  [app/transicao-script-js] [skipFormatting]   ← tail: vence o setup
  ```

  Consequência: **qualquer override futuro precisa vir depois de `vueTsConfigs.recommended`.**
- `js.configs.recommended` fica antes (o `no-unused-vars` do TS o desliga e assume); `no-undef` continua ligado nos `.js` (o `eslint-recommended` do TS só o desliga em `.ts`/`.vue`).

Após a troca:

```bash
rm -f .eslintcache
npm run lint        # o script tem --fix
git diff --stat     # obrigatório: a premissa da fase é não mexer em src/
```

Risco de autofix já avaliado no repo: 0 `var`; 3 `let` (todos reatribuídos → `prefer-const` não dispara); nenhuma expressão-solta (`no-unused-expressions`); sem `@ts-*`, `new Array(` ou `.apply(`. Se o lint apontar algo novo, é regra TS sobre JS legado → override pontual no **tail** + item em `analise-melhorias.md`, sem reescrever código.

### ✅ Pronto quando

`npm run lint` com 0 erros (a `vue/block-lang` transitória aceitando `lang="ts"`), `type-check` e `build` verdes + smoke (login → acervo → criar → editar). O `vue-tsc` com `allowJs` não deve acusar nada no JS atual; qualquer reclamação se resolve aqui, antes de migrar arquivo algum.

---

## Fase 2 — Tipos de contrato + folhas

**Objetivo:** criar o vocabulário de tipos e migrar os arquivos "folha" (sem estado, sem dependência de componentes). Risco baixo: nada consome os tipos ainda.

### 2a. Tipos de contrato (`src/types/`)

Fonte da verdade: **`docs/API.md`** espelhando `notion_api/lib/domains/books/schema.js` (Zod). **Espelhar, não importar**: os 5 repos são independentes.

| Arquivo | Conteúdo |
|---------|----------|
| `src/types/book.ts` | `Book` (contrato agrupado: `pages`, `seriesInfo`, `startEnd` — Decisão 005), `BookStatus`, `BookType`, `BookOptions`, `CreateBookInput`, `UpdateBookInput` |
| `src/types/auth.ts` | `SessionUser`, `LoginResponse`, `GuestUser` |
| `src/types/api.ts` | `Envelope<T>`, `Pagination`, `ApiError` (`{ code, message }`), `ListQuery` |
| `src/types/store.ts` | `BookLists`, `LoadingStates` (consumido na Fase 3) |

- **Sem enums** (compatível com `erasableSyntaxOnly`): usar `as const` + `satisfies Record<...>` nos mapas (`BOOK_STATUS_MAP`, `BOOK_STATUS_LABELS`).

### 2b. Folhas (ordem exata; sempre `git mv` para preservar histórico)

| # | Arquivos | Cuidado |
|---|----------|---------|
| 1 | `utils/validation.js` → `.ts` | funções puras; assinaturas fáceis |
| 2 | `utils/errorHandler.js` → `.ts` | `extractErrorMessage`/`logError` aceitam **`unknown`** (padrão TS para erro) |
| 3 | `constants/book.js`, `toast.js`, `formLayout.js` → `.ts` | `as const`; `TOAST_CONFIG` tipado como `PluginOptions` do vue-toastification |
| 4 | 4 composables → `.ts` (`useAnimatedModal` é o maior, 83 linhas) | tipar refs e callbacks |
| 5 | `router/index.js` → `.ts` | guard de auth: `to`/`from` de `RouteLocationNormalized` |
| 6 | 5 barrels `index.js` → `index.ts` | só renomear (`git mv`) |

### ✅ Pronto quando

Gate verde após cada lote 2b. Nenhum consumidor muda ainda — fase silenciosa.

---

## Fase 3 — Dados: serviço + stores

**Objetivo:** tipar o contrato inteiro de I/O. Maior valor por linha migrada; as stores herdam os tipos do serviço. Arquivos: `services/api.js` + `stores/bookStore.js` + `stores/userStore.js` (os 3 `.js` restantes; o `main.js` espera a Fase 4f).

**Ordem:** 3a (serviço) → 3b (userStore, menor) → 3b (bookStore). Se a store reclamar, o problema está no serviço (3a) — corrigir lá.

### Tipos novos em `src/types/` (complemento da Fase 2)

| Arquivo | Adição |
|---------|--------|
| `types/api.ts` | `DeleteResponse` (`{ success: boolean; id: string }` — API.md §DELETE), `MeResponse` (`{ user: SessionUser }` — API.md §/auth/me) |
| `types/store.ts` | `BookPagination` (`pageSize: number`, `currentCursor/nextCursor: string \| null`, `previousCursors: string[]`), `BookState` (agrupa listas + loading + pagination + filtros + `bookOptions: BookOptions \| null` + `error: string \| null`), `UserState` (`userActive: SessionUser \| GuestUser \| null`, `token: string \| null`, `isGuest`, `error`) |

### 3a. `services/api.js` → `api.ts`

`git mv src/services/api.js src/services/api.ts` (preservar histórico). Os tipos de endpoint abaixo já existem na Fase 2 (`Envelope<Book[]>`, `ListAllResponse`, `FinishedThisYearResponse`, `ListQuery`, `LoginResponse`, `BookOptions`); só `DeleteResponse`/`MeResponse` são novos.

| Item | Ação |
|------|------|
| `booksApi.list(options = {})` | `options: ListQuery = {}`; retorno `Promise<AxiosResponse<Envelope<Book[]>>>` |
| `params` do `list` | `const params: Record<string, string> = { pageSize: pageSize.toString(), search, searchBy, status }` (todos string, condicionais incluídos) |
| `params` do `finishedThisYear` | `Record<string, string \| number>` — `year`/`pageSize` entram como **number** (diferente do `list`; axios serializa ambos) |
| `listAll()` | `AxiosResponse<ListAllResponse>` (timeout 60 s mantido) |
| `get(id: string)` | `AxiosResponse<Book>` — o `:id` devolve o book **no topo**, sem envelope (API.md) |
| `create(data: CreateBookInput)` / `update(id: string, data: UpdateBookInput)` | `AxiosResponse<Book>` (201/200 + book mapeado) |
| `delete(id: string)` | `AxiosResponse<DeleteResponse>` (soft delete) |
| `options()` | `AxiosResponse<BookOptions>` |
| `finishedThisYear(options = {})` | `AxiosResponse<FinishedThisYearResponse>`; options inline `{ year?: number; pageSize?: number; startCursor?: string }` |
| `authApi.login(data: LoginBody)` | `LoginBody = { email: string; codigo: string }` (local, no serviço); retorno `AxiosResponse<LoginResponse>` |
| `authApi.me(config: AxiosRequestConfig = {})` | `AxiosResponse<MeResponse>` |
| Interceptor de request | `(config: InternalAxiosRequestConfig)` — tipar o parâmetro |
| Interceptor de response | `(error: AxiosError)` — `error.response?.status` / `error.config?.url` já são seguros com o tipo (nada de `any`) |

### 3b. Stores (`defineStore` com `state` tipado — manter padrão options API; **não** converter para setup store)

**`userStore.js` → `userStore.ts`** (começar por ele — 118 linhas)

| Ponto | Ação |
|-------|------|
| `GUEST_USER` | `satisfies GuestUser` — o `type: 'guest'` distingue do `SessionUser` do backend; a união tipada em `userActive` expõe isso |
| `state` | `(): UserState` — `userActive: SessionUser \| GuestUser \| null`, `token: string \| null`, `isGuest: boolean`, `error: string \| null` |
| `login({ email, codigo })` | tipar o parâmetro destruturado `{ email: string; codigo: string }`; retorno `Promise<SessionUser>` |
| `catch` do `login` | **gotcha TS:** com `strict`, a variável de `catch` é `unknown` → `error.response?.data?.message` não compila. Usar o guard `isAxiosError(error)` (export do axios) antes de ler `response`; a fallback continua `extractErrorMessage(error)` (já aceita `unknown` desde a Fase 2) |
| `catch` do `validateSession` | mesmo guard: `isAxiosError(erro) && erro.response?.status === 401` |
| `loadSession` | `JSON.parse(storedUser)` devolve `any` → `as SessionUser` no ponto de confiança (fronteira `localStorage`; o `validateSession` revalida contra o `/me` no boot, então o cast não é risco) |

**`bookStore.js` → `bookStore.ts`** (315 linhas)

| Ponto | Ação |
|-------|------|
| `createInitialState()` | anotar retorno `(): BookState`; `state: () => createInitialState()` e `$reset` (`Object.assign(this, createInitialState())`) herdam o tipo sem duplicar |
| `pagination` | `BookPagination` (ver tipos novos acima) |
| `searchBy` / `filterStatus` | `BookSearchMode` / `string` (`'all'` é o sentinel do backend) |
| `_fetchPaged` | **genérico** `_fetchPaged<T>({...})`: `key: keyof LoadingStates`, `loader: () => Promise<AxiosResponse<T>>`, `apply: (response: AxiosResponse<T>) => void`, `onError?: () => void`, `useToken?: boolean` — o `<T>` absorve `Envelope<Book[]>` (list) e `FinishedThisYearResponse` (thisYear) sem `any` |
| getter `getBookById` | retornar função exige anotação explícita: `(state) => (bookId: string): Book \| undefined => ...` (sem ela o inference do Pinia quebra) |
| `fetchBooksReadThisYear` | ⚠️ `apply` hoje faz `response.data.results \|\| response.data.data \|\| []` — com `FinishedThisYearResponse` tipado, `.data` não existe e o TS acusa. O `results` é garantido pelo contrato (API.md); **remover o fallback morto `.data.data`** e registrar em `analise-melhorias.md` (comportamento idêntico) |
| `createBook` / `updateBook` | `bookData: CreateBookInput` / `UpdateBookInput` |
| `_applyFilters(patches)` | `Partial<Pick<BookState, 'searchTerm' \| 'searchBy' \| 'filterStatus'>>` (o `Object.assign(this, patches)` continua) |
| Getters simples | `statusOptions` → `string[]` (o `\|\| BOOK_STATUS_FALLBACK` já fecha o tipo); contagens/flags inferem sozinhos |

### ✅ Pronto quando

- Gate verde após **cada** arquivo (3a → userStore → bookStore).
- Smoke completo: login, visitante, CRUD (criar/editar/excluir), busca com debounce, paginação (próxima/anterior), troca de pageSize, 401 → `/login`.
- `find src -name '*.js'` aponta só `main.js` (fecha a Fase 3; o `main.js` fica para a 4f).

### Gotchas específicos desta fase

- `catch` é `unknown` sob `strict` → guard `isAxiosError` do axios; **nunca** `any` ou `@ts-ignore`.
- Getter do Pinia que retorna função (`getBookById`) precisa de retorno anotado.
- `_fetchPaged` genérico é o que evita `any` nos dois envelopes distintos — não "resolver" com cast.
- Interceptors: `InternalAxiosRequestConfig` (request) e `AxiosError` (response) são os tipos que o próprio axios exporta; não reinventar.

---

## Fase 4 — 26 componentes `.vue` + `main.ts` (maior bloco)

Em cada componente: `<script setup lang="ts">`, props runtime → tipo, emits array → tipo. **Zero mudança de comportamento.**

### Regras de conversão

- **Props:** `defineProps({ x: { type: String, default: '' } })` → `withDefaults(defineProps<{ x?: string }>(), { x: '' })`. Só trocar o formato se os **defaults continuarem idênticos** (default que muda é bug visual silencioso).
- **Emits:** `defineEmits(['edit', 'delete'])` → `defineEmits<{ edit: [id: string]; delete: [id: string] }>()`; manter kebab-case no template.
- Comentário de 1 linha no topo continua obrigatório (regra do repo).
- Quiser mexer em lógica (ex.: emissão dupla do `FormField`), abrir item separado em `analise-melhorias.md` — **não misturar com a migração**.

### Lotes (primitivas → composição → telas)

| Lote | Componentes | Esforço |
|------|-------------|---------|
| **4a — primitivas** (10) | `Button`, `LoadingSpinner`, `StateHandler`, `BookCardSkeleton`, `FormSkeleton`, `FormSection`, `FormActions`, `ConfirmDialog`, `CardStatus`, `BookCover` | pequeno |
| **4b — formulário** (3) | `FormField.vue` (527 linhas; **sem mexer no bug de emissão dupla do v-model**), `Filters`, `Pagination` | médio |
| **4c — listas** (4) | `BookList`, `ReadingList`, `TBRList`, `ThisYearList` | médio |
| **4d — cartão/stack** (4) | `BookCard`, `CardFront`, `CardBack` (props aninhadas + flip 3D via GSAP), `CardIntro` (196 linhas) | médio |
| **4e — telas** (5) | `CreateBookView` (141), `LoginView`, `CardStackView` (265), `App.vue`, e por último `BookForm.vue` (708 linhas, maior arquivo do repo) | alto |
| **4f — entry** | `main.js` → `main.ts`; conferir `app.use(Toast, TOAST_CONFIG)` | pequeno |

> Inventário corrigido: o plano original esquecia `BookCover`, `CardIntro` e `CreateBookView` nos lotes (23 de 25); os 26 `.vue` estão todos acima.

### ✅ Pronto quando

Gate + smoke visual **por lote** (modais, flip, listas com capa, busca/paginação). Depois do 4f: `find src -name '*.js'` volta vazio.

---

## Fase 5 — Endurecimento e documentação

| # | Ação |
|---|------|
| 5.1 | Sem `.js` em `src/` → remover `allowJs` do `tsconfig.app.json`, apagar `jsconfig.json` e remover o bloco `app/transicao-script-js` do `eslint.config.js` (a `vue/block-lang` volta ao default `allowNoLang: false`, exigindo `lang="ts"` em todo `.vue`) |
| 5.2 | (Opcional, adiado de propósito) `noUncheckedIndexedAccess`: quebra `BOOK_STATUS_LABELS[status]` e `BOOK_SEARCH_PLACEHOLDERS[mode]`; se ativar, corrigir com **lookup tipado**, não com `!` |
| 5.3 | Gate final + smoke dos 6 fluxos de `TESTING.md` §5 |
| 5.4 | **ADR 011** em `DECISIONS.md`: migração incremental por camada, gating de tipo no build, tipos espelhados (não compartilhados) com o `notion_api` |
| 5.5 | Docs: `AGENTS.md` raiz (Stack → TypeScript; Comandos → `type-check`; Estrutura → `*.ts`), `CODE_STYLE.md` §10 (Type Checking deixa de ser "Nenhum"), `TESTING.md` §7, `ARCHITECTURE.md`, `README.md` |
| 5.6 | `ROADMAP.md` (item da TS ✅ com data) + `../analise-melhorias.md` (linha do tsconfig órfão ✅) + `KANBAN.md` (raiz) |

---

## Riscos e gotchas

- **Deploy:** com gate no build, `push` com erro de tipo falha na Vercel → rodar o gate local antes de todo push.
- **Nenhum shim esperado:** axios, pinia, vue-router, gsap, swiper, lucide-vue-next e vue-toastification publicam tipos próprios. Se algo reclamar, criar `src/types/<lib>.d.ts` dedicado; **nunca `any` contornando o erro**.
- **`vue-toastification` é `2.0.0-rc.5`**: lib menos estável do stack; se `TOAST_CONFIG` não casar com `PluginOptions`, ajustar o objeto (não ignorar o erro).
- **TS 6:** `verbatimModuleSyntax`/`erasableSyntaxOnly` → usar `import type`, sem enums; `paths` sem `baseUrl`.
- **`vue-tsc × TS 6`:** se o `npx vue-tsc -b` da Fase 1 reclamar do compiler, usar `typescript@~5.9` temporário e abrir issue no `vuejs/language-tools`; não adiar nem afrouxar o gate.
- **Ruído do `vue-tsc` em SFC JS:** se ele reclamar de template nos 26 `.vue` ainda em JS, `strictTemplates` já é `false` por default — não ligar nada novo; erro pré-existente → `analise-melhorias.md`.
- **Shim de `.vue`:** o `vue-tsc` resolve `.vue` nativamente; se ainda assim aparecer `TS2307: Cannot find module './App.vue'`, criar `src/types/vue-shim.d.ts` (`declare module '*.vue'` com `DefineComponent`) e registrar em `analise-melhorias.md` — **nunca** desligar o type check para passar.
- **Não tocar** no que já está resolvido (`_handleError`, toast, reset, `searchToken`) e respeitar os gotchas do `../AGENTS.md` (ex.: `publishedBy` é string, não array).
