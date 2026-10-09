import type { FastifyInstance } from "fastify"
import { z } from "zod"

import { exigir } from "../../auth/plugin"
import { db } from "../../lib/db"
import { transicionar } from "../pedidos/servico"

export async function rotasCredito(app: FastifyInstance) {
  /** A fila do financeiro: pedidos parados esperando decisão de crédito, o mais antigo primeiro. */
  app.get("/credito/fila", { preHandler: exigir("financeiro") }, async () => {
    return db.analiseCredito.findMany({
      where: { decisao: null },
      include: { pedido: { include: { cliente: true, representante: { select: { nome: true } } } } },
      orderBy: { abertaEm: "asc" },
    })
  })

  app.post("/credito/:pedidoId/decisao", { preHandler: exigir("financeiro") }, async (req) => {
    const { pedidoId } = z.object({ pedidoId: z.string() }).parse(req.params)
    const { decisao, justificativa } = z
      .object({ decisao: z.enum(["aprovado", "recusado"]), justificativa: z.string().min(3) })
      .parse(req.body)
    await db.analiseCredito.update({
      where: { pedidoId },
      data: { decisao, justificativa, analistaId: req.user.usuarioId, decididaEm: new Date() },
    })
    return transicionar(pedidoId, decisao, req.user.usuarioId)
  })
}
