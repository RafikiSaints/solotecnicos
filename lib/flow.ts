import crypto from 'crypto'
import { PLANES } from './planes'

const API_KEY    = process.env.FLOW_API_KEY!
const SECRET_KEY = process.env.FLOW_SECRET!
const API_URL    = process.env.NODE_ENV === 'production'
  ? 'https://www.flow.cl/api'
  : 'https://sandbox.flow.cl/api'

export function firmar(params: Record<string, string>): string {
  const keys = Object.keys(params).sort()
  const cadena = keys.map(k => `${k}${params[k]}`).join('')
  return crypto.createHmac('sha256', SECRET_KEY).update(cadena).digest('hex')
}

export function verificarFirma(params: Record<string, string>, firma: string): boolean {
  const copy = { ...params }
  delete copy.s
  const esperada = firmar(copy)
  return crypto.timingSafeEqual(Buffer.from(esperada, 'hex'), Buffer.from(firma, 'hex'))
}

/**
 * Crea orden de pago en Flow.cl (suscripción o pago único).
 * TODO: credenciales en .env.local
 */
export async function crearOrdenPago(params: {
  tecnicoId: string
  email: string
  plan: 'pro' | 'elite'
  tipo: 'mensual' | 'anual'
  urlRetorno: string
}) {
  const monto = PLANES[params.plan][`precio_${params.tipo}`]
  if (!monto) throw new Error('Monto inválido')

  const body: Record<string, string> = {
    apiKey: API_KEY,
    amount: String(monto),
    currency: 'CLP',
    subject: `SoloTécnicos ${PLANES[params.plan].nombre} - ${params.tipo}`,
    email: params.email,
    urlConfirmation: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/flow`,
    urlReturn: params.urlRetorno,
    commerceOrder: `ST-${params.tecnicoId}-${Date.now()}`,
    paymentMethod: '9',
  }
  body.s = firmar(body)

  const form = new URLSearchParams(body)
  const res = await fetch(`${API_URL}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  if (!res.ok) throw new Error(`Flow error: ${res.status}`)
  const json = await res.json()
  return {
    token: json.token as string,
    url: `${json.url}?token=${json.token}` as string,
    flowOrder: json.flowOrder as string | undefined,
  }
}

export async function obtenerEstadoPago(token: string) {
  const params: Record<string, string> = { apiKey: API_KEY, token }
  params.s = firmar(params)
  const url = `${API_URL}/payment/getStatus?${new URLSearchParams(params).toString()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Flow getStatus: ${res.status}`)
  return res.json()
}
