# PRD — Product Requirements Document

## 1. Visão do Produto

#### Nome do Produto:

Book Journal

#### Descrição em uma linha:

SPA web para catalogar e acompanhar leituras pessoais (biblioteca pessoal), com dados persistidos no Notion via API própria.

#### Tipo de Produto:

Aplicação pessoal (ferramenta de uso próprio / Internal Tool)

#### Plataforma Primária:

Web (desktop e mobile via browser; app Android em estudo, ver `ROADMAP.md`)

---

## 2. Problema

#### Qual problema resolvemos?

Registrar leituras em planilhas ou no Notion manualmente é trabalhoso e não oferece visão rápida do que está em andamento, do que foi lido no ano e do que está na fila.

#### Por que esse problema importa?

A leitura é um hábito acompanhado ao longo do tempo. Quem lê sem registro estruturado perde o histórico de progresso e notas.

#### Como o usuário resolve isso hoje?

Planilhas, Goodreads/Storygraph ou o próprio database do Notion sem interface dedicada.

---

## 3. Objetivo

#### Objetivo Principal:

Ter uma interface rápida e agradável para cadastrar livros, acompanhar progresso de leitura e revisar o histórico no ano.

#### Objetivos Secundários:

- Consultar o acervo com busca e filtros sem carregar a página inteira
- Registrar conclusões de leitura por ano ("Lidos neste ano")
- Manter o dado vivo no Notion (fonte de verdade editável fora do app)

---

## 4. Usuários-alvo

### Tipo de Usuário 1 — Proprietária (dona)

#### Descrição:

Dono do database do Notion; única pessoa com conta real no sistema.

#### Necessidades:

- CRUD completo de livros (criar, editar, arquivar)
- Acompanhar leituras em progresso e definir a nota final
- Filtrar/buscar no acervo

#### Dores:

- Digitar os mesmos dados em vários lugares
- Não ter visão imediata do "lendo agora" e do "lido neste ano"

### Tipo de Usuário 2 — Visitante

#### Descrição:

Qualquer pessoa com o link, sem conta.

#### Necessidades:

- Apenas leitura do acervo e das listas

#### Limitações:

- Sem acesso a criação/edição; escritas no backend retornam 401

---

## 5. Histórias de Usuário

- Como usuária, quero entrar com email + código de acesso para salvar meus dados de leitura.
- Como usuária, quero entrar como visitante para consultar a estante sem conta.
- Como usuária, quero cadastrar um livro com título, autor, gêneros, série e tipo para organizar minha biblioteca.
- Como usuária, quero atualizar páginas lidas para acompanhar o progresso.
- Como usuária, quero marcar um livro como concluído e dar uma nota para registrar a experiência.
- Como usuária, quero buscar por título, autor ou gênero e filtrar por status para achar um livro rápido.
- Como usuária, quero ver os livros finalizados no ano agrupados por mês para revisar meu ano de leitura.

---

## 6. Funcionalidades Núcleo

### Feature 1 — Cadastro e edição de livro

#### Propósito:

Registrar um livro completo no acervo.

#### Fluxo do usuário:

`/criar` (ou `/editar/:id`) → `BookForm` → validação → `POST /api/books` (ou `PATCH /:id`) → toast de sucesso → redireciona ao slide da lista (`/?slide=1`).

#### Entradas:

título, autor (multi), status, nota (❤/⭐), páginas (total/atual), tipo, primeiro ano de publicação, "tenho cópia", anos de leitura, datas início/fim, URL da capa, atlas literário, gêneros (multi), editora, série + volume.

#### Saídas:

Livro persistido no Notion, refletido nas listas (main/TBR/leitura/ano).

#### Critérios de aceite:

- Título e autor são obrigatórios
- Auto-cálculo do campo atual quando informado o total de páginas Kindle (%)
- Preencher a data de fim auto-muda o status para "Read" e preenche o ano em "wasReadIn"
- Estados de loading (FormSkeleton) e erro com "Tentar novamente"

#### Casos de borda:

- ISBN/capa inexistente → placeholder
- Valores fora do catálogo do Notion (ex.: tipo desconhecido) → exibe o valor cru

### Feature 2 — Acervo com busca, filtros e paginação

#### Propósito:

Percorrer o acervo sem carregar a página inteira.

#### Fluxo do usuário:

Slide "Acervo" (`BookList`) → `Filters` (busca com debounce de 400 ms + radios de status) → `GET /api/books` → grid com `Pagination` (cursor-based).

#### Critérios de aceite:

- Busca por título/autor/gênero (`searchBy`) com debounce de 400 ms
- Respostas obsoletas descartadas (`searchToken`)
- Próxima/anterior via cursor; troca de `pageSize`
- Estados de loading (skeleton só na primeira carga), erro e vazio com textos distintos (com/sem filtro ativo)

### Feature 3 — Pilha de cartas (home)

#### Propósito:

Home navegável como pilha vertical de cartas.

#### Fluxo do usuário:

`/` → Swiper (EffectCards, vertical) com slides dinâmicos: intro → acervo → lendo → ano → TBR; slides vazios não aparecem; deep-link `?slide=N`.

#### Critérios de aceite:

- Slides de status só aparecem se houver livros
- Dados buscados conforme o slide ativo; chunks pré-carregados (produção)
- Animações respeitam `prefers-reduced-motion`

### Feature 4 — Autenticação e sessão

#### Propósito:

Proteger escritas e manter sessão.

#### Fluxo:

`/login` em 2 etapas → email + código → `POST /api/auth/login` → JWT guardado em `localStorage` → guard de rotas revalida no boot via `GET /api/auth/me` → modo visitante opcional.

#### Critérios de aceite:

- Rotas com `meta.requiresAuth` redirecionam para `/login`
- 401 fora do login limpa a sessão e redireciona
- Sessão persiste por reload (30 dias no backend)

---

## 7. Fora de Escopo (Non-Goals)

Fora desta versão:

- Cadastro/gerenciamento de múltiplos usuários no app
- Social (compartilhar, comentar, seguir)
- Busca por ISBN ou integração com APIs de livros (ex.: Google Books)
- App nativo / lojas (plano Capacitor em estudo, ver `ROADMAP.md`)
- Painel de estatísticas com gráficos: **fora de escopo definitivo**; o endpoint `/api/books/stats` é do `dashboard__journal` (Decisão 009, `DECISIONS.md`)

---

## 8. Escopo do MVP

Obrigatório:

- CRUD de livros via API
- Listagem com busca, filtro por status e paginação
- Modo visitante + login por código
- Responsividade e acessibilidade básica

Desejável:

- Slides dinâmicos da home (Swiper)
- Lista "Lidos neste ano"

Futuro:

- App mobile (Capacitor)
- Migração incremental para TypeScript
- Sessão em cookie HTTP-only

---

## 9. Métricas de Sucesso

Primárias:

- Fluxos críticos funcionam: login, criar, editar, buscar, filtrar
- Build de produção sem erros (Vercel)

Secundárias:

- Boa experiência em telas pequenas (media queries ativas)
- Busca responde sem corrida de condições (respostas obsoletas descartadas)

---

## 10. Restrições

Técnicas:

- Frontend 100% client-side (SPA); sem backend próprio
- Todo dado vem do Notion via `notion_api`; o schema do Notion é a fonte de verdade do dado
- Leituras (GET) são públicas no backend; escritas exigem JWT

De Negócio:

- Uso pessoal, single-user real
- Custo de infra: Vercel (front) + Notion (dados)

De Design:

- Tema "papel/caderno" (creme, pastéis, sombras) definido em `DESIGN_SYSTEM.md`

De Timeline:

- Sem prazo formal; evolução contínua (ver `ROADMAP.md`)

---

## 11. Premissas

- O database do Notion e suas propriedades existem e são mantidos fora do app
- O `notion_api` está implantado (Vercel) e expõe o domínio books + auth
- Existe uma única pessoa real com credenciais; o código de acesso é compartilhado manualmente
- O visitante nunca terá permissão de escrita

---

## 12. Questões em Aberto

- O modo visitante deve ocultar apenas botões de escrita ou também bloquear rotas `/criar` no guard?
~~Vale manter `HomeView.vue` (legacy, não usada) até quando?~~ **Resolvido: removida em 15/10/2026 (não era rota e importava componente inexistente).**

~~O endpoint `/api/books/stats` será consumido aqui ou exclusivo do `dashboard__journal`?~~ **Resolvido (Decisão 009): exclusivo do `dashboard__journal`; este app não terá estatísticas.**

---

## 13. Definição de Pronto (DoD)

A funcionalidade está considerada completa quando:

- [x] Requisitos implementados
- [x] Fluxos críticos de usuário funcionam (login, CRUD, busca)
- [ ] Testes passam (hoje sem suíte de testes, ver `TESTING.md`)
- [x] Build passa (`npm run build`)
- [x] Requisitos de segurança respeitados (token, escritas autenticadas no servidor)
- [x] Documentação atualizada (`docs/`, `KANBAN.md` na raiz)
