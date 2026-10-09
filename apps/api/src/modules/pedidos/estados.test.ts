import { describe, expect, it } from "vitest"
import { podeTransicionar } from "@pedidos/shared"

describe("ciclo do pedido", () => {
  it("só fatura pedido aprovado", () => {
    expect(podeTransicionar("aprovado", "faturado")).toBe(true)
    expect(podeTransicionar("aguardando_credito", "faturado")).toBe(false)
  })

  it("não cancela depois de faturado", () => {
    expect(podeTransicionar("faturado", "cancelado")).toBe(false)
  })

  it("pedido recusado volta para rascunho para ser refeito", () => {
    expect(podeTransicionar("recusado", "rascunho")).toBe(true)
  })
})
