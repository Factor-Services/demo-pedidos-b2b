/** Dinheiro sempre em centavos inteiros. Nunca float. */
export function formatarCentavos(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function somarItens(itens: { quantidade: number; precoUnitarioCentavos: number }[]): number {
  return itens.reduce((total, i) => total + i.quantidade * i.precoUnitarioCentavos, 0)
}
