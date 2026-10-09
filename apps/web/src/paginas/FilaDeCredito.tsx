import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatarCentavos } from "@pedidos/shared"

import { api } from "../api"

interface Analise {
  id: string
  pedidoId: string
  excedenteCentavos: number
  abertaEm: string
  pedido: { numero: number; totalCentavos: number; cliente: { razaoSocial: string; limiteCreditoCentavos: number }; representante: { nome: string } }
}

/** A fila do financeiro. Cada linha é um pedido parado até alguém decidir. */
export function FilaDeCredito() {
  const qc = useQueryClient()
  const { data = [] } = useQuery({ queryKey: ["fila-credito"], queryFn: () => api<Analise[]>("/credito/fila") })
  const decidir = useMutation({
    mutationFn: (v: { pedidoId: string; decisao: "aprovado" | "recusado"; justificativa: string }) =>
      api(`/credito/${v.pedidoId}/decisao`, { method: "POST", body: JSON.stringify(v) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fila-credito"] }),
  })
  return (
    <table>
      <thead>
        <tr>
          <th>Pedido</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Excedente</th>
          <th>Esperando desde</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {data.map((a) => (
          <tr key={a.id}>
            <td>#{a.pedido.numero}</td>
            <td>{a.pedido.cliente.razaoSocial}</td>
            <td>{formatarCentavos(a.pedido.totalCentavos)}</td>
            <td>{formatarCentavos(a.excedenteCentavos)}</td>
            <td>{new Date(a.abertaEm).toLocaleString("pt-BR")}</td>
            <td>
              <button onClick={() => decidir.mutate({ pedidoId: a.pedidoId, decisao: "aprovado", justificativa: prompt("Justificativa") ?? "" })}>Aprovar</button>
              <button onClick={() => decidir.mutate({ pedidoId: a.pedidoId, decisao: "recusado", justificativa: prompt("Justificativa") ?? "" })}>Recusar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
