'use client'
import { Copy, Check, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { generarLinkPersonalizado } from '@/lib/utils'

export function CompartirLink({ slug, nombre }: { slug: string; nombre: string }) {
  const link = generarLinkPersonalizado(slug)
  const [copied, setCopied] = useState(false)

  function copiar() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card space-y-3">
      <h4 className="font-display text-lg text-azul">Compartir</h4>
      <div className="flex items-center gap-2 bg-papel rounded-md px-3 py-2 text-xs text-gris-4 break-all">
        {link}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={copiar} className="flex-1">
          {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar link</>}
        </Button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Mira a ${nombre} en SoloTécnicos: ${link}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            <MessageCircle size={14} /> WhatsApp
          </Button>
        </a>
      </div>
    </div>
  )
}
