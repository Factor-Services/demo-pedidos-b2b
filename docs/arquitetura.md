# Arquitetura

Monorepo pnpm com dois apps e um pacote compartilhado.

- **API** (`apps/api`): Fastify 5, Prisma 5 e Postgres 16. Módulos por assunto em `src/modules`: `clientes`, `produtos`, `pedidos`, `credito` e `notificacoes`. Autenticação por JWT com papel (`representante`, `financeiro`, `expedicao`, `admin`) em `src/auth/plugin.ts`. Erro de regra de negócio é `ErroDeNegocio`, traduzido para HTTP no `server.ts`.
- **Portal** (`apps/web`): React 18, React Router 6 e TanStack Query, falando com a API por `/api` (proxy do Vite em dev).
- **Compartilhado** (`packages/shared`): os estados e as transições do pedido, os rótulos, e dinheiro sempre em centavos inteiros.

## O pedido

O representante cria o rascunho, com o preço de cada produto congelado no item. Ao enviar, a API avalia o crédito do cliente (`modules/credito/regras.ts`): dentro do limite disponível, o pedido é aprovado na hora; acima, abre uma `AnaliseCredito` com o excedente e o pedido fica em `aguardando_credito` até o financeiro decidir na fila (`/credito/fila`). A decisão manda e-mail ao representante. A expedição fatura e marca a entrega. Cada mudança de estado grava um `EventoPedido`.

## Limites conhecidos

- O `emAbertoCentavos` do cliente só é atualizado pelo job noturno de conciliação, fora deste repositório. Durante o dia o disponível pode estar desatualizado.
- A análise de crédito é sempre manual. Não há regra de tolerância, score nem prazo.
- O único canal de notificação é o e-mail.
- Não há testes de integração da API; os testes cobrem regras puras.
