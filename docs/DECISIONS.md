# Decisões de Arquitetura

Registro das decisões técnicas que já foram tomadas — para não redecidir o que já foi resolvido. Novas decisões entram aqui com o próximo número.

---

## Decisão 001 — Paginação por cursor (Notion)

Data: 2026 (consolidada)

Status: Aceita

Contexto:

A API do Notion pagina por cursor; paginação numérica clássica não existe no backend.

Decisão:

`GET /api/books` com `startCursor` + `pageSize`; store mantém pilha `previous_cursors` para o botão "anterior" (`bookStore.next_page`/`previous_page`).

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

Enviar/receber `pages: { totalPages, currentlyPage }`, `seriesInfo: { bookSeries, volume }`, `startEnd: { start, end }` conforme `DATABASE.md`. Formulário mantém o shape agrupado até no `form_data`.

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

Slides definidos por tipo lógico (`LOGICAL_SLIDES`) e filtrados por dados; dados buscados conforme o slide ativo (`fetch_data_for_type`); chunks pré-carregados em produção; deep-link `?slide=N`.

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

Guard de rotas chama `userStore.validate_session()` (`GET /api/auth/me`, timeout 5 s) **uma vez por carga de app** (flag `sessao_revalidada`). **Só 401 derruba a sessão** — rede/timeout/5xx mantêm o login, pois não provam token inválido.

Consequências:

- Positivo: sem revalidar a cada navegação; login não cai por instabilidade momentânea
- Trade-off: token revogado pode sobreviver até o próximo 401 real
