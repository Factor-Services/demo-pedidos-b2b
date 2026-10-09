# Pedidos B2B

Portal de pedidos da Distribuidora Ventura: os representantes comerciais lançam os pedidos dos clientes (mercados, farmácias e restaurantes), o financeiro libera o crédito quando o pedido passa do limite, e a expedição fatura e acompanha a entrega.

## Estrutura

| Pasta | O que é |
|---|---|
| `apps/api` | API em Fastify e Prisma sobre Postgres: clientes, produtos, pedidos, crédito e notificações |
| `apps/web` | Portal em React e Vite, usado pelos representantes, pelo financeiro e pela expedição |
| `packages/shared` | Tipos, estados do pedido e utilitários de dinheiro, usados pelos dois apps |
| `docs` | Arquitetura e decisões |

## Rodar

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm --filter api prisma migrate dev
pnpm dev          # API na 3333, portal na 5173
pnpm test
```

## O ciclo do pedido

`rascunho` → `enviado` → `aguardando_credito` (quando passa do limite) → `aprovado` → `faturado` → `entregue`. Pode ser `cancelado` até o faturamento, e `recusado` pelo financeiro na análise de crédito. Ver `packages/shared/src/pedido.ts` e `docs/arquitetura.md`.
