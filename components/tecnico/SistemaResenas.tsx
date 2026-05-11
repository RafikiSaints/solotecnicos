'use client'
import { useState, useMemo } from 'react'
import { StarRating, RatingDisplay } from '@/components/ui/StarRating'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { tiempoTranscurrido } from '@/lib/utils'
import { ShieldCheck } from 'lucide-react'
import type { Resena } from '@/types/database.types'

const DIMENSIONES = [
  { key: 'rating_atencion',  label: 'Atención al cliente' },
  { key: 'rating_calidad',   label: 'Calidad del trabajo' },
  { key: 'rating_respuesta', label: 'Tiempo de respuesta' },
  { key: 'rating_resolucion',label: 'Resolución del problema' },
  { key: 'rating_rapidez',   label: 'Rapidez de ejecución' },
  { key: 'rating_precio',    label: 'Precio justo' },
  { key: 'rating_garantia',  label: 'Garantía ofrecida' },
] as const

export function SistemaResenas({ tecnicoId, resenas }: { tecnicoId: string; resenas: Resena[] }) {
  return (
    <div className="space-y-6">
      <ListaResenas resenas={resenas} />
      <FormularioResena tecnicoId={tecnicoId} />
    </div>
  )
}

function ListaResenas({ resenas }: { resenas: Resena[] }) {
  const [page, setPage] = useState(1)
  const perPage = 10
  const total = resenas.length
  const totalPages = Math.ceil(total / perPage)
  const visible = resenas.slice((page - 1) * perPage, page * perPage)

  if (!total) return (
    <div className="text-center py-8 text-gris-3 text-sm">
      Aún no hay reseñas. Sé el primero en dejar una.
    </div>
  )
  return (
    <div className="space-y-4">
      {visible.map(r => (
        <article key={r.id} className="card">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-azul">{r.autor_nombre}</strong>
                {r.autor_verificado && <Badge tone="verde"><ShieldCheck size={11} />Reseña verificada</Badge>}
              </div>
              <div className="text-xs text-gris-3">{tiempoTranscurrido(r.created_at)}</div>
            </div>
            <RatingDisplay value={r.rating_promedio} />
          </div>
          {r.titulo && <h5 className="font-semibold text-azul mb-1">{r.titulo}</h5>}
          <p className="text-sm text-gris-4 mb-3">{r.comentario}</p>

          <details className="text-xs">
            <summary className="cursor-pointer text-azul font-medium select-none">Ver detalle por dimensión</summary>
            <div className="mt-2 grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
              {DIMENSIONES.map(d => (
                <div key={d.key} className="flex items-center gap-2">
                  <span className="text-gris-4 w-32">{d.label}</span>
                  <div className="flex-1 h-1.5 bg-papel rounded-full overflow-hidden">
                    <div className="h-full bg-oro" style={{ width: `${((r as any)[d.key] / 5) * 100}%` }} />
                  </div>
                  <span className="text-gris-4 w-6 text-right">{((r as any)[d.key]).toFixed(1)}</span>
                </div>
              ))}
            </div>
          </details>

          {r.respuesta_tecnico && (
            <div className="mt-3 ml-4 pl-4 border-l-2 border-azul/30 bg-papel/40 rounded-r p-3">
              <Badge tone="azul">Respuesta del técnico</Badge>
              <p className="text-sm text-gris-4 mt-1.5">{r.respuesta_tecnico}</p>
            </div>
          )}
        </article>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</Button>
          <span className="text-sm text-gris-4">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
        </div>
      )}
    </div>
  )
}

function FormularioResena({ tecnicoId }: { tecnicoId: string }) {
  const [open, setOpen] = useState(false)
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [autor, setAutor] = useState({ nombre: '', email: '' })
  const [titulo, setTitulo] = useState('')
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [ok, setOk] = useState(false)
  const push = useToast(s => s.push)

  const promedio = useMemo(() => {
    const vals = Object.values(ratings).filter(Boolean)
    if (vals.length !== 7) return 0
    return vals.reduce((a, b) => a + b, 0) / 7
  }, [ratings])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (Object.keys(ratings).length !== 7) {
      push('Califica las 7 dimensiones', 'error')
      return
    }
    if (comentario.length < 30) {
      push('El comentario debe tener al menos 30 caracteres', 'error')
      return
    }
    setEnviando(true)
    const res = await fetch('/api/resenas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tecnico_id: tecnicoId,
        autor_nombre: autor.nombre,
        autor_email: autor.email || null,
        titulo: titulo || null,
        comentario,
        ...ratings,
      }),
    })
    setEnviando(false)
    if (res.ok) {
      setOk(true)
      push('¡Reseña enviada! Se publicará tras moderación')
    } else {
      push('Error — intenta nuevamente', 'error')
    }
  }

  if (ok) return (
    <div className="card text-center">
      <div className="text-3xl">⭐</div>
      <h4 className="font-display text-lg text-azul mt-2">¡Gracias por tu reseña!</h4>
      <p className="text-sm text-gris-4">Será revisada por nuestro equipo antes de publicarse.</p>
      <Badge tone="oro" className="mt-3">En revisión</Badge>
    </div>
  )

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)} className="w-full">
        Dejar una reseña
      </Button>
    )
  }

  return (
    <form onSubmit={enviar} className="card space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-lg text-azul">Tu reseña</h4>
        {promedio > 0 && (
          <Badge tone="oro">Promedio: {promedio.toFixed(1)} / 5</Badge>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {DIMENSIONES.map(d => (
          <div key={d.key} className="rounded-md border border-borde p-3">
            <div className="text-xs font-medium text-azul mb-1">{d.label}</div>
            <StarRating
              value={ratings[d.key] || 0}
              onChange={v => setRatings(r => ({ ...r, [d.key]: v }))}
              size={20}
            />
          </div>
        ))}
      </div>

      <Input label="Tu nombre" value={autor.nombre} onChange={e => setAutor(a => ({ ...a, nombre: e.target.value }))} required />
      <Input label="Email (no se publica)" type="email" value={autor.email} onChange={e => setAutor(a => ({ ...a, email: e.target.value }))} />
      <Input label="Título (opcional)" value={titulo} onChange={e => setTitulo(e.target.value)} />
      <Textarea label="Comentario" value={comentario} onChange={e => setComentario(e.target.value)} required helper={`${comentario.length} / 30 mínimo`} />

      {/* honeypot */}
      <input type="text" name="_h" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="flex gap-2">
        <Button type="submit" loading={enviando}>Enviar reseña</Button>
        <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
      </div>
    </form>
  )
}
