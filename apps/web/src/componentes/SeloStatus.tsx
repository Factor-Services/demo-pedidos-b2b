import { ROTULO_STATUS, type StatusPedido } from "@pedidos/shared"

export function SeloStatus({ status }: { status: StatusPedido }) {
  return <span className={`selo selo-${status}`}>{ROTULO_STATUS[status]}</span>
}
