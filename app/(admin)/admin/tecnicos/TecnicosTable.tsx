'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Edit3, ExternalLink, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import { TablaPaginada } from '@/components/ui/TablaPaginada'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { formatearFecha } from '@/lib/utils'
import { planVigente } from '@/lib/planes'
import { InputChips } from '@/components/dashboard/InputChips'
import { HorarioPicker, HORARIOS_VACIOS } from '@/components/dashboard/HorarioPicker'
import type { Region } from '@/types/database.types'

interface TecnicoAdmin {
  id: string
  slug: string | null
  user_id: string | null
  nombre_empresa: string
  nombre_contacto: string | null
  descripcion_corta: string | null
  descripcion: string | null
  region_id: number | null
  comuna: string | null
  direccion: string | null
  plan: 'gratis' | 'pro' | 'elite'
  plan_vence_en: string | null
  verificado: boolean
  activo: boolean
  destacado: boolean
  rating_promedio: number
  total_resenas: number
  telefono: string | null
  whatsapp: string | null
  email_publico: string | null
  sitio_web: string | null
  link_google_maps: string | null
  link_google_business: string | null
  google_rating: number | null
  google_total_resenas: number | null
  etiquetas: string[] | null
  comunas_cobertura: string[] | null
  sucursales_texto: string | null
  video_url: string | null
  atiende_24h: boolean | null
  atiende_domicilio: boolean | null
  horarios: any
  created_at: string
  regiones?: { nombre: string } | null
}

export function TecnicosTable({ tecnicos: ini, regiones = [] }: { tecnicos: TecnicoAdmin[]; regiones?: Region[] }) {
  const [tecnicos, setTecnicos] = useState(ini)
  const [editando, setEditando] = useState<TecnicoAdmin | null>(null)
  const [filtroPlan, setFiltroPlan] = useState<string>('todos')
  const [filtroActivo, setFiltroActivo] = useState<string>('todos')
  const push = useToast(s => s.push)
  const supabase = createClient()

  const data = tecnicos.filter(t => {
    if (filtroPlan !== 'todos' && t.plan !== filtroPlan) return false
    if (filtroActivo === 'activos' && !t.activo) return false
    if (filtroActivo === 'inactivos' && t.activo) return false
    return true
  })

  async function guardarCambios(updates: Partial<TecnicoAdmin>) {
    if (!editando) return
    // Usa endpoint admin con pg directo (bypass schema cache de PostgREST)
    const res = await fetch('/api/admin/tecnico/actualizar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tecnico_id: editando.id, ...updates }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      push(`Error: ${err.error || 'No se pudo guardar'}`, 'error')
      return
    }
    setTecnicos(tecnicos.map(t => t.id === editando.id ? { ...t, ...updates } : t))
    push('Técnico actualizado')
    setEditando(null)
  }

  async function toggleActivo(id: string, actual: boolean) {
    const { error } = await supabase.from('tecnicos').update({ activo: !actual }).eq('id', id)
    if (!error) {
      setTecnicos(tecnicos.map(t => t.id === id ? { ...t, activo: !actual } : t))
      push(actual ? 'Técnico desactivado' : 'Técnico activado')
    } else push(`Error: ${error.message}`, 'error')
  }

  async function toggleVerificado(id: string, actual: boolean) {
    const { error } = await supabase.from('tecnicos').update({ verificado: !actual }).eq('id', id)
    if (!error) {
      setTecnicos(tecnicos.map(t => t.id === id ? { ...t, verificado: !actual } : t))
      push(actual ? 'Verificación quitada' : 'Técnico verificado')
    } else push(`Error: ${error.message}`, 'error')
  }

  async function eliminarTecnico(t: TecnicoAdmin) {
    const confirmacion = prompt(
      `⚠️ ELIMINAR PERMANENTEMENTE\n\n` +
      `Vas a borrar "${t.nombre_empresa}" y TODOS sus datos asociados:\n` +
      `• Categorías, servicios, fotos, sucursales\n` +
      `• Reseñas, cotizaciones, pagos, visitas\n\n` +
      `Esta acción NO se puede deshacer.\n\n` +
      `Para confirmar, escribe el nombre exacto de la empresa:`
    )
    if (confirmacion === null) return
    if (confirmacion.trim() !== t.nombre_empresa.trim()) {
      push('El nombre no coincide. Eliminación cancelada.', 'error')
      return
    }
    const res = await fetch('/api/admin/tecnico/eliminar', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      push(`Error: ${err.error || 'No se pudo eliminar'}`, 'error')
      return
    }
    setTecnicos(prev => prev.filter(x => x.id !== t.id))
    push(`"${t.nombre_empresa}" eliminado`)
  }

  return (
    <>
      <TablaPaginada<TecnicoAdmin>
        data={data}
        perPage={25}
        searchFn={(t, q) =>
          t.nombre_empresa.toLowerCase().includes(q) ||
          (t.nombre_contacto || '').toLowerCase().includes(q) ||
          (t.comuna || '').toLowerCase().includes(q) ||
          (t.email_publico || '').toLowerCase().includes(q) ||
          (t.regiones?.nombre || '').toLowerCase().includes(q)
        }
        filtros={
          <>
            <select value={filtroPlan} onChange={e => setFiltroPlan(e.target.value)} className="text-sm rounded-md border border-borde px-2 py-2">
              <option value="todos">Todos los planes</option>
              <option value="gratis">Gratis</option>
              <option value="pro">PRO</option>
              <option value="elite">Elite</option>
            </select>
            <select value={filtroActivo} onChange={e => setFiltroActivo(e.target.value)} className="text-sm rounded-md border border-borde px-2 py-2">
              <option value="todos">Activos e inactivos</option>
              <option value="activos">Solo activos</option>
              <option value="inactivos">Solo inactivos</option>
            </select>
          </>
        }
        columnas={[
          {
            key: 'empresa',
            label: 'Empresa',
            render: t => (
              <div>
                <Link href={`/tecnico/${t.slug}`} target="_blank" className="font-semibold text-azul hover:underline inline-flex items-center gap-1">
                  {t.nombre_empresa}
                  <ExternalLink size={11} />
                </Link>
                <div className="text-xs text-gris-3">{t.comuna}{t.regiones?.nombre ? `, ${t.regiones.nombre}` : ''}</div>
              </div>
            ),
          },
          {
            key: 'contacto',
            label: 'Contacto',
            render: t => (
              <div className="text-xs">
                {t.email_publico && <div className="text-gris-4">{t.email_publico}</div>}
                {t.telefono && <div className="text-gris-3">{t.telefono}</div>}
              </div>
            ),
          },
          {
            key: 'plan',
            label: 'Plan',
            render: t => {
              const p = planVigente(t)
              return <Badge tone={p === 'elite' ? 'oro' : p === 'pro' ? 'azul' : 'gris'}>{p}</Badge>
            },
          },
          {
            key: 'rating',
            label: 'Rating',
            render: t => (
              <span className="text-xs">
                {(t.rating_promedio || 0).toFixed(1)} <span className="text-gris-3">({t.total_resenas})</span>
              </span>
            ),
          },
          {
            key: 'estado',
            label: 'Estado',
            render: t => (
              <div className="flex flex-wrap gap-1">
                {t.activo ? <Badge tone="verde">Activo</Badge> : <Badge tone="rojo">Inactivo</Badge>}
                {t.verificado && <Badge tone="azul"><ShieldCheck size={10} />Verificado</Badge>}
                {!t.user_id && <Badge tone="oro">🪪 Sin reclamar</Badge>}
              </div>
            ),
          },
          {
            key: 'fecha',
            label: 'Registrado',
            render: t => <span className="text-xs text-gris-3">{formatearFecha(t.created_at)}</span>,
          },
          {
            key: 'acciones',
            label: 'Acciones',
            render: t => (
              <div className="flex gap-1">
                <button onClick={() => setEditando(t)} className="p-1.5 text-azul-mid hover:bg-azul-mid/10 rounded" title="Editar">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => toggleVerificado(t.id, t.verificado)} className="p-1.5 hover:bg-papel rounded" title={t.verificado ? 'Quitar verificación' : 'Verificar'}>
                  {t.verificado ? <ShieldOff size={14} className="text-rojo" /> : <ShieldCheck size={14} className="text-verde" />}
                </button>
                <button onClick={() => eliminarTecnico(t)} className="p-1.5 text-rojo hover:bg-rojo/10 rounded" title="Eliminar permanentemente">
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal open={!!editando} onClose={() => setEditando(null)} title={`Editar: ${editando?.nombre_empresa}`} size="lg">
        {editando && (
          <EditarTecnicoForm
            tecnico={editando}
            regiones={regiones}
            onSave={guardarCambios}
            onCancel={() => setEditando(null)}
            onUserUpdated={(newUserId) => {
              setTecnicos(tecnicos.map(t => t.id === editando.id ? { ...t, user_id: newUserId } : t))
              setEditando({ ...editando, user_id: newUserId })
            }}
          />
        )}
      </Modal>
    </>
  )
}

function EditarTecnicoForm({ tecnico, regiones, onSave, onCancel, onUserUpdated }: {
  tecnico: TecnicoAdmin
  regiones: Region[]
  onSave: (u: any) => void
  onCancel: () => void
  onUserUpdated: (newUserId: string | null) => void
}) {
  const [form, setForm] = useState({
    nombre_empresa: tecnico.nombre_empresa || '',
    nombre_contacto: tecnico.nombre_contacto || '',
    descripcion_corta: tecnico.descripcion_corta || '',
    descripcion: tecnico.descripcion || '',
    region_id: tecnico.region_id != null ? String(tecnico.region_id) : '',
    comuna: tecnico.comuna || '',
    direccion: tecnico.direccion || '',
    telefono: tecnico.telefono || '',
    whatsapp: tecnico.whatsapp || '',
    email_publico: tecnico.email_publico || '',
    sitio_web: tecnico.sitio_web || '',
    etiquetas: tecnico.etiquetas || [],
    comunas_cobertura: tecnico.comunas_cobertura || [],
    sucursales_texto: tecnico.sucursales_texto || '',
    video_url: tecnico.video_url || '',
    atiende_24h: !!tecnico.atiende_24h,
    atiende_domicilio: !!tecnico.atiende_domicilio,
    horarios: (tecnico.horarios as any) || HORARIOS_VACIOS,
    plan: tecnico.plan,
    plan_vence_en: tecnico.plan_vence_en?.slice(0, 10) || '',
    verificado: tecnico.verificado,
    destacado: tecnico.destacado,
    activo: tecnico.activo,
    link_google_maps: tecnico.link_google_maps || '',
    link_google_business: tecnico.link_google_business || '',
    google_rating: tecnico.google_rating != null ? String(tecnico.google_rating) : '',
    google_total_resenas: tecnico.google_total_resenas != null ? String(tecnico.google_total_resenas) : '',
  })
  const [emailVincular, setEmailVincular] = useState('')
  const [vinculando, setVinculando] = useState(false)
  const push = useToast(s => s.push)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      nombre_empresa: form.nombre_empresa.trim(),
      nombre_contacto: form.nombre_contacto.trim() || null,
      descripcion_corta: form.descripcion_corta.trim() || null,
      descripcion: form.descripcion.trim() || null,
      region_id: form.region_id ? Number(form.region_id) : null,
      comuna: form.comuna.trim() || null,
      direccion: form.direccion.trim() || null,
      telefono: form.telefono.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      email_publico: form.email_publico.trim() || null,
      sitio_web: form.sitio_web.trim() || null,
      etiquetas: form.etiquetas.length ? form.etiquetas : null,
      comunas_cobertura: form.comunas_cobertura.length ? form.comunas_cobertura : null,
      sucursales_texto: form.sucursales_texto.trim() || null,
      video_url: form.video_url.trim() || null,
      atiende_24h: form.atiende_24h,
      atiende_domicilio: form.atiende_domicilio,
      horarios: form.horarios,
      plan: form.plan,
      plan_vence_en: form.plan_vence_en ? new Date(form.plan_vence_en).toISOString() : null,
      verificado: form.verificado,
      destacado: form.destacado,
      activo: form.activo,
      link_google_maps: form.link_google_maps.trim() || null,
      link_google_business: form.link_google_business.trim() || null,
      google_rating: form.google_rating ? parseFloat(form.google_rating) : null,
      google_total_resenas: form.google_total_resenas ? parseInt(form.google_total_resenas) : null,
    })
  }

  async function vincular() {
    if (!emailVincular.trim()) return
    if (!confirm(`¿Vincular usuario ${emailVincular} al técnico "${tecnico.nombre_empresa}"?\n\nEsto convierte al usuario en técnico. Si la cuenta no existe se creará automáticamente y se enviará email de bienvenida.`)) return
    setVinculando(true)
    const res = await fetch('/api/admin/vincular-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tecnico_id: tecnico.id, email: emailVincular }),
    })
    setVinculando(false)
    if (res.ok) {
      const { user_id } = await res.json()
      onUserUpdated(user_id)
      setEmailVincular('')
      push('Usuario vinculado correctamente')
    } else {
      const err = await res.json().catch(() => ({}))
      push(err.error || 'Error al vincular', 'error')
    }
  }

  async function desvincular() {
    if (!confirm(`¿Desvincular usuario de "${tecnico.nombre_empresa}"? El técnico quedará como "huérfano" y otro usuario podrá reclamarlo.`)) return
    setVinculando(true)
    const res = await fetch('/api/admin/vincular-usuario', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tecnico_id: tecnico.id }),
    })
    setVinculando(false)
    if (res.ok) {
      onUserUpdated(null)
      push('Usuario desvinculado')
    } else {
      const err = await res.json().catch(() => ({}))
      push(err.error || 'Error', 'error')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* INFO BÁSICA */}
      <details open className="rounded-md border-2 border-borde p-3">
        <summary className="cursor-pointer font-display text-sm text-azul font-bold mb-2">📝 Información básica</summary>
        <div className="space-y-3 mt-3">
          <Input
            label="Nombre de la empresa *"
            required
            value={form.nombre_empresa}
            onChange={e => setForm({ ...form, nombre_empresa: e.target.value })}
          />
          <Input
            label="Nombre del contacto"
            value={form.nombre_contacto}
            onChange={e => setForm({ ...form, nombre_contacto: e.target.value })}
            placeholder="Juan Pérez"
          />
          <Textarea
            label="Descripción corta (máx 160 chars)"
            maxLength={160}
            value={form.descripcion_corta}
            onChange={e => setForm({ ...form, descripcion_corta: e.target.value })}
          />
          <Textarea
            label="Descripción larga"
            rows={3}
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>
      </details>

      {/* CONTACTO */}
      <details className="rounded-md border-2 border-borde p-3">
        <summary className="cursor-pointer font-display text-sm text-azul font-bold">📞 Contacto</summary>
        <div className="space-y-3 mt-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Teléfono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+56 9 1234 5678" />
            <Input label="WhatsApp" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="+56 9 1234 5678" />
          </div>
          <Input label="Email público" type="email" value={form.email_publico} onChange={e => setForm({ ...form, email_publico: e.target.value })} placeholder="contacto@empresa.cl" />
          <Input label="Sitio web" value={form.sitio_web} onChange={e => setForm({ ...form, sitio_web: e.target.value })} placeholder="https://..." />
        </div>
      </details>

      {/* UBICACIÓN */}
      <details className="rounded-md border-2 border-borde p-3">
        <summary className="cursor-pointer font-display text-sm text-azul font-bold">📍 Ubicación</summary>
        <div className="space-y-3 mt-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Select label="Región" value={form.region_id} onChange={e => setForm({ ...form, region_id: e.target.value })}>
              <option value="">Sin región</option>
              {regiones.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </Select>
            <Input label="Comuna" value={form.comuna} onChange={e => setForm({ ...form, comuna: e.target.value })} />
          </div>
          <Input label="Dirección" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
          <InputChips
            label="Comunas de cobertura (servicio a domicilio)"
            values={form.comunas_cobertura}
            onChange={v => setForm({ ...form, comunas_cobertura: v })}
            placeholder="Las Condes, Vitacura..."
          />
        </div>
      </details>

      {/* ETIQUETAS / SERVICIOS */}
      <details className="rounded-md border-2 border-borde p-3">
        <summary className="cursor-pointer font-display text-sm text-azul font-bold">🏷️ Etiquetas y extras</summary>
        <div className="space-y-3 mt-3">
          <InputChips
            label="Etiquetas (palabras clave de búsqueda)"
            values={form.etiquetas}
            onChange={v => setForm({ ...form, etiquetas: v })}
            placeholder="Samsung, lavadoras, climatización..."
          />
          <Textarea
            label="Sucursales (texto libre, PRO/Elite)"
            value={form.sucursales_texto}
            onChange={e => setForm({ ...form, sucursales_texto: e.target.value })}
            placeholder="Sucursal Las Condes, Sucursal Maipú..."
          />
          <Input
            label="URL Video promocional (Elite)"
            value={form.video_url}
            onChange={e => setForm({ ...form, video_url: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      </details>

      {/* HORARIO */}
      <details className="rounded-md border-2 border-borde p-3">
        <summary className="cursor-pointer font-display text-sm text-azul font-bold">🕒 Horario de atención</summary>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.atiende_domicilio} onChange={e => setForm({ ...form, atiende_domicilio: e.target.checked })} />
            <span className="text-sm">🚐 Atiende a domicilio</span>
          </label>
          <HorarioPicker
            horarios={form.horarios}
            onChange={h => setForm({ ...form, horarios: h })}
            atiende24h={form.atiende_24h}
            onToggle24h={v => setForm({ ...form, atiende_24h: v })}
          />
        </div>
      </details>

      {/* PLAN + FLAGS */}
      <details open className="rounded-md border-2 border-azul-mid/30 bg-azul-mid/5 p-3">
        <summary className="cursor-pointer font-display text-sm text-azul font-bold">🎟️ Plan y visibilidad</summary>
        <div className="space-y-3 mt-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Select label="Plan" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value as any })}>
              <option value="gratis">Gratis</option>
              <option value="pro">PRO</option>
              <option value="elite">Elite</option>
            </Select>
            <Input
              label="Plan vence el"
              type="date"
              value={form.plan_vence_en}
              onChange={e => setForm({ ...form, plan_vence_en: e.target.value })}
              helper={form.plan === 'gratis' ? 'Sin uso para plan gratis' : 'Después vuelve a gratis'}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.verificado} onChange={e => setForm({ ...form, verificado: e.target.checked })} />
              <span className="text-sm">✓ Técnico verificado (badge azul en perfil)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.destacado} onChange={e => setForm({ ...form, destacado: e.target.checked })} />
              <span className="text-sm">⭐ Destacado en home (sección destacados)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} />
              <span className="text-sm">🟢 Cuenta activa (visible al público)</span>
            </label>
          </div>
        </div>
      </details>

      {/* SECCIÓN PROPIETARIO */}
      <div className="rounded-md border-2 border-azul-mid/20 bg-azul-mid/5 p-3 space-y-3">
        <h4 className="font-display text-sm text-azul font-bold flex items-center gap-2">
          👤 Propietario del perfil
        </h4>

        {tecnico.user_id ? (
          <>
            <div className="text-sm text-gris-4">
              <Badge tone="verde">✓ Vinculado</Badge>
              <div className="text-xs mt-1">User ID: <span className="font-mono text-[10px]">{tecnico.user_id}</span></div>
              <div className="text-xs">El propietario puede iniciar sesión y editar este perfil.</div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={desvincular} loading={vinculando} className="!text-rojo hover:!bg-rojo/5">
              Desvincular propietario
            </Button>
          </>
        ) : (
          <>
            <div className="text-sm text-gris-4">
              <Badge tone="oro">🪪 Sin propietario</Badge>
              <div className="text-xs mt-1">Vincula a un usuario existente (ej: cliente registrado que quiere ser técnico) o crea cuenta nueva con email.</div>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailVincular}
                onChange={e => setEmailVincular(e.target.value)}
                placeholder="email@ejemplo.cl"
                className="input-st flex-1 text-sm"
              />
              <Button type="button" size="sm" onClick={vincular} loading={vinculando}>
                Vincular
              </Button>
            </div>
            <p className="text-[11px] text-gris-3">
              Si el email no existe en el sistema, se creará una cuenta nueva y se enviará email de bienvenida automáticamente.
            </p>
          </>
        )}
      </div>

      {/* SECCIÓN GOOGLE — solo admin puede editar */}
      <div className="rounded-md border-2 border-oro/30 bg-oro/5 p-3 space-y-3">
        <h4 className="font-display text-sm text-azul font-bold flex items-center gap-2">
          ⭐ Reputación de Google
        </h4>
        <Input
          label="Link Google Maps"
          value={form.link_google_maps}
          onChange={e => setForm({ ...form, link_google_maps: e.target.value })}
          placeholder="https://maps.app.goo.gl/..."
        />
        <Input
          label="Link Google My Business"
          value={form.link_google_business}
          onChange={e => setForm({ ...form, link_google_business: e.target.value })}
          placeholder="https://g.co/kgs/..."
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            label="Rating Google (0-5)"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={form.google_rating}
            onChange={e => setForm({ ...form, google_rating: e.target.value })}
            placeholder="4.7"
          />
          <Input
            label="Total reseñas Google"
            type="number"
            min="0"
            value={form.google_total_resenas}
            onChange={e => setForm({ ...form, google_total_resenas: e.target.value })}
            placeholder="132"
          />
        </div>
        <p className="text-[11px] text-gris-3">
          El técnico no puede editar estos valores — solo admin. Aparecen como prueba social en su perfil hasta que tenga reseñas propias.
        </p>
      </div>

      <div className="rounded-md bg-papel p-3 text-xs text-gris-4">
        <strong>📋 Info del técnico:</strong>
        <div>Email: {tecnico.email_publico || 'sin email'}</div>
        <div>Teléfono: {tecnico.telefono || 'sin teléfono'}</div>
        <div>Rating: {tecnico.rating_promedio.toFixed(1)}/5 ({tecnico.total_resenas} reseñas)</div>
        <div>Slug: {tecnico.slug}</div>
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-borde">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar cambios</Button>
      </div>
    </form>
  )
}
