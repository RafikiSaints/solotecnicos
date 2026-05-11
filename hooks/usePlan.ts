'use client'
import { useTecnico } from './useTecnico'
import { planVigente, puedeHacer, limiteNumerico, PLANES, type PlanFeature } from '@/lib/planes'

export function usePlan() {
  const { tecnico, loading } = useTecnico()
  if (!tecnico) return { tecnico: null, plan: 'gratis' as const, loading, puedeHacer: () => false, limite: () => 0, info: PLANES.gratis }
  const plan = planVigente(tecnico)
  return {
    tecnico,
    plan,
    loading,
    puedeHacer: (f: PlanFeature) => puedeHacer(tecnico, f),
    limite: (f: 'fotos' | 'servicios' | 'trabajos_portafolio' | 'sucursales') => limiteNumerico(tecnico, f),
    info: PLANES[plan],
  }
}
