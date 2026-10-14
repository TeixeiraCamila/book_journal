# Error Handling

## Filosofia

Nenhuma falha pode deixar a tela em branco. Todo componente com dado remoto tem estados de **loading / erro / vazio**, e erros viram mensagem pt-BR + ação de retry. A lógica central vive em `src/utils/errorHandler.js`.

---

## 1. Camadas

1. **Validação de campo** (client-side) — `utils/validation.js` + `field_errors` por campo no `BookForm`; bloqueia o envio
2. **Store** — `_handle_error(action, error)` loga (`log_error`, ❌) e expõe `store.error` (`extract_error_message`)
3. **View/Componente** — renderiza estado de erro com retry ou toast de erro
4. **Interceptor Axios** — 401 global (sessão) — ver § 4

---

## 2. Erros de API (mapeamento do cliente)

`extract_error_message(error)`:

| Situação | Mensagem exibida |
|---|---|
| `message` do backend presente | usa a do backend (ex.: "O código não confere.") |
| 400 | "Dados inválidos. Verifique as informações enviadas." |
| 401 | "Não autorizado. Verifique suas credenciais." |
| 404 | "Recurso não encontrado." |
| 500 | "Erro no servidor. Tente novamente mais tarde." |
| Outro status | `error.message` do Axios |
| Sem `response` (rede/timeout) | "Erro de conexão. Verifique sua internet." |
| Sem erro | "Erro desconhecido" |

Formato vindo do backend: `{ error, message, code }` (sem stack). Validação Zod: `{ error, message, details[] }`.

---

## 3. Estados de Erro por Tela

| Tela/Componente | Comportamento |
|---|---|
| `BookList` | ⚠️ + `bookStore.error` + botão "Tentar Novamente" (`fetch_books()`) |
| `ReadingList` / `TBRList` / `ThisYearList` | estado de erro próprio com retry (repetição a eliminar — `ROADMAP.md`) |
| `CreateBookView` | "Erro ao carregar livro" + "Tentar novamente" (`load_book`) |
| `BookForm` | erros por campo (`field_errors`); falha de API → toast de erro |
| `LoginView` | mensagem inline no formulário; formulário permanece utilizável |
| Falha de `/books/options` | silenciosa: fallback para `constants/book.js` |

---

## 4. Sessão (401)

Regra do interceptor (`services/api.js`):

- `401` em requisição que **não** é `/api/auth/*` e **não** está na página `/login` → limpa `SESSION_TOKEN`/`SESSION_USER` e redireciona para `/login` (`window.location.href`)
- `401` no `POST /auth/login` → tratado na tela (mensagem do backend)
- No boot, `validate_session()` chama `/auth/me` (timeout 5 s): **só 401 derruba a sessão**; rede/timeout/5xx mantêm o login (falha de rede não prova token inválido)

---

## 5. Falhas de Rede e Timeout

- Timeout padrão 10 s (`/all` 60 s, `/auth/me` 5 s) → cai em "Erro de conexão"
- Retry: sempre manual (botão), nunca automático
- Busca durante requisição em voo: resposta obsoleta descartada (`search_token`) — não é erro, é corrida resolvida

---

## 6. Estados Especiais

Vazio:

Não é erro. Texto muda conforme há filtro ativo ("Tente ajustar seus filtros") ou não ("Comece adicionando seu primeiro livro!").

Modo visitante:

Escritas bloqueadas por UX no cliente; se o backend responder 401 (ex.: token removido), o interceptor derruba a sessão normalmente.

---

## 7. Mensagens ao Usuário

- Idioma: **pt-BR** sempre
- Tom: direto, sem jargão técnico ("Erro no servidor", não "Exception 500")
- Feedback de sucesso/erro de escrita: toast (`use_notifications`), 3 s
- Nunca exibir stack trace, URL interna ou corpo cru da resposta

---

## 8. Regras para Novos Erros

1. Mensagem pt-BR com fallback ("Erro desconhecido" como última instância)
2. Log com `log_error` (console, ❌) — sem credenciais
3. Avisar o usuário **e** oferecer retry quando a ação for recuperável
4. Nunca `catch` vazio
5. Erro novo recorrente de API → atualizar este doc e, se for mudança de contrato, `API.md`
