import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, MapPin, Star, Sparkles, ArrowRight, Search } from 'lucide-react'
import { FiltroBusqueda } from '@/components/directorio/FiltroBusqueda'
import { FiltroCategorias } from '@/components/directorio/FiltroCategorias'
import { TarjetaTecnico } from '@/components/tecnico/TarjetaTecnico'
import { SeccionEmergencias } from '@/components/directorio/SeccionEmergencias'
import { InvitarTecnico } from '@/components/directorio/InvitarTecnico'
import { Button } from '@/components/ui/Button'
import { getRegionCookie } from '@/lib/region'
import type { TecnicoConRelaciones, Region } from '@/types/database.types'

export const dynamic = 'force-dynamic' // necesario para que la cookie cambie SSR

async function tecnicosTop(sb: any, regionId?: number, limit = 8) {
  let query = sb.from('tecnicos')
    .select('*, regiones(nombre), tecnico_fotos(url, es_portada)')
    .eq('activo', true)
  if (regionId) query = query.eq('region_id', regionId)
  query = query
    .order('plan', { ascending: false })          // elite > pro > gratis
    .order('rating_promedio', { ascending: false })
    .limit(limit)
  const { data } = await query
  return (data || []).map((t: any) => ({
    ...t,
    region_nombre: t.regiones?.nombre,
    foto_portada: t.tecnico_fotos?.find((f: any) => f.es_portada)?.url || t.tecnico_fotos?.[0]?.url,
  })) as TecnicoConRelaciones[]
}

export default async function HomePage() {
  const sb = createClient()

  const [{ data: catDestacadas }, totalCatRes, { data: regiones }] = await Promise.all([
    sb.from('categorias').select('*').eq('destacada', true).order('orden').limit(15),
    sb.from('categorias').select('id', { count: 'exact', head: true }),
    sb.from('regiones').select('*').order('orden'),
  ])

  // Fallback: si nadie marcó destacadas, mostrar primeras 10
  let categorias = catDestacadas
  if (!categorias || categorias.length === 0) {
    const { data: fallback } = await sb.from('categorias').select('*').order('orden').limit(10)
    categorias = fallback
  }
  const totalCategorias = totalCatRes.count || 0
  const hayMasCategorias = totalCategorias > (categorias?.length || 0)

  const regionSlug = getRegionCookie()
  const regionSel: Region | undefined = regionSlug ? regiones?.find(r => r.slug === regionSlug) : undefined

  // Si hay región seleccionada → 1 grid grande con esa región
  // Si no → 3 grids por las regiones más populares (RM, Valpo, Biobío)
  let destacadosDeRegion: TecnicoConRelaciones[] = []
  let porRegion: { region: Region; tecnicos: TecnicoConRelaciones[] }[] = []

  if (regionSel) {
    destacadosDeRegion = await tecnicosTop(sb, regionSel.id, 8)
  } else {
    // Top regiones a destacar
    const slugsTop = ['metropolitana', 'valparaiso', 'biobio']
    for (const slug of slugsTop) {
      const r = regiones?.find(x => x.slug === slug)
      if (!r) continue
      const techs = await tecnicosTop(sb, r.id, 4)
      if (techs.length > 0) porRegion.push({ region: r, tecnicos: techs })
    }
  }

  const stats = await sb.from('tecnicos').select('id', { count: 'exact', head: true }).eq('activo', true)
  const totalTecnicos = stats.count || 0

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-azul">
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
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-semibold mb-5 !text-white">
              <ShieldCheck size={14} className="text-cyan" />
              {totalTecnicos > 0 ? `${totalTecnicos.toLocaleString('es-CL')}+ técnicos verificados` : 'Técnicos verificados'}
              {regionSel && <> · en <strong>{regionSel.nombre}</strong></>}
            </span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-5 !text-white tracking-tight">
              Encuentra al técnico<br />
              <span style={{ WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>perfecto</span> para tu reparación.
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

        <svg className="absolute bottom-0 left-0 right-0 w-full text-white" preserveAspectRatio="none" viewBox="0 0 1440 60" fill="currentColor">
          <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" />
        </svg>
      </section>

      {/* CATEGORÍAS DESTACADAS */}
      <section className="container-st py-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <h2 className="font-display text-3xl md:text-4xl text-azul font-extrabold">¿Qué necesitas reparar?</h2>
            <p className="text-gris-4 mt-1">Las especialidades más buscadas</p>
          </div>
          {hayMasCategorias && (
            <Link href="/categorias">
              <Button variant="outline" size="sm">Ver todas ({totalCategorias}) →</Button>
            </Link>
          )}
        </div>
        <FiltroCategorias categorias={categorias || []} />
      </section>

      {/* TÉCNICOS DESTACADOS — según región */}
      {regionSel ? (
        // Región seleccionada → 1 grid de esa región
        <section className="container-st py-16">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-3xl md:text-4xl text-azul font-extrabold flex items-center gap-2">
                <MapPin size={28} className="text-azul-mid" />
                Destacados en {regionSel.nombre}
              </h2>
              <p className="text-gris-4 mt-1">Los técnicos mejor calificados de tu región</p>
            </div>
            <Link href={`/region/${regionSel.slug}`}>
              <Button variant="outline" size="sm">Ver todos en {regionSel.nombre} →</Button>
            </Link>
          </div>
          {destacadosDeRegion.length === 0 ? (
            <div className="card text-center py-12">
              <Search size={32} className="text-gris-3 mx-auto mb-3" />
              <p className="text-gris-4">Aún no hay técnicos registrados en {regionSel.nombre}.</p>
              <Link href="/registro-tecnico" className="inline-block mt-3">
                <Button size="sm">Sé el primero</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {destacadosDeRegion.map(t => (
                <TarjetaTecnico key={t.id} tecnico={t} />
              ))}
            </div>
          )}
        </section>
      ) : (
        // Sin región → secciones por región popular
        porRegion.map(({ region, tecnicos }) => (
          <section key={region.id} className="container-st py-12">
            <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="font-display text-2xl md:text-3xl text-azul font-extrabold flex items-center gap-2">
                  <MapPin size={24} className="text-azul-mid" />
                  Top técnicos en {region.nombre}
                </h2>
                <p className="text-gris-4 text-sm mt-1">{tecnicos.length} mejor{tecnicos.length !== 1 ? 'es' : ''} calificado{tecnicos.length !== 1 ? 's' : ''}</p>
              </div>
              <Link href={`/region/${region.slug}`}>
                <Button variant="outline" size="sm">Ver más →</Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {tecnicos.map(t => (
                <TarjetaTecnico key={t.id} tecnico={t} />
              ))}
            </div>
          </section>
        ))
      )}

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

      {/* INVITAR A OTROS TÉCNICOS / OFICIOS */}
      <InvitarTecnico />

      {/* CTA PARA TÉCNICOS (registro directo) */}
      <section className="container-st pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-cool p-10 md:p-16 text-center text-white">
          <div className="absolute inset-0 bg-mesh-pattern opacity-50" />
          <div className="relative">
            <Sparkles size={36} className="text-oro-soft mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl mb-3 font-extrabold !text-white">¿Te dedicas a algún oficio?</h2>
            <p className="text-white/90 mb-3 max-w-xl mx-auto text-lg">
              <strong>Cualquier especialidad</strong>: técnica, manual o de servicio. Pintores, gasfiteres, eléctricos, jardineros, mecánicos, albañiles, técnicos…
            </p>
            <p className="text-white/80 mb-7 max-w-lg mx-auto">
              Únete gratis y recibe cotizaciones de clientes en tu zona. Sin costo ni compromiso.
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
