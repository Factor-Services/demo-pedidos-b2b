import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { formatarCentavos } from "@pedidos/shared"
import { useNavigate } from "react-router-dom"

import { api } from "../api"

interface Cliente {
  id: string
  razaoSocial: string
}
interface Produto {
  id: string
  nome: string
  sku: string
  precoCentavos: number
}

export function NovoPedido() {
  const navigate = useNavigate()
  const [clienteId, setClienteId] = useState("")
  const [quantidades, setQuantidades] = useState<Record<string, number>>({})
  const clientes = useQuery({ queryKey: ["clientes"], queryFn: () => api<Cliente[]>("/clientes") })
  const produtos = useQuery({ queryKey: ["produtos"], queryFn: () => api<Produto[]>("/produtos") })
  const criar = useMutation({
    mutationFn: () =>
      api<{ id: string }>("/pedidos", {
        method: "POST",
        body: JSON.stringify({
          clienteId,
          itens: Object.entries(quantidades)
            .filter(([, q]) => q > 0)
            .map(([produtoId, quantidade]) => ({ produtoId, quantidade })),
        }),
      }),
    onSuccess: (p) => navigate(`/pedidos/${p.id}`),
  })
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        criar.mutate()
      }}
    >
      <label>
        Cliente
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
          <option value="">Escolha</option>
          {clientes.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.razaoSocial}
            </option>
          ))}
        </select>
      </label>
      {produtos.data?.map((p) => (
        <label key={p.id}>
          {p.nome} ({formatarCentavos(p.precoCentavos)})
          <input type="number" min={0} value={quantidades[p.id] ?? 0} onChange={(e) => setQuantidades({ ...quantidades, [p.id]: Number(e.target.value) })} />
        </label>
      ))}
      <button type="submit" disabled={!clienteId || criar.isPending}>
        Salvar rascunho
      </button>
    </form>
  )
}
