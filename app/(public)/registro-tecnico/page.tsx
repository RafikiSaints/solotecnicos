import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'
import { FormularioRegistro } from './FormularioRegistro'

export const metadata = {
  title: 'Únete como técnico gratis',
  description: 'Recibe cotizaciones de clientes en tu zona. Crea tu perfil en 5 minutos, completamente gratis.',
}

export default async function RegistroPage() {
  const sb = createClient()
  const [{ data: categorias }, { data: regiones }] = await Promise.all([
    sb.from('categorias').select('*').order('orden'),
    sb.from('regiones').select('*').order('orden'),
  ])

  return (
    <>
      <section className="bg-azul text-white hero-clip">
        <div className="container-st py-14 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium mb-4">
              <ShieldCheck size={12} className="text-oro" /> Gratis · Sin tarjeta
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-3">
              Llega a más clientes <span className="italic font-light">en tu región</span>
            </h1>
            <p className="text-white/80 text-lg mb-6 max-w-lg">
              Únete a SoloTécnicos, el directorio más completo de Chile. Recibe cotizaciones, gestiona reseñas y haz crecer tu negocio.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { n: '01', t: 'Crea tu perfil', d: 'En 5 minutos' },
                { n: '02', t: 'Recibe cotizaciones', d: 'Directo en tu email' },
                { n: '03', t: 'Crece con reseñas', d: 'Sin costo' },
              ].map(p => (
                <div key={p.n}>
                  <div className="num-deco text-4xl text-oro">{p.n}</div>
                  <div className="font-semibold text-white text-sm mt-1">{p.t}</div>
                  <div className="text-xs text-white/60">{p.d}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 md:p-8 text-gris-4">
            <FormularioRegistro categorias={categorias || []} regiones={regiones || []} />
          </div>
        </div>
      </section>

      <section className="container-st py-14">
        <div className="rounded-xl border-2 border-oro/30 bg-gradient-to-br from-oro/5 to-white p-8 text-center">
          <Sparkles size={32} className="text-oro mx-auto mb-2" />
          <h2 className="font-display text-2xl text-azul">¿Quieres más visibilidad?</h2>
          <p className="text-gris-4 mt-2 mb-4">Mejora a PRO o Elite para destacar tu perfil, ver estadísticas y más.</p>
          <Link href="/planes" className="text-rojo font-semibold inline-flex items-center gap-1">
            Ver planes <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  )
}
