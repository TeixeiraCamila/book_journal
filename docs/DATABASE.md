# Database

## Propósito

Este frontend **não tem banco de dados próprio**: todo dado vive no **database do Notion**, acessado via `notion_api`. Este documento define o **modelo de dados do domínio books** tal como o frontend o consome, para não inventar campos, formatos ou nomes.

Schema físico (propriedades do Notion) é mantido no backend; mudanças de schema acontecem lá e repercutem aqui.

---

## 1. Motor de Dados

#### Banco:

Notion API (workspace pessoal)

#### Acesso:

Exclusivamente via `notion_api` (repositório irmão). O frontend nunca fala com o Notion direto.

---

## 2. Convenções de Nomenclatura

#### Objeto devolvido pela API:

camelCase (`wasReadIn`, `iHaveCopy`, `firstPublished`, `literaryAtlas`, `seriesInfo`)

Escrita (POST/PATCH):

camelCase; atenção às assimetrias documentadas abaixo

Campos internos do app (stores, utils):

camelCase (convenção do repo, ver `DECISIONS.md`, Decisão 008)

#### Vazios:

O backend **apaga campos vazios** do objeto (`null`, `undefined` ou `[]`); o frontend nunca pode assumir presença fixa de todos os campos. Usar optional chaining (`book.cover?.[0]`).

---

## 3. Entidade `book` (contrato de leitura)

Formato retornado por `GET /api/books`, `/all`, `/:id`:

```jsonc
{
  "id": "uuid-Notion",              // sempre presente
  "title": "Duna",                   // string; "Sem título" se vazio
  "author": ["Frank Herbert"],       // array (multi-select)
  "status": "Read",                  // string | null (select)
  "pages": { "totalPages": 688, "currentlyPage": null },  // number | null
  "wasReadIn": ["2024"],             // array de strings (anos)
  "startEnd": { "start": "...", "end": "..." } | null,    // datas de leitura
  "cover": ["https://..."],          // array de URLs (files)
  "type": ["Kindle"],                // SEMPRE array na leitura
  "rate": "⭐⭐⭐⭐⭐" | null,        // select de emoji
  "iHaveCopy": true,                 // boolean (checkbox)
  "firstPublished": "1965" | null,   // select (string)
  "genres": ["Science Fiction"],     // array (multi-select)
  "publishedBy": "Editora Alpha" | null,
  "literaryAtlas": "Tolkien" | null, // propriedade Notion "Atlas"
  "progress": "100%" | null,         // formula (somente leitura)
  "seriesInfo": { "bookSeries": "Crônicas de Duna" | null, "volume": 1 | null }
}
```

### Assimetrias de escrita (POST/PATCH `/api/books`)

| Campo na escrita | Aceita | Observação |
|---|---|---|
| `coverUrl` | string | Na leitura vira `cover` (array); nomes diferentes |
| `type` | `string \| string[]` | Leitura sempre array |
| `startEnd` | `string` ou `{ start, end }` | |
| `status`, `rate`, `pages.*`, `seriesInfo.*` | aceitam `null` | para limpar o valor |

---

## 4. Relacionamentos

Não há joins no modelo do frontend. Agrupamentos derivados:

- **Série**: `seriesInfo.bookSeries` agrupa livros; consultado via opções (`Book Series Name`)
- **Ano de leitura**: `wasReadIn[]` permite listar livros por ano (rota dedicada `finished-this-year`)

---

## 5. Restrições (validação no cliente)

`BookForm` + `utils/validation.js` impõem:

- `title` e `author` obrigatórios
- `pages.*` numéricos não negativos; `currentPage ≤ totalPages`
- `firstPublished`: 4 dígitos, entre 1000 e ano atual + 1
- `seriesInfo.volume`: número ≥ 1 quando preenchido
- `endDate ≥ startDate`

O backend revalida com Zod (fonte final).

---

## 6. Índices / Busca

O "índice" é o query do Notion, exposto pela API:

- `search` + `searchBy` (`title` | `author` | `genre`): match parcial; sem resultado devolve `data: []` sem gastar chamada ao Notion
- `status`: filtro por select; `all` = sem filtro
- `genres`: filtro por multi-select (array ou `A,B`)
- `wasReadIn`: filtro por ano

---

## 7. Validação de Dados

- Backend: Zod (mensagens em pt-BR); `searchBy` inválido ou gênero desconhecido → `400`
- Frontend: validação por campo antes do envio (feedback imediato), não substitui a do servidor

---

## 8. Soft Delete

`DELETE /api/books/:id` faz **soft delete** (`archived: true` no Notion). O item some das listagens e permanece no Notion.

---

## 9. Auditoria

Não há registro de "quem editou". O backend tem um único usuário autenticado; o Notion mantém seu próprio histórico de páginas.

---

## 10. Dados Sensíveis

- Nenhum dado pessoal de terceiros é armazenado
- Apenas o email do usuário logado trafega (validado contra os "persons" do Notion)
- Capas são URLs de arquivos hospedados no Notion

---

## 11. Regras de Migração

Mudanças no schema do Notion devem:

1. Ser feitas primeiro no backend (mapper + types de contrato)
2. Atualizar `API.md` (contrato) e `constants/book.js` (fallbacks) aqui
3. Ser testadas em dev (`VITE_API_URL` local) antes do deploy

Não renomear campos do contrato sem coordenar com o `notion_api`.

---

## 12. Seed / Dados de Desenvolvimento

O "seed" é o próprio database do Notion de produção; não há banco de dev separado. Cuidado ao testar escritas: elas persistem no Notion.
