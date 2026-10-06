# Services

**Arquivo:** src/services/api.js

**Motivo:** Centralizar toda comunicação HTTP com o backend em um só lugar, evitando repetir a configuração do Axios e URLs em cada store/componente.

**O que faz:** Define uma instância Axios e os objetos de API (books_api e auth_api) com métodos para cada endpoint.

## Configuração

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})
```

## books_api

| Método | Descrição | Exemplo |
|--------|-----------|---------|
| list(options) | Lista com paginação | books_api.list({ pageSize: 20, status: "Read", searchBy: "genre" }) |
| listAll() | Todos os livros | books_api.listAll() |
| get(id) | Busca por ID | books_api.get("book-id") |
| create(data) | Cria livro | books_api.create({ name: "...", author: [...] }) |
| update(id, data) | Atualiza | books_api.update("book-id", { status: "Read" }) |
| delete(id) | Deleta | books_api.delete("book-id") |
| options() | Opções dinâmicas | books_api.options() |
| stats() | Estatísticas | books_api.stats() |

### Parâmetros de `list()`

| Chave | Padrão | Descrição |
|-------|--------|-----------|
| `pageSize` | `20` | Itens por página (máximo `100` no backend) |
| `startCursor` | — | Cursor da página anterior |
| `search` | `''` | Termo digitado na busca |
| `searchBy` | `title` | Campo da busca: `title`, `author` ou `genre` |
| `status` | `all` | Um status do banco ou `all` |

`searchBy` acompanha `search` em toda listagem filtrada, inclusive nas listas de TBR e de
leitura em andamento. Quem chama sem `searchBy` continua buscando por título.

## auth_api

| Método | Descrição | Payload |
|--------|-----------|---------|
| login(data) | Troca email + código por um token | `{ email, codigo }` |
| me() | Revalida o token da sessão | — |

O front não consome a lista de usuários do workspace: o backend valida o email
dentro do servidor e devolve só o token.

**Exemplo de uso na store:**
```js
const response = await books_api.list({
  pageSize: this.pagination.page_size,
  startCursor: cursor,
  search: this.search_term,
  searchBy: this.search_by,
  status: this.filter_status,
})
this.book_lists.main = response.data.data
```
