import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatarCentavos, ROTULO_STATUS, type StatusPedido } from "@pedidos/shared"
import { useParams } from "react-router-dom"

import { api } from "../api"
import { SeloStatus } from "../componentes/SeloStatus"

interface Detalhe {
  id: string
  numero: number
  status: StatusPedido
  totalCentavos: number
  cliente: { razaoSocial: string; limiteCreditoCentavos: number; emAbertoCentavos: number }
  itens: { id: string; quantidade: number; precoUnitarioCentavos: number; produto: { nome: string; sku: string } }[]
  analiseCredito: { excedenteCentavos: number; decisao: string | null; justificativa: string | null } | null
  eventos: { id: string; para: StatusPedido; criadoEm: string }[]
}

export function Pedido() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ["pedido", id], queryFn: () => api<Detalhe>(`/pedidos/${id}`) })
  const enviar = useMutation({
    mutationFn: () => api(`/pedidos/${id}/enviar`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pedido", id] }),
  })
  if (!data) return null
  return (
    <section>
      <h1>
        Pedido #{data.numero} <SeloStatus status={data.status} />
      </h1>
      <p>{data.cliente.razaoSocial}</p>
      <ul>
        {data.itens.map((i) => (
          <li key={i.id}>
            {i.quantidade} × {i.produto.nome} ({i.produto.sku}) {formatarCentavos(i.precoUnitarioCentavos)}
          </li>
        ))}
      </ul>
      <p>Total: {formatarCentavos(data.totalCentavos)}</p>
      {data.analiseCredito && !data.analiseCredito.decisao ? (
        <p className="aviso">Esperando o financeiro: passou {formatarCentavos(data.analiseCredito.excedenteCentavos)} do limite.</p>
      ) : null}
      {data.status === "rascunho" ? <button onClick={() => enviar.mutate()}>Enviar pedido</button> : null}
      <h2>Histórico</h2>
      <ol>
        {data.eventos.map((e) => (
          <li key={e.id}>
            {ROTULO_STATUS[e.para]} em {new Date(e.criadoEm).toLocaleString("pt-BR")}
          </li>
        ))}
      </ol>
    </section>
  )
}
