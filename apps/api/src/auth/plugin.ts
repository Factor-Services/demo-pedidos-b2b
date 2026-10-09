import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import jwt from "@fastify/jwt"
import type { Papel } from "@pedidos/shared"

import { env } from "../env"

export interface Sessao {
  usuarioId: string
  papel: Papel
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: Sessao
  }
}

export async function registrarAuth(app: FastifyInstance) {
  await app.register(jwt, { secret: env.JWT_SECRET })
}

/** Exige sessão e, quando informado, um dos papéis. */
export function exigir(...papeis: Papel[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    await req.jwtVerify()
    if (papeis.length > 0 && !papeis.includes(req.user.papel) && req.user.papel !== "admin") {
      return reply.code(403).send({ erro: "Sem permissão para esta operação" })
    }
  }
}
