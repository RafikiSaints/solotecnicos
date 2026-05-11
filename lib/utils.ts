import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Horarios } from '@/types/database.types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatearFecha(d: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...opts,
  }).format(date)
}

export function tiempoTranscurrido(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  const ms = Date.now() - date.getTime()
  const min = Math.floor(ms / 60000)
  if (min < 1) return 'hace un momento'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  if (d < 7) return `hace ${d} día${d > 1 ? 's' : ''}`
  const sem = Math.floor(d / 7)
  if (sem < 4) return `hace ${sem} sem`
  const mes = Math.floor(d / 30)
  if (mes < 12) return `hace ${mes} mes${mes > 1 ? 'es' : ''}`
  return `hace ${Math.floor(d / 365)} año${Math.floor(d / 365) > 1 ? 's' : ''}`
}

const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const

export function estaAbiertoAhora(horarios: Horarios | null | undefined): boolean {
  if (!horarios) return false
  const now = new Date()
  const dia = DIAS[now.getDay()] as keyof Horarios
  const h = horarios[dia]
  if (!h || !h.abierto || !h.abre || !h.cierra) return false
  const [ah, am] = h.abre.split(':').map(Number)
  const [ch, cm] = h.cierra.split(':').map(Number)
  const minNow = now.getHours() * 60 + now.getMinutes()
  return minNow >= ah * 60 + am && minNow <= ch * 60 + cm
}

export function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function truncar(text: string | null | undefined, max: number): string {
  if (!text) return ''
  return text.length > max ? text.substring(0, max).trim() + '…' : text
}

export function clpFormat(n: number | null | undefined): string {
  if (n === null || n === undefined) return 'A cotizar'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n)
}

export function generarLinkPersonalizado(slug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'
  return `${base}/t/${slug}`
}

export const DIAS_SEMANA = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
] as const
