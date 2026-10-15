# Testing

## Estado Atual

**Não existe suíte de testes.** O `package.json` não tem script de teste nem dependências de teste. A única validação automatizada hoje é:

- `npm run lint` (ESLint com `--fix`)
- `npm run build` (Vite)

Isso é uma lacuna conhecida (`ROADMAP.md` → NOW/NEXT). Até a suíte existir, a validação é manual dos fluxos críticos (§ 5).

---

## 1. Objetivos de Teste

Funcionalidades críticas:

- Autenticação (login, sessão, visitante, 401)
- CRUD de livros (criar, editar, arquivar)
- Busca com debounce + descarte de respostas obsoletas
- Paginação por cursor (próxima/anterior)
- Validação de formulário

---

## 2. Tipos de Teste (planejados)

### Unitário

Testar:

- `utils/validation.js` (funções puras — ponto de partida ideal)
- `utils/errorHandler.js` (mapeamento de status → mensagem)
- `constants/book.js` (labels/mappings)
- `composables/useBookFormatters.js` (formatters de autor/páginas/datas)
- Transformação de dados do `BookForm` (`fillFormFromBook`, montagem do payload)

### Integração

Testar:

- `stores/bookStore.js` (actions com Axios mockado: paginação, `searchToken`, `$reset`)
- `stores/userStore.js` (login, `loadSession`, `validateSession` — só 401 derruba)
- Interceptors de `services/api.js` (anexo de token, redirect em 401)

### E2E (futuro)

Jornadas críticas:

1. Login com credenciais → home
2. Entrar como visitante → acervo somente leitura
3. Criar livro → aparece na lista/TBR
4. Editar livro → dados atualizados
5. Buscar/filtrar → resultados corretos
6. Sessão expirada → redirect para login

---

## 3. Ferramentas (planejadas)

Unitário/Integração:

Vitest + `@vue/test-utils` + `happy-dom`

E2E:

Playwright (a decidir)

Mock:

Axios mockado (`vi.mock`) — sem MSW por enquanto (escopo pequeno)

---

## 4. Estrutura de Arquivos (planejada)

```text
tests/
├── unit/
│   ├── validation.test.js
│   ├── errorHandler.test.js
│   └── useBookFormatters.test.js
├── integration/
│   ├── bookStore.test.js
│   └── userStore.test.js
└── e2e/
    └── critical-flows.spec.js
```

Arquivos unitários podem coexistir em `src/**/__tests__/` se preferir proximidade — escolher um padrão e seguir.

---

## 5. Fluxos Críticos de Usuário

Fluxo: Login

Passos: `/login` → etapa form → email + código → submit

Resultado esperado: redireciona para `/`; token no `localStorage`
Falha esperada: mensagem "O código não confere." inline

Fluxo: Criar livro

Passos: `/criar` → título + autor → submit

Resultado esperado: toast de sucesso; volta para `/?slide=1`; livro presente na lista

Fluxo: Editar livro

Passos: card → `/editar/:id` → alterar status → submit

Resultado esperado: PATCH disparado; listas recarregadas

Fluxo: Busca

Passos: digitar 3+ caracteres no acervo

Resultado esperado: 1 requisição após 400 ms; respostas antigas descartadas

Fluxo: Visitante

Passos: login visitante → acervo

Resultado esperado: botões de escrita ocultos; APIs de escrita retornariam 401

---

## 6. Cobertura

Alvo:

~70% em `utils/` e `stores/` (lógica pura e de estado); UI coberta por E2E dos fluxos críticos, não por teste de componente exaustivo.

Priorizar:

1. `validation.js` e `errorHandler.js`
2. `userStore` (sessão) e interceptors
3. `bookStore` (paginação e corrida de busca)
4. Transformação do `BookForm`

---

## 7. Comandos

| Ação | Comando |
|---|---|
| Testar (quando existir) | `npm run test` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Preview do build | `npm run preview` |
| Type check | não existe (JS puro) |

---

## 8. Definição de Pronto (validação mínima enquanto não há testes)

- [ ] `npm run lint` passa
- [ ] `npm run build` passa
- [ ] Fluxo crítico afetado verificado manualmente (login → ação → resultado)
- [ ] Estados de loading/erro/vazio do componente novo verificados
- [ ] Responsividade básica conferida (≤768px)
