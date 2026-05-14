'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { InputChips } from '@/components/dashboard/InputChips'
import { HorarioPicker, HORARIOS_VACIOS } from '@/components/dashboard/HorarioPicker'
import type { Region, Categoria, Horarios } from '@/types/database.types'

export function CrearTecnicoForm({ regiones, categorias }: { regiones: Region[]; categorias: Categoria[] }) {
  const router = useRouter()
  const push = useToast(s => s.push)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre_empresa: '',
    nombre_contacto: '',
    descripcion_corta: '',
    telefono: '',
    email_publico: '',
    sitio_web: '',
    region_id: '',
    comuna: '',
    direccion: '',
    categoria_ids: [] as number[],
    etiquetas: [] as string[],
    comunas_cobertura: [] as string[],
    email_propietario: '', // opcional: vincula a usuario existente o crea cuenta nueva
    // Datos importados de Google (opcionales pero ÚTILES al cargar técnicos sin reseñas propias)
    link_google_maps: '',
    link_google_business: '',
    google_rating: '',
    google_total_resenas: '',
    whatsapp: '',
    // Horario — opcional; si todo queda en false, no se muestra en el perfil público
    atiende_24h: false,
    atiende_domicilio: false,
    horarios: HORARIOS_VACIOS as Horarios,
  })

  function toggleCategoria(id: number) {
    if (form.categoria_ids.includes(id)) {
      setForm({ ...form, categoria_ids: form.categoria_ids.filter(c => c !== id) })
    } else if (form.categoria_ids.length < 5) {
      setForm({ ...form, categoria_ids: [...form.categoria_ids, id] })
    } else {
      push('Máximo 5 categorías', 'error')
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre_empresa || !form.region_id || form.categoria_ids.length === 0) {
      push('Nombre, región y al menos 1 categoría son obligatorios', 'error')
      return
    }
    setLoading(true)
    // Crear vía endpoint con pg directo (bypass schema cache de PostgREST)
    const res = await fetch('/api/admin/tecnico/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_empresa: form.nombre_empresa,
        nombre_contacto: form.nombre_contacto,
        descripcion_corta: form.descripcion_corta,
        telefono: form.telefono,
        whatsapp: form.whatsapp,
        email_publico: form.email_publico,
        sitio_web: form.sitio_web,
        region_id: Number(form.region_id),
        comuna: form.comuna,
        direccion: form.direccion,
        etiquetas: form.etiquetas,
        comunas_cobertura: form.comunas_cobertura,
        link_google_maps: form.link_google_maps,
        link_google_business: form.link_google_business,
        google_rating: form.google_rating,
        google_total_resenas: form.google_total_resenas,
        categoria_ids: form.categoria_ids,
        atiende_24h: form.atiende_24h,
        atiende_domicilio: form.atiende_domicilio,
        horarios: form.horarios,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error desconocido' }))
      push(`Error: ${err.error}`, 'error')
      setLoading(false)
      return
    }
    const { id: tecnicoId } = await res.json()

    // Si dio email del propietario, vincular cuenta
    if (form.email_propietario.trim()) {
      const vincRes = await fetch('/api/admin/vincular-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tecnico_id: tecnicoId, email: form.email_propietario.trim() }),
      })
      if (!vincRes.ok) {
        const err = await vincRes.json().catch(() => ({}))
        push(`Técnico creado pero falló vincular usuario: ${err.error}`, 'error')
        router.push('/admin/tecnicos')
        return
      }
      push('Técnico creado y vinculado al usuario ✓')
    } else {
      push('Técnico creado — sin propietario, lo podrá reclamar después')
    }

    setLoading(false)
    router.push('/admin/tecnicos')
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="card space-y-4">
        <h3 className="font-display text-lg text-azul font-bold">Información básica</h3>
        <Input label="Nombre de la empresa *" required value={form.nombre_empresa} onChange={e => setForm({ ...form, nombre_empresa: e.target.value })} placeholder="ClimaTech Express" />
        <Input label="Nombre del contacto" value={form.nombre_contacto} onChange={e => setForm({ ...form, nombre_contacto: e.target.value })} placeholder="Juan Pérez" />
        <Textarea label="Descripción corta (máx 160)" maxLength={160} value={form.descripcion_corta} onChange={e => setForm({ ...form, descripcion_corta: e.target.value })} placeholder="Especialistas en climatización con 15 años de experiencia..." />
      </div>

      <div className="card space-y-4">
        <h3 className="font-display text-lg text-azul font-bold">Contacto</h3>
        <Input label="Teléfono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+56 9 1234 5678" />
        <Input label="WhatsApp" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="+56 9 1234 5678" helper="Si lo dejas vacío, se usa el teléfono general como WhatsApp" />
        <Input label="Email público" type="email" value={form.email_publico} onChange={e => setForm({ ...form, email_publico: e.target.value })} placeholder="contacto@empresa.cl" helper="Importante: si el técnico reclama el perfil después, este email se usará para verificar." />
        <Input label="Sitio web" value={form.sitio_web} onChange={e => setForm({ ...form, sitio_web: e.target.value })} placeholder="https://..." />
      </div>

      <div className="card space-y-3">
        <h3 className="font-display text-lg text-azul font-bold">⭐ Reputación de Google (recomendado)</h3>
        <p className="text-xs text-gris-3 -mt-2">
          Si el técnico ya tiene reseñas en Google, ingrésalas aquí. Aparecerán en su perfil como prueba social mientras no tenga reseñas propias en SoloTécnicos.
        </p>
        <Input
          label="Link Google Maps"
          value={form.link_google_maps}
          onChange={e => setForm({ ...form, link_google_maps: e.target.value })}
          placeholder="https://maps.app.goo.gl/..."
          helper="Busca el negocio en Google Maps → Compartir → Copiar link"
        />
        <Input
          label="Link Google My Business (opcional)"
          value={form.link_google_business}
          onChange={e => setForm({ ...form, link_google_business: e.target.value })}
          placeholder="https://g.co/kgs/..."
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            label="Rating en Google (0-5)"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={form.google_rating}
            onChange={e => setForm({ ...form, google_rating: e.target.value })}
            placeholder="Ej: 4.7"
          />
          <Input
            label="Cantidad de reseñas en Google"
            type="number"
            min="0"
            value={form.google_total_resenas}
            onChange={e => setForm({ ...form, google_total_resenas: e.target.value })}
            placeholder="Ej: 132"
          />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-display text-lg text-azul font-bold">Ubicación</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Región *" required value={form.region_id} onChange={e => setForm({ ...form, region_id: e.target.value })}>
            <option value="">Selecciona...</option>
            {regiones.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </Select>
          <Input label="Comuna" value={form.comuna} onChange={e => setForm({ ...form, comuna: e.target.value })} placeholder="Las Condes" />
        </div>
        <Input label="Dirección" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Av. Apoquindo 1234" />
      </div>

      <div className="card space-y-3">
        <h3 className="font-display text-lg text-azul font-bold">Categorías * ({form.categoria_ids.length}/5)</h3>
        <div className="flex flex-wrap gap-2">
          {categorias.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCategoria(c.id)}
              className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${form.categoria_ids.includes(c.id) ? 'border-azul-mid bg-azul-mid text-white' : 'border-borde bg-white text-gris-4 hover:border-azul-mid'}`}
            >
              {c.icono} {c.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        <h3 className="font-display text-lg text-azul font-bold">Etiquetas y cobertura</h3>
        <InputChips
          label="Etiquetas de servicio (palabras clave)"
          values={form.etiquetas}
          onChange={v => setForm({ ...form, etiquetas: v })}
          placeholder="Ej: Samsung, lavadoras, fugas gas, iPhone..."
          helper="Mejoran las búsquedas. Separa con Enter o coma. Sin límite estricto en carga manual."
        />
        <InputChips
          label="Comunas de cobertura (servicio a domicilio)"
          values={form.comunas_cobertura}
          onChange={v => setForm({ ...form, comunas_cobertura: v })}
          placeholder="Las Condes, Vitacura, Providencia..."
        />
      </div>

      <div className="card space-y-3">
        <h3 className="font-display text-lg text-azul font-bold">🕒 Horario de atención (opcional)</h3>
        <p className="text-xs text-gris-3 -mt-2">
          Si no defines horario, no se mostrará en el perfil — el técnico lo podrá agregar cuando reclame su cuenta.
        </p>
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

      <div className="card space-y-3">
        <h3 className="font-display text-lg text-azul font-bold">Propietario de la cuenta (opcional)</h3>
        <p className="text-xs text-gris-3 -mt-2">
          Si quieres asignar este perfil a un usuario específico (ej: cliente existente que quiere ser técnico, o crear cuenta nueva), pon su email aquí. Si lo dejas vacío, el perfil queda sin dueño y cualquier técnico podrá reclamarlo después.
        </p>
        <Input
          label="Email del propietario"
          type="email"
          value={form.email_propietario}
          onChange={e => setForm({ ...form, email_propietario: e.target.value })}
          placeholder="contacto@empresa.cl (opcional)"
          helper="Si el email no existe, se creará una cuenta nueva automáticamente y se enviará email de bienvenida."
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" loading={loading}>Crear técnico</Button>
      </div>
    </form>
  )
}
