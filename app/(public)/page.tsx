import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ShieldCheck, MapPin, Star, Sparkles, ArrowRight } from 'lucide-react'
import { FiltroBusqueda } from '@/components/directorio/FiltroBusqueda'
import { FiltroCategorias } from '@/components/directorio/FiltroCategorias'
import { TarjetaTecnico } from '@/components/tecnico/TarjetaTecnico'
import { SeccionEmergencias } from '@/components/directorio/SeccionEmergencias'
import { Button } from '@/components/ui/Button'
import type { TecnicoConRelaciones } from '@/types/database.types'

export const revalidate = 60

export default async function HomePage() {
  const sb = createClient()

  const [{ data: categorias }, { data: regiones }, { data: tecnicosRaw }] = await Promise.all([
    sb.from('categorias').select('*').order('orden'),
    sb.from('regiones').select('*').order('orden'),
    sb.from('tecnicos')
      .select(`*, regiones(nombre), tecnico_fotos(url, es_portada)`)
      .eq('activo', true)
      .order('rating_promedio', { ascending: false })
      .limit(8),
  ])

  const tecnicos: TecnicoConRelaciones[] = (tecnicosRaw || []).map((t: any) => ({
    ...t,
    region_nombre: t.regiones?.nombre,
    foto_portada: t.tecnico_fotos?.find((f: any) => f.es_portada)?.url || t.tecnico_fotos?.[0]?.url,
  }))

  const stats = await sb.from('tecnicos').select('id', { count: 'exact', head: true }).eq('activo', true)
  const totalTecnicos = stats.count || 0

  return (
    <>
      {/* HERO */}
      <section className="relative bg-azul text-white hero-clip overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute -right-20 top-10 num-deco text-[400px] text-white">01</div>
        </div>
        <div className="container-st relative py-16 md:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium mb-4 text-white/90">
              <ShieldCheck size={12} className="text-oro" />
              Técnicos verificados en toda Chile
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] mb-4">
              Encuentra al técnico <span className="italic font-light">perfecto</span> para tu reparación.
            </h1>
            <p className="text-lg text-white/80 mb-7 max-w-xl">
              {totalTecnicos.toLocaleString('es-CL')}+ profesionales verificados con reseñas reales en 7 dimensiones. Climatización, computación, electricidad, gasfitería y más.
            </p>
            <div className="bg-white rounded-xl p-2">
              <FiltroBusqueda />
            </div>
            <div className="flex items-center gap-6 mt-6 text-sm text-white/70">
              <span className="inline-flex items-center gap-1"><Star size={14} className="text-oro" /> Reseñas en 7 dimensiones</span>
              <span className="inline-flex items-center gap-1"><MapPin size={14} className="text-oro" /> 16 regiones</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="container-st py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl text-azul">¿Qué necesitas reparar?</h2>
            <p className="text-gris-4 mt-1">15 especialidades técnicas</p>
          </div>
        </div>
        <FiltroCategorias categorias={categorias || []} />
      </section>

      {/* TÉCNICOS DESTACADOS */}
      <section className="container-st py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl text-azul">Técnicos destacados</h2>
            <p className="text-gris-4 mt-1">Los mejor calificados de la semana</p>
          </div>
          <Link href="/buscar">
            <Button variant="outline" size="sm">Ver todos →</Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {tecnicos.map(t => (
            <TarjetaTecnico key={t.id} tecnico={t} />
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="container-st py-14">
        <h2 className="font-display text-3xl text-azul mb-8 text-center">Cómo funciona</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: '01', t: 'Busca', d: 'Filtra por categoría, región y calificación. Compara hasta 3 técnicos.' },
            { n: '02', t: 'Conecta', d: 'Solicita cotización gratis. El técnico te contacta por WhatsApp o teléfono.' },
            { n: '03', t: 'Reseña', d: 'Después del trabajo, califica en 7 dimensiones para ayudar a otros.' },
          ].map(p => (
            <div key={p.n} className="card">
              <div className="num-deco text-5xl mb-3">{p.n}</div>
              <h3 className="font-display text-xl text-azul mb-2">{p.t}</h3>
              <p className="text-sm text-gris-4">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EMERGENCIAS */}
      <section className="container-st pb-14">
        <SeccionEmergencias />
      </section>

      {/* CTA PARA TÉCNICOS */}
      <section className="container-st pb-20">
        <div className="rounded-xl border-2 border-oro/40 bg-gradient-to-br from-oro/5 to-white p-8 md:p-12 text-center">
          <Sparkles size={32} className="text-oro mx-auto mb-3" />
          <h2 className="font-display text-3xl text-azul mb-2">¿Eres técnico?</h2>
          <p className="text-gris-4 mb-6 max-w-lg mx-auto">
            Únete gratis y empieza a recibir cotizaciones de clientes en tu zona. Sin costo, sin compromiso.
          </p>
          <Link href="/registro-tecnico">
            <Button size="lg">Registrarme gratis <ArrowRight size={16} /></Button>
          </Link>
        </div>
      </section>
    </>
  )
}
