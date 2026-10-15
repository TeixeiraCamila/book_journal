# API

Fonte de verdade dos contratos consumidos pelo `book_journal`. Backend: **`notion_api`** (repositório irmão). Este documento documenta o **lado do consumidor**; a referência completa do backend vive em `notion_api/docs/api-reference.md`.

Cliente Axios: `src/services/api.js` — baseURL `VITE_API_URL` (vazio + proxy `/api` em dev), timeout 10 s (`/all` 60 s, `/auth/me` 5 s), header `Content-Type: application/json`, `Authorization: Bearer <token>` quando há sessão.

---

## Autenticação

`POST /api/auth/login`

Autenticação: não requer

Request:

```json
{ "email": "voce@exemplo.com", "codigo": "seu-codigo" }
```

Response `200`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "name": "Teixeira", "email": "...", "avatar_url": "...", "nivel": "dona" }
}
```

Erros:

- `400` validação Zod ("Informe o email." / "Informe o código de acesso.")
- `401` "O código não confere." / "Esse email não está no arquivo."

`GET /api/auth/me`

Autenticação: `Bearer` obrigatório

Response `200`:

```json
{ "user": { "id": "uuid", "name": "Teixeira", "nivel": "dona" } }
```

Uso no front: revalidação única no boot (`userStore.validateSession`, timeout 5 s). Só `401` derruba a sessão.

---

## Books

Leituras (GET) são **públicas** no backend; escritas exigem `Bearer`.

### `GET /api/books`

Query: `pageSize` (1–100, def. 20), `startCursor`, `search`, `searchBy` (`title`|`author`|`genre`), `status` (`all` = sem filtro), `wasReadIn`, `genres`

Response `200`:

```json
{
  "data": [ { "...book": "..." } ],
  "pagination": { "pageSize": 20, "hasMore": true, "nextCursor": "..." }
}
```

Sem correspondência na busca: `data: []`, `hasMore: false` (sem chamada ao Notion).

### `GET /api/books/all`

Sem params. Response `200`: `{ "data": [book], "total": n }` — timeout do front estendido para 60 s.

### `GET /api/books/:id`

Response `200`: o `book` **no topo** (sem envelope `data`).

### `GET /api/books/options`

Response `200`: objeto **flat** — chave = propriedade do Notion, valor = `string[]`:

```json
{
  "Status": ["Reading", "Read", "DNF", "To be read"],
  "Rate": ["❤", "⭐⭐⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐", "⭐⭐", "⭐"],
  "Type": ["Audiobook", "Kindle", "Mangá", "Paper"],
  "Author": ["..."],
  "Genres": ["..."],
  "Book Series Name": ["..."],
  "First published in": ["..."],
  "Published by": ["..."],
  "Atlas": ["..."]
}
```

Cacheadas no backend (300 s). Fallback local em `constants/book.js` quando falha.

### `GET /api/books/stats`

Response `200` (objeto direto): `totalBooks`, `currentlyReading` (array), `statusCounts`, `totalPagesRead`, `averagePagesRead`, `averageRating`, `ratingDistribution`, `authorsMostRead`, `genresDistribution`, `statsByYear`, `booksReadInYear`, `totalPagesReadInYear`.

**Fora de escopo do `book_journal`** (Decisão 009, `DECISIONS.md`): este app não terá estatísticas. Consumidor: `dashboard__journal`. Nenhum código deste repo chama o endpoint.

### `GET /api/books/finished-this-year`

Query: `year` (obrigatório, 1900–2100), `pageSize`, `startCursor` (cursor **numérico como string**)

Response `200` — atenção: formato **snake_case, diferente do list**:

```json
{
  "results": [book],
  "has_more": false,
  "next_cursor": null,
  "total_count": 12,
  "year": 2026
}
```

### `POST /api/books`

Autenticação: obrigatória. Response `201` + `book` mapeado.

Request (contrato agrupado usado pelo `BookForm`):

```json
{
  "title": "Duna",
  "author": ["Frank Herbert"],
  "status": "Read",
  "rate": "⭐⭐⭐⭐⭐",
  "pages": { "totalPages": 688, "currentlyPage": 688 },
  "type": "Kindle",
  "firstPublished": "1965",
  "iHaveCopy": true,
  "wasReadIn": ["2026"],
  "startEnd": { "start": "2026-01-01", "end": "2026-02-01" },
  "coverUrl": "https://...",
  "literaryAtlas": "Tolkien",
  "genres": ["Science Fiction"],
  "publishedBy": "Editora Alpha",
  "seriesInfo": { "bookSeries": "Crônicas de Duna", "volume": 1 }
}
```

Campos opcionais podem ser omitidos; `null` limpa o valor (em `status`, `rate`, `pages.*`, `seriesInfo.*`).

### `PATCH /api/books/:id`

Autenticação: obrigatória. Mesmo corpo do POST (parcial). Response `200` + `book`.

### `DELETE /api/books/:id`

Autenticação: obrigatória. **Soft delete** (`archived: true`). Response `200`:

```json
{ "success": true, "id": "uuid" }
```

---

## Formato de Erro

Erros de aplicação (`lib/errors.js` do backend):

```json
{ "error": "NotFoundError", "message": "Livro não encontrado", "code": "NOT_FOUND" }
```

Códigos: `VALIDATION_ERROR` (400), `AUTHENTICATION_ERROR` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `RATE_LIMITED` (429), `NOTION_ERROR`/`INTERNAL_ERROR` (500).

Validação Zod (400):

```json
{
  "error": "Erro de validação",
  "message": "<primeira issue>",
  "details": [{ "path": "author", "message": "..." }]
}
```

O frontend lê `error.response.data.message` e, na ausência, aplica mensagem padrão por status (`utils/errorHandler.js`).

---

## Regras da API

- Validar tudo no cliente **e** no servidor (Zod é a última palavra)
- Nunca assumir presença de campos no `book` (vazios são apagados)
- Autorizar escritas no servidor; no cliente, apenas ocultar a UI do visitante
- Respostas de erro seguem o formato acima; não expor detalhes internos
- Rate limit no backend: 3 req/s por IP — não fazer polling agressivo
- `GET /books` (sem `/api`) redireciona para `/api/books`
- Não existe `PATCH /:id/status` no domínio books (só em entertainment)
