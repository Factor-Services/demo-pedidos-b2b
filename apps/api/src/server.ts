import Fastify from "fastify"
import cors from "@fastify/cors"
import { ZodError } from "zod"

import { registrarAuth } from "./auth/plugin"
import { env } from "./env"
import { ErroDeNegocio } from "./lib/erros"
import { rotasClientes } from "./modules/clientes/rotas"
import { rotasCredito } from "./modules/credito/rotas"
import { rotasPedidos } from "./modules/pedidos/rotas"
import { rotasProdutos } from "./modules/produtos/rotas"

const app = Fastify({ logger: true })

await app.register(cors, { origin: ["http://localhost:5173"] })
await registrarAuth(app)

app.setErrorHandler((erro, _req, reply) => {
  if (erro instanceof ErroDeNegocio) return reply.code(erro.status).send({ erro: erro.message })
  if (erro instanceof ZodError) return reply.code(400).send({ erro: "Dados inválidos", detalhes: erro.issues })
  app.log.error(erro)
  return reply.code(500).send({ erro: "Erro interno" })
})

await app.register(rotasClientes)
await app.register(rotasProdutos)
await app.register(rotasPedidos)
await app.register(rotasCredito)

await app.listen({ port: env.PORT, host: "0.0.0.0" })
