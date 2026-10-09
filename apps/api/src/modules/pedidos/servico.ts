import { podeTransicionar, somarItens, type StatusPedido } from "@pedidos/shared"

import { db } from "../../lib/db"
import { ErroDeNegocio } from "../../lib/erros"
import { avaliarCredito } from "../credito/regras"
import { enviarEmail } from "../notificacoes/email"

export interface NovoItem {
  produtoId: string
  quantidade: number
}

export async function criarRascunho(clienteId: string, representanteId: string, itens: NovoItem[], observacao?: string) {
  const produtos = await db.produto.findMany({ where: { id: { in: itens.map((i) => i.produtoId) }, ativo: true } })
  if (produtos.length !== new Set(itens.map((i) => i.produtoId)).size) {
    throw new ErroDeNegocio(400, "Há produto inativo ou inexistente no pedido")
  }
  const comPreco = itens.map((i) => ({
    produtoId: i.produtoId,
    quantidade: i.quantidade,
    precoUnitarioCentavos: produtos.find((p) => p.id === i.produtoId)!.precoCentavos,
  }))
  return db.pedido.create({
    data: {
      clienteId,
      representanteId,
      observacao,
      totalCentavos: somarItens(comPreco),
      itens: { create: comPreco },
      eventos: { create: { para: "rascunho", autorId: representanteId } },
    },
    include: { itens: true },
  })
}

export async function transicionar(pedidoId: string, para: StatusPedido, autorId: string) {
  const pedido = await db.pedido.findUnique({ where: { id: pedidoId } })
  if (!pedido) throw new ErroDeNegocio(404, "Pedido não encontrado")
  if (!podeTransicionar(pedido.status, para)) {
    throw new ErroDeNegocio(409, `O pedido não pode ir de ${pedido.status} para ${para}`)
  }
  const agora = new Date()
  const atualizado = await db.pedido.update({
    where: { id: pedidoId },
    data: {
      status: para,
      ...(para === "enviado" ? { enviadoEm: agora } : {}),
      ...(para === "aprovado" || para === "recusado" ? { decisaoCreditoEm: agora } : {}),
      ...(para === "faturado" ? { faturadoEm: agora } : {}),
      eventos: { create: { de: pedido.status, para, autorId } },
    },
    include: { representante: true, cliente: true },
  })
  if (para === "aprovado" || para === "recusado") {
    await enviarEmail(
      atualizado.representante.email,
      `Pedido #${atualizado.numero} ${para}`,
      `O pedido #${atualizado.numero} de ${atualizado.cliente.razaoSocial} foi ${para} pelo financeiro.`,
    )
  }
  return atualizado
}

/**
 * Envia o pedido. Dentro do limite ele é aprovado na hora; acima, abre uma análise de crédito e espera o
 * financeiro. Cliente bloqueado não envia.
 */
export async function enviar(pedidoId: string, autorId: string) {
  const pedido = await db.pedido.findUnique({ where: { id: pedidoId }, include: { cliente: true } })
  if (!pedido) throw new ErroDeNegocio(404, "Pedido não encontrado")
  const credito = avaliarCredito(pedido.cliente, pedido.totalCentavos)
  if (credito.tipo === "bloqueado") throw new ErroDeNegocio(409, "Cliente bloqueado pelo financeiro")
  await transicionar(pedidoId, "enviado", autorId)
  if (credito.tipo === "liberado") return transicionar(pedidoId, "aprovado", autorId)
  await db.analiseCredito.create({ data: { pedidoId, excedenteCentavos: credito.excedenteCentavos } })
  return transicionar(pedidoId, "aguardando_credito", autorId)
}
