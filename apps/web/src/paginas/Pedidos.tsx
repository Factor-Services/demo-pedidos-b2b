import { useQuery } from "@tanstack/react-query"
import { formatarCentavos, type StatusPedido } from "@pedidos/shared"
import { Link } from "react-router-dom"

import { api } from "../api"
import { SeloStatus } from "../componentes/SeloStatus"

interface Linha {
  id: string
  numero: number
  status: StatusPedido
  totalCentavos: number
  criadoEm: string
  cliente: { razaoSocial: string }
}

export function Pedidos() {
  const { data = [], isLoading } = useQuery({ queryKey: ["pedidos"], queryFn: () => api<Linha[]>("/pedidos") })
  if (isLoading) return <p>Carregando...</p>
  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Status</th>
          <th>Criado em</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p) => (
          <tr key={p.id}>
            <td>
              <Link to={`/pedidos/${p.id}`}>{p.numero}</Link>
            </td>
            <td>{p.cliente.razaoSocial}</td>
            <td>{formatarCentavos(p.totalCentavos)}</td>
            <td>
              <SeloStatus status={p.status} />
            </td>
            <td>{new Date(p.criadoEm).toLocaleDateString("pt-BR")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
