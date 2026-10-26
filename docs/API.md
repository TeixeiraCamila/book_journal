# API

Fonte de verdade dos contratos consumidos pelo `book_journal`. Backend: **`notion_api`** (repositório irmão). Este documento cobre o **lado do consumidor**; a referência completa do backend vive em `notion_api/docs/api-reference.md`.

Cliente Axios: `src/services/api.ts`; baseURL `VITE_API_URL` (vazio + proxy `/api` em dev), timeout 10 s (`/all` 60 s, `/auth/me` 5 s), header `Content-Type: application/json`, `Authorization: Bearer <token>` quando há sessão.

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

Mensagens de `401` do backend: `Autenticação necessária` (sem header), `Token inválido` (assinatura não bate) e `Sessão expirada` (JWT com 30 dias). Escritas sem sessão respondem `401` — o `400` de validação só chega depois do `require_auth`.

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

Sem params. Response `200`: `{ "data": [book], "total": n }`; o timeout do front estende para 60 s.

### `GET /api/books/:id`

Response `200`: o `book` **no topo** (sem envelope `data`).

### `GET /api/books/options`

Response `200`: objeto **flat** (chave = propriedade do Notion, valor = `string[]`):

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

Cacheadas no backend (300 s). Fallback local em `constants/book.ts` para **Status** e **Type** quando falha; **Rate não tem fallback** — o catálogo do Notion é a fonte única (Decisão 004, atualização de 22/10/2026).

### `GET /api/books/stats`

Response `200` (objeto direto): `totalBooks`, `currentlyReading` (array), `statusCounts`, `totalPagesRead`, `averagePagesRead`, `averageRating`, `ratingDistribution`, `authorsMostRead`, `genresDistribution`, `statsByYear`, `booksReadInYear`, `totalPagesReadInYear`.

**Fora de escopo do `book_journal`** (Decisão 009, `DECISIONS.md`): este app não terá estatísticas. Consumidor: `dashboard__journal`. Nenhum código deste repo chama o endpoint.

### `GET /api/books/finished-this-year`

Query: `year` (obrigatório, 1900–2100), `pageSize`, `startCursor` (cursor **numérico como string**)

Response `200`: atenção, o formato é **snake_case, diferente do list**, e traz `stats` do ano inteiro (independe da página pedida):

```json
{
  "year": 2026,
  "stats": {
    "totalBooks": 29,
    "totalPagesRead": 11287,
    "booksWithPages": 29,
    "averagePagesRead": 389,
    "averageRating": "3.3",
    "booksWithRating": 27,
    "ratingDistribution": { "⭐⭐⭐": 16 },
    "authorsMostRead": [{ "name": "…", "count": 3 }],
    "genresDistribution": [{ "name": "…", "count": 5 }],
    "formatCounts": [{ "name": "Kindle", "count": 10 }],
    "statusCounts": { "Read": 28, "DNF": 1 },
    "monthlyFinished": [{ "month": "2026-01", "count": 5 }],
    "iHaveCopyCount": 13,
    "longestBook": { "id": "…", "title": "…", "pages": 984 },
    "averageReadingDays": 9
  },
  "results": [book],
  "has_more": false,
  "next_cursor": null,
  "total_count": 12
}
```

Os campos de `stats` podem ser `null` (`longestBook`, `averageReadingDays`) quando não há base de cálculo; `averageRating` é `string` (`.toFixed(1)`). Detalhe campo a campo: `notion_api/docs/api-reference.md`.

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

O frontend lê `error.response.data.message` e, se a chave faltar, usa a mensagem padrão do status (`src/utils/errorHandler.ts`).

---

## Regras da API

- Validar tudo no cliente **e** no servidor (Zod é a última palavra)
- Nunca assumir presença de campos no `book` (vazios são apagados)
- Autorizar escritas no servidor; no cliente, apenas ocultar a UI do visitante
- Respostas de erro seguem o formato acima; não expor detalhes internos
- Rate limit no backend: 3 req/s **por domínio de integração** (limite do Notion, não por IP); não fazer polling agressivo
- `GET /books` (sem `/api`) redireciona para `/api/books`
- Não existe `PATCH /:id/status` no domínio books (só em entertainment)

---

## Quando a API muda

| Mudança | Atualizar |
|---|---|
| Rota nova/alterada | este arquivo + `src/services/api.ts` + store correspondente |
| DTO novo/removido | este arquivo + `src/types/book.ts` / `api.ts` + `DATABASE.md` |
| Opções do schema (Status/Type/…) | `constants/` só se houver fallback local; o `/options` muda sozinho |
| Formato de erro | este arquivo + `src/utils/errorHandler.ts` |
| Auth (login, token, sessão) | este arquivo + `SECURITY.md` + `../AGENTS.md` |

A fonte da verdade do contrato é `notion_api/docs/api-reference.md`; o checklist de propagação para os 5 repositórios está em `notion_api/docs/atualizar-documentacao.md`.
