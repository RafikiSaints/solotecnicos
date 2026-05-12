import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { tiempoTranscurrido, formatearFecha, clpFormat } from '@/lib/utils'

export default async function MisCotizaciones() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login?next=/mi-cuenta/cotizaciones')

  const { data: cotizaciones } = await sb.from('cotizaciones')
    .select('*, tecnicos(nombre_empresa, slug, telefono, whatsapp)')
    .eq('cliente_user_id', user.id)
    .order('created_at', { ascending: false })

  const ESTADOS: Record<string, { tone: any; label: string }> = {
    pendiente:  { tone: 'oro',   label: 'Esperando respuesta' },
    vista:      { tone: 'azul',  label: 'El técnico vio tu mensaje' },
    respondida: { tone: 'verde', label: 'Te respondió' },
    contactada: { tone: 'verde', label: 'Te contactó' },
    cerrada:    { tone: 'gris',  label: 'Cerrada' },
  }

  return (
    <div className="container-st py-10 max-w-4xl">
      <Link href="/mi-cuenta" className="text-sm text-gris-4 hover:text-azul inline-flex items-center gap-1 mb-4">
        <ArrowLeft size={14} /> Volver a mi cuenta
      </Link>

      <h1 className="font-display text-3xl text-azul font-bold mb-1">Mis cotizaciones</h1>
      <p className="text-gris-4 mb-6">Historial de solicitudes que enviaste a técnicos</p>

      {!cotizaciones?.length ? (
        <div className="card text-center py-10">
          <MessageSquare size={36} className="text-gris-3 mx-auto mb-2" />
          <p className="text-gris-4">Aún no has solicitado cotizaciones</p>
          <Link href="/buscar" className="inline-block mt-3">
            <Button size="sm">Buscar técnicos</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cotizaciones.map((c: any) => (
            <article key={c.id} className="card">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                <div>
                  <Link href={`/tecnico/${c.tecnicos?.slug}`} className="font-display text-lg text-azul font-bold hover:text-azul-mid inline-flex items-center gap-1">
                    {c.tecnicos?.nombre_empresa || 'Técnico'}
                    <ExternalLink size={12} />
                  </Link>
                  <div className="text-xs text-gris-3">
                    Enviada {tiempoTranscurrido(c.created_at)} · {formatearFecha(c.created_at)}
                  </div>
                </div>
                <Badge tone={ESTADOS[c.estado]?.tone || 'gris'}>
                  {ESTADOS[c.estado]?.label || c.estado}
                </Badge>
              </div>

              <div className="rounded-md bg-papel p-3 my-3">
                <div className="text-xs text-gris-3 font-semibold uppercase mb-1">Tu solicitud:</div>
                <p className="text-sm text-gris-4 whitespace-pre-wrap">{c.descripcion}</p>
              </div>

              {c.respuesta && (
                <div className="rounded-md bg-verde/5 border border-verde/30 p-3 my-3">
                  <div className="text-xs text-verde font-semibold uppercase mb-1">Respuesta del técnico:</div>
                  <p className="text-sm text-gris-4 whitespace-pre-wrap">{c.respuesta}</p>
                  {c.precio_cotizado && (
                    <div className="mt-2 text-sm">
                      <span className="text-xs text-gris-3">Precio cotizado:</span>
                      <strong className="text-verde ml-1">{clpFormat(c.precio_cotizado)}</strong>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-borde">
                {c.tecnicos?.telefono && (
                  <a href={`tel:${c.tecnicos.telefono}`}>
                    <Button variant="outline" size="sm">📞 Llamar</Button>
                  </a>
                )}
                {c.tecnicos?.whatsapp && (
                  <a href={`https://wa.me/${c.tecnicos.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="!border-verde/40 !text-verde">💬 WhatsApp</Button>
                  </a>
                )}
                <Link href={`/tecnico/${c.tecnicos?.slug}`} className="ml-auto">
                  <Button variant="ghost" size="sm">Ver perfil</Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
