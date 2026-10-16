# AGENTS (docs)

Instruções do agente de IA: ver **`../AGENTS.md`** (raiz do repositório).

Não existe `docs/AGENTS.md` completo por decisão deliberada: o `AGENTS.md` da raiz é a **única fonte de verdade** para comportamento do agente (convenções, comandos, stack, estrutura). Duplicar criaria dois documentos para manter, e eles divergiriam.

## Antes de codar

1. Ler `../AGENTS.md` (raiz)
2. Ler os documentos relevantes desta pasta:
   - O que construir → `PRD.md`
   - Jornadas → `UX_FLOWS.md`
   - Visual → `DESIGN_SYSTEM.md`
   - Estrutura do sistema → `ARCHITECTURE.md`
   - Dado → `DATABASE.md`
   - Contrato HTTP → `API.md`
   - Segurança → `SECURITY.md`
   - Código → `CODE_STYLE.md`
   - Validação → `TESTING.md`
3. Não contradizer esses documentos sem antes apontar o conflito

## Regras operacionais

- Não inventar requisitos, campos de banco, endpoints, componentes ou padrões já definidos
- Mudança de comportamento → atualizar o doc correspondente
- Decisão técnica nova → registrar em `DECISIONS.md`
- Prioridades → `ROADMAP.md`; pendências conhecidas → `../analise-melhorias.md`
- Conflito entre requisitos: **não adivinhar**; perguntar
- Rodar `npm run lint` e `npm run build` ao final
- Commits só quando pedido explicitamente (regra do repo)
