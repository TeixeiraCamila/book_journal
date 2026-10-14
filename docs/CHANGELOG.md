# Changelog

Mudanças relevantes do `book_journal`. Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/); versionamento por data (app sem releases formais — `package.json` em `0.0.0`).

---

## [Não lançado]

### Adicionado

- Revalidação de sessão no boot: `GET /api/auth/me` uma única vez no guard de rotas; só 401 derruba a sessão (`DECISIONS.md` 007) — *em desenvolvimento*

### Adicionado (docs)

- Documentação completa em `docs/` segundo o modelo "Vibe Coding Blueprint": PRD, DESIGN_SYSTEM, UX_FLOWS, ARCHITECTURE, DATABASE, API, SECURITY, CODE_STYLE, TESTING, AGENTS, ENVIRONMENT, ERROR_HANDLING, DEPLOYMENT, OBSERVABILITY, DECISIONS, ROADMAP, CHANGELOG

---

## [2026-10-13]

### Adicionado

- `KANBAN.md` na raiz (board consolidado dos 5 repositórios) e plano de app mobile com Capacitor

### Alterado

- Remoção de blocos de CSS mortos comentados (`CardIntro`, `FormField`)
- Comentários do código traduzidos para pt-BR

---

## [2026-10-05]

### Corrigido

- Adoção do contrato agrupado do livro (`pages`, `seriesInfo`, `startEnd`) (`DECISIONS.md` 005)
- Exibição de tipos de livro sem emoji

### Adicionado

- Busca por título, autor ou gênero (`searchBy`) com radios de status e debounce de 400 ms

---

## [2026-10-02]

### Alterado

- Slides da home tornados dinâmicos conforme os dados (`DECISIONS.md` 006)
- Lista "Lidos no ano" passa a usar a rota `/books/finished-this-year`
- Nome do campo de leitura do ano padronizado

### Corrigido

- `useBookFormatters` aceita autor único como string (não só array)

---

## [2026-09-25]

### Alterado

- `userAPI` renomeado para `authAPI`; login por nome removido (só email + código)
- Código morto de listagem de usuários removido

### Corrigido

- Backgrounds dos cards atualizados

---

## [2026-09-21]

### Alterado

- Identificadores próprios padronizados em snake_case em todo o código
- `AGENTS.md` adicionado na raiz; revisão editorial de README e docs
- CSS e imagens dos cards do acervo atualizados

---

## [2026-09-17]

### Adicionado

- **Autenticação por código de acesso com sessão JWT** (login em 2 etapas, interceptor 401, guard de rotas) (`DECISIONS.md` 002)

### Alterado

- Visual do login alinhado ao vocabulário do projeto (typewriter, fitas)
- README traduzido para inglês

### Corrigido

- Variantes do `Button` ativadas; vermelho de erro unificado (`--danger`)

---

## [2026-08-28]

### Alterado

- `vue-toastification` como única lib de toast, com CSS isolado dos estilos globais
- Configuração de toast centralizada em `constants/toast.js`

---

## [2026-07-28]

### Alterado

- Duplicações eliminadas: formatters (`useBookFormatters`), error handling (`errorHandler.js`), config de toast, modal
- `CardStatus` centraliza a exibição de estrelas
- Assets e layout de `ReadingList` atualizados

### Corrigido

- `calculateProgress`, import de `useBookFormatters`, flex do tablet, guard do `errorHandler`

---

## [2026-07-23]

### Alterado

- Classes CSS migradas para BEM; imports e caminhos de assets com alias `@/`
- Remoção de código morto e ajustes de layout/lint

---

## [2026-06-14]

### Adicionado

- Seção "Lidos neste ano" com agrupamento por mês
- Progresso Kindle (auto-cálculo de página atual), auto-preenchimento de ano de leitura, filtro visível

---

## [2026-05-25]

### Adicionado

- Multi-select para gêneros substituindo autocomplete

### Removido

- `StatsList` (estatísticas e Chart.js saem do escopo do app — ver `ROADMAP.md`)

---

## [2026-05]

### Adicionado

- CRUD de livros, listagem com busca/filtros, paginação por cursor, card com flip 3D, modo visitante, estados de loading/erro/vazio, responsividade e deploy na Vercel (MVP)
