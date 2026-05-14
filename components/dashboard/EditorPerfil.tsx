'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { LockedOverlay } from '@/components/ui/UpgradePrompt'
import { InputChips } from './InputChips'
import { createClient } from '@/lib/supabase/client'
import { puedeHacer, limiteNumerico } from '@/lib/planes'
import { DIAS_SEMANA } from '@/lib/utils'
import type { Tecnico, Region, Categoria, Servicio, Horarios } from '@/types/database.types'

const MapaSelector = dynamic(() => import('./MapaSelector').then(m => m.MapaSelector), { ssr: false })

interface Props {
  tecnico: Tecnico
  regiones: Region[]
  categorias: Categoria[]
  categoriasSeleccionadas: number[]
  servicios: Servicio[]
}

export function EditorPerfil({ tecnico, regiones, categorias, categoriasSeleccionadas, servicios }: Props) {
  const push = useToast(s => s.push)
  const supabase = createClient()
  const [form, setForm] = useState(tecnico)
  const [cats, setCats] = useState<number[]>(categoriasSeleccionadas)
  const [svcs, setSvcs] = useState<Servicio[]>(servicios)
  const [saving, setSaving] = useState(false)

  // Auto-save con debounce — usa endpoint /api/tecnico/actualizar (pg directo, bypass schema cache)
  useEffect(() => {
    if (JSON.stringify(form) === JSON.stringify(tecnico)) return
    const id = setTimeout(async () => {
      setSaving(true)
      try {
        const res = await fetch('/api/tecnico/actualizar', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre_empresa: form.nombre_empresa,
            nombre_contacto: form.nombre_contacto,
            descripcion: form.descripcion,
            descripcion_corta: form.descripcion_corta,
            region_id: form.region_id,
            comuna: form.comuna,
            direccion: form.direccion,
            lat: form.lat,
            lng: form.lng,
            comunas_cobertura: form.comunas_cobertura,
            etiquetas: form.etiquetas,
            telefono: form.telefono,
            whatsapp: form.whatsapp,
            email_publico: form.email_publico,
            sitio_web: form.sitio_web,
            link_google_maps: form.link_google_maps,
            link_google_business: form.link_google_business,
            google_rating: (form as any).google_rating ?? null,
            google_total_resenas: (form as any).google_total_resenas ?? null,
            sucursales_texto: form.sucursales_texto,
            video_url: form.video_url,
            horarios: form.horarios,
            atiende_24h: form.atiende_24h,
            atiende_domicilio: form.atiende_domicilio,
          }),
        })
        setSaving(false)
        if (res.ok) push('Cambios guardados')
        else {
          const { error } = await res.json().catch(() => ({ error: 'Error desconocido' }))
          push(`Error al guardar: ${error}`, 'error')
        }
      } catch (e: any) {
        setSaving(false)
        push(`Error al guardar: ${e.message}`, 'error')
      }
    }, 1500)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  function actualizarHorario(dia: keyof Horarios, campo: 'abre' | 'cierra' | 'abierto', valor: any) {
    setForm(f => ({
      ...f,
      horarios: { ...f.horarios, [dia]: { ...f.horarios[dia], [campo]: valor } },
    }))
  }

  function toggleCategoria(id: number) {
    if (cats.includes(id)) {
      setCats(cats.filter(c => c !== id))
      supabase.from('tecnico_categorias').delete().eq('tecnico_id', tecnico.id).eq('categoria_id', id)
    } else if (cats.length < 5) {
      setCats([...cats, id])
      supabase.from('tecnico_categorias').insert({ tecnico_id: tecnico.id, categoria_id: id })
    } else {
      push('Máximo 5 categorías', 'error')
    }
  }

  const limiteSvc = limiteNumerico(tecnico, 'servicios')
  const limiteEtiq = limiteNumerico(tecnico, 'etiquetas')
  const whatsappPermitido = puedeHacer(tecnico, 'whatsapp_visible')

  async function agregarServicio() {
    if (svcs.length >= limiteSvc) {
      push(`Límite alcanzado: ${limiteSvc} servicios`, 'error')
      return
    }
    const { data } = await supabase.from('tecnico_servicios').insert({
      tecnico_id: tecnico.id,
      nombre: 'Nuevo servicio',
      orden: svcs.length,
    }).select().single()
    if (data) setSvcs([...svcs, data])
  }

  async function actualizarServicio(s: Servicio) {
    await supabase.from('tecnico_servicios').update({
      nombre: s.nombre, descripcion: s.descripcion, precio_desde: s.precio_desde,
    }).eq('id', s.id)
  }

  async function eliminarServicio(id: string) {
    await supabase.from('tecnico_servicios').delete().eq('id', id)
    setSvcs(svcs.filter(s => s.id !== id))
  }

  return (
    <div className="space-y-6">
      {saving && <Badge tone="azul">Guardando…</Badge>}

      {/* INFO BÁSICA */}
      <Seccion titulo="Información básica">
        <Input label="Nombre de la empresa" value={form.nombre_empresa} onChange={e => setForm({ ...form, nombre_empresa: e.target.value })} />
        <Input label="Nombre de contacto" value={form.nombre_contacto || ''} onChange={e => setForm({ ...form, nombre_contacto: e.target.value })} />
        <Textarea label="Descripción corta (máx 160)" maxLength={160} value={form.descripcion_corta || ''} onChange={e => setForm({ ...form, descripcion_corta: e.target.value })} helper={`${(form.descripcion_corta || '').length}/160`} />
        <Textarea label="Descripción completa" value={form.descripcion || ''} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="min-h-[160px]" />
      </Seccion>

      {/* CONTACTO */}
      <Seccion titulo="Contacto">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Teléfono" value={form.telefono || ''} onChange={e => setForm({ ...form, telefono: e.target.value })} />
          <div className="relative">
            <Input
              label="WhatsApp"
              value={form.whatsapp || ''}
              onChange={e => setForm({ ...form, whatsapp: e.target.value })}
              disabled={!whatsappPermitido}
              placeholder="+56912345678"
            />
            {!whatsappPermitido && <LockedOverlay feature="WhatsApp visible solo en plan PRO" />}
          </div>
          <Input label="Email público" value={form.email_publico || ''} onChange={e => setForm({ ...form, email_publico: e.target.value })} />
          <Input label="Sitio web" value={form.sitio_web || ''} onChange={e => setForm({ ...form, sitio_web: e.target.value })} placeholder="https://" />
        </div>
      </Seccion>

      {/* UBICACIÓN */}
      <Seccion titulo="Ubicación del local">
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Región" value={form.region_id || ''} onChange={e => setForm({ ...form, region_id: Number(e.target.value) })}>
            <option value="">Selecciona...</option>
            {regiones.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </Select>
          <Input label="Comuna" value={form.comuna || ''} onChange={e => setForm({ ...form, comuna: e.target.value })} />
        </div>
        <Input label="Dirección" value={form.direccion || ''} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Av. Apoquindo 1234, Las Condes" />

        <div>
          <label className="label-st">Ubicación en el mapa</label>
          <MapaSelector
            lat={form.lat}
            lng={form.lng}
            onChange={(lat, lng) => setForm({ ...form, lat, lng })}
          />
        </div>

        <InputChips
          label="Comunas de cobertura"
          values={form.comunas_cobertura || []}
          onChange={v => setForm({ ...form, comunas_cobertura: v })}
          placeholder="Escribe y presiona Enter o coma"
          helper="Las comunas que cubres con servicio a domicilio"
        />

        {/* Puntos de atención adicionales (solo PRO/Elite) */}
        {puedeHacer(tecnico, 'puntos_atencion') ? (
          <Textarea
            label="Puntos de atención adicionales (PRO/Elite)"
            value={form.sucursales_texto || ''}
            onChange={e => setForm({ ...form, sucursales_texto: e.target.value })}
            placeholder="Ej: Tenemos sucursales en Las Condes (Av. Apoquindo 1234) y Maipú (Plaza Maipú local 23). También atendemos en domicilio de lunes a sábado."
            className="min-h-[80px]"
            helper="Si tienes varias sucursales o puntos de atención, descríbelos aquí. Aparece como bloque en tu perfil público."
          />
        ) : (
          <div className="rounded-md border border-borde p-3 bg-papel/50 text-sm text-gris-3 flex items-center gap-2">
            <span className="text-oro">🔒</span>
            <span><strong>Puntos de atención múltiples</strong> — disponible en plan PRO o Elite. Te permite describir tus sucursales adicionales en el perfil público.</span>
          </div>
        )}
      </Seccion>

      {/* GOOGLE */}
      <Seccion titulo="Integraciones Google (opcional, recomendado)">
        <Input
          label="Link Google Maps"
          value={form.link_google_maps || ''}
          onChange={e => setForm({ ...form, link_google_maps: e.target.value })}
          placeholder="https://maps.app.goo.gl/..."
          helper="Pega el link compartible de tu local en Google Maps. Aparecerá un botón en tu perfil."
        />
        <Input
          label="Link Google My Business"
          value={form.link_google_business || ''}
          onChange={e => setForm({ ...form, link_google_business: e.target.value })}
          placeholder="https://g.co/kgs/..."
          helper="Tu perfil de empresa en Google. Aumenta la confianza de los clientes."
        />

        {/* Importar rating de Google */}
        <div className="rounded-md bg-azul-mid/5 border border-azul-mid/20 p-3 space-y-3">
          <div>
            <strong className="text-azul text-sm">⭐ Reputación de Google</strong>
            <p className="text-xs text-gris-3 mt-0.5">
              Muestra tu rating actual de Google en tu perfil mientras no tengas reseñas aquí. Suma confianza.
              <br /><strong>Cómo encontrarlo:</strong> busca tu negocio en Google Maps → mira la estrella y el número de reseñas.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label="Rating en Google (0-5)"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={(form as any).google_rating || ''}
              onChange={e => setForm({ ...form, google_rating: e.target.value ? parseFloat(e.target.value) : 0 } as any)}
              placeholder="4.8"
            />
            <Input
              label="Cantidad de reseñas"
              type="number"
              min="0"
              value={(form as any).google_total_resenas || ''}
              onChange={e => setForm({ ...form, google_total_resenas: e.target.value ? parseInt(e.target.value) : 0 } as any)}
              placeholder="132"
            />
          </div>
        </div>
      </Seccion>

      {/* VIDEO PROMOCIONAL (solo Elite) */}
      <Seccion titulo="Video promocional (Elite)">
        {puedeHacer(tecnico, 'video') ? (
          <>
            <Input
              label="URL del video"
              value={form.video_url || ''}
              onChange={e => setForm({ ...form, video_url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              helper="Pega la URL completa de un video de YouTube o Vimeo. Aparecerá embebido en tu perfil."
            />
            <p className="text-xs text-gris-3">
              <strong>Tip:</strong> Un video de 30-60 segundos donde te presentes, muestres tu trabajo o explique algún caso real funciona muy bien. Aumenta hasta 2x las cotizaciones.
            </p>
          </>
        ) : (
          <div className="rounded-md border border-borde p-3 bg-papel/50 text-sm text-gris-3 flex items-center gap-2">
            <span className="text-oro">🔒</span>
            <span><strong>Video promocional</strong> — disponible solo en plan Elite. Te diferencia de la competencia con un video de tu trabajo o presentación.</span>
          </div>
        )}
      </Seccion>

      {/* CATEGORÍAS */}
      <Seccion titulo={`Categorías (${cats.length}/5)`}>
        <p className="text-xs text-gris-3 -mt-2 mb-2">
          Las categorías principales que ofreces. Aparecen como filtro y badge en tu perfil.
        </p>
        <div className="flex flex-wrap gap-2">
          {categorias.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCategoria(c.id)}
              className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${cats.includes(c.id) ? 'border-azul-mid bg-azul-mid text-white' : 'border-borde bg-white text-gris-4 hover:border-azul-mid'}`}
            >
              {c.icono} {c.nombre}
            </button>
          ))}
        </div>
      </Seccion>

      {/* ETIQUETAS DE SERVICIO */}
      <Seccion titulo={`Etiquetas de servicio (${(form.etiquetas || []).length}/${limiteEtiq === 9999 ? '∞' : limiteEtiq})`}>
        <p className="text-xs text-gris-3 -mt-2 mb-2">
          Palabras clave específicas para que te encuentren al buscar. Ejemplos: <em>lavadoras Samsung</em>, <em>aire acondicionado split</em>, <em>iPhone 13</em>, <em>placa madre</em>, <em>fuga gas</em>, <em>cámaras Hikvision</em>.
        </p>
        <InputChips
          values={form.etiquetas || []}
          onChange={v => {
            if (v.length > limiteEtiq) {
              push(`Límite alcanzado: ${limiteEtiq} etiquetas en tu plan`, 'error')
              return
            }
            setForm({ ...form, etiquetas: v })
          }}
          placeholder="Escribe una palabra clave y Enter…"
          helper={`${limiteEtiq === 9999 ? 'Ilimitadas' : `Máximo ${limiteEtiq} etiquetas`} en tu plan`}
        />
      </Seccion>

      {/* SERVICIOS */}
      <Seccion titulo={`Servicios (${svcs.length}/${limiteSvc === 9999 ? '∞' : limiteSvc})`}>
        <p className="text-xs text-gris-3 -mt-2 mb-2">
          Si no tienes precio fijo, déjalo vacío y aparecerá un botón <strong>"Cotizar"</strong> en tu perfil.
        </p>

        {/* Ejemplo guía */}
        {svcs.length === 0 && (
          <div className="rounded-md border-2 border-dashed border-azul-mid/30 bg-azul-mid/5 p-4 space-y-2 text-sm">
            <div className="font-semibold text-azul-mid flex items-center gap-1.5">💡 Ejemplo de cómo se vería:</div>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="bg-white rounded p-2.5 border border-borde">
                <div className="text-xs text-gris-3 mb-1">Servicio con precio fijo:</div>
                <strong className="text-azul block">Limpieza split 9000 BTU</strong>
                <span className="text-xs text-gris-4">Mantención completa con químico</span>
                <div className="text-sm font-bold text-azul-mid mt-1">desde $25.000</div>
              </div>
              <div className="bg-white rounded p-2.5 border border-borde">
                <div className="text-xs text-gris-3 mb-1">Servicio sin precio (cotizar):</div>
                <strong className="text-azul block">Instalación split personalizada</strong>
                <span className="text-xs text-gris-4">Depende de la complejidad</span>
                <div className="text-sm font-semibold text-rojo mt-1">💬 Solicitar cotización →</div>
              </div>
            </div>
            <p className="text-xs text-gris-3">Click en "+ Agregar servicio" para crear los tuyos.</p>
          </div>
        )}

        <div className="space-y-2">
          {svcs.map((s, i) => (
            <ServicioRow
              key={s.id}
              servicio={s}
              onChange={(updated) => {
                setSvcs(svcs.map((x, j) => (j === i ? updated : x)))
                actualizarServicio(updated)
              }}
              onDelete={() => eliminarServicio(s.id)}
            />
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={agregarServicio}>+ Agregar servicio</Button>
      </Seccion>

      {/* HORARIOS */}
      <Seccion titulo="Horarios">
        <label className="flex items-center gap-2 mb-3">
          <input type="checkbox" checked={form.atiende_24h} onChange={e => setForm({ ...form, atiende_24h: e.target.checked })} />
          <span className="text-sm">Atendemos 24/7</span>
        </label>
        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={form.atiende_domicilio} onChange={e => setForm({ ...form, atiende_domicilio: e.target.checked })} />
          <span className="text-sm">Atendemos a domicilio</span>
        </label>
        <div className="space-y-2">
          {DIAS_SEMANA.map(d => {
            const h = form.horarios[d.key]
            return (
              <div key={d.key} className="grid grid-cols-[100px_1fr_1fr_60px] gap-2 items-center">
                <span className="text-sm font-medium">{d.label}</span>
                <input type="time" value={h?.abre || ''} onChange={e => actualizarHorario(d.key, 'abre', e.target.value)} className="input-st text-sm" disabled={!h?.abierto} />
                <input type="time" value={h?.cierra || ''} onChange={e => actualizarHorario(d.key, 'cierra', e.target.value)} className="input-st text-sm" disabled={!h?.abierto} />
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={h?.abierto ?? false} onChange={e => actualizarHorario(d.key, 'abierto', e.target.checked)} />
                  Abre
                </label>
              </div>
            )
          })}
        </div>
      </Seccion>
    </div>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <details className="card" open>
      <summary className="cursor-pointer font-display text-xl text-azul mb-3 select-none font-bold">{titulo}</summary>
      <div className="space-y-4 pt-3">{children}</div>
    </details>
  )
}

function ServicioRow({ servicio, onChange, onDelete }: { servicio: Servicio; onChange: (s: Servicio) => void; onDelete: () => void }) {
  return (
    <div className="grid grid-cols-[1fr_1fr_120px_40px] gap-2 items-start">
      <Input value={servicio.nombre} onChange={e => onChange({ ...servicio, nombre: e.target.value })} placeholder="Nombre" />
      <Input value={servicio.descripcion || ''} onChange={e => onChange({ ...servicio, descripcion: e.target.value })} placeholder="Descripción" />
      <Input
        type="number"
        value={servicio.precio_desde || ''}
        onChange={e => onChange({ ...servicio, precio_desde: e.target.value ? Number(e.target.value) : null })}
        placeholder="Vacío = cotizar"
      />
      <Button variant="ghost" size="sm" onClick={onDelete}>×</Button>
    </div>
  )
}
