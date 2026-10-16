# Code Style & Conventions

Consenso compilado do `AGENTS.md` (raiz) + configurações reais. O `AGENTS.md` da raiz tem precedência em caso de divergência.

## 1. Princípios Gerais

- Código legível acima de engenhosidade
- Reutilizar componentes e utilitários existentes antes de criar novos
- Preferir consistência sobre novidade
- Mudanças focadas; sem refatorações não pedidas
- Sem dependências novas sem necessidade clara

---

## 2. Nomenclatura

#### Componentes:

PascalCase para arquivos e pastas (`BookCard/BookCard.vue`)

#### Funções, variáveis e parâmetros (identificadores próprios):

camelCase (`fetchBooks`, `bookData`, `isSubmitting`)

#### Constantes:

SCREAMING_SNAKE_CASE (`BOOK_STATUS_MAP`, `DEFAULT_PAGE_SIZE`, `SEARCH_DEBOUNCE_MS`)

#### Chaves de dados/API e props:

Seguem o ecossistema/contrato: camelCase na API (`wasReadIn`, `seriesInfo`), camelCase nas props Vue (`isEdit`, `loadingMessage`)

#### Arquivos:

`.vue` PascalCase; `.js` camelCase (`bookStore.js`, `useBookFormatters.js`)

#### Rotas:

Paths em pt-BR (`/criar`, `/editar/:id`)

#### CSS (fora do JS):

Classes BEM e custom properties mantêm o padrão do projeto (`card_back__text`, `--accent_muted`, `--button_color`); não são identificadores JS e **não** seguem camelCase

---

## 3. Estrutura de Pastas

Seguir a árvore de `ARCHITECTURE.md`. Regras:

- Um componente por pasta (`components/<grupo>/<Componente>/`)
- Barrel `index.js` em cada pasta de componentes
- Imports sempre com alias `@/`
- CSS do componente no `<style scoped>`

---

## 4. Imports

- Alias `@/` para tudo que está em `src/`
- Ordem: Vue/bibliotecas → stores/services/composables → componentes → constants/utils
- Bibliotecas de estilo de terceiros importadas no componente que as usa (ex.: CSS do Swiper em `CardStackView`)

---

## 5. Componentes

- `<script setup>` em **todos** os componentes
- Comentário de 1 linha no topo descrevendo a responsabilidade
- `defineProps`/`defineEmits` tipados (runtime types)
- Responsabilidade única; extrair lógica reutilizável para composables
- `Teleport` para modais; transições respeitando `prefers-reduced-motion`
- Props de apresentação em camelCase; eventos em kebab-case no template

---

## 6. Funções

- Uma função = uma responsabilidade lógica
- Nomes descritivos em camelCase
- Ações de store iniciam com verbo (`fetchBooks`, `createBook`, `updateBook`, `deleteBook`)
- Sem complexidade desnecessária; early return preferível a aninhamento

---

## 7. Tratamento de Erros

#### Use:

`utils/errorHandler.js`: `extractErrorMessage(error)` para mensagem pt-BR e `logError(action, error)` para console com ❌. Stores usam o padrão `_handleError(action, error)`.

#### Não fazer:

`try/catch` vazio, `console.log` de erro, mensagem crua do backend sem fallback, `alert()`

Erros de API em stores: registrar, expor em `store.error` e relançar quando a view precise tratar.

---

## 8. Comentários

Explicam o _que_ e o _porquê_, não o _como_:

- Topo de arquivo: 1 linha de responsabilidade
- Topo de função/componente: 1–2 linhas
- Inline: só lógica não óbvia ou decisão de design (ex.: por que `searchToken` invalida respostas)
- Máximo 3 linhas; marcadores ✅ ❌ 🔍 ⚡ 📝 em logs
- Sem comentários que repetem o código; sem blocos de código comentado morto

---

## 9. Logging

#### Biblioteca:

Nenhuma: `console` direto, encapsulado por `logError`.

#### Regras:

- Erros com `❌` via `logError`; nunca logar token/código de acesso/email
- Sem `console.log` de produção (remover antes de commitar)

---

## 10. Formatação

#### Formatter:

Prettier: `singleQuote: true`, `semi: true`, `printWidth: 100` (`.prettierrc.json`)

#### Linter:

ESLint flat config + `eslint-plugin-vue` (essential) + `@vue/eslint-config-prettier` (`npm run lint` com `--fix`)

#### Type Checking:

Nenhum (JS puro; `tsconfig.json` é resíduo sem `typescript`, ver `ROADMAP.md`)

#### Executar após edições:

`npm run lint` e `npm run format`.

---

## 11. Faça

- Reutilizar padrões existentes (`StateHandler`, `useNotifications`, `useBookFormatters`)
- Manter mudanças focadas no pedido
- Seguir o design system (`DESIGN_SYSTEM.md`) e o BEM no CSS
- Remover código morto ao mexer no arquivo

---

## 12. Não Faça

- Criar utilitários duplicados (ver `analise-melhorias.md` para duplicações conhecidas)
- Introduzir dependências desnecessárias (todas as atuais têm uso; não adicionar mais uma sem necessidade)
- Ignorar a arquitetura (ex.: chamada Axios direta numa view)
- Mudar arquivos não relacionados
- Escrever selectores por ID (`#right-image`): só BEM
- Usar `<script>` sem `setup` em componente novo
