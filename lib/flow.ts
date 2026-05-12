import crypto from 'crypto'
import { PLANES } from './planes'

const API_KEY    = process.env.FLOW_API_KEY || ''
const SECRET_KEY = process.env.FLOW_SECRET || ''

/**
 * URL de Flow controlable por env var:
 *   FLOW_MODE=sandbox  → sandbox.flow.cl (pruebas, no procesa plata)
 *   FLOW_MODE=production → www.flow.cl (cobros reales)
 *   sin valor → autodetecta: localhost = sandbox, Vercel = production
 */
function getApiUrl(): string {
  const mode = (process.env.FLOW_MODE || '').toLowerCase()
  if (mode === 'sandbox') return 'https://sandbox.flow.cl/api'
  if (mode === 'production') return 'https://www.flow.cl/api'
  // Fallback heurístico
  return process.env.NODE_ENV === 'production'
    ? 'https://www.flow.cl/api'
    : 'https://sandbox.flow.cl/api'
}

const API_URL = getApiUrl()

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
 * Crea orden de pago en Flow.cl
 */
export async function crearOrdenPago(params: {
  tecnicoId: string
  email: string
  plan: 'pro' | 'elite'
  tipo: 'mensual' | 'anual'
  urlRetorno: string
}) {
  if (!API_KEY || !SECRET_KEY) {
    throw new Error('Flow no configurado: faltan FLOW_API_KEY o FLOW_SECRET en variables de entorno')
  }

  const monto = PLANES[params.plan][`precio_${params.tipo}`]
  if (!monto) throw new Error('Monto inválido')

  // commerceOrder máx 45 chars en Flow
  // UUID sin guiones (32) → primeros 8 + timestamp en base36 (~9) + prefijo ST- (3) = ~22 chars
  const tecShort = params.tecnicoId.replace(/-/g, '').slice(0, 8)
  const ts = Date.now().toString(36)
  const commerceOrder = `ST-${tecShort}-${ts}` // ej: ST-a1b2c3d4-lj8zxk2

  const body: Record<string, string> = {
    apiKey: API_KEY,
    amount: String(monto),
    currency: 'CLP',
    subject: `SoloTécnicos ${PLANES[params.plan].nombre} - ${params.tipo}`,
    email: params.email,
    urlConfirmation: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/flow`,
    urlReturn: params.urlRetorno,
    commerceOrder,
    paymentMethod: '9',
  }
  body.s = firmar(body)

  const form = new URLSearchParams(body)
  console.log('[flow] POST', API_URL + '/payment/create', { commerceOrder: body.commerceOrder, amount: body.amount })

  const res = await fetch(`${API_URL}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })

  const text = await res.text()
  if (!res.ok) {
    console.error('[flow] error response', res.status, text)
    throw new Error(`Flow error ${res.status}: ${text}`)
  }

  let json
  try { json = JSON.parse(text) } catch {
    throw new Error(`Flow respuesta inválida: ${text.slice(0, 200)}`)
  }

  if (!json.url || !json.token) {
    throw new Error(`Flow respuesta sin url/token: ${text.slice(0, 200)}`)
  }

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
