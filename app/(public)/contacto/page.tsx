'use client'
import { useState } from 'react'
import { Mail, MessageCircle, MapPin, Send } from 'lucide-react'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export default function ContactoPage() {
  const push = useToast(s => s.push)
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const r = await fetch('/api/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (r.ok) {
      setEnviado(true)
      push('Mensaje enviado, te contactaremos pronto')
    } else {
      push('Error al enviar', 'error')
    }
  }

  return (
    <div className="container-st py-12 max-w-5xl">
      <h1 className="font-display text-4xl md:text-5xl text-azul font-extrabold mb-2">Contacto</h1>
      <p className="text-gris-4 mb-10">¿Tienes preguntas, sugerencias o necesitas ayuda? Escríbenos.</p>

      <div className="grid md:grid-cols-[1fr_320px] gap-10">
        <div className="card">
          {enviado ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl">✉️</div>
              <h3 className="font-display text-2xl text-azul">¡Mensaje enviado!</h3>
              <p className="text-gris-4">Te responderemos en menos de 24 horas.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <Input label="Nombre" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              <Input label="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Textarea label="Mensaje" required minLength={20} value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })} className="min-h-[140px]" />
              <Button type="submit" loading={loading}>
                <Send size={14} /> Enviar mensaje
              </Button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card">
            <Mail size={18} className="text-azul-mid mb-2" />
            <h4 className="font-semibold text-azul">Email</h4>
            <a href="mailto:hola@solotecnicos.cl" className="text-sm text-gris-4 hover:text-azul">hola@solotecnicos.cl</a>
          </div>
          <div className="card">
            <MessageCircle size={18} className="text-verde mb-2" />
            <h4 className="font-semibold text-azul">WhatsApp</h4>
            <p className="text-sm text-gris-4">Lun-Vie 9-18h</p>
          </div>
          <div className="card">
            <MapPin size={18} className="text-coral mb-2" />
            <h4 className="font-semibold text-azul">Ubicación</h4>
            <p className="text-sm text-gris-4">Santiago, Chile</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
