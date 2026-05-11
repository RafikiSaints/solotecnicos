import type { Tecnico } from '@/types/database.types'

/**
 * Score que coincide con la función SQL `calcular_score`.
 * Útil para ordenar en cliente cuando ya se obtuvo el resultado.
 */
export function calcularScore(t: Tecnico): number {
  const diasSinUpdate = Math.floor(
    (Date.now() - new Date(t.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  )
  return (
    (t.rating_promedio || 0) * 30 +
    Math.log((t.total_resenas || 0) + 1) * 15 +
    (t.plan === 'elite' ? 40 : t.plan === 'pro' ? 20 : 0) +
    (t.verificado ? 10 : 0) +
    (t.badge_respuesta_rapida ? 5 : 0) +
    (t.atiende_24h ? 3 : 0) -
    diasSinUpdate * 0.1
  )
}

export function ordenarTecnicos<T extends Tecnico>(arr: T[]): T[] {
  const planOrden = { elite: 1, pro: 2, gratis: 3 }
  return [...arr].sort((a, b) => {
    const po = planOrden[a.plan] - planOrden[b.plan]
    if (po !== 0) return po
    return calcularScore(b) - calcularScore(a)
  })
}
