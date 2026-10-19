<p align="center">
  <img src="public/brand/axometra-symbol.png" width="104" height="104" alt="Monograma geométrico A" />
</p>

<h1 align="center">AXOMETRA</h1>
<p align="center"><strong>Performance Intelligence</strong></p>
<p align="center">Train. Measure. Evolve.</p>

Plataforma pessoal de acompanhamento da performance física, em construção, que busca transformar registros de treino, alimentação, sono, peso e medidas corporais em indicadores úteis para acompanhar evolução e tomar decisões orientadas por dados.

**Status: em desenvolvimento.** MVP com autenticação real e interfaces demonstrativas de Dashboard, Treinos e Alimentação. Os registros de performance ainda não são persistidos. Não há publicação em produção documentada neste repositório.

## Visão geral

Dados de performance costumam ficar dispersos entre anotações, aplicativos e planilhas. O AXOMETRA propõe uma visão integrada desses registros, com períodos, unidades e cobertura explícitos para facilitar a interpretação da evolução.

A experiência segue uma identidade Premium Dark, com Obsidian, Graphite e Sage, tipografia clara e apresentação responsiva para desktop e celular. O projeto também serve como portfólio técnico e visual para o Instagram **Shape & Dados**.

## O que já funciona

| Área | Implementação atual |
| --- | --- |
| Autenticação | Login por e-mail e senha com Supabase Auth, sessão SSR, validação no servidor e logout da sessão local. |
| Dashboard | Cards de peso, calorias, treinos e sono; evolução do peso em SVG com alternativa tabular; resumo semanal recolhível e apresentação compacta no celular. |
| Treinos | Divisão de treinos, sessões, exercícios, séries, repetições e cargas; contagem de sessões e séries concluídas; volume externo registrado e indicação de dados parciais. |
| Alimentação | Refeições, porções demonstrativas e quantidades; proteínas, carboidratos, gorduras, energia informada e estimada; distribuição energética dos macronutrientes. |
| Interface | Marca AXOMETRA, navegação entre os três módulos, estados vazios, foco visível e controles nativos de expansão. |

### Registros pessoais e demonstração

- `/dashboard`, `/treinos` e `/alimentacao` exibem uma **visão pessoal vazia** por padrão. Ausência de registro não é apresentada como zero.
- O parâmetro `view`, com uma única ocorrência e valor exato `demo`, ativa as fixtures demonstrativas, como em `/dashboard?view=demo`. Valores diferentes ou repetidos não ativam esse modo.
- As demonstrações exigem autenticação e são identificadas como **“Demonstração — dados fictícios”**, inclusive em blocos que podem ser capturados isoladamente.
- A navegação preserva o modo demonstrativo. As fixtures são fixas, separadas dos estados pessoais e não são gravadas no Supabase.
- Não existem formulários de registro, edição ou exclusão de métricas nesta versão. A integração atual com o Supabase é de autenticação.

Os dados fictícios ilustram a interface e os cálculos; não representam resultados reais de uma pessoa. As fixtures alimentares usam porções genéricas, sem constituir uma base de composição de alimentos.

### Convenções dos indicadores

- **Treinos:** volume externo em `kg·rep`, calculado a partir de repetições e carga externa das séries de trabalho concluídas em sessões concluídas. Aquecimento fica fora; peso corporal e assistência não são convertidos em carga externa. Dados ausentes podem produzir subtotais parciais.
- **Alimentação:** nutrientes em gramas e energia em quilocalorias. A energia informada nos registros é separada da estimativa `4 × proteínas + 4 × carboidratos + 9 × gorduras`. A distribuição percentual usa a energia estimada dos macros. A interface apresenta a diferença entre as energias quando ambas estão completas, sem determinar sua causa.
- **Períodos:** datas civis e horários das fixtures de Treinos e Alimentação seguem `America/Sao_Paulo`. As telas mantêm período, unidades e informações de cobertura pertinentes.

## Arquitetura e tecnologias

| Tecnologia | Uso no projeto |
| --- | --- |
| Next.js 16.4.2 / App Router | Rotas, Server Components, Server Actions e Proxy. `cacheComponents` e `partialPrefetching` habilitados. |
| React 19.3 | Composição da interface e formulários com `useActionState`. |
| TypeScript | Modo `strict`, contratos tipados e funções puras de cálculo. |
| Tailwind CSS 4 | Tokens e estilos responsivos, com o loader `@tailwindcss/turbopack` configurado no Next.js. |
| Supabase JS / Supabase SSR | Autenticação e gerenciamento de sessão por cookies. |
| Geist / Geist Mono | Fontes configuradas com `next/font/google`. |
| ESLint 9 | Verificação estática com a configuração do Next.js. |

As páginas permanecem Server Components; os formulários de login e logout usam Client Components para interação com as Server Actions. Os módulos analíticos concentram tipos, fixtures e cálculos, separados da apresentação.

O gráfico de peso usa SVG nativo, sem biblioteca de gráficos. Embora o Supabase ofereça PostgreSQL, esta versão ainda não integra tabelas de métricas.

## Estrutura do projeto

```text
public/brand/              Símbolo da marca
src/
  app/
    page.tsx               Página inicial
    login/                 Acesso à aplicação
    dashboard/             Visão geral protegida
    treinos/               Módulo de treinos protegido
    alimentacao/           Módulo alimentar protegido
    globals.css            Tokens e estilos globais
    layout.tsx             Fontes, metadados e idioma
  components/
    auth/                  Formulários e logout
    brand/                 Componente BrandLogo
    dashboard/             Shell, navegação, cards, gráfico e resumo
    training/              Sessões, divisão e séries
    nutrition/             Refeições e distribuição de macros
  lib/
    auth/                  Actions, estados e validação de identidade
    supabase/              Clientes e atualização de sessão
    dashboard/             Contratos e fixtures do Dashboard
    training/              Contratos, fixtures e cálculos de treinos
    nutrition/             Contratos, fixtures e cálculos alimentares
  proxy.ts                 Entrada do Proxy do Next.js
.codex/                    Configuração e instruções dos agentes do projeto
AGENTS.md                  Diretrizes técnicas e identidade visual
```

## Executar localmente

### Pré-requisitos

- Node.js e npm compatíveis com as dependências. O Next.js instalado declara Node `>=20.9.0`; o ambiente utilizado possui Node 24.22.0 e npm 11.19.1.
- Projeto Supabase com autenticação por e-mail e senha configurada.
- Usuário de acesso criado manualmente no Supabase. Para reproduzir o modelo pessoal do aplicativo, mantenha o cadastro público desabilitado no serviço.

Na raiz de uma cópia do repositório, instale as dependências do lockfile:

```bash
npm ci
```

Crie `.env.local` na raiz com as variáveis abaixo e preencha os valores do seu próprio projeto Supabase:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Os nomes correspondem aos clientes existentes. A chave **publishable** é destinada ao uso público pelo cliente; não a substitua por `service_role` ou uma secret key. Não versionar senhas, tokens de sessão ou credenciais administrativas.

`.env.local` está coberto por `.gitignore`. As configurações remotas de usuários e cadastro precisam ser verificadas no seu projeto Supabase; não são provisionadas pelo repositório.

Inicie o servidor:

```bash
npm run dev
```

Acesse [localhost:3000](http://localhost:3000) e abra `/login`. Após autenticar, use as rotas pessoais ou `/dashboard?view=demo`, `/treinos?view=demo` e `/alimentacao?view=demo`.

### Verificações e produção local

```bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

Após um build bem-sucedido:

```bash
npm run start
```

`start` serve o build de produção existente. O projeto não possui script `test` nem pipeline CI/CD configurado. A instalação e o primeiro processamento das fontes por `next/font/google` podem precisar de acesso à rede.

## Segurança e autenticação

- O Proxy valida/renova a sessão com `getClaims()` e propaga cookies entre requisição e resposta. As respostas tratadas por ele recebem controles para evitar cache compartilhado da sessão.
- As páginas protegidas confirmam a identidade com `requireUser()` e `getUser()` no servidor. A leitura ocorre sob `Suspense`, com `connection()` estabelecendo o contexto de requisição.
- Visitantes sem sessão são redirecionados para `/login`. Indisponibilidade de autenticação apresenta erro ou resposta temporariamente indisponível, sem liberar o conteúdo protegido.
- Login e logout são Server Actions. O login valida os campos sem normalizar a senha; mensagens de rejeição evitam distinguir a existência da conta. O logout usa `signOut({ scope: "local" })` e não promete encerrar sessões em outros dispositivos.
- Os estados retornados pelas Actions não incluem senhas, cookies ou tokens. As demonstrações seguem a mesma proteção das páginas pessoais.

Essas medidas descrevem a implementação atual, não uma certificação de segurança. Tabelas, autorização por registro e políticas RLS para métricas precisarão ser implementadas e verificadas antes da persistência de dados pessoais. Não há auditoria das configurações remotas do Supabase documentada aqui.

## Roadmap

### Implementado

- [x] Identidade AXOMETRA e interface Premium Dark responsiva.
- [x] Login, sessão SSR, proteção das páginas e logout local.
- [x] Dashboard V1 e refinamento mobile com resumo recolhível.
- [x] Interfaces V1 de Treinos e Alimentação.
- [x] Fixtures demonstrativas isoladas, contratos e cálculos tipados.

### Em desenvolvimento / consolidação

- [ ] Ampliação das verificações de regressão, acessibilidade e execução em diferentes ambientes.

### Planejado

- [ ] Modelagem e persistência de registros pessoais, com migrations e RLS.
- [ ] Formulários para registrar e editar treinos e alimentação.
- [ ] Módulos de Sono e Medidas, hoje identificados como “Em breve”.
- [ ] Acompanhamento de cardio e evolução corporal a partir de registros reais.
- [ ] Testes automatizados contínuos e pipeline CI/CD.
- [ ] Preparação de hospedagem, ainda sem ambiente publicado documentado.

O roadmap indica intenção de evolução; não representa funcionalidades disponíveis ou datas de entrega.

## Status e limitações conhecidas

- O fluxo de autenticação passou por testes manuais básicos relatados pelo responsável pelo projeto. Os indicadores demonstrativos continuam sendo fictícios; as visões pessoais não carregam registros persistidos.
- Não há cadastro público, recuperação de senha, formulários de métricas ou integração entre métricas reais dos módulos nesta etapa.
- O build de produção foi concluído com sucesso no PowerShell externo. Execuções iniciadas pelo Codex apresentaram uma falha no subprocesso CSS do Turbopack, cuja causa completa permanece não confirmada.
- Verificações pontuais de tipos, lint, SSR e cálculos não equivalem a uma suíte automatizada de ponta a ponta nem garantem comportamento em todos os dispositivos.
