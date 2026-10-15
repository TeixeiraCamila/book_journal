# Decisões de Arquitetura

Registro das decisões técnicas que já foram tomadas — para não redecidir o que já foi resolvido. Novas decisões entram aqui com o próximo número.

---

## Decisão 001 — Paginação por cursor (Notion)

Data: 2026 (consolidada)

Status: Aceita

Contexto:

A API do Notion pagina por cursor; paginação numérica clássica não existe no backend.

Decisão:

`GET /api/books` com `startCursor` + `pageSize`; store mantém pilha `previousCursors` para o botão "anterior" (`bookStore.nextPage`/`previousPage`).

Alternativas:

- Carregar tudo com `/books/all`
- Offset numérico simulado

Consequências:

- Positivo: paginação estável com dados mudando no Notion
- Trade-off: voltar depende da pilha local (reset em nova busca); "anterior" não funciona após reload

---

## Decisão 002 — Token JWT em `localStorage`

Data: 2026-09-17 (commit `f856ef4` "autentica por código de acesso com sessão JWT")

Status: Aceita (alternativa em avaliação)

Contexto:

Login por código de acesso emitindo JWT de 30 dias; SPA sem SSR.

Decisão:

Guardar `SESSION_TOKEN`/`SESSION_USER` no `localStorage`; interceptor anexa `Bearer`; 401 global redireciona para `/login`.

Alternativas:

- Cookie HTTP-only (planejado — `ROADMAP.md`)
- Memória apenas (perdia sessão no reload)

Consequências:

- Positivo: sessão persiste por 30 dias; implementação simples
- Trade-off: exposto a XSS; mitigado por app sem conteúdo de terceiros e `v-html` restrito

---

## Decisão 003 — Modo visitante simulado no cliente

Data: 2026 (consolidada)

Status: Aceita

Contexto:

Queria-se permitir "entrar sem conta" para só leitura.

Decisão:

Sessão fake no cliente (`IS_GUEST=true`, usuário `Visitante`); autorização real é do backend (escritas exigem JWT). UI oculta ações de escrita para o visitante.

Alternativas:

- Conta pública real no backend
- Modo anônimo com token de leitura

Consequências:

- Positivo: zero mudanças no backend; leitura 100% pública já é o contrato da API
- Trade-off: "segurança" do visitante é só UX — qualquer um pode chamar a API de escrita sem token (e levará 401)

---

## Decisão 004 — Constantes locais como fallback do catálogo do Notion

Data: 2026 (consolidada)

Status: Aceita

Contexto:

Status, tipos e notas vêm de `GET /api/books/options` (catálogo do Notion), mas o form e os labels precisam funcionar quando a chamada falha.

Decisão:

`constants/book.js` guarda fallbacks (`BOOK_STATUS_FALLBACK`, `BOOK_TYPES_FALLBACK`, labels pt-BR); a store usa `opção do backend || fallback`.

Consequências:

- Positivo: UI nunca fica sem opções
- Trade-off: catálogo duplicado — se mudar no Notion, o fallback fica defasado (aceito; é só fallback)

---

## Decisão 005 — Contrato agrupado do livro (`pages`, `seriesInfo`, `startEnd`)

Data: 2026-10-05 (commit `f5fcdd8` "adota o contrato agrupado do livro")

Status: Aceita

Contexto:

O backend agrupa campos relacionados em objetos aninhados; versões anteriores do front enviavam campos achatados.

Decisão:

Enviar/receber `pages: { totalPages, currentlyPage }`, `seriesInfo: { bookSeries, volume }`, `startEnd: { start, end }` conforme `DATABASE.md`. Formulário mantém o shape agrupado até no `formData`.

Consequências:

- Positivo: contrato único, sem mapeamento ad-hoc
- Trade-off: `v-model` em objeto aninhado exige cuidado no reset (repovoar `seriesInfo` por chave)

---

## Decisão 006 — Home como pilha de cartas com slides dinâmicos

Data: 2026-10-02 (commit `e4e520c` "torna slides dinamicos conforme os dados")

Status: Aceita

Contexto:

A home é um Swiper (EffectCards vertical). Listas "Lendo", "Ano" e "TBR" não fazem sentido quando vazias.

Decisão:

Slides definidos por tipo lógico (`LOGICAL_SLIDES`) e filtrados por dados; dados buscados conforme o slide ativo (`fetchDataForType`); chunks pré-carregados em produção; deep-link `?slide=N`.

Consequências:

- Positivo: home viva e enxuta; carregamento por demanda
- Trade-off: Swiper precisa de `update()` quando a lista de slides muda; índice de `?slide=` é do slide visível, não do lógico

---

## Decisão 007 — Revalidação de sessão uma única vez no boot

Data: 2026-10-13/14 (em desenvolvimento, não commitado)

Status: Aceita

Contexto:

`localStorage` não prova que o token ainda é aceito pelo backend (expira em 30 dias).

Decisão:

Guard de rotas chama `userStore.validateSession()` (`GET /api/auth/me`, timeout 5 s) **uma vez por carga de app** (flag `sessaoRevalidada`). **Só 401 derruba a sessão** — rede/timeout/5xx mantêm o login, pois não provam token inválido.

Consequências:

- Positivo: sem revalidar a cada navegação; login não cai por instabilidade momentânea
- Trade-off: token revogado pode sobreviver até o próximo 401 real

---

## Decisão 008 — Migração de identificadores de snake_case para camelCase

Data: 2026-10-15

Status: Aceita

Contexto:

O `AGENTS.md` da raiz (bloco comum aos 5 repositórios) pedia `snake_case` para identificadores próprios. No `book_journal`, o restante do ecossistema já era camelCase: chaves de payload/query da API (`wasReadIn`, `pageSize`, `startCursor`), props Vue (`isEdit`, `modelValue`) e nomes de arquivos (`bookStore.js`, `useBookFormatters.js`). A assimetria forçava tradução mental em toda camada de fronteira.

Decisão:

Renomear **todos os identificadores JS** de `src/` para camelCase: variáveis, funções, parâmetros, getters/actions e estado da Pinia (`form_data` → `formData`, `fetch_books` → `fetchBooks`, `use_book_store` → `useBookStore`). Constantes permanecem em SCREAMING_SNAKE_CASE (`BOOK_STATUS_MAP`, `DEFAULT_PAGE_SIZE`).

Fora de escopo (continuam como estão):

- Classes CSS e custom properties BEM (`card_back__text`, `--accent_muted`, `--button_color`)
- Chaves de contrato do backend (`has_more`, `next_cursor`, `avatar_url` — ver `API.md`)
- Nomes de assets/paths (`card_this_year/left_top.webp`) e de outros repos (`notion_api`)

Alternativas:

- Manter snake_case só no JS (assimetria permanente com API/props)
- Renomear também CSS e chaves de API (quebraria contrato e BEM)

Consequências:

- Positivo: fronteiras consistentes — o que vem da API/props já chega em camelCase e não precisa de mapeamento
- Trade-off: diverge do bloco comum do `AGENTS.md` raiz (que segue snake_case para os outros 4 repos) — a divergência está marcada no `AGENTS.md` deste repo
- Ação: comentários e docs do projeto atualizados junto com o código
