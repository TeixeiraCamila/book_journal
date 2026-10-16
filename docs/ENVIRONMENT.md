# Environment

## Variáveis Públicas

Variáveis `VITE_*` são embutidas no bundle: qualquer coisa aqui é pública.

```bash
# URL do backend notion_api (vazio em dev: usa o proxy do Vite)
VITE_API_URL=http://localhost:3000

# Produção (Vercel):
# VITE_API_URL=https://notion-api-green.vercel.app
```

| Variável | Dev | Produção |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` (ou vazia + proxy) | URL da API na Vercel |

Não há variáveis privadas neste repositório. As do backend (`AUTH_ACCESS_CODE`, `AUTH_JWT_SECRET`, `NOTION_TOKEN`, `CORS_ORIGINS`, chaves do database) vivem no `notion_api`.

---

## Arquivos de Env

| Arquivo | Commitado? | Função |
|---|---|---|
| `.env` | ❌ (gitignored) | env local real |
| `.env.exemple` | ✅ | template (⚠️ nome com typo "exemple", não ".example") |
| `.env.*.local` | ❌ | variações locais |

⚠️ Gotcha: o `.gitignore` ignora `.env.example` (grafado "certo") mas o arquivo real se chama `.env.exemple`, e por isso ele é commitado. Renomear exige ajustar o `.gitignore` junto.

---

## Comportamento por Ambiente

**Dev** (`npm run dev`):

- Vite em `localhost:5173`
- Proxy `/api → http://localhost:3000` (exige `notion_api` rodando local)
- Vue DevTools plugin ativo

**Produção** (Vercel):

- `VITE_API_URL` aponta para a API implantada
- CORS do backend restringe origens; adicionar o domínio novo em `CORS_ORIGINS` do `notion_api` se mudar de domínio
- `npm run vercel-build` (= `npm run build`)

---

## Regras

- Nunca commitar `.env`
- Nunca expor variáveis privadas no cliente (só `VITE_*` chega ao bundle)
- Manter `.env.exemple` atualizado ao introduzir variável nova
- Config local e produção separadas; não misturar URLs
- Segredos de verdade (JWT secret, token do Notion) nunca passam por este frontend, ver `SECURITY.md`
