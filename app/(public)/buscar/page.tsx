import { createClient } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'
import { FiltroBusqueda } from '@/components/directorio/FiltroBusqueda'
import { FiltroRegiones } from '@/components/directorio/FiltroRegiones'
import { FiltroCategorias } from '@/components/directorio/FiltroCategorias'
import { FiltrosAvanzados } from '@/components/directorio/FiltrosAvanzados'
import { TarjetaTecnico } from '@/components/tecnico/TarjetaTecnico'
import type { TecnicoConRelaciones } from '@/types/database.types'

const MapaDirectorio = dynamic(() => import('@/components/directorio/MapaDirectorio').then(m => m.MapaDirectorio), { ssr: false })

export const metadata = {
  title: 'Buscar técnicos',
  description: 'Filtra técnicos por categoría, región y calificación. Encuentra el profesional perfecto.',
}

export default async function BuscarPage({ searchParams }: { searchParams: Record<string, string> }) {
  const sb = createClient()

  const [{ data: categorias }, { data: regiones }] = await Promise.all([
    sb.from('categorias').select('*').order('orden'),
    sb.from('regiones').select('*').order('orden'),
  ])

  // Filtros — si no viene región en la URL, usar la cookie del usuario
  const q = searchParams.q
  const regionCookie = (await import('@/lib/region')).getRegionCookie()
  const regionSlug = searchParams.region !== undefined ? searchParams.region : regionCookie
  const categoriaSlug = searchParams.categoria
  const ratingMin = searchParams.rating ? parseFloat(searchParams.rating) : null
  const domicilio = searchParams.domicilio === '1'
  const verificado = searchParams.verificado === '1'
  const ah24 = searchParams['24h'] === '1'

  let regionId: number | null = null
  if (regionSlug) {
    const r = regiones?.find(x => x.slug === regionSlug)
    regionId = r?.id || null
  }
  let categoriaId: number | null = null
  if (categoriaSlug) {
    const c = categorias?.find(x => x.slug === categoriaSlug)
    categoriaId = c?.id || null
  }

  // Query base
  let query = sb.from('tecnicos').select(`
    *, regiones(nombre, slug),
    tecnico_fotos(url, es_portada),
    tecnico_categorias!inner(categoria_id, categorias(slug, nombre))
  `).eq('activo', true)

  if (regionId) query = query.eq('region_id', regionId)
  if (categoriaId) query = query.eq('tecnico_categorias.categoria_id', categoriaId)
  if (ratingMin) query = query.gte('rating_promedio', ratingMin)
  if (domicilio) query = query.eq('atiende_domicilio', true)
  if (verificado) query = query.eq('verificado', true)
  if (ah24) query = query.eq('atiende_24h', true)
  if (q) {
    // Buscar en nombre, descripción, comuna o etiquetas
    // El operador `cs.{...}` es "contains" para arrays — busca si la etiqueta está
    query = query.or(`nombre_empresa.ilike.%${q}%,descripcion.ilike.%${q}%,comuna.ilike.%${q}%,etiquetas.cs.{${q.toLowerCase()}}`)
  }

  query = query.order('plan', { ascending: false }).order('rating_promedio', { ascending: false }).limit(40)

  const { data: tecnicosRaw } = await query

  const tecnicos: TecnicoConRelaciones[] = (tecnicosRaw || []).map((t: any) => ({
    ...t,
    region_nombre: t.regiones?.nombre,
    foto_portada: t.tecnico_fotos?.find((f: any) => f.es_portada)?.url || t.tecnico_fotos?.[0]?.url,
    categorias_nombres: t.tecnico_categorias?.map((tc: any) => tc.categorias?.nombre).filter(Boolean),
  }))

  return (
    <div className="container-st py-8">
      <h1 className="font-display text-3xl md:text-4xl text-azul mb-1">
        {tecnicos.length} técnicos {categoriaSlug ? `de ${categorias?.find(c => c.slug === categoriaSlug)?.nombre}` : ''}{regionSlug ? ` en ${regiones?.find(r => r.slug === regionSlug)?.nombre}` : ''}
      </h1>
      <p className="text-gris-4 mb-6">Filtra y compara para encontrar el mejor</p>

      <div className="mb-6">
        <FiltroBusqueda defaultValue={q || ''} />
      </div>

      <div className="mb-6">
        <FiltroCategorias categorias={categorias || []} activa={categoriaSlug} />
      </div>

      <div className="grid lg:grid-cols-[260px_1fr_400px] gap-6">
        {/* Sidebar filtros */}
        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="card space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gris-3 mb-2">Región</h4>
              <FiltroRegiones regiones={regiones || []} />
            </div>
            <FiltrosAvanzados />
          </div>
        </aside>

        {/* Resultados */}
        <div className="space-y-3">
          {tecnicos.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-gris-4">No encontramos técnicos con esos filtros.</p>
              <p className="text-sm text-gris-3 mt-1">Intenta ampliar la búsqueda.</p>
            </div>
          ) : (
            tecnicos.map(t => (
              <TarjetaTecnico key={t.id} tecnico={t} servicios={t.categorias_nombres} />
            ))
          )}
        </div>

        {/* Mapa */}
        <div className="hidden lg:block">
          <MapaDirectorio tecnicos={tecnicos} />
        </div>
      </div>
    </div>
  )
}
