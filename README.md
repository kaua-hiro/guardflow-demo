# GuardFlow

**Automação de compliance e revisão de acesso para equipes pequenas e médias.**

Produção: **https://guardflow-demo.vercel.app**

> Projeto de portfólio desenvolvido por [Kauã Hiro Mizumoto](mailto:hirosala97@gmail.com). Não é um produto SaaS real em operação — é uma demonstração funcional completa, com lógica de negócio real (não apenas telas estáticas), pensada para mostrar como eu abordo produtos B2B de compliance/segurança na prática.

## O problema que resolve

Empresas que buscam certificação SOC 2, ISO 27001 ou conformidade com a LGPD precisam provar três coisas para um auditor: **quem tem acesso a quê**, **que esse acesso é revisado periodicamente**, e **que existe um registro à prova de adulteração de tudo isso**. Hoje, times pequenos e médios fazem isso em planilha — o que não escala e não convence um auditor.

GuardFlow automatiza essa rotina em um único painel:

- **Revisão de acessos** com recálculo real de risco a cada aprovação/revogação.
- **Trilha de auditoria com hash-chain** (SHA-256) — qualquer alteração retroativa nos registros quebra a corrente de forma matematicamente verificável, o elemento de assinatura visual do produto.
- **Checklist de compliance** mapeado a controles reais de SOC 2 / ISO 27001 / LGPD.

## Para quem é

Startups e empresas de médio porte (fintechs, SaaS B2B, prestadoras de serviço) que estão se preparando para uma auditoria de segurança e ainda não têm — nem precisam ainda ter — uma equipe de compliance dedicada ou uma plataforma como Vanta/Drata. GuardFlow é o produto que um freelancer ou uma pequena squad de engenharia consegue adotar em um dia para começar a organizar essa rotina, sem esperar orçamento para uma ferramenta enterprise.

## Por que compraria

- **Reduz risco de auditoria reprovada**: acessos não revisados são a causa mais comum de apontamentos em auditorias SOC 2.
- **Prova de integridade real, não apenas visual**: a trilha de auditoria é uma cadeia de hashes de verdade — o botão "Verificar integridade" recomputa a cadeia inteira e mostra exatamente onde ela quebraria se houvesse adulteração.
- **Score de compliance objetivo**: em vez de "achismo", o score é uma função determinística do estado real dos acessos (peso de risco por permissão, tempo desde a última revisão, pendências).

## Stack

- **Vite + React + TypeScript** — TypeScript em toda a lógica de negócio, com tipos explícitos para o domínio (`AccessGrant`, `AuditEvent`, `ComplianceScoreBreakdown`).
- **react-router-dom** para as rotas da SPA.
- **Arquitetura modular**: `src/services/` contém a lógica de negócio pura (cálculo de score, cadeia de hashes, autenticação mock, persistência) sem nenhuma dependência de React — testável isoladamente. `src/context/` conecta essa lógica ao estado da aplicação. `src/pages/` e `src/components/` cuidam só de apresentação.
- **Sem backend**: autenticação e dados são simulados via `localStorage`, incluindo um passo de verificação em duas etapas (2FA) com UI real.
- **Hash-chain real**: `src/services/auditChain.ts` usa `crypto.subtle.digest` (Web Crypto API, SHA-256) para encadear cada evento ao hash do evento anterior — a mesma primitiva usada por blockchains e pelo Git.
- **Sem bibliotecas de gráfico**: o gráfico de tendência do score é SVG desenhado à mão em `RiskTrendChart.tsx`.
- Deploy na **Vercel**, com rewrite de SPA e headers de segurança (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) configurados em `vercel.json`.

## Rodando localmente

```bash
npm install
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção
npm run preview  # servir o build localmente
```

Credenciais de demonstração (exibidas na própria tela de login):

- **E-mail**: `kaua@guardflow.demo`
- **Senha**: `guardflow123`
- **Código 2FA**: qualquer sequência de 6 dígitos é aceita (ambiente de demonstração).
