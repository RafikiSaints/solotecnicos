import Link from 'next/link'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function SeccionEmergencias() {
  return (
    <section className="relative overflow-hidden rounded-xl bg-azul text-white p-8 md:p-10">
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-l from-rojo to-transparent" />
      </div>
      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rojo/20 text-rojo text-xs font-semibold mb-3">
          <Zap size={12} /> EMERGENCIAS 24/7
        </span>
        <h3 className="font-display text-3xl font-bold mb-2">¿Necesitas un técnico ahora?</h3>
        <p className="text-white/80 mb-5">Encuentra técnicos disponibles 24/7 cerca de ti. Sin fila de espera, sin lunes a viernes.</p>
        <Link href="/emergencias">
          <Button>Ver técnicos 24/7 →</Button>
        </Link>
      </div>
    </section>
  )
}
