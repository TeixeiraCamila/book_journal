# Services

**Arquivo:** src/services/api.js

**Motivo:** Centralizar toda comunicação HTTP com o backend em um só lugar, evitando repetir a configuração do Axios e URLs em cada store/componente.

**O que faz:** Define uma instância Axios e dois objetos de API (booksAPI e userAPI) com métodos para cada endpoint.

## Configuração

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})
```

## booksAPI

| Método | Descrição | Exemplo |
|--------|-----------|--------|
| list(options) | Lista com paginação | booksAPI.list({ pageSize: 20, status: "Read", wasReadIn: "2024" }) |
| listAll() | Todos os livros | booksAPI.listAll() |
| get(id) | Busca por ID | booksAPI.get("book-id") |
| create(data) | Cria livro | booksAPI.create({ name: "...", author: [...] }) |
| update(id, data) | Atualiza | booksAPI.update("book-id", { status: "Read" }) |
| delete(id) | Deleta | booksAPI.delete("book-id") |
| options() | Opções dinâmicas | booksAPI.options() |
| stats() | Estatísticas | booksAPI.stats() |

## userAPI

| Método | Descrição |
|--------|-----------|
| list(options) | Lista usuários |
| listAll() | Todos os usuários |
| getById(id) | Busca por ID |

**Exemplo de uso na store:**
```js
const response = await booksAPI.list({
  pageSize: this.pagination.pageSize,
  startCursor: cursor,
  search: this.searchTerm,
  status: this.filterStatus,
})
this.bookLists.main = response.data.data
```
