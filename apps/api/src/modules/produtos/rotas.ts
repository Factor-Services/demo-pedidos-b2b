import type { FastifyInstance } from "fastify"
import { z } from "zod"

import { exigir } from "../../auth/plugin"
import { db } from "../../lib/db"

export async function rotasProdutos(app: FastifyInstance) {
  app.get("/produtos", { preHandler: exigir() }, async (req) => {
    const { busca } = z.object({ busca: z.string().optional() }).parse(req.query)
    return db.produto.findMany({
      where: { ativo: true, ...(busca ? { nome: { contains: busca, mode: "insensitive" as const } } : {}) },
      orderBy: { nome: "asc" },
      take: 100,
    })
  })
}
