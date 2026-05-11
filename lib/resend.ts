import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY || ''
export const resend = new Resend(apiKey)

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'hola@solotecnicos.cl'

/** Helper para enviar email; falla silenciosamente si no hay API key (útil para dev) */
export async function enviarEmail(opts: {
  to: string | string[]
  subject: string
  react: React.ReactElement
}) {
  if (!apiKey) {
    console.warn('[resend] RESEND_API_KEY no configurada — email no enviado:', opts.subject)
    return { skipped: true }
  }
  return resend.emails.send({
    from: FROM_EMAIL,
    to: opts.to,
    subject: opts.subject,
    react: opts.react,
  })
}
