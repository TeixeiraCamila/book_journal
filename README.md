# Book Journal

Aplicação web para gerenciamento de biblioteca pessoal. Permite cadastrar livros, controlar progresso de leitura, avaliar obras e organizar por status, gêneros e séries. Os dados são persistidos no Notion via API própria.

## Descrição

Book Journal é uma SPA focada na experiência de catalogação e acompanhamento de leituras. O usuário pode adicionar livros manualmente, marcar progresso, avaliar com estrelas e favoritar. A interface utiliza cards com animações suaves e design limpo.

Consome a API do backend em `backend__final`, domínio **Books**.

## Tecnologias

- **Vue.js 3** (Composition API + `<script setup>`)
- **Pinia** — Gerenciamento de estado
- **Vue Router 4** — Roteamento SPA
- **Vite 7** — Build tool
- **Axios** — HTTP client
- **GSAP** — Animações avançadas
- **VueUse Motion** — Animações declarativas
- **Swiper** — Sliders e carrosséis
- **Lucide Vue** — Ícones
- **vue-toastification** — Notificações toast
- **ESLint + Prettier** — Qualidade de código

## Funcionalidades

- Cadastro completo de livros (título, autor, gêneros, série, tipo)
- Controle de progresso (páginas lidas, status: lendo/completo/abandono)
- Avaliação com estrelas e favoritos
- Filtragem por status e busca por nome
- Paginação cursor-based
- Visualização em cards com flip animation
- Modo visitante (guest) sem login
- Interface responsiva

## Layout

A interface utiliza cards como elemento central, com animação de flip para exibir detalhes. O layout é limpo com foco no conteúdo, fundo claro e cores suaves.

## Estrutura de Pastas

```
src/
├── App.vue                  # Componente raiz
├── main.js                  # Entry point (Pinia, Router, Toast)
├── assets/
│   └── main.css             # Estilos globais
├── components/
│   ├── index.js             # Barrel exports
│   ├── books/
│   │   ├── BookCard/        # Card com flip animation
│   │   │   ├── BookCard.vue
│   │   │   ├── CardBack.vue
│   │   │   ├── CardFront.vue
│   │   │   └── CardStatus.vue
│   │   └── BookList/        # Lista de livros
│   ├── features/
│   │   ├── Stack/           # Stack de cards
│   │   ├── ReadingList/     # Lista de leitura atual
│   │   └── TBRList/         # Lista "para ler"
│   ├── forms/
│   │   ├── BookForm/        # Formulário de livro
│   │   ├── FormField.vue
│   │   ├── FormSection.vue
│   │   └── FormActions.vue
│   ├── ui/                  # Componentes base
│   │   ├── Button.vue
│   │   ├── LoadingSpinner.vue
│   │   ├── Modal.vue
│   │   ├── Badge.vue
│   │   ├── Card.vue
│   │   └── Skeleton/        # Estados de loading
│   ├── layout/
│   │   ├── Header.vue
│   │   ├── Layout.vue
│   │   └── Container.vue
│   ├── navigation/
│   │   ├── Pagination.vue
│   │   ├── Filters.vue
│   │   └── SearchBar.vue
│   └── feedback/
│       ├── Notification.vue
│       ├── ToastContainer.vue
│       └── ConfirmDialog.vue
├── composables/
│   ├── useAnimatedModal.js
│   └── useNotifications.js
├── constants/
│   └── book.js              # Constantes de status, tipos, labels
├── router/
│   └── index.js             # Rotas + guard de autenticação
├── services/
│   └── api.js               # Axios client + endpoints
├── stores/
│   ├── bookStore.js         # Estado de livros (Pinia)
│   └── userStore.js         # Estado de usuário (Pinia)
├── utils/
│   └── validation.js        # Funções de validação
└── views/
    ├── HomeView.vue
    ├── CardStackView.vue
    ├── CreateBookView.vue
    └── LoginView.vue
```

## Instalação

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Verifica código com ESLint |
| `npm run format` | Formata código com Prettier |
| `npm run vercel-build` | Build para Vercel |

**Produção** — adicione no Vercel:
```
VITE_API_URL= 
```

Em produção, configure a URL da API como variável de ambiente no Vercel.

## Arquitetura

A aplicação segue a arquitetura **Vue 3 SPA** com:

- **Composition API** com `<script setup>` para todos os componentes
- **Pinia** como store global, com stores separadas por domínio (`bookStore`, `userStore`)
- **Vue Router** com lazy loading de views e guard de navegação para autenticação
- **Camada de serviços** centralizada em `services/api.js` com Axios
- **Constantes** em `constants/` como fallback para opções do backend
- **Composables** para lógica reutilizável (modais animados, notificações)
- **Barrel exports** em `components/index.js` para importação simplificada

### Fluxo de dados

```
Views → Pinia Stores → services/api.js (Axios) → Backend API → Notion CMS
```

## Consumo de API

A aplicação consome os seguintes endpoints do backend `backend__final`:

| Endpoint | Uso |
|----------|-----|
| `GET /api/books` | Listar livros (paginado) |
| `GET /api/books/all` | Todos os livros |
| `GET /api/books/:id` | Detalhe do livro |
| `GET /api/books/options` | Opções de filtro |
| `POST /api/books` | Criar livro |
| `PATCH /api/books/:id` | Atualizar livro |
| `DELETE /api/books/:id` | Arquivar livro |
| `GET /api/users` | Listar usuários |
| `GET /api/users/:id` | Detalhe do usuário |

## Responsividade

A interface é totalmente responsiva, adaptando-se de mobile a desktop. O layout usa CSS Grid e Flexbox com media queries para reorganizar cards e navegação conforme o viewport.

## Acessibilidade

- Contraste adequado entre texto e fundo
- Foco visível em elementos interativos
- Textos alternativos em imagens
- Navegação por teclado
- Animações respeitam `prefers-reduced-motion`

## Deploy

Deploy na **Vercel** como SPA:

```bash
# 1. Conecte o repositório na Vercel
# 2. Configure VITE_API_URL como variável de ambiente
# 3. O arquivo vercel.json redireciona todas as rotas para index.html
```

## Melhorias Futuras

- [ ] Testes automatizados (Vitest + Vue Test Utils)
- [ ] Dark mode
- [ ] Upload de capas via upload direto
- [ ] Sincronização com Goodreads/Skoob
- [ ] Modo offline com Service Worker
- [ ] Compartilhamento de estante em rede social
- [ ] Importação em lote via CSV
