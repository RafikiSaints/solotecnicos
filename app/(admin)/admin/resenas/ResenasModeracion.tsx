'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RatingDisplay } from '@/components/ui/StarRating'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { tiempoTranscurrido } from '@/lib/utils'

export function ResenasModeracion({ resenas: ini }: { resenas: any[] }) {
  const [resenas, setResenas] = useState(ini)
  const supabase = createClient()
  const push = useToast(s => s.push)

  async function aprobar(id: string) {
    await supabase.from('resenas').update({ aprobada: true }).eq('id', id)
    setResenas(resenas.map(r => r.id === id ? { ...r, aprobada: true } : r))
    push('Reseña aprobada')
  }
  async function rechazar(id: string) {
    if (!confirm('¿Rechazar/eliminar reseña?')) return
    await supabase.from('resenas').delete().eq('id', id)
    setResenas(resenas.filter(r => r.id !== id))
    push('Reseña eliminada')
  }

  return (
    <div className="space-y-3">
      {resenas.map(r => (
        <div key={r.id} className="card">
          <div className="flex items-start justify-between mb-2">
            <div>
              <Link href={`/tecnico/${r.tecnicos?.slug}`} className="text-azul font-medium hover:underline">
                {r.tecnicos?.nombre_empresa}
              </Link>
              <div className="text-xs text-gris-3">
                <strong>{r.autor_nombre}</strong> · {tiempoTranscurrido(r.created_at)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RatingDisplay value={r.rating_promedio} />
              <Badge tone={r.aprobada ? 'verde' : 'oro'}>{r.aprobada ? 'Aprobada' : 'Pendiente'}</Badge>
            </div>
          </div>
          {r.titulo && <div className="font-semibold text-azul">{r.titulo}</div>}
          <p className="text-sm text-gris-4 mb-3">{r.comentario}</p>
          {!r.aprobada && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => aprobar(r.id)}>Aprobar</Button>
              <Button size="sm" variant="ghost" onClick={() => rechazar(r.id)}>Rechazar</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
