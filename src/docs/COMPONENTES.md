# Componentes — Book Journal

Documentação dos componentes, padrões de uso e boas práticas do projeto.

## Índice

1. [Estrutura de Componentes](#estrutura-de-componentes)
2. [Padrões](#padrões)
3. [UI Components](#ui-components)
4. [Form Components](#form-components)
5. [Book Components](#book-components)
6. [Layout Components](#layout-components)
7. [Feedback Components](#feedback-components)
8. [Navigation Components](#navigation-components)
9. [Feature Components](#feature-components)
10. [Stores](#stores)

---

## Estrutura de Componentes

```
src/components/
├── index.js              # Barrel exports — importação centralizada
├── ui/                   # Componentes base reutilizáveis
├── forms/                # Componentes de formulário
├── books/                # Componentes específicos de livro
├── layout/               # Componentes estruturais
├── navigation/           # Componentes de navegação
├── feedback/             # Componentes de feedback ao usuário
└── features/             # Componentes de funcionalidades específicas
```

## Padrões de Código

### Componentes
- Composition API com `<script setup>` em todos os componentes
- Props tipadas com `defineProps` e valores default
- Eventos emitidos com `defineEmits`
- Slots para conteúdo flexível
- BEM simplificado nas classes CSS: `componente__elemento--modificador`
- `scoped` nos estilos para evitar vazamento
- Componente por arquivo, nome PascalCase

### Imports
- Barrel exports centralizados em `components/index.js`
- Importação via alias `@/` configurado no Vite (`jsconfig.json`)

```js
import { Button, Card, Modal } from '@/components'
```

### Stores (Pinia)
- Stores separadas por domínio (`bookStore`, `userStore`)
- Actions assíncronas com try/catch e `_handleError` interno
- Getters para dados derivados
- `$reset()` para limpar estado ao desmontar

### Api
- Cliente Axios centralizado em `services/api.js`
- Métodos organizados por recurso (`booksAPI`, `userAPI`)
- Timeout de 10s (padrão) e 60s para listagens completas

### Constantes
- Valores fixos em `constants/` como fallback
- Opções dinâmicas vêm do backend via `GET /options`

### Estilos
- `<style scoped>` para estilos específicos do componente
- Variáveis CSS customizadas (`--accent`, `--muted`, etc.) definidas globalmente

---

## UI Components

Componentes base de baixo nível, reutilizáveis em toda a aplicação.

### Button

Botão com variantes visuais.

**Props:**
| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `variant` | String | `'primary'` | `primary`, `secondary`, `ghost`, `danger` |
| `disabled` | Boolean | `false` | Desabilita o botão |

**Eventos:** `click`

**Uso:**
```vue
<Button variant="primary" @click="handleSave">Salvar</Button>
<Button variant="danger" :disabled="isLoading">Excluir</Button>
```

### LoadingSpinner

Indicador de carregamento.

### Modal

Janela modal sobreposta.

**Props:**
| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `open` | Boolean | `false` | Controla visibilidade |

**Eventos:** `close`

**Slots:** `default` (conteúdo), `title` (título)

### Badge

Tag/Pill para exibir status ou categorias.

### Card

Container com elevação e borda arredondada.

**Slots:** `default`

### Skeleton

Componentes de placeholder para estados de loading.

**Disponíveis:**
| Componente | Descrição |
|------------|-----------|
| `BookCardSkeleton` | Placeholder para BookCard |
| `FormSkeleton` | Placeholder para formulário |

---

## Form Components

### FormField

Campo de formulário universal. Suporta múltiplos tipos de entrada.

**Props:**
| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `modelValue` | Mixed | `''` | Valor do campo (v-model) |
| `label` | String | (obrigatório) | Rótulo do campo |
| `type` | String | `'text'` | `text`, `number`, `date`, `select`, `checkbox`, `autocomplete`, `multi-select`, `email`, `password`, `url` |
| `placeholder` | String | `''` | Placeholder |
| `required` | Boolean | `false` | Exibe asterisco |
| `error` | String | `''` | Mensagem de erro |
| `options` | Array | `[]` | Opções para select/autocomplete/multi-select |
| `labels` | Object | `null` | Labels customizados para opções |
| `min`, `max`, `step` | Mixed | — | Para inputs numéricos |

**Eventos:** `update:modelValue`

**Uso:**
```vue
<FormField v-model="book.name" label="Nome" required />
<FormField v-model="book.author" label="Autores" type="multi-select" :options="authorOptions" />
<FormField v-model="book.status" label="Status" type="select" :options="statusOptions" />
<FormField v-model="book.iHaveCopy" label="Tenho cópia" type="checkbox" />
```

### FormSection

Agrupamento visual de campos no formulário.

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| `title` | String | Título da seção |

### FormActions

Container para botões de ação (salvar/cancelar) no formulário.

**Slots:** `default`

### BookForm

Formulário completo de livro. Integra com a store para criar/editar.

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| `book` | Object | Dados do livro (null para criação) |
| `isEditing` | Boolean | Modo edição |

---

## Book Components

### BookCard

Card de livro com animação flip (frente/verso).

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| `book` | Object | Dados do livro |
| `index` | Number | Índice para animação |

**Subcomponentes:**
- `CardFront.vue` — Frente com capa, nome, autor
- `CardBack.vue` — Verso com detalhes, avaliação
- `CardStatus.vue` — Indicador de status

### BookList

Lista paginada de BookCards.

### BookDetails

Exibição detalhada de um livro.

### ReadingProgress

Barra de progresso de leitura.

---

## Layout Components

### Header

Cabeçalho da aplicação.

### Layout

Estrutura principal (header + conteúdo).

### Container

Wrapper com largura máxima centralizada.

**Slots:** `default`

---

## Feedback Components

### Notification

Notificação inline.

### ToastContainer

Container de toasts (integrado com vue-toastification).

### ConfirmDialog

Diálogo de confirmação para ações destrutivas (excluir, etc).

---

## Navigation Components

### Pagination

Navegação entre páginas (cursor-based).

### Filters

Filtros por status.

### SearchBar

Campo de busca com debounce.

---

## Feature Components

### CardStackView

Visualização em pilha de cards com navegação.

### CardIntro

Tela de introdução/boas-vindas da stack.

### TBRList

Lista "To Be Read" — livros para ler.

### ReadingList

Lista de leitura atual.

---

## Stores

### bookStore (Pinia)

Gerencia estado de livros: listas, paginação, busca, filtros, estatísticas.

**State:**
- `bookLists` — `{ main, tbr, reading }`
- `loadingStates` — `{ main, tbr }`
- `stats` — Estatísticas computadas
- `pagination` — `{ pageSize, currentCursor, nextCursor, previousCursors }`
- `searchTerm`, `filterStatus`, `bookOptions`

**Actions principais:**
- `fetchBooks(startCursor?)` — Busca livros com paginação
- `fetchStats()` — Estatísticas
- `createBook(data)` — Criar e recarregar
- `updateBook(id, data)` — Atualizar
- `deleteBook(id)` — Arquivar
- `search(term)` / `filterByStatus(status)` — Busca/filtro
- `nextPage()` / `previousPage()` — Paginação

### userStore (Pinia)

Gerencia autenticação e usuários.

**State:**
- `users`, `userActive`, `loading`, `error`, `isGuest`

**Actions principais:**
- `fetchUsers()` / `fetchAllUsers()` — Carregar usuários
- `setActiveUser(id)` — Login
- `setGuestUser()` — Modo visitante
- `clearActiveUser()` — Logout
- `loadActiveUser()` — Restaurar sessão do localStorage
