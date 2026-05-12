'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3, User, Camera, MessageSquare, Star, Calendar,
  LineChart, Award, CreditCard, Sparkles, Lock,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Badge } from '@/components/ui/Badge'
import { planVigente, PLANES } from '@/lib/planes'
import { cn, formatearFecha } from '@/lib/utils'
import type { Tecnico } from '@/types/database.types'

interface SidebarProps {
  tecnico: Pick<Tecnico, 'plan' | 'plan_vence_en' | 'nombre_empresa'>
  mensajesNoLeidos?: number
}

type Item = {
  href: string
  label: string
  icon: typeof BarChart3
  badge?: string
  lockFeature?: 'agenda' | 'estadisticas' | 'certificaciones'
}
const ITEMS: Item[] = [
  { href: '/dashboard',                 label: 'Resumen',         icon: BarChart3 },
  { href: '/dashboard/perfil',          label: 'Mi perfil',       icon: User },
  { href: '/dashboard/fotos',           label: 'Fotos y portafolio', icon: Camera },
  { href: '/dashboard/mensajes',        label: 'Cotizaciones',    icon: MessageSquare, badge: 'mensajes' },
  { href: '/dashboard/resenas',         label: 'Reseñas',         icon: Star },
  { href: '/dashboard/agenda',          label: 'Agenda',          icon: Calendar, lockFeature: 'agenda' },
  { href: '/dashboard/estadisticas',    label: 'Estadísticas',    icon: LineChart, lockFeature: 'estadisticas' },
  { href: '/dashboard/certificaciones', label: 'Certificaciones', icon: Award, lockFeature: 'certificaciones' },
  { href: '/dashboard/plan',            label: 'Mi plan',         icon: CreditCard },
]

export function SidebarDashboard({ tecnico, mensajesNoLeidos = 0 }: SidebarProps) {
  const pathname = usePathname()
  const plan = planVigente(tecnico)
  const venceEn = tecnico.plan_vence_en ? new Date(tecnico.plan_vence_en) : null
  const diasRestantes = venceEn ? Math.ceil((venceEn.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

  return (
    <aside className="hidden lg:block w-60 shrink-0 border-r border-borde bg-white min-h-screen">
      <div className="sticky top-0 p-4 space-y-4">
        <Logo size="sm" />

        <div className="rounded-lg border border-borde p-3 bg-papel/50">
          <div className="text-xs text-gris-3">Plan actual</div>
          <div className="flex items-center justify-between mt-0.5">
            <span className={cn('font-display font-bold text-lg', plan === 'elite' ? 'text-oro' : plan === 'pro' ? 'text-azul' : 'text-gris-4')}>
              {PLANES[plan].nombre}
            </span>
            {plan !== 'gratis' && <Sparkles size={14} className="text-oro" />}
          </div>
          {venceEn && diasRestantes !== null && (
            <div className={cn('text-[11px] mt-1', diasRestantes <= 7 ? 'text-rojo font-medium' : 'text-gris-3')}>
              {diasRestantes > 0 ? `Vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}` : 'Vencido'}
              <br />{formatearFecha(venceEn)}
            </div>
          )}
        </div>

        <nav className="space-y-0.5">
          {ITEMS.map(it => {
            const active = pathname === it.href
            const Icon = it.icon
            const locked = it.lockFeature && !PLANES[plan].limites[it.lockFeature]
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                  active ? 'bg-azul text-white' : 'text-gris-4 hover:bg-papel hover:text-azul',
                )}
              >
                <Icon size={16} />
                <span className="flex-1">{it.label}</span>
                {it.badge === 'mensajes' && mensajesNoLeidos > 0 && (
                  <span className="bg-rojo text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {mensajesNoLeidos}
                  </span>
                )}
                {locked && <Lock size={12} className="text-oro" />}
              </Link>
            )
          })}
        </nav>

        {plan === 'gratis' && (
          <Link href="/dashboard/plan" className="block rounded-lg bg-gradient-to-br from-oro/10 to-rojo/10 border border-oro/30 p-3">
            <div className="text-xs font-semibold text-azul">Upgrade a PRO</div>
            <div className="text-[11px] text-gris-4 mt-0.5">Desbloquea WhatsApp, estadísticas, agenda y +</div>
          </Link>
        )}
      </div>
    </aside>
  )
}
