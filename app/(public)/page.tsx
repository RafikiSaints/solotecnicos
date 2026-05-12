import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, MapPin, Star, Sparkles, ArrowRight, Search } from 'lucide-react'
import { FiltroBusqueda } from '@/components/directorio/FiltroBusqueda'
import { FiltroCategorias } from '@/components/directorio/FiltroCategorias'
import { TarjetaTecnico } from '@/components/tecnico/TarjetaTecnico'
import { SeccionEmergencias } from '@/components/directorio/SeccionEmergencias'
import { Button } from '@/components/ui/Button'
import type { TecnicoConRelaciones } from '@/types/database.types'

export const revalidate = 60

export default async function HomePage() {
  const sb = createClient()

  const [{ data: categorias }, { data: tecnicosRaw }] = await Promise.all([
    sb.from('categorias').select('*').order('orden'),
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
      {/* HERO con imagen + gradiente */}
      <section className="relative overflow-hidden bg-azul">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2070&auto=format&fit=crop"
            alt=""
            fill
            priority
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-azul via-azul-mid/95 to-cyan/40" />
          <div className="absolute inset-0 bg-mesh-pattern opacity-50" />
        </div>

        <div className="container-st relative py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-semibold mb-5 text-white">
              <ShieldCheck size={14} className="text-cyan" />
              {totalTecnicos > 0 ? `${totalTecnicos.toLocaleString('es-CL')}+ técnicos verificados en Chile` : 'Técnicos verificados en toda Chile'}
            </span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-5 text-white tracking-tight">
              Encuentra al técnico<br />
              <span className="text-gradient" style={{ WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>perfecto</span> para tu reparación.
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
              Profesionales con reseñas reales en 7 dimensiones. Climatización, computación, electricidad, gasfitería y más.
            </p>

            <div className="bg-white rounded-2xl p-3 shadow-2xl">
              <FiltroBusqueda />
            </div>

            <div className="flex flex-wrap items-center gap-5 mt-7 text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5">
                <Star size={16} className="text-oro" fill="#F59E0B" /> Reseñas en 7 dimensiones
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={16} className="text-cyan" /> 16 regiones
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={16} className="text-oro-soft" /> 100% gratis para clientes
              </span>
            </div>
          </div>
        </div>

        {/* curva inferior */}
        <svg className="absolute bottom-0 left-0 right-0 w-full text-white" preserveAspectRatio="none" viewBox="0 0 1440 60" fill="currentColor">
          <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" />
        </svg>
      </section>

      {/* CATEGORÍAS */}
      <section className="container-st py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl text-azul font-extrabold">¿Qué necesitas reparar?</h2>
            <p className="text-gris-4 mt-1">15 especialidades técnicas</p>
          </div>
        </div>
        <FiltroCategorias categorias={categorias || []} />
      </section>

      {/* TÉCNICOS DESTACADOS */}
      <section className="container-st py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl text-azul font-extrabold">Técnicos destacados</h2>
            <p className="text-gris-4 mt-1">Los mejor calificados de la semana</p>
          </div>
          <Link href="/buscar">
            <Button variant="outline" size="sm">Ver todos →</Button>
          </Link>
        </div>
        {tecnicos.length === 0 ? (
          <div className="card text-center py-12">
            <Search size={32} className="text-gris-3 mx-auto mb-3" />
            <p className="text-gris-4">Aún no hay técnicos registrados. ¡Sé el primero!</p>
            <Link href="/registro-tecnico" className="inline-block mt-3">
              <Button size="sm">Registrarme</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {tecnicos.map(t => (
              <TarjetaTecnico key={t.id} tecnico={t} />
            ))}
          </div>
        )}
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="bg-papel py-20">
        <div className="container-st">
          <h2 className="font-display text-3xl md:text-4xl text-azul mb-2 text-center font-extrabold">Cómo funciona</h2>
          <p className="text-center text-gris-4 mb-12">En 3 simples pasos encuentras al técnico ideal</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', t: 'Busca', d: 'Filtra por categoría, región y calificación. Compara hasta 3 técnicos a la vez.', color: 'text-azul-mid' },
              { n: '02', t: 'Conecta', d: 'Solicita cotización gratis. El técnico te contacta por WhatsApp o teléfono.', color: 'text-cyan' },
              { n: '03', t: 'Reseña', d: 'Después del trabajo, califica en 7 dimensiones para ayudar a otros.', color: 'text-oro' },
            ].map(p => (
              <div key={p.n} className="card relative overflow-hidden">
                <div className={`num-deco text-6xl mb-4 ${p.color}`}>{p.n}</div>
                <h3 className="font-display text-xl text-azul mb-2 font-bold">{p.t}</h3>
                <p className="text-sm text-gris-4 leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMERGENCIAS */}
      <section className="container-st py-16">
        <SeccionEmergencias />
      </section>

      {/* CTA PARA TÉCNICOS */}
      <section className="container-st pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-cool p-10 md:p-16 text-center text-white">
          <div className="absolute inset-0 bg-mesh-pattern opacity-50" />
          <div className="relative">
            <Sparkles size={36} className="text-oro-soft mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl mb-3 font-extrabold">¿Eres técnico?</h2>
            <p className="text-white/90 mb-7 max-w-lg mx-auto text-lg">
              Únete gratis y recibe cotizaciones de clientes en tu zona. Sin costo, sin compromiso.
            </p>
            <Link href="/registro-tecnico">
              <Button size="lg" className="bg-white !text-azul hover:bg-papel">
                Registrarme gratis <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
