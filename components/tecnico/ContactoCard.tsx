'use client'
import { Phone, MessageCircle, Mail, Globe, Lock, MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { puedeHacer, planVigente } from '@/lib/planes'
import Link from 'next/link'
import type { Tecnico } from '@/types/database.types'

export function ContactoCard({ tecnico }: { tecnico: Tecnico }) {
  const whatsappVisible = puedeHacer(tecnico, 'whatsapp_visible')
  const plan = planVigente(tecnico)
  const esPro = plan === 'pro' || plan === 'elite'

  function registrarContacto(tipo: 'telefono' | 'whatsapp' | 'contacto') {
    fetch('/api/visitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tecnico_id: tecnico.id, tipo }),
    }).catch(() => {})
  }

  return (
    <div className="card space-y-3">
      <h4 className="font-display text-lg text-azul font-bold">Contacto</h4>

      {tecnico.telefono && (
        <a
          href={`tel:${tecnico.telefono}`}
          onClick={() => registrarContacto('telefono')}
          className="flex items-center gap-3 p-3 rounded-md border-2 border-borde hover:border-azul-mid transition-colors"
        >
          <Phone size={18} className="text-azul-mid" />
          <div className="flex-1">
            <div className="text-xs text-gris-3">Teléfono</div>
            <div className="font-semibold text-azul">{tecnico.telefono}</div>
          </div>
        </a>
      )}

      {/* WhatsApp: visible para TODOS los planes con mensaje predeterminado que promociona SoloTécnicos */}
      {tecnico.whatsapp && (() => {
        const mensaje = `¡Hola! Te encontré en SoloTécnicos.cl 👋\n\nMe interesa solicitar tus servicios. ¿Tienes disponibilidad para coordinar una visita o cotización?`
        const waLink = `https://wa.me/${tecnico.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`
        return (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => registrarContacto('whatsapp')}
            className="flex items-center gap-3 p-3 rounded-md border-2 border-verde/30 bg-verde/5 hover:bg-verde/10 transition-colors"
          >
            <MessageCircle size={18} className="text-verde" />
            <div className="flex-1">
              <div className="text-xs text-verde font-semibold">WhatsApp</div>
              <div className="font-semibold text-azul">{tecnico.whatsapp}</div>
            </div>
          </a>
        )
      })()}

      {/* Si no hay WhatsApp y técnico es gratis, sugerir agregar uno */}
      {!tecnico.whatsapp && tecnico.telefono && (
        <a
          href={`https://wa.me/${tecnico.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola! Te encontré en SoloTécnicos.cl 👋 Me interesa solicitar tus servicios. ¿Tienes disponibilidad?`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => registrarContacto('whatsapp')}
          className="flex items-center gap-3 p-3 rounded-md border-2 border-verde/30 bg-verde/5 hover:bg-verde/10 transition-colors"
        >
          <MessageCircle size={18} className="text-verde" />
          <div className="flex-1">
            <div className="text-xs text-verde font-semibold">Enviar WhatsApp al teléfono</div>
            <div className="font-medium text-azul text-sm">{tecnico.telefono}</div>
          </div>
        </a>
      )}

      {tecnico.email_publico && (
        <a
          href={`mailto:${tecnico.email_publico}`}
          onClick={() => registrarContacto('contacto')}
          className="flex items-center gap-3 p-3 rounded-md border-2 border-borde hover:border-azul-mid"
        >
          <Mail size={18} className="text-azul-mid" />
          <div className="flex-1">
            <div className="text-xs text-gris-3">Email</div>
            <div className="font-medium text-azul text-sm break-all">{tecnico.email_publico}</div>
          </div>
        </a>
      )}

      {tecnico.sitio_web && (
        <a
          href={tecnico.sitio_web.startsWith('http') ? tecnico.sitio_web : `https://${tecnico.sitio_web}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-md border-2 border-borde hover:border-azul-mid"
        >
          <Globe size={18} className="text-azul-mid" />
          <div className="flex-1">
            <div className="text-xs text-gris-3">Sitio web</div>
            <div className="font-medium text-azul text-sm">{tecnico.sitio_web}</div>
          </div>
        </a>
      )}

      {/* Google Maps (solo PRO/Elite) */}
      {esPro && tecnico.link_google_maps && (
        <a
          href={tecnico.link_google_maps}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-md border-2 border-cyan/30 bg-cyan/5 hover:bg-cyan/10"
        >
          <MapPin size={18} className="text-cyan" />
          <div className="flex-1">
            <div className="text-xs text-cyan font-semibold">Cómo llegar</div>
            <div className="font-medium text-azul text-sm">Ver en Google Maps</div>
          </div>
        </a>
      )}

      {/* Google My Business (solo PRO/Elite) */}
      {esPro && tecnico.link_google_business && (
        <a
          href={tecnico.link_google_business}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-md border-2 border-oro/30 bg-oro/5 hover:bg-oro/10"
        >
          <Star size={18} className="text-oro" />
          <div className="flex-1">
            <div className="text-xs text-oro font-semibold">Reseñas Google</div>
            <div className="font-medium text-azul text-sm">Ver perfil en Google</div>
          </div>
        </a>
      )}

      <Link href="#cotizar" className="block">
        <Button className="w-full">Solicitar cotización</Button>
      </Link>
    </div>
  )
}
