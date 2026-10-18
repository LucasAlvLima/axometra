<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AXOMETRA — Performance Intelligence

## Contexto

Aplicativo pessoal de treino, musculação, nutrição, cardio, sono e evolução corporal, orientado por dados, indicadores e dashboards. O projeto também será utilizado como portfólio profissional e poderá evoluir para produto comercial.

## Stack

- Next.js 16 com App Router.
- React 19.
- TypeScript em modo strict.
- Tailwind CSS 4.
- Supabase PostgreSQL e Supabase Auth.
- GitHub para versionamento e colaboração.
- Futura hospedagem na Vercel.

## Identidade visual

Premium Dark, minimalista, responsiva e orientada a analytics.

| Token | Cor |
| --- | --- |
| Background | `#0B1110` |
| Surface | `#17211F` |
| Primary | `#A8E6D2` |
| Text | `#EAF3EE` |
| Muted | `#879991` |

Fontes propostas: Manrope, Inter e JetBrains Mono. Não adicionar bibliotecas ou fontes sem necessidade e sem aprovação.

## Regras de engenharia

1. Apresentar um plano antes de mudanças significativas.
2. Fazer alterações pequenas, com escopo claramente definido.
3. Preservar alterações existentes no working tree.
4. Utilizar TypeScript estrito, evitando `any` sem justificativa.
5. Respeitar a separação entre Server Components e Client Components.
6. Priorizar componentes reutilizáveis e acessibilidade.
7. Nunca expor segredos ou registrar credenciais no Git.
8. Manter `.env.local` fora do versionamento.
9. Utilizar Supabase Auth e RLS para proteger dados pessoais.
10. Não utilizar `service_role` ou secret keys no navegador.
11. Não desabilitar RLS como solução para erros de acesso.
12. Versionar alterações de banco por migrations SQL.
13. Não executar comandos destrutivos, migrações remotas ou deploys sem aprovação.
14. Validar alterações com lint, verificação de tipos e build quando adequado.
15. Documentar decisões arquiteturais relevantes.
16. Não fazer commit ou push automaticamente sem solicitação explícita.

## Delegação

O agente principal atua como Tech Lead e coordena:

- Frontend & UI.
- Backend & Database.
- Data & Analytics.
- QA & Security.

Subagentes devem receber tarefas delimitadas e evitar edições concorrentes dos mesmos arquivos. A implementação de agentes especializados será configurada separadamente.
