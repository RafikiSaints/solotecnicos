import Link from 'next/link'
import { Sparkles, Search, MessageCircle, Star } from 'lucide-react'
import { FormularioRegistroCliente } from './FormularioRegistroCliente'

export const metadata = {
  title: 'Crea tu cuenta gratis',
  description: 'Registra una cuenta gratis para guardar tus cotizaciones, ver el historial de tus reseñas y más.',
}

export default function RegistroClientePage() {
  return (
    <>
      <section className="bg-azul text-white hero-clip">
        <div className="container-st py-14 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium mb-4">
              <Sparkles size={12} className="text-cyan" /> Gratis · Sin tarjeta
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-3 !text-white">
              Crea tu cuenta y <span className="italic font-light">simplifica</span> tu vida
            </h1>
            <p className="text-white/80 text-lg mb-6 max-w-lg">
              Guarda tus cotizaciones, organiza tus reseñas y conecta más rápido con técnicos. <strong>100% gratis</strong> y sin compromiso.
            </p>
            <div className="grid gap-3 mb-6">
              {[
                { icon: Search, t: 'Historial de búsquedas y cotizaciones', d: 'Encuentra rápido a quién contactaste antes' },
                { icon: MessageCircle, t: 'Tus solicitudes ordenadas', d: 'Ve estado de respuestas y precios cotizados' },
                { icon: Star, t: 'Tus reseñas verificadas', d: 'Tus opiniones con badge de "verificada"' },
              ].map(b => {
                const Icon = b.icon
                return (
                  <div key={b.t} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-cyan" />
                    </div>
                    <div>
                      <strong className="text-white text-sm">{b.t}</strong>
                      <p className="text-xs text-white/70">{b.d}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 md:p-8 text-gris-4">
            <FormularioRegistroCliente />
          </div>
        </div>
      </section>

      <section className="container-st py-12 text-center">
        <p className="text-sm text-gris-4">
          ¿Eres técnico? <Link href="/registro-tecnico" className="text-rojo font-semibold hover:underline">Registra tu negocio →</Link>
        </p>
      </section>
    </>
  )
}
