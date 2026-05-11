'use client'
import { useState, useEffect } from 'react'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { LockedOverlay } from '@/components/ui/UpgradePrompt'
import { createClient } from '@/lib/supabase/client'
import { puedeHacer, limiteNumerico } from '@/lib/planes'
import { DIAS_SEMANA } from '@/lib/utils'
import type { Tecnico, Region, Categoria, Servicio, Horarios } from '@/types/database.types'

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

  // Auto-save con debounce
  useEffect(() => {
    if (JSON.stringify(form) === JSON.stringify(tecnico)) return
    const id = setTimeout(async () => {
      setSaving(true)
      const { error } = await supabase.from('tecnicos').update({
        nombre_empresa: form.nombre_empresa,
        nombre_contacto: form.nombre_contacto,
        descripcion: form.descripcion,
        descripcion_corta: form.descripcion_corta,
        region_id: form.region_id,
        comuna: form.comuna,
        direccion: form.direccion,
        comunas_cobertura: form.comunas_cobertura,
        telefono: form.telefono,
        whatsapp: form.whatsapp,
        email_publico: form.email_publico,
        sitio_web: form.sitio_web,
        horarios: form.horarios,
        atiende_24h: form.atiende_24h,
        atiende_domicilio: form.atiende_domicilio,
      }).eq('id', tecnico.id)
      setSaving(false)
      if (!error) push('Cambios guardados')
      else push('Error al guardar', 'error')
    }, 1500)
    return () => clearTimeout(id)
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
            />
            {!whatsappPermitido && <LockedOverlay feature="WhatsApp visible solo en plan PRO" />}
          </div>
          <Input label="Email público" value={form.email_publico || ''} onChange={e => setForm({ ...form, email_publico: e.target.value })} />
          <Input label="Sitio web" value={form.sitio_web || ''} onChange={e => setForm({ ...form, sitio_web: e.target.value })} placeholder="https://" />
        </div>
      </Seccion>

      {/* UBICACIÓN */}
      <Seccion titulo="Ubicación">
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Región" value={form.region_id || ''} onChange={e => setForm({ ...form, region_id: Number(e.target.value) })}>
            <option value="">Selecciona...</option>
            {regiones.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </Select>
          <Input label="Comuna" value={form.comuna || ''} onChange={e => setForm({ ...form, comuna: e.target.value })} />
        </div>
        <Input label="Dirección" value={form.direccion || ''} onChange={e => setForm({ ...form, direccion: e.target.value })} />
        <Textarea
          label="Comunas de cobertura (separadas por coma)"
          value={(form.comunas_cobertura || []).join(', ')}
          onChange={e => setForm({ ...form, comunas_cobertura: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="Las Condes, Vitacura, Providencia"
        />
      </Seccion>

      {/* CATEGORÍAS */}
      <Seccion titulo={`Categorías (${cats.length}/5)`}>
        <div className="flex flex-wrap gap-2">
          {categorias.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCategoria(c.id)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${cats.includes(c.id) ? 'border-azul bg-azul text-white' : 'border-borde bg-white text-gris-4 hover:border-azul'}`}
            >
              {c.icono} {c.nombre}
            </button>
          ))}
        </div>
      </Seccion>

      {/* SERVICIOS */}
      <Seccion titulo={`Servicios (${svcs.length}/${limiteSvc === 9999 ? '∞' : limiteSvc})`}>
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
      <summary className="cursor-pointer font-display text-xl text-azul mb-3 select-none">{titulo}</summary>
      <div className="space-y-4 pt-3">{children}</div>
    </details>
  )
}

function ServicioRow({ servicio, onChange, onDelete }: { servicio: Servicio; onChange: (s: Servicio) => void; onDelete: () => void }) {
  return (
    <div className="grid grid-cols-[1fr_1fr_120px_40px] gap-2 items-start">
      <Input value={servicio.nombre} onChange={e => onChange({ ...servicio, nombre: e.target.value })} placeholder="Nombre" />
      <Input value={servicio.descripcion || ''} onChange={e => onChange({ ...servicio, descripcion: e.target.value })} placeholder="Descripción" />
      <Input type="number" value={servicio.precio_desde || ''} onChange={e => onChange({ ...servicio, precio_desde: e.target.value ? Number(e.target.value) : null })} placeholder="Precio CLP" />
      <Button variant="ghost" size="sm" onClick={onDelete}>×</Button>
    </div>
  )
}
