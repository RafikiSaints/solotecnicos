'use client'
import { useState } from 'react'
import { Share2, MessageCircle, Mail, Copy, Check, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

const MENSAJE_BASE = `Hola! Conozco un sitio donde puedes registrar tu negocio gratis y recibir más clientes: SoloTécnicos. Cualquier oficio puede sumarse — técnicos, gasfiteros, pintores, mecánicos, albañiles, jardineros, lo que sea. Es 100% gratis y sin compromiso.

Mira si te sirve: `

export function InvitarTecnico() {
  const [copiado, setCopiado] = useState(false)
  const push = useToast(s => s.push)

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/registro-tecnico`
    : 'https://solotecnicos.cl/registro-tecnico'

  const mensajeCompleto = MENSAJE_BASE + url

  async function copiarLink() {
    await navigator.clipboard.writeText(mensajeCompleto)
    setCopiado(true)
    push('Mensaje copiado al portapapeles')
    setTimeout(() => setCopiado(false), 2500)
  }

  async function compartirNativo() {
    // Web Share API en mobile
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Únete a SoloTécnicos',
          text: MENSAJE_BASE,
          url,
        })
      } catch {
        // Usuario canceló, ignorar
      }
    } else {
      copiarLink()
    }
  }

  return (
    <section className="container-st py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan/15 via-papel to-oro/10 border-2 border-cyan/20 p-8 md:p-12">
        <div className="absolute top-6 right-6 opacity-10">
          <Heart size={120} fill="currentColor" className="text-coral" />
        </div>

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coral/15 text-coral text-xs font-bold uppercase tracking-wide mb-4">
            <Heart size={12} fill="currentColor" /> Ayuda a alguien que conoces
          </div>

          <h2 className="font-display text-3xl md:text-5xl text-azul font-extrabold mb-4 leading-tight">
            ¿Conoces a un buen <span className="italic font-light">maestro</span> de confianza?
          </h2>

          <p className="text-lg text-gris-4 mb-3 max-w-2xl">
            Pintor, gasfiter, eléctrico, mecánico, jardinero, albañil, técnico de cualquier rubro…
            <strong className="text-azul"> cualquier oficio puede registrarse</strong>.
          </p>

          <p className="text-base text-gris-4 mb-6 max-w-2xl">
            Invítalo a SoloTécnicos: <strong>es gratis para siempre</strong>, sin trampa ni letra chica.
            Más clientes para él, mejores recomendaciones para todos.
          </p>

          {/* Caja con beneficios */}
          <div className="grid sm:grid-cols-3 gap-3 mb-7">
            <div className="bg-white/80 backdrop-blur rounded-xl p-3 border border-borde">
              <div className="text-2xl mb-1">🎁</div>
              <strong className="text-azul text-sm block">Gratis siempre</strong>
              <span className="text-xs text-gris-4">El plan base no tiene costo</span>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-3 border border-borde">
              <div className="text-2xl mb-1">⏱️</div>
              <strong className="text-azul text-sm block">Registro en 5 min</strong>
              <span className="text-xs text-gris-4">Sin trámites complicados</span>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-3 border border-borde">
              <div className="text-2xl mb-1">📈</div>
              <strong className="text-azul text-sm block">Más clientes</strong>
              <span className="text-xs text-gris-4">Aparece en búsquedas de su zona</span>
            </div>
          </div>

          {/* Botones de compartir */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gris-3 uppercase tracking-wide">Compártele por…</div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(mensajeCompleto)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-verde text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-verde/90 transition-colors"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>

              <a
                href={`mailto:?subject=${encodeURIComponent('Conozco un sitio que te puede servir')}&body=${encodeURIComponent(mensajeCompleto)}`}
                className="inline-flex items-center gap-2 bg-azul-mid text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-azul transition-colors"
              >
                <Mail size={16} /> Email
              </a>

              <button
                onClick={copiarLink}
                className="inline-flex items-center gap-2 bg-white text-azul border-2 border-borde px-4 py-2.5 rounded-md text-sm font-semibold hover:border-azul-mid transition-colors"
              >
                {copiado ? <><Check size={16} className="text-verde" /> ¡Copiado!</> : <><Copy size={16} /> Copiar mensaje</>}
              </button>

              {/* Web Share solo aparece en mobile */}
              <button
                onClick={compartirNativo}
                className="sm:hidden inline-flex items-center gap-2 bg-coral text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-coral/90 transition-colors"
              >
                <Share2 size={16} /> Más opciones
              </button>
            </div>
          </div>

          {/* Preview del mensaje */}
          <details className="mt-5 text-xs text-gris-4">
            <summary className="cursor-pointer text-gris-3 hover:text-azul font-medium">Ver mensaje que se va a enviar</summary>
            <div className="mt-2 p-3 bg-white/60 rounded-md border border-borde whitespace-pre-wrap">
              {mensajeCompleto}
            </div>
          </details>
        </div>
      </div>
    </section>
  )
}
