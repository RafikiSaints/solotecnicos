'use client'
import { useState } from 'react'
import { RatingDisplay } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { tiempoTranscurrido } from '@/lib/utils'
import { puedeHacer } from '@/lib/planes'
import { UpgradePrompt } from '@/components/ui/UpgradePrompt'
import { createClient } from '@/lib/supabase/client'
import type { Resena, Tecnico } from '@/types/database.types'

export function ResenasManager({ resenas, tecnico }: { resenas: Resena[]; tecnico: Tecnico }) {
  const [items, setItems] = useState(resenas)
  const supabase = createClient()
  const push = useToast(s => s.push)
  const puedeResponder = puedeHacer(tecnico, 'puede_responder_resenas')

  async function responder(id: string, respuesta: string) {
    await supabase.from('resenas').update({
      respuesta_tecnico: respuesta,
      respondido_en: new Date().toISOString(),
    }).eq('id', id)
    setItems(items.map(r => r.id === id ? { ...r, respuesta_tecnico: respuesta, respondido_en: new Date().toISOString() } : r))
    push('Respuesta publicada')
  }

  if (!items.length) {
    return <p className="text-center text-gris-3 py-10">Aún no tienes reseñas.</p>
  }

  return (
    <div className="space-y-4">
      {items.map(r => (
        <ResenaItem key={r.id} resena={r} onResponder={responder} puedeResponder={puedeResponder} />
      ))}
    </div>
  )
}

function ResenaItem({ resena, onResponder, puedeResponder }: { resena: Resena; onResponder: (id: string, r: string) => Promise<void>; puedeResponder: boolean }) {
  const [respondiendo, setRespondiendo] = useState(false)
  const [texto, setTexto] = useState('')

  return (
    <article className="card">
      <div className="flex items-start justify-between mb-2">
        <div>
          <strong className="text-azul">{resena.autor_nombre}</strong>
          <div className="text-xs text-gris-3">{tiempoTranscurrido(resena.created_at)}</div>
        </div>
        <div className="text-right">
          <RatingDisplay value={resena.rating_promedio} />
          {!resena.aprobada && <Badge tone="oro" className="mt-1">En revisión</Badge>}
        </div>
      </div>
      {resena.titulo && <h5 className="font-medium text-azul mb-1">{resena.titulo}</h5>}
      <p className="text-sm text-gris-4 mb-3">{resena.comentario}</p>

      {resena.respuesta_tecnico ? (
        <div className="bg-papel/50 border-l-2 border-azul/30 p-3 rounded-r">
          <Badge tone="azul">Tu respuesta</Badge>
          <p className="text-sm text-gris-4 mt-1.5">{resena.respuesta_tecnico}</p>
        </div>
      ) : puedeResponder ? (
        respondiendo ? (
          <form onSubmit={async (e) => {
            e.preventDefault()
            if (texto.trim()) {
              await onResponder(resena.id, texto)
              setRespondiendo(false)
              setTexto('')
            }
          }} className="space-y-2">
            <Textarea placeholder="Tu respuesta…" value={texto} onChange={e => setTexto(e.target.value)} />
            <div className="flex gap-2">
              <Button type="submit" size="sm">Publicar</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setRespondiendo(false)}>Cancelar</Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setRespondiendo(true)}>Responder</Button>
        )
      ) : (
        <UpgradePrompt feature="Responde a tus reseñas con plan PRO" inline />
      )}
    </article>
  )
}
