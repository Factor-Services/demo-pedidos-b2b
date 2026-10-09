# 0001. Crédito acima do limite vai para análise manual

**Data:** 2025-03-12. **Estado:** aceita.

**Contexto.** A distribuidora tinha inadimplência alta em clientes novos e nenhum controle no momento do pedido.

**Decisão.** Todo pedido que passa do limite disponível do cliente para em `aguardando_credito` e só segue com decisão do financeiro, com justificativa.

**Consequências.** O risco caiu, e a fila cresceu: em semana de promoção, pedidos de clientes antigos e bons pagadores esperam mais de um dia pela decisão, e o representante só sabe do resultado por e-mail. A regra não diferencia um excedente de 2% de um de 200%.
