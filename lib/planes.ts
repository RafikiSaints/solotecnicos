import type { Tecnico } from '@/types/database.types'

export const PLANES = {
  gratis: {
    nombre: 'Gratuito',
    precio_mensual: 0,
    precio_anual: 0,
    limites: {
      fotos: 3,
      trabajos_portafolio: 2,
      servicios: 5,
      etiquetas: 5,
      puede_responder_resenas: false,
      whatsapp_visible: false,
      estadisticas: false,
      badge_verificado: false,
      posicion_destacada: false,
      primera_posicion: false,
      banner_resultados: false,
      puede_ver_fotos_cotizacion: false,
      agenda: false,
      video: false,
      puntos_atencion: false,
      certificaciones: false,
      link_personalizado: true,
      alertas_demanda: false,
    },
  },
  pro: {
    nombre: 'PRO',
    precio_mensual: 14990,
    precio_anual: 149900,
    limites: {
      fotos: 30,
      trabajos_portafolio: 30,
      servicios: 50,
      etiquetas: 15,
      puede_responder_resenas: true,
      whatsapp_visible: true,
      estadisticas: true,
      badge_verificado: true,
      posicion_destacada: true,
      primera_posicion: false,
      banner_resultados: false,
      puede_ver_fotos_cotizacion: true,
      agenda: true,
      video: true,
      puntos_atencion: true,
      certificaciones: true,
      link_personalizado: true,
      alertas_demanda: true,
    },
  },
  elite: {
    nombre: 'Elite',
    precio_mensual: 34990,
    precio_anual: 349900,
    limites: {
      fotos: 100,
      trabajos_portafolio: 100,
      servicios: 200,
      etiquetas: 100,
      puede_responder_resenas: true,
      whatsapp_visible: true,
      estadisticas: true,
      badge_verificado: true,
      posicion_destacada: true,
      primera_posicion: true,
      banner_resultados: true,
      puede_ver_fotos_cotizacion: true,
      agenda: true,
      video: true,
      puntos_atencion: true,
      certificaciones: true,
      link_personalizado: true,
      alertas_demanda: true,
    },
  },
} as const

export type PlanFeature = keyof typeof PLANES.gratis.limites
export type PlanKey = keyof typeof PLANES

export function planVigente(tecnico: Pick<Tecnico, 'plan' | 'plan_vence_en'>): PlanKey {
  if (tecnico.plan === 'gratis') return 'gratis'
  if (!tecnico.plan_vence_en) return tecnico.plan
  if (new Date(tecnico.plan_vence_en) < new Date()) return 'gratis'
  return tecnico.plan
}

export function puedeHacer(
  tecnico: Pick<Tecnico, 'plan' | 'plan_vence_en'>,
  feature: PlanFeature
): boolean {
  const plan = planVigente(tecnico)
  return !!PLANES[plan].limites[feature]
}

export function limiteNumerico(
  tecnico: Pick<Tecnico, 'plan' | 'plan_vence_en'>,
  feature: 'fotos' | 'servicios' | 'trabajos_portafolio' | 'etiquetas'
): number {
  const plan = planVigente(tecnico)
  const val = PLANES[plan].limites[feature]
  return val === Infinity ? 9999 : (val as number)
}

export function precioFormateado(precio: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(precio)
}

export function ahorroAnual(plan: 'pro' | 'elite'): number {
  return PLANES[plan].precio_mensual * 12 - PLANES[plan].precio_anual
}
