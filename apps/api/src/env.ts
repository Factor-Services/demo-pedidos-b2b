import { z } from "zod"

const Env = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  SMTP_URL: z.string().default("smtp://localhost:1025"),
  PORT: z.coerce.number().default(3333),
})

export const env = Env.parse(process.env)
