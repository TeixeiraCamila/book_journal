# AGENTS.md: book_journal

SPA Vue 3 para catalogar e acompanhar leituras (biblioteca pessoal). Consome o `notion_api` (domínio **books**) para CRUD de livros, listagem, estatísticas e autenticação.

## Convenções comuns a todos os projetos

### Idioma

- Código de produção, comentários e erros retornados ao cliente: **pt-BR**.
- README.md é o único arquivo de documentação em **inglês** (onde aplicável); o restante (`docs/`, `AGENTS.md`, comentários) é pt-BR.

### Commits (Conventional Commits)

Formato:

```
<type>(<escopo opcional>): <descrição em português>
```

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `refactor:` refatoração sem mudança de comportamento
- `docs:` documentação
- `chore:` manutenção (deps, config, etc.)
- `style:` formatação/CSS sem mudança de lógica

Regras:

- **Só commitar quando o usuário pedir explicitamente** ("faça commit", "commita", "comita"...)
- Commits atômicos: um commit por funcionalidade/mudança lógica
- Merge commits: manter o padrão gerado pelo Git
- **A cada 5 commits locais** (desde o último push), rodar `git pull` automaticamente

### Comentários

- Explicam o _que_ e o _porquê_, não o _como_ (o código já mostra o como)
- Topo de arquivo: 1 linha descrevendo a responsabilidade
- Topo de função/componente: 1–2 linhas
- Inline: reservado para lógica não óbvia ou decisão de design
- Marcadores visuais em logs: ✅ ❌ 🔍 ⚡ 📝
- Máximo 3 linhas por comentário

### JavaScript

- Identificadores próprios (variáveis, funções e parâmetros) em **snake_case**
- Componentes, chaves de dados/API e APIs de bibliotecas seguem a convenção do ecossistema

## Comandos

- `npm run dev`: servidor de desenvolvimento (Vite).
- `npm run build`: build de produção.
- `npm run lint`: ESLint (flat config). Rodar após edições.
- `npm run format`: Prettier (`--write src/`).
- `npm run vercel-build`: build de produção para a Vercel.

## Stack

- **Vue 3** com Composition API e `<script setup>` em todos os componentes.
- **Pinia**: stores por domínio (`bookStore`, `userStore`).
- **Vue Router 4**: views lazy-loading + navigation guard de auth.
- **Vite 7** com alias `@/` e proxy `/api → http://localhost:3000` em dev.
- **Axios**: client centralizado em `services/api.js`.
- **GSAP + VueUse Motion**: animações; **Swiper**: sliders/carousels.
- **lucide-vue-next** (ícones) e **vue-toastification** (toasts).

## JavaScript

- Single quotes `'`
- Ponto e vírgula obrigatório (`.prettierrc.json` com `semi: true`)
- `const` / `let` (nunca `var`)
- snake_case
- Função: JSDoc-style `/** */` com descrição curta

## Componentes Vue

- PascalCase para arquivos e pastas de componentes (`BookCard/BookCard.vue`)
- Comentário descritivo de 1 linha no topo de cada componente (`<script setup>`)
- Barrel exports (`index.js`) em cada pasta de componentes
- Imports com alias `@/`
- `defineProps`/`defineEmits` para props/eventos
- `Teleport` para modais; `transition`/animações respeitando `prefers-reduced-motion`
- CSS escopado (`<style scoped>`)

## CSS: BEM

```css
.block {
}
.block__element {
}
.block--modifier {
}
```

- kebab-case
- Variáveis CSS do `vars.css`: `var(--accent)`, `var(--accent2)`, `var(--white)`, `var(--black)`, `var(--muted)`, `var(--shadow)`, etc.
- Tema "papel/caderno": fundo creme (`#fff9ee`), fontes **Raleway + Sour Gummy**, acentos pastéis, cards com flip 3D e sombras marcadas

## Estrutura

```
src/
├── components/{books,features,forms,ui,layout,navigation,feedback}/
├── composables/          # useAnimatedModal, useNotifications...
├── constants/            # fallback de opções do backend
├── router/               # rotas + guard de auth
├── services/             # api.js (Axios client)
├── stores/               # Pinia (bookStore, userStore)
├── utils/                # validation, errorHandler
├── views/                # HomeView, CardStackView, CreateBookView, LoginView
└── assets/css/           # vars.css, style.css
```

## Consumo de API (notion_api)

`GET/POST/PATCH/DELETE /api/books`, `GET /api/books/all`, `GET /api/books/:id`, `GET /api/books/options`, `POST /api/auth/login`, `GET /api/auth/me`. Fluxo:

```
Views → Pinia Stores → services/api.js (Axios) → notion_api → Notion CMS
```

## Docs

- `README.md`: visão geral, estrutura, endpoints consumidos.
- `docs/`: auth-flow, components, composables, constants, router, services, stores, utils.
- `analise-melhorias.md`: bugs, duplicações e oportunidades registradas.