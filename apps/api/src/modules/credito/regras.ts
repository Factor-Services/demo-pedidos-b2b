/**
 * Regra de crédito do pedido. Hoje é uma só: passou do limite disponível, vai para análise manual do
 * financeiro. Não há score, histórico de pagamento nem tolerância. Ver docs/decisoes/0001-credito-manual.md.
 */
export interface SituacaoDeCredito {
  limiteCreditoCentavos: number
  emAbertoCentavos: number
  bloqueado: boolean
}

export type ResultadoCredito =
  | { tipo: "liberado" }
  | { tipo: "analise"; excedenteCentavos: number }
  | { tipo: "bloqueado" }

export function avaliarCredito(cliente: SituacaoDeCredito, totalPedidoCentavos: number): ResultadoCredito {
  if (cliente.bloqueado) return { tipo: "bloqueado" }
  const disponivel = cliente.limiteCreditoCentavos - cliente.emAbertoCentavos
  if (totalPedidoCentavos <= disponivel) return { tipo: "liberado" }
  return { tipo: "analise", excedenteCentavos: totalPedidoCentavos - Math.max(disponivel, 0) }
}
