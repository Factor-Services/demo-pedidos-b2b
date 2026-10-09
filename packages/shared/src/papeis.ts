export const PAPEIS = ["representante", "financeiro", "expedicao", "admin"] as const
export type Papel = (typeof PAPEIS)[number]
