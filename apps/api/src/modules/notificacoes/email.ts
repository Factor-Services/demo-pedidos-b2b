import nodemailer from "nodemailer"

import { env } from "../../env"

const transporte = nodemailer.createTransport(env.SMTP_URL)

/** E-mail é o único canal hoje. O representante só sabe da decisão de crédito por aqui. */
export async function enviarEmail(para: string, assunto: string, texto: string) {
  await transporte.sendMail({ from: "pedidos@distribuidoraventura.example", to: para, subject: assunto, text: texto })
}
