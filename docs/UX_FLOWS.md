# UX Flows

Jornadas reais do usuário, mapeadas a partir das views e do router.

## Rotas disponíveis

| Rota | View | Auth |
|---|---|---|
| `/login` | `LoginView` | pública (autenticado é redirecionado para `/`) |
| `/` | `CardStackView` | `requiresAuth: true` (aceita visitante) |
| `/criar` | `CreateBookView` | `requiresAuth: true` |
| `/editar/:id` | `CreateBookView` (modo edição) | `requiresAuth: true` |

---

## Fluxo 1 — Login (duas etapas)

1. Usuário abre `/login` e vê a etapa "chegada" (`step = 'entry'`) com o título "Diário de Leitura"
2. Clica em "Entrar no diário" → avança para a etapa "form"
3. Informa email + código de acesso
4. Submit chama `userStore.login({ email, codigo })` → `POST /api/auth/login`
5. Sucesso: token + usuário no `localStorage`, redireciona para `/`
6. Falha: mensagem do backend exibida na tela (ex.: "O código não confere.")

Sucesso:

Sessão JWT persistida (30 dias no backend); guard de rotas aceita.

Falha:

Mensagem de erro inline + formulário permanece disponível para nova tentativa.

---

## Fluxo 2 — Modo visitante

1. Na etapa "chegada", clica em "Entrar como visitante"
2. `userStore.set_guest_user()` cria sessão fake (`IS_GUEST=true`, sem token)
3. Redireciona para `/`

Resultado esperado:

Leitura liberada; escritas falham no backend (401) e as ações de escrita devem ficar ocultas para o visitante (`Filters` verifica `userStore.is_guest`).

---

## Fluxo 3 — Home (pilha de cartas)

1. Usuário autenticado/visitante acessa `/`
2. Swiper renderiza slides **visíveis**: intro → acervo → lendo (se houver) → lidos no ano (se houver) → TBR (se houver)
3. Ao navegar para um slide, os dados correspondentes são buscados (`fetch_data_for_type`)
4. Slides de status sem livros simplesmente não aparecem; o Swiper recalcula (`swiper.update()`)

Deep link:

`/?slide=2` abre direto no slide de índice 2 (índice do slide visível, com clamp para o máximo disponível).

Loading State:

Cada lista assíncrona mostra `LoadingSpinner` enquanto o chunk baixa (`defineAsyncComponent`).

---

## Fluxo 4 — Acervo (lista principal)

1. Slide "acervo" monta `BookList` → `fetch_book_options()` + `fetch_books()` em paralelo
2. Grid mostra skeletons apenas na primeira carga
3. Usuário digita na busca (debounce 400 ms) ou troca o modo (título/autor/gênero) ou o radio de status
4. `Pagination` navega por cursor (próxima/anterior); `page_size` ajustável
5. Clicar num card (editar) → `/editar/:id`

Empty State:

Sem filtros: "Comece adicionando seu primeiro livro!"; com filtro: "Tente ajustar seus filtros de busca".

Error State:

⚠️ + mensagem + botão "Tentar Novamente" (refaz `fetch_books()`).

---

## Fluxo 5 — Criar livro

1. Botão em `Filters` (visível só para usuário não-visitante) → `/criar`
2. `CreateBookView` renderiza `BookForm` (sem skeleton, sem carga prévia)
3. Preenchimento: título/autor obrigatórios; gêneros multi-select; opções (status, tipo, autor, série, gênero, ano) vêm de `/api/books/options` com fallback local
4. Regras automáticas do formulário:
   - Kindle + "Lendo": campo de progresso % que auto-calcula `currentPage`
   - Preencher `endDate`: auto-muda status para "Read" e preenche `wasReadIn` com o ano
5. Submit → `create_book()` → `POST /api/books` → refaz listas → toast de sucesso → volta para `/?slide=1`

Error State:

Erros de validação aparecem por campo (`field_errors`); erros de API viram toast.

---

## Fluxo 6 — Editar livro

1. Acesso via card do acervo → `/editar/:id`
2. `load_book()` tenta achar na store; se ausente, busca `GET /api/books/:id`
3. Form pré-preenchido (`fill_form_from_book`); datas de leitura (string, "start/end" ou objeto) normalizadas para os campos
4. Submit → `PATCH /api/books/:id` → `reload_current_page()` → toast → `/?slide=1`
5. Arquivar (delete) é um `DELETE` (soft delete no Notion) com `ConfirmDialog`

Loading State:

`FormSkeleton` enquanto carrega.

Error State:

"Erro ao carregar livro" + botão "Tentar novamente" (`load_book`).

---

## Fluxo 7 — Sessão expirada (401)

1. Qualquer requisição (fora de `/api/auth/*` e da página `/login`) retorna 401
2. Interceptor do Axios limpa `SESSION_TOKEN`/`SESSION_USER` e redireciona para `/login` via `window.location.href`
3. No boot, o guard revalida uma única vez via `GET /api/auth/me`; só 401 derruba a sessão (rede/timeout/5xx mantêm o login)

---

## Estados globais obrigatórios (resumo)

Todo componente que consome dado deve ter:

- **Loading** — skeleton/spinner (nunca tela em branco)
- **Vazio** — ícone + título + texto contextual
- **Erro** — mensagem + retry
- **Sucesso** — toast (escritas) ou conteúdo (leituras)
- **Desabilitado** — visitante sem permissão de escrita
