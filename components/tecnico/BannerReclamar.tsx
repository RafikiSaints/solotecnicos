'use client'
import { useState } from 'react'
import { ShieldCheck, X } from 'lucide-react'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'

export function BannerReclamar({ tecnicoId, tecnicoNombre }: { tecnicoId: string; tecnicoNombre: string }) {
  const [open, setOpen] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre_solicitante: '',
    email: '',
    telefono: '',
    mensaje: '',
  })
  const push = useToast(s => s.push)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/claim/solicitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tecnico_id: tecnicoId, ...form }),
    })
    setLoading(false)
    if (res.ok) {
      setEnviado(true)
      push('Solicitud enviada — te contactaremos en 24-48h')
    } else {
      const err = await res.json().catch(() => ({}))
      push(err.error || 'Error al enviar solicitud', 'error')
    }
  }

  return (
    <>
      {/* Banner */}
      <div className="container-st">
        <div className="rounded-xl border-2 border-oro/40 bg-gradient-to-r from-oro/10 to-oro/5 p-4 flex flex-wrap items-center gap-3 mt-6">
          <span className="text-2xl">🪪</span>
          <div className="flex-1 min-w-[220px]">
            <strong className="text-azul block">¿Este es tu negocio?</strong>
            <p className="text-sm text-gris-4">Reclama tu perfil para gestionarlo: actualizar info, responder reseñas, subir fotos y más.</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <ShieldCheck size={14} /> Reclamar mi perfil
          </Button>
        </div>
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setEnviado(false) }} title={enviado ? '✅ Solicitud enviada' : `Reclamar perfil: ${tecnicoNombre}`} size="md">
        {enviado ? (
          <div className="space-y-3 text-center py-4">
            <div className="text-5xl">📬</div>
            <p className="text-gris-4">
              Recibimos tu solicitud. Nuestro equipo verificará tus datos y te enviará un email con las instrucciones para acceder a tu cuenta en <strong>24-48 horas</strong>.
            </p>
            <p className="text-xs text-gris-3">
              Mientras tanto, tu perfil sigue visible en el directorio.
            </p>
            <Button variant="outline" onClick={() => { setOpen(false); setEnviado(false) }}>Cerrar</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="rounded-md bg-azul-mid/5 border border-azul-mid/30 p-3 text-sm text-gris-4">
              <strong className="text-azul">📋 ¿Cómo funciona?</strong>
              <ol className="text-xs mt-2 space-y-1 list-decimal pl-4">
                <li>Llenas este formulario con tus datos reales</li>
                <li>Nosotros verificamos que eres el dueño del negocio</li>
                <li>Te enviamos un email con link para acceder a tu cuenta</li>
                <li>Empiezas a gestionar tu perfil: fotos, servicios, reseñas, etc.</li>
              </ol>
            </div>

            <Input label="Tu nombre completo" required value={form.nombre_solicitante} onChange={e => setForm({ ...form, nombre_solicitante: e.target.value })} placeholder="Juan Pérez Soto" />
            <Input label="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contacto@miempresa.cl" helper="Donde te enviaremos el link de acceso" />
            <Input label="Teléfono" type="tel" required value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+56 9 1234 5678" helper="Lo verificamos con el que está en tu perfil actual" />
            <Textarea
              label="Mensaje (opcional)"
              value={form.mensaje}
              onChange={e => setForm({ ...form, mensaje: e.target.value })}
              placeholder="Cuéntanos cualquier dato que ayude a verificar que eres el dueño (ej: dirección exacta, años de experiencia, redes sociales, etc.)"
            />

            <div className="flex gap-2 justify-end pt-2 border-t border-borde">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={loading}>Enviar solicitud</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
