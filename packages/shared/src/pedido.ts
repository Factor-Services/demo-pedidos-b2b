export const STATUS_PEDIDO = [
  "rascunho",
  "enviado",
  "aguardando_credito",
  "aprovado",
  "recusado",
  "faturado",
  "entregue",
  "cancelado",
] as const

export type StatusPedido = (typeof STATUS_PEDIDO)[number]

/** Transições permitidas. A API recusa qualquer outra com 409. */
export const TRANSICOES: Record<StatusPedido, readonly StatusPedido[]> = {
  rascunho: ["enviado", "cancelado"],
  enviado: ["aguardando_credito", "aprovado", "cancelado"],
  aguardando_credito: ["aprovado", "recusado", "cancelado"],
  aprovado: ["faturado", "cancelado"],
  recusado: ["rascunho"],
  faturado: ["entregue"],
  entregue: [],
  cancelado: [],
}

export function podeTransicionar(de: StatusPedido, para: StatusPedido): boolean {
  return TRANSICOES[de].includes(para)
}

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aguardando_credito: "Aguardando crédito",
  aprovado: "Aprovado",
  recusado: "Recusado",
  faturado: "Faturado",
  entregue: "Entregue",
  cancelado: "Cancelado",
}

export interface ItemPedidoDTO {
  produtoId: string
  quantidade: number
  precoUnitarioCentavos: number
}

export interface PedidoDTO {
  id: string
  numero: number
  clienteId: string
  representanteId: string
  status: StatusPedido
  itens: ItemPedidoDTO[]
  totalCentavos: number
  criadoEm: string
  enviadoEm: string | null
  decisaoCreditoEm: string | null
}
