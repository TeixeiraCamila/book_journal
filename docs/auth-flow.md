# Fluxo de Autenticação — "a primeira ficha do arquivo"

Documentação da feature de autenticação do Book Journal: o que mudou, porquê, e como funciona ponta a ponta. Envolve dois repositórios:

- **Backend:** `notion_api` (Express + Notion SDK)
- **Frontend:** `book_journal` (Vue 3 + Pinia + Vue Router)

---

## 1. Porquê foi implementada

### O problema da autenticação anterior

O login antigo era **cosmético**. O `LoginView.vue` carregava a lista inteira de usuários do Notion (`GET /api/users`) e comparava **nome + email no navegador**:

1. O usuário digitava nome e email.
2. O front buscava na lista qual usuário `person` tinha aquele par.
3. Se existisse, gravava `USER_LOGADO` no `localStorage` e liberava a rota.

Falhas concretas:

| Falha | Consequência |
|---|---|
| Nenhum segredo em jogo | Qualquer pessoa que soubesse o nome e o email da dona entrava como dona |
| Matching client-side | A "checagem" rodava no bundle JS; dava pra burlar no devtools |
| Dependia de despejar todos os usuários | O `GET /api/users` por si só expõe o workspace inteiro ao navegador |
| Sessão sem expiração | `USER_LOGADO`/`IS_GUEST` ficavam soltos no `localStorage`, sem token nem validade |
| Botão "Entrar" e "Entrar como Visitante" no mesmo nível | Sem hierarquia visual — os dois pareciam a ação principal |

### O que o backend permitia

Investigação do `notion_api`:

- Os usuários do Notion (`notion.users.list`) são usuários **do workspace** — só têm `id`, `name`, `person.email`, `avatar_url`. **Não dá pra armazenar senha/código neles**.
- O header `X-User-Id` citado no `api-reference.md` **não existia no código** (era aspiração documental). Leituras eram públicas e escritas não autenticadas.
- O backend já tinha a infraestrutura pronta: Express 5 com `errorHandler` global, hierarquia de erros (incluindo `AuthenticationError` 401), Zod e rate limiter.

### A decisão

Depois de ver a resposta real de `GET /api/users` (um único usuário `person` — Teixeira — e três bots), ficou claro que **não precisava de banco de usuários novo** em Notion. O corte escolhido foi:

- **Um segredo no servidor** (`AUTH_ACCESS_CODE`), nunca no Notion e nunca no bundle.
- **Uma rota de login** (`POST /api/auth/login`) que valida o email contra um usuário real do workspace **e** o código contra a env var.
- **Sessão JWT** sem estado — sobrevive a cold starts do Vercel (cache em memória não sobreviveria).

Isso foi a **opção 1** do brainstorming (rota de login + JWT), escolhida por você depois de compararmos com a opção 2 (middleware de header).

---

## 2. Visão geral

```
LoginView (2 etapas)
   │  email + código
   ▼
POST /api/auth/login ──► valida contra usuário real do Notion + AUTH_ACCESS_CODE
   │                        (comparação timing-safe)
   ▼
{ token: JWT, user }  ──► salvo em SESSION_TOKEN / SESSION_USER (localStorage)
   │
   ▼
Toda request (Interceptor Axios) ──► add Authorization: Bearer <token>
   │
   ▼
POST/PATCH/DELETE /api/books ──► requireAuth (valida JWT) → 201/200
401 em qualquer rota (fora do login) ──► limpa sessão → volta pra /login
```

---

## 3. Backend (`notion_api`) — passo a passo

### 3.1 `lib/domains/auth/token.js`

JWT **HS256 assinado com HMAC** usando o `node:crypto` (zero dependências novas).

- `signToken(payload)` → monta `header.body.signature` com `iat` e `exp` (30 dias).
- `verifyToken(token)` → reconstrói a assinatura esperada e compara com **`timingSafeEqual`** (evita timing attack); depois checa a expiração.
- O segredo vem de `AUTH_JWT_SECRET` (env). Se não estiver configurado, lança `AuthenticationError`.

Porquê: token **stateless** significa que o servidor não precisa guardar sessão — cada request carrega a identidade. Em Vercel (serverless com cold start), sessão em memória morre; o JWT não.

### 3.2 `lib/domains/auth/middleware.js`

`requireAuth` — middleware Express:

- Lê o header `Authorization`, exige prefixo `Bearer `.
- Sem token → `AuthenticationError('Autenticação necessária')` (401).
- Chama `verifyToken`; em sucesso anexa o payload em `req.user`.

Usado nas rotas de escrita do books e no `GET /api/auth/me`.

### 3.3 `lib/domains/auth/schema.js`

Schema Zod do login:

- `email` opcional (se fornecido, precisa ser email válido)
- `name` opcional
- `codigo` obrigatório
- `refine` exige que pelo menos `name` **ou** `email` esteja presente

Aceitar nome ou email deixa o fluxo flexível; o email é o identificador robusto (único no workspace).

### 3.4 `lib/domains/auth/service.js`

O coração da checagem:

1. Pega o cliente Notion via `getUserClient()` (mesma lógica usada por `/api/users`).
2. Lista os usuários do workspace (com rate limit `limitedClientCall`, no mesmo domínio da rota de users para não furar o token bucket do Notion).
3. Procura um usuário do tipo **`person`** cujo `person.email` (ou `name`) bata com o enviado. **Bots são ignorados.**
4. Se não existe → `AuthenticationError('Esse email não está no arquivo.')`.
5. Compara o `codigo` com `AUTH_ACCESS_CODE` via `textMatches` (timing-safe).
6. Errado/ausente → `AuthenticationError('O código não confere.')`.
7. Acertou → monta o `user` (id, nome, email, avatar, `nivel: 'dona'`) e assina o token com `signToken`.

Porquê: a identidade vem do **usuário real do workspace** (mesmo dado que o `/api/users` expõe), mas o **segredo vive no servidor**. O navegador nunca conhece a lista de usuários nem o código; ele só envia `{ email, codigo }` e recebe o token.

### 3.5 `lib/domains/auth/controller.js`

- `handleLogin` — valida o body com o schema Zod (400 com `formatZodError` se inválido) e delega ao service. **Sem try/catch**: o Express 5 repassa rejeições ao `errorHandler` global.
- `handleMe` — devolve a identidade da sessão (`{ id, name, nivel }`) a partir do `req.user` já validado pelo `requireAuth`.

### 3.6 `lib/domains/auth/routes.js`

```js
router.post('/login', handleLogin);
router.get('/me', requireAuth, handleMe);
```

### 3.7 Registro no servidor

- `server.js`: monta `/api/auth` **apenas se** `AUTH_ACCESS_CODE` e `AUTH_JWT_SECRET` existirem no ambiente — mesmo padrão de "domínio ativo só com env válida" dos outros domínios.
- `lib/domains/index.js`: adiciona o domínio `auth` com `requiredEnvVars` (aparece na listagem de domínios da rota raiz).

### 3.8 Proteção das escritas — `lib/domains/books/routes.js`

```js
router.post('/', requireAuth, controller.create);
router.patch('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);
```

Leituras (`GET`) seguem públicas (dados do diário são compartilhados); só **mudar** o acervo exige sessão. Quem entrar como visitante fica read-only.

### 3.9 `notion_api/.env` / `.env.example`

```
AUTH_ACCESS_CODE=mapa-violino-97
AUTH_JWT_SECRET=<chave-aleatoria-de-32-bytes>
```

O `.env` local é gitignored; o `.env.example` documenta as variáveis para quem for montar do zero. Em produção, adicionar as duas no painel da Vercel.

---

## 4. Frontend (`book_journal`) — passo a passo

### 4.1 `src/services/api.js`

- `authAPI.login({ email, codigo })` → `POST /api/auth/login`
- `authAPI.me()` → `GET /api/auth/me`
- **Interceptor de request:** se existir `SESSION_TOKEN`, anexa `Authorization: Bearer <token>` em todas as chamadas. Nenhuma view/precisa se preocupar com o token.
- **Interceptor de response:** qualquer `401` **fora** das chamadas `/api/auth/*` e **fora** da página `/login` → limpa a sessão e redireciona para `/login`. Cuidado assim: o login que falhar mostra o erro (não redireciona) e uma sessão expirada no meio do uso te devolve à chegada.

### 4.2 `src/stores/userStore.js`

A sessão virou um objeto no `localStorage`:

| Chave | Conteúdo |
|---|---|
| `SESSION_TOKEN` | JWT assinado (30 dias) |
| `SESSION_USER` | JSON `{ id, name, email, avatar_url, nivel }` |
| `IS_GUEST` | `'true'` quando em modo visitante |

Ações:

- `login({ email, codigo })` → chama `authAPI.login`, persiste token+user, `isGuest = false`. Na falha, guarda a **mensagem do backend** (ex.: "O código não confere.") em `this.error`.
- `loadSession()` → restaura token+user, ou o modo visitante; devolve `true/false`.
- `setGuestUser()` → sessão de leitura **sem token** — visitante não escreve.
- `logout()` → limpa estado e as três chaves.

Removidos os antigos `setActiveUser`/`loadActiveUser`/`initGuestSession`/`clearActiveUser` e o padrão quebrado `const { _handleError } = extractErrorMessage()` (extraia string → `_handleError` virava `undefined` e o catch estourava `TypeError`).

### 4.3 `src/router/index.js`

Guard reescrito usando a store:

```js
const hasSession = userStore.userActive !== null || userStore.loadSession();
const isAuthenticated = hasSession;
```

- Rota protegida sem sessão → `/login`.
- `/login` com sessão → `/` (home). Sem checagens manuais de `localStorage` na guard.

### 4.4 `src/views/LoginView.vue` — duas etapas

Proposta visual "a primeira ficha do arquivo": o login como o primeiro cartão que sai da máquina de escrever, com o mesmo vocabulário do diário (papel, pastel, carimbo).

- **Etapa 1 (Chegada):** cartão com "Diário de Leitura". Ação primária **"Entrar no diário"**; o visitante vira um link discreto **"Só observar"** — sai da disputa visual com o login.
- **Etapa 2 (Entrada):** campos **email** e **código de acesso**, botão **"Registrar"**, link "Voltar". Erros aparecem na voz do arquivo ("O código não confere."), com `role="alert"`/`aria-live="polite"`.
- Mantém a animação `ejectCard` já amada, respeitando `prefers-reduced-motion`.
- O `onMounted` não precisa mais despejar `fetchUsers()` — o backend valida.

### 4.5 `src/App.vue` — Logout

Botão **"Sair"** flutuante (topo direito), visível quando `route.name !== 'login'` e existe sessão. Chama `userStore.logout()` e volta para `/login`. Antes não existia logout nenhum.

---

## 5. Como funciona, passo a passo (fluxo de ponta a ponta)

1. **Chegada** — quem abre o app cai em `/login` (a menos que já tenha sessão).
2. **Escolha** — "Entrar no diário" (conta) ou "Só observar" (visitante).
3. **Credenciais** — a dona digita email + `AUTH_ACCESS_CODE`.
4. **Validação no servidor** — o backend confere se o email é de um `person` real do workspace **e** se o código confere. Nada disso roda no navegador.
5. **Token** — com sucesso, recebe `{ token, user }`; o front guarda `SESSION_TOKEN`/`SESSION_USER` e vai pra home.
6. **Uso** — toda request sai com `Authorization: Bearer <token>`. Escritas no acervo são aceitas; leituras, públicas.
7. **Expiração/erro** — um `401` fora do login limpa a sessão e devolve ao `/login`. Na página de login, o `401` do próprio `POST /login` só mostra a mensagem.
8. **Saída** — "Sair" limpa tudo e volta para `/login`.
9. **Visitante** — entra sem token, navega e lê; os controles de escrita (criar/editar, ações do card) ficam ocultos e, se tentados por URL, o backend responde 401.

---

## 6. Modelo de ameaças (o que isso resolve e o que não resolve)

| Ameaça | Status |
|---|---|
| Burlar o login pelo devtools | Resolvido — a checagem é no servidor |
| Saber o nome/email e entrar como a dona | Resolvido — exige o `AUTH_ACCESS_CODE` |
| Lê o código no bundle do front | Resolvido — o segredo só existe no `.env` do backend |
| Token roubado do `localStorage` | **Não resolve** — quem pegar o token consegue usar; mitigação normal é HTTP-only cookie, o que exigiria refatorar o backend para cookie e é além do escopo |
| Força bruta do código | Parcial — resposta timing-safe, mas sem rate limit de tentativas de login no servidor (possível próximo passo) |
| Vazamento do `.env` | Evitado por gitignore; em produção, o painel da Vercel guarda as vars |

---

## 7. Configuração necessária

**Local:**
- `notion_api/.env` → `AUTH_ACCESS_CODE=mapa-violino-97` e `AUTH_JWT_SECRET` (já criadas).
- Reiniciar o servidor (`npm run dev`) para carregar as novas envs.

**Produção (Vercel):**
- Adicionar `AUTH_ACCESS_CODE` e `AUTH_JWT_SECRET` no projeto da API.
- O conselho de segurança: trocar o código e a secret por valores próprios (o do `.env` local é só para dev).

**Frontend:** sem variável nova — o `VITE_API_URL` existente já aponta para o backend.

---

## 8. Possíveis próximos passos

- Rate limit de tentativas de login no servidor (`AUTH_LOGIN_MAX_ATTEMPTS`), para frear força bruta.
- `GET /api/auth/me` já existe; usar no boot do app para revalidar o token (hoje a guard apenas confia no `localStorage`).
- Migrar o cookie HTTP-only para sessão em navegador (removeria o ataque por roubo de `localStorage`).
- Gerenciar "lembrar deste navegador" (token de curta duração + refresh token).