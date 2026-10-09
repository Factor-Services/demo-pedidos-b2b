const TOKEN = "pedidos.token"

export async function api<T>(caminho: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(`/api${caminho}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem(TOKEN) ?? ""}`, ...init?.headers },
  })
  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}))
    throw new Error(corpo.erro ?? `Erro ${resposta.status}`)
  }
  return resposta.json() as Promise<T>
}
