# Observability

## Contexto

App pessoal, single-user, SPA estática. **Não há telemetria, analytics ou error tracking** hoje. O que existe é observabilidade via console do browser e logs do backend (`notion_api`/Vercel). Este doc define o que observar e o que seria necessário adotar se o app sair do uso pessoal.

---

## 1. Logging (front)

Mecanismo atual:

`console` via `utils/errorHandler.js` → `logError(action, error)` com prefixo ❌ e nome da action (`fetchBooks`, `createBook`, `login`...).

Logar:

- Erros de action de store (já faz)
- Falhas de autenticação (mensagem, sem credenciais)

Nunca logar:

- Token JWT (`SESSION_TOKEN`)
- Código de acesso
- Email completo
- Corpo completo de responses com dado pessoal

Sem `console.log` de debug em produção (código de produção e comentários em pt-BR; logs com marcadores ✅ ❌ 🔍 ⚡ 📝).

---

## 2. Métricas

Não coletadas. Se necessário no futuro:

- Tempo de carregamento das listas (o backend expõe paginação; medir client-side)
- Taxa de falha por endpoint (contar erros por status no interceptor)
- Número de livros por status (endpoint `/api/books/stats` existe no backend, mas é consumo do `dashboard__journal` — aqui viraria contagem client-side via listas)

---

## 3. Monitoramento

Não configurado. Opções leves, caso venha a ser necessário:

- **Vercel Analytics/Web Vitals** (zero-config no plano Hobby) — métricas de carga
- **Sentry Browser** — erros de runtime do front (atenção ao scrub de PII)
- Logs do backend: Vercel Functions (retention limitada no plano gratuito)

---

## 4. Alertas

Nenhum. Para uso pessoal, o alerta é a falha visível na tela (estado de erro + toast).

Se houvesse: downtime do backend, taxa de 5xx, falhas de login recorrentes.

---

## 5. Eventos de Negócio Importantes

Registráveis futuramente (hoje só existem como dados no Notion):

- Livro criado / concluído / arquivado
- Leituras por ano (já derivável de `wasReadIn` e `/finished-this-year`)

---

## 6. Rastreamento de Erros

Atual: desenvolvedora vê o erro no console do browser.

Lacuna conhecida: erros em produção (celular, rede ruim) passam despercebidos. Mitigação mínima possível sem libs: os estados de erro da UI já mostram `store.error` ao usuário.

---

## 7. Performance

Observado manualmente:

- Chunk prefetch de listas (produção) reduz tempo entre slides
- Debounce 400 ms e descarte de respostas obsoletas evitam picos de req
- Backend cacheia `options` (300 s)

A monitorar se a biblioteca crescer: virtual scrolling na `BookList` (`ROADMAP.md`).
