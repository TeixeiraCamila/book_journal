# Security

## 1. Autenticação

Provedor:

`notion_api` (próprio) — `POST /api/auth/login` com email + código de acesso; emite **JWT HS256** (exp 30 dias).

Métodos:

- Email + código de acesso compartilhado manualmente
- Modo visitante (sem conta, sem token, só leitura)

Sessão no cliente:

`localStorage` (`SESSION_TOKEN`, `SESSION_USER`, `IS_GUEST`). Interceptor Axios anexa `Bearer` em toda requisição; `401` fora de `/api/auth/*` limpa a sessão e redireciona para `/login`.

Trade-off conhecido:

`localStorage` é acessível por JS (risco de XSS). Cookie HTTP-only está no roadmap (`ROADMAP.md`) — não adotar sem revisar `DECISIONS.md`.

---

## 2. Autorização

Perfis:

- **Usuário logado** (dona): CRUD completo
- **Visitante**: leitura apenas

Permissões:

| Ação | Logado | Visitante |
|---|---|---|
| GET (listas, detalhe, options) | sim | sim |
| POST/PATCH/DELETE books | sim | não |

Regra fundamental:

**A autorização é obrigatória no servidor** (`require_auth` do backend em todas as escritas). No cliente, ocultar botões de escrita para o visitante (`Filters` verifica `userStore.isGuest`) é só UX — nunca segurança.

---

## 3. Segredos

Regras:

- Nenhum segredo de produção no código ou no bundle
- `.env` está no `.gitignore` (nunca commitar)
- O backend guarda `AUTH_ACCESS_CODE` e `AUTH_JWT_SECRET` — fora do alcance deste frontend
- Nunca logar token, código de acesso ou header Authorization

---

## 4. Variáveis de Ambiente

Públicas (vão para o bundle):

`VITE_API_URL` — única variável; sem valor em dev (proxy Vite)

Privadas:

Nenhuma neste repositório (as do backend vivem no `notion_api`/Vercel). Ver `ENVIRONMENT.md`.

---

## 5. Segurança da API

Validação de input:

`BookForm` valida antes do envio; **Zod no backend é a validação real**. Não confiar em nada vindo do cliente.

Rate limiting:

Backend limita 3 req/s por IP — evitar loops de refetch.

CORS:

O backend aceita apenas origens fixas (mais `CORS_ORIGINS`); em dev o proxy do Vite evita CORS.

Autenticação/Autorização:

Header `Authorization` via interceptor; nunca montar requests autenticados fora de `services/api.js`.

---

## 6. Proteção de Dados

Dados sensíveis:

Apenas email do usuário logado. Nenhum dado de terceiro.

Encriptação:

Tráfego HTTPS (Vercel + Notion). Sem dados locais além do token.

Retenção/Exclusão:

DELETE no app = soft delete no Notion (recuperável no Notion).

---

## 7. Logging

Nunca logar:

- Token JWT
- Código de acesso
- Email completo em produção

Logar:

- Erros de ação via `logError` (`console.error` com ❌) — só `error` do Axios, sem headers
- Falhas de autenticação (mensagem, sem credenciais)

---

## 8. Uploads

Não há upload de arquivo. Capas são **URLs** coladas pelo usuário (`coverUrl`).

Riscos a considerar:

- URL de imagem de origem maliciosa: o `<img>` limita o risco, mas evitar `v-html` com conteúdo do usuário
- ⚠️ `CardBack.vue` usa `v-html` em `literaryAtlas` — conteúdo vem do Notion (editável só pela dona), risco aceito e baixo, mas **não copiar esse padrão** para campos de entrada livre de terceiros

---

## 9. Checklist de Segurança

- [x] Autenticação implementada (JWT no backend)
- [x] Autorização server-side em todas as escritas
- [x] Validação de input no cliente + Zod no servidor
- [x] Segredos fora do repositório (`.env` gitignored)
- [x] Sem dados sensíveis no `localStorage` além do token de sessão
- [x] Rate limiting considerado (backend)
- [x] Erros não expõem stack trace (formato `{ error, message, code }`)
- [ ] Sessão migrada para cookie HTTP-only (roadmap)
- [ ] `v-html` eliminado do `CardBack` (roadmap, baixa prioridade)
