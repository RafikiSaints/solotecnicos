import { createClient } from '@/lib/supabase/server'
import { Zap } from 'lucide-react'
import { TarjetaTecnico } from '@/components/tecnico/TarjetaTecnico'
import { FiltroRegiones } from '@/components/directorio/FiltroRegiones'
import type { TecnicoConRelaciones } from '@/types/database.types'

export const metadata = {
  title: 'Emergencias 24/7 — Técnicos disponibles ahora',
  description: 'Encuentra técnicos disponibles 24/7 en toda Chile. Atención inmediata para emergencias domésticas.',
}

export default async function EmergenciasPage({ searchParams }: { searchParams: { region?: string } }) {
  const sb = createClient()
  const { data: regiones } = await sb.from('regiones').select('*').order('orden')

  let regionId: number | null = null
  if (searchParams.region) {
    regionId = regiones?.find(r => r.slug === searchParams.region)?.id || null
  }

  let query = sb.from('tecnicos')
    .select('*, regiones(nombre), tecnico_fotos(url, es_portada)')
    .eq('activo', true)
    .eq('atiende_24h', true)
    .order('rating_promedio', { ascending: false })
  if (regionId) query = query.eq('region_id', regionId)

  const { data: tecnicosRaw } = await query

  const tecnicos: TecnicoConRelaciones[] = (tecnicosRaw || []).map((t: any) => ({
    ...t,
    region_nombre: t.regiones?.nombre,
    foto_portada: t.tecnico_fotos?.find((f: any) => f.es_portada)?.url || t.tecnico_fotos?.[0]?.url,
  }))

  return (
    <>
      <section className="bg-rojo text-white hero-clip">
        <div className="container-st py-12 md:py-16">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-white" />
            <span className="text-sm font-bold tracking-wide uppercase">Emergencias 24/7</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold">Técnicos disponibles <span className="italic font-light">ahora</span></h1>
          <p className="text-white/80 mt-2 max-w-xl">Profesionales que atienden las 24 horas todos los días. Llamada directa, sin esperas.</p>
        </div>
      </section>

      <div className="container-st py-8">
        <div className="mb-6 max-w-sm">
          <FiltroRegiones regiones={regiones || []} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {tecnicos.length === 0 ? (
            <div className="card text-center col-span-2">
              <p className="text-gris-4">No hay técnicos 24/7 con los filtros actuales.</p>
            </div>
          ) : (
            tecnicos.map(t => <TarjetaTecnico key={t.id} tecnico={t} />)
          )}
        </div>
      </div>
    </>
  )
}
