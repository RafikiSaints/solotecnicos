'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

export function CertificacionesModeracion({ certs: ini }: { certs: any[] }) {
  const [certs, setCerts] = useState(ini)
  const supabase = createClient()
  const push = useToast(s => s.push)

  async function aprobar(id: string) {
    await supabase.from('tecnico_certificaciones').update({ estado: 'aprobada', aprobada_en: new Date().toISOString() }).eq('id', id)
    setCerts(certs.map(c => c.id === id ? { ...c, estado: 'aprobada' } : c))
    push('Certificación aprobada')
  }
  async function rechazar(id: string) {
    if (!confirm('¿Rechazar?')) return
    await supabase.from('tecnico_certificaciones').update({ estado: 'rechazada' }).eq('id', id)
    setCerts(certs.map(c => c.id === id ? { ...c, estado: 'rechazada' } : c))
    push('Rechazada')
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {certs.map(c => (
        <div key={c.id} className="card">
          <div className="flex justify-between items-start mb-2">
            <div>
              <strong className="text-azul">{c.nombre}</strong>
              {c.entidad_emisora && <div className="text-xs text-gris-3">{c.entidad_emisora}</div>}
              {c.tecnicos && (
                <Link href={`/tecnico/${c.tecnicos.slug}`} className="text-xs text-azul hover:underline">
                  {c.tecnicos.nombre_empresa}
                </Link>
              )}
            </div>
            <Badge tone={c.estado === 'aprobada' ? 'verde' : c.estado === 'rechazada' ? 'rojo' : 'oro'}>{c.estado}</Badge>
          </div>
          {c.documento_url && (
            <a href={c.documento_url} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-papel rounded overflow-hidden mb-2">
              <Image src={c.documento_url} alt="" fill className="object-contain" />
            </a>
          )}
          {c.estado === 'pendiente' && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => aprobar(c.id)}>Aprobar</Button>
              <Button size="sm" variant="ghost" onClick={() => rechazar(c.id)}>Rechazar</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
