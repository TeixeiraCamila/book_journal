# Deployment

## Ambientes

Desenvolvimento:

`http://localhost:5173` (Vite; proxy `/api` para `notion_api` em `localhost:3000`)

Produção:

Vercel — SPA estática + backend `notion_api` também na Vercel (`notion-api-green.vercel.app`)

Staging:

não existe

---

## Processo de Deploy

1. `npm run lint`
2. `npm run build` (localmente ou via `vercel-build`)
3. Push para a branch principal (deploy automático na Vercel)
4. Verificar smoke test manual (ver abaixo)
5. Conferir que `VITE_API_URL` está configurada no projeto da Vercel

Build command na Vercel:

`npm run vercel-build` (alias de `npm run build`)

---

## Configuração da Vercel

- **SPA rewrite**: `vercel.json` redireciona toda rota para `/index.html`:

```json
{ "version": 2, "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Sem isso, `/login` e `/editar/:id` quebram no refresh.

- **Env var do projeto**: `VITE_API_URL` (URL do backend) — definir no painel da Vercel, nunca no repositório
- **CORS**: o domínio do front precisa estar nas origens permitidas do `notion_api` (`CORS_ORIGINS`)

---

## Rollback

Deploy automático por commit. Rollback:

1. Vercel → Deployments → escolher build anterior → "Promote to Production"
2. Ou reverter o commit (`git revert`) e push

Sem migrations de banco (Notion), rollback é seguro — o schema não muda com o deploy do front.

---

## Checklist de Produção

- [ ] `npm run lint` passa
- [ ] `npm run build` passa
- [ ] `VITE_API_URL` configurada na Vercel
- [ ] CORS do backend aceita o domínio do front
- [ ] Smoke test: login → home carrega → lista popula → criar/editar livro funciona
- [ ] Sessão persiste após reload (guard + `/auth/me`)
- [ ] 401 (token expirado) redireciona para `/login`
- [ ] Responsividade conferida no celular
