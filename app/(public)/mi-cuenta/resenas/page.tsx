import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, ExternalLink, Star } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RatingDisplay } from '@/components/ui/StarRating'
import { formatearFecha, tiempoTranscurrido } from '@/lib/utils'

export default async function MisResenas() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login?next=/mi-cuenta/resenas')

  const { data: resenas } = await sb.from('resenas')
    .select('*, tecnicos(nombre_empresa, slug)')
    .eq('autor_user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container-st py-10 max-w-4xl">
      <Link href="/mi-cuenta" className="text-sm text-gris-4 hover:text-azul inline-flex items-center gap-1 mb-4">
        <ArrowLeft size={14} /> Volver a mi cuenta
      </Link>

      <h1 className="font-display text-3xl text-azul font-bold mb-1">Mis reseñas</h1>
      <p className="text-gris-4 mb-6">Opiniones que has dejado sobre técnicos contratados</p>

      {!resenas?.length ? (
        <div className="card text-center py-10">
          <Star size={36} className="text-gris-3 mx-auto mb-2" />
          <p className="text-gris-4">Aún no has dejado ninguna reseña</p>
          <Link href="/buscar" className="inline-block mt-3">
            <Button size="sm">Buscar técnicos</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {resenas.map((r: any) => (
            <article key={r.id} className="card">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                <div>
                  <Link href={`/tecnico/${r.tecnicos?.slug}`} className="font-display text-lg text-azul font-bold hover:text-azul-mid inline-flex items-center gap-1">
                    {r.tecnicos?.nombre_empresa || 'Técnico'}
                    <ExternalLink size={12} />
                  </Link>
                  <div className="text-xs text-gris-3">{tiempoTranscurrido(r.created_at)} · {formatearFecha(r.created_at)}</div>
                </div>
                <div className="text-right">
                  <RatingDisplay value={r.rating_promedio} />
                  <Badge tone={r.aprobada ? 'verde' : 'oro'} className="mt-1">
                    {r.aprobada ? '✓ Publicada' : '⏳ En revisión'}
                  </Badge>
                </div>
              </div>

              {r.titulo && <h4 className="font-semibold text-azul mb-1">{r.titulo}</h4>}
              <p className="text-sm text-gris-4">{r.comentario}</p>

              {r.respuesta_tecnico && (
                <div className="mt-3 ml-4 pl-4 border-l-2 border-azul-mid/30 bg-papel/40 rounded-r p-3">
                  <Badge tone="azul">Respuesta del técnico</Badge>
                  <p className="text-sm text-gris-4 mt-1.5">{r.respuesta_tecnico}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
