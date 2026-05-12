'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { StarRating, RatingDisplay } from '@/components/ui/StarRating'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { tiempoTranscurrido } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, ChevronDown, ChevronUp, Star } from 'lucide-react'
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

export function SistemaResenas({ tecnicoId, resenas, ratingsTecnico }: { tecnicoId: string; resenas: Resena[]; ratingsTecnico?: Record<string, number> }) {
  return (
    <div className="space-y-6">
      {ratingsTecnico && <DesgloseRatings ratings={ratingsTecnico} total={resenas.length} />}
      <ListaResenas resenas={resenas} />
      <FormularioResena tecnicoId={tecnicoId} />
    </div>
  )
}

/**
 * Bloque expandible con promedio global + detalle de las 7 dimensiones
 */
function DesgloseRatings({ ratings, total }: { ratings: Record<string, number>; total: number }) {
  const [open, setOpen] = useState(false)
  const promedio = ratings.rating_promedio || 0

  return (
    <div className="card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <div className="flex items-center gap-3">
            <span className="font-display text-4xl font-extrabold text-azul">{promedio.toFixed(1)}</span>
            <div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} size={18} fill={promedio >= n - 0.25 ? '#F59E0B' : 'transparent'} stroke={promedio >= n - 0.25 ? '#F59E0B' : '#E2E8F0'} strokeWidth={1.5} />
                ))}
              </div>
              <div className="text-xs text-gris-3 mt-0.5">{total} reseña{total !== 1 ? 's' : ''} verificadas</div>
            </div>
          </div>
        </div>
        <span className="text-sm text-azul-mid font-medium inline-flex items-center gap-1">
          {open ? <>Ocultar detalle <ChevronUp size={14} /></> : <>Ver detalle por categoría <ChevronDown size={14} /></>}
        </span>
      </button>

      {open && (
        <div className="mt-5 pt-5 border-t border-borde grid sm:grid-cols-2 gap-x-6 gap-y-3 animate-fade-in">
          {DIMENSIONES.map(d => {
            const v = ratings[d.key] || 0
            return (
              <div key={d.key} className="flex items-center gap-3">
                <span className="text-sm text-gris-4 flex-1">{d.label}</span>
                <div className="w-24 h-2 bg-papel rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-oro to-coral"
                    style={{ width: `${(v / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-azul w-8 text-right">{v.toFixed(1)}</span>
              </div>
            )
          })}
        </div>
      )}
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
                {r.autor_verificado && <Badge tone="verde"><ShieldCheck size={11} />Verificada</Badge>}
              </div>
              <div className="text-xs text-gris-3">{tiempoTranscurrido(r.created_at)}</div>
            </div>
            <RatingDisplay value={r.rating_promedio} />
          </div>
          {r.titulo && <h5 className="font-semibold text-azul mb-1">{r.titulo}</h5>}
          <p className="text-sm text-gris-4 mb-3">{r.comentario}</p>

          <details className="text-xs">
            <summary className="cursor-pointer text-azul-mid font-medium select-none">Ver detalle por dimensión</summary>
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
            <div className="mt-3 ml-4 pl-4 border-l-2 border-azul-mid/30 bg-papel/40 rounded-r p-3">
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
  const [modo, setModo] = useState<'detallado' | 'simple'>('detallado')
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [ratingSimple, setRatingSimple] = useState(0)
  const [autor, setAutor] = useState({ nombre: '', email: '' })
  const [titulo, setTitulo] = useState('')
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [ok, setOk] = useState(false)
  const [user, setUser] = useState<any>(null)
  const push = useToast(s => s.push)
  const supabase = createClient()

  // Detectar usuario logueado y auto-llenar
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUser(user)
      const { data: cliente } = await supabase.from('clientes').select('nombre').eq('user_id', user.id).maybeSingle()
      setAutor({
        nombre: cliente?.nombre || user.user_metadata?.nombre || '',
        email: user.email || '',
      })
    })
  }, [])

  // Promedio en tiempo real para modo detallado
  const promedio = useMemo(() => {
    const vals = Object.values(ratings).filter(Boolean)
    if (vals.length !== 7) return 0
    return vals.reduce((a, b) => a + b, 0) / 7
  }, [ratings])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()

    // Determinar qué ratings enviar según el modo
    let ratingsFinal: Record<string, number>
    if (modo === 'detallado') {
      if (Object.keys(ratings).length !== 7) {
        push('Califica las 7 dimensiones, o cambia al modo simple', 'error')
        return
      }
      ratingsFinal = ratings
    } else {
      if (!ratingSimple) {
        push('Selecciona una calificación', 'error')
        return
      }
      // Aplicar la misma calificación a las 7 dimensiones
      ratingsFinal = Object.fromEntries(
        DIMENSIONES.map(d => [d.key, ratingSimple])
      )
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
        autor_user_id: user?.id || null,
        titulo: titulo || null,
        comentario,
        ...ratingsFinal,
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
        ⭐ Dejar una reseña
      </Button>
    )
  }

  return (
    <form onSubmit={enviar} className="card space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-xl text-azul font-bold">Tu reseña</h4>
        {modo === 'detallado' && promedio > 0 && (
          <Badge tone="oro">Promedio: {promedio.toFixed(1)} / 5</Badge>
        )}
      </div>

      {/* Selector de modo */}
      <div className="rounded-lg bg-papel p-1 flex gap-1 text-sm">
        <button
          type="button"
          onClick={() => setModo('detallado')}
          className={`flex-1 py-2 rounded-md font-medium transition-colors ${modo === 'detallado' ? 'bg-white text-azul shadow-sm' : 'text-gris-3'}`}
        >
          ⭐ Detallado (7 categorías)
        </button>
        <button
          type="button"
          onClick={() => setModo('simple')}
          className={`flex-1 py-2 rounded-md font-medium transition-colors ${modo === 'simple' ? 'bg-white text-azul shadow-sm' : 'text-gris-3'}`}
        >
          ⚡ Rápido (1 sola)
        </button>
      </div>

      {modo === 'detallado' ? (
        <>
          <p className="text-xs text-gris-3">
            La forma más útil de evaluar — califica cada aspecto del servicio.
          </p>
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
        </>
      ) : (
        <div className="rounded-md border-2 border-oro/30 bg-oro/5 p-4 text-center">
          <p className="text-sm text-gris-4 mb-3">
            ⚡ <strong>Modo rápido:</strong> Una sola calificación se aplicará a las 7 categorías. Si después quieres detallar, vuelve al modo detallado <strong>antes</strong> de enviar.
          </p>
          <div className="flex justify-center">
            <StarRating
              value={ratingSimple}
              onChange={setRatingSimple}
              size={36}
            />
          </div>
        </div>
      )}

      <Input label="Tu nombre" value={autor.nombre} onChange={e => setAutor(a => ({ ...a, nombre: e.target.value }))} required />
      <Input label="Email (no se publica, solo para verificación)" type="email" value={autor.email} onChange={e => setAutor(a => ({ ...a, email: e.target.value }))} />
      <Input label="Título (opcional)" value={titulo} onChange={e => setTitulo(e.target.value)} />
      <Textarea label="Comentario" value={comentario} onChange={e => setComentario(e.target.value)} required helper={`${comentario.length} / 30 mínimo`} />

      <input type="text" name="_h" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="flex gap-2">
        <Button type="submit" loading={enviando}>Enviar reseña</Button>
        <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
      </div>
    </form>
  )
}
