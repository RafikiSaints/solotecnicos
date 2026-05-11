'use client'
import { Lock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from './Button'

interface UpgradePromptProps {
  feature: string
  plan?: 'pro' | 'elite'
  inline?: boolean
}

export function UpgradePrompt({ feature, plan = 'pro', inline = false }: UpgradePromptProps) {
  const planLabel = plan === 'elite' ? 'Elite' : 'PRO'
  if (inline) {
    return (
      <div className="rounded-md border border-oro/30 bg-oro/5 p-3 flex items-center gap-3">
        <Lock size={18} className="text-oro shrink-0" />
        <div className="flex-1 text-sm">
          <strong className="text-azul">Función {planLabel}</strong> — {feature}
        </div>
        <Link href="/dashboard/plan" className="text-xs font-semibold text-oro hover:underline">
          Desbloquear →
        </Link>
      </div>
    )
  }
  return (
    <div className="relative overflow-hidden rounded-lg border border-borde bg-papel">
      <div className="absolute inset-0 bg-gradient-to-br from-oro/5 to-transparent" />
      <div className="relative p-6 text-center space-y-3">
        <div className="mx-auto h-10 w-10 rounded-full bg-oro/10 flex items-center justify-center">
          <Sparkles size={20} className="text-oro" />
        </div>
        <h4 className="font-display text-lg text-azul">Función {planLabel}</h4>
        <p className="text-sm text-gris-4 max-w-sm mx-auto">{feature}</p>
        <Link href="/dashboard/plan">
          <Button size="sm">Desbloquear con {planLabel} →</Button>
        </Link>
      </div>
    </div>
  )
}

/** Overlay sobre un campo bloqueado */
export function LockedOverlay({ feature }: { feature: string }) {
  return (
    <div className="absolute inset-0 z-10 bg-papel/80 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center gap-2 p-4">
      <Lock size={20} className="text-oro" />
      <p className="text-xs text-center text-gris-4 max-w-[200px]">{feature}</p>
      <Link href="/dashboard/plan" className="text-xs font-semibold text-rojo hover:underline">
        Desbloquear con PRO →
      </Link>
    </div>
  )
}
