import { describe, expect, it } from "vitest"

import { avaliarCredito } from "./regras"

describe("avaliarCredito", () => {
  const cliente = { limiteCreditoCentavos: 100_000, emAbertoCentavos: 40_000, bloqueado: false }

  it("libera quando o pedido cabe no limite disponível", () => {
    expect(avaliarCredito(cliente, 60_000)).toEqual({ tipo: "liberado" })
  })

  it("manda para análise o que passa do disponível, com o excedente", () => {
    expect(avaliarCredito(cliente, 75_000)).toEqual({ tipo: "analise", excedenteCentavos: 15_000 })
  })

  it("conta o excedente inteiro quando o cliente já estourou o limite", () => {
    expect(avaliarCredito({ ...cliente, emAbertoCentavos: 120_000 }, 10_000)).toEqual({ tipo: "analise", excedenteCentavos: 10_000 })
  })

  it("bloqueia cliente bloqueado, mesmo com limite", () => {
    expect(avaliarCredito({ ...cliente, bloqueado: true }, 1)).toEqual({ tipo: "bloqueado" })
  })
})
