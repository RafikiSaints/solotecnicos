import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { Check, X, ShieldCheck, Zap, Home, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const metadata = {
  title: 'Comparar técnicos',
  description: 'Compara hasta 3 técnicos lado a lado: rating, servicios, plan, cobertura.',
}

const DIMENSIONES = [
  { key: 'rating_atencion',  label: 'Atención' },
  { key: 'rating_calidad',   label: 'Calidad' },
  { key: 'rating_respuesta', label: 'Respuesta' },
  { key: 'rating_resolucion',label: 'Resolución' },
  { key: 'rating_rapidez',   label: 'Rapidez' },
  { key: 'rating_precio',    label: 'Precio' },
  { key: 'rating_garantia',  label: 'Garantía' },
]

export default async function CompararPage({ searchParams }: { searchParams: { t?: string } }) {
  const slugs = (searchParams.t || '').split(',').filter(Boolean).slice(0, 3)
  const sb = createClient()

  if (!slugs.length) {
    return (
      <div className="container-st py-16 text-center">
        <h1 className="font-display text-3xl text-azul mb-3">Comparador de técnicos</h1>
        <p className="text-gris-4 mb-6">Selecciona técnicos desde el directorio marcando "Comparar".</p>
        <Link href="/buscar"><Button>Ir al directorio →</Button></Link>
      </div>
    )
  }

  const { data: tecnicos } = await sb.from('tecnicos')
    .select('*, regiones(nombre), tecnico_fotos(url, es_portada)')
    .in('slug', slugs)
    .eq('activo', true)

  if (!tecnicos?.length) {
    return <div className="container-st py-16 text-center"><p>Técnicos no encontrados</p></div>
  }

  return (
    <div className="container-st py-10">
      <h1 className="font-display text-3xl text-azul mb-1">Comparación de técnicos</h1>
      <p className="text-gris-4 mb-6">{tecnicos.length} técnicos · Lado a lado</p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-3 text-xs uppercase tracking-wide text-gris-3 font-medium w-40"></th>
              {tecnicos.map((t: any) => (
                <th key={t.id} className="p-3 min-w-[220px]">
                  <div className="card text-center">
                    <div className="relative h-20 w-20 mx-auto rounded-full overflow-hidden bg-papel mb-2">
                      {t.tecnico_fotos?.[0]?.url && (
                        <Image src={t.tecnico_fotos[0].url} alt="" fill className="object-cover" />
                      )}
                    </div>
                    <h3 className="font-display text-base text-azul">{t.nombre_empresa}</h3>
                    <div className="text-xs text-gris-3">{t.comuna}</div>
                    <Link href={`/tecnico/${t.slug}`} className="block mt-3">
                      <Button size="sm" className="w-full">Contactar</Button>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            <Fila label="Rating global">
              {tecnicos.map((t: any) => (
                <td key={t.id} className="p-3 text-center">
                  <div className="font-display text-2xl font-bold text-azul">{(t.rating_promedio || 0).toFixed(1)}</div>
                  <div className="text-xs text-gris-3">({t.total_resenas} reseñas)</div>
                </td>
              ))}
            </Fila>
            {DIMENSIONES.map(d => (
              <Fila key={d.key} label={d.label}>
                {tecnicos.map((t: any) => (
                  <td key={t.id} className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-papel rounded-full overflow-hidden">
                        <div className="h-full bg-oro" style={{ width: `${(t[d.key] / 5) * 100}%` }} />
                      </div>
                      <span className="text-xs w-8 text-right">{(t[d.key] || 0).toFixed(1)}</span>
                    </div>
                  </td>
                ))}
              </Fila>
            ))}
            <Fila label="Plan">
              {tecnicos.map((t: any) => (
                <td key={t.id} className="p-3 text-center text-sm font-semibold uppercase">
                  {t.plan}
                </td>
              ))}
            </Fila>
            <Fila label="Verificado">
              {tecnicos.map((t: any) => (
                <td key={t.id} className="p-3 text-center">
                  {t.verificado ? <ShieldCheck size={18} className="text-verde mx-auto" /> : <X size={18} className="text-gris-3 mx-auto" />}
                </td>
              ))}
            </Fila>
            <Fila label="Atiende 24/7">
              {tecnicos.map((t: any) => (
                <td key={t.id} className="p-3 text-center">
                  {t.atiende_24h ? <Zap size={18} className="text-rojo mx-auto" /> : <X size={18} className="text-gris-3 mx-auto" />}
                </td>
              ))}
            </Fila>
            <Fila label="A domicilio">
              {tecnicos.map((t: any) => (
                <td key={t.id} className="p-3 text-center">
                  {t.atiende_domicilio ? <Home size={18} className="text-azul mx-auto" /> : <X size={18} className="text-gris-3 mx-auto" />}
                </td>
              ))}
            </Fila>
            <Fila label="Cobertura">
              {tecnicos.map((t: any) => (
                <td key={t.id} className="p-3 text-xs text-gris-4">
                  {(t.comunas_cobertura || []).slice(0, 5).join(', ') || t.comuna}
                </td>
              ))}
            </Fila>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Fila({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t border-borde">
      <td className="p-3 text-xs uppercase tracking-wide font-medium text-gris-3">{label}</td>
      {children}
    </tr>
  )
}
