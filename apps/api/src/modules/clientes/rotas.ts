import type { FastifyInstance } from "fastify"
import { z } from "zod"

import { exigir } from "../../auth/plugin"
import { db } from "../../lib/db"

export async function rotasClientes(app: FastifyInstance) {
  app.get("/clientes", { preHandler: exigir() }, async (req) => {
    const { busca } = z.object({ busca: z.string().optional() }).parse(req.query)
    return db.cliente.findMany({
      where: busca ? { OR: [{ razaoSocial: { contains: busca, mode: "insensitive" } }, { cnpj: { contains: busca } }] } : undefined,
      orderBy: { razaoSocial: "asc" },
      take: 50,
    })
  })

  app.get("/clientes/:id", { preHandler: exigir() }, async (req) => {
    const { id } = z.object({ id: z.string() }).parse(req.params)
    return db.cliente.findUniqueOrThrow({ where: { id } })
  })

  app.patch("/clientes/:id/limite", { preHandler: exigir("financeiro") }, async (req) => {
    const { id } = z.object({ id: z.string() }).parse(req.params)
    const { limiteCreditoCentavos } = z.object({ limiteCreditoCentavos: z.number().int().nonnegative() }).parse(req.body)
    return db.cliente.update({ where: { id }, data: { limiteCreditoCentavos } })
  })
}
