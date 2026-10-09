import type { FastifyInstance } from "fastify"
import { STATUS_PEDIDO } from "@pedidos/shared"
import { z } from "zod"

import { exigir } from "../../auth/plugin"
import { db } from "../../lib/db"
import { criarRascunho, enviar, transicionar } from "./servico"

export async function rotasPedidos(app: FastifyInstance) {
  app.get("/pedidos", { preHandler: exigir() }, async (req) => {
    const { status } = z.object({ status: z.enum(STATUS_PEDIDO).optional() }).parse(req.query)
    const meus = req.user.papel === "representante" ? { representanteId: req.user.usuarioId } : {}
    return db.pedido.findMany({
      where: { ...meus, ...(status ? { status } : {}) },
      include: { cliente: { select: { razaoSocial: true } } },
      orderBy: { criadoEm: "desc" },
      take: 100,
    })
  })

  app.get("/pedidos/:id", { preHandler: exigir() }, async (req) => {
    const { id } = z.object({ id: z.string() }).parse(req.params)
    return db.pedido.findUniqueOrThrow({
      where: { id },
      include: { itens: { include: { produto: true } }, cliente: true, analiseCredito: true, eventos: { orderBy: { criadoEm: "asc" } } },
    })
  })

  app.post("/pedidos", { preHandler: exigir("representante") }, async (req, reply) => {
    const corpo = z
      .object({
        clienteId: z.string(),
        observacao: z.string().optional(),
        itens: z.array(z.object({ produtoId: z.string(), quantidade: z.number().int().positive() })).min(1),
      })
      .parse(req.body)
    const pedido = await criarRascunho(corpo.clienteId, req.user.usuarioId, corpo.itens, corpo.observacao)
    return reply.code(201).send(pedido)
  })

  app.post("/pedidos/:id/enviar", { preHandler: exigir("representante") }, async (req) => {
    const { id } = z.object({ id: z.string() }).parse(req.params)
    return enviar(id, req.user.usuarioId)
  })

  app.post("/pedidos/:id/cancelar", { preHandler: exigir("representante", "financeiro") }, async (req) => {
    const { id } = z.object({ id: z.string() }).parse(req.params)
    return transicionar(id, "cancelado", req.user.usuarioId)
  })

  app.post("/pedidos/:id/faturar", { preHandler: exigir("expedicao") }, async (req) => {
    const { id } = z.object({ id: z.string() }).parse(req.params)
    return transicionar(id, "faturado", req.user.usuarioId)
  })

  app.post("/pedidos/:id/entregar", { preHandler: exigir("expedicao") }, async (req) => {
    const { id } = z.object({ id: z.string() }).parse(req.params)
    return transicionar(id, "entregue", req.user.usuarioId)
  })
}
