'use client'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, ShieldCheck, MessageCircle, Phone } from 'lucide-react'
import { RatingDisplay } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { estaAbiertoAhora, truncar } from '@/lib/utils'
import { useComparadorStore } from '@/store/useComparadorStore'
import type { TecnicoConRelaciones } from '@/types/database.types'

interface TarjetaTecnicoProps {
  tecnico: TecnicoConRelaciones
  servicios?: string[]
  compact?: boolean
}

export function TarjetaTecnico({ tecnico, servicios = [], compact = false }: TarjetaTecnicoProps) {
  const { toggle, isSelected } = useComparadorStore()
  const selected = isSelected(tecnico.id)
  const abierto = estaAbiertoAhora(tecnico.horarios)
  const isElite = tecnico.plan === 'elite'
  const isPro = tecnico.plan === 'pro'

  return (
    <article className={`relative rounded-lg overflow-hidden hover:shadow-card transition-shadow duration-200 group ${
      isElite
        ? 'bg-gradient-to-br from-oro/10 via-white to-white border-2 border-oro shadow-soft'
        : 'bg-white border border-borde'
    }`}>
      {/* Banner Elite destacado */}
      {isElite && (
        <div className="bg-gradient-to-r from-oro to-coral text-white text-xs font-bold px-4 py-1.5 flex items-center gap-2">
          <span>👑</span>
          <span className="tracking-wider">RECOMENDADO ELITE</span>
        </div>
      )}
      {/* Ribbon PRO (más sutil) */}
      {isPro && (
        <div className="absolute top-0 right-0 z-10 bg-azul text-white text-[10px] font-bold px-3 py-1 tracking-wide rounded-bl-lg">
          PRO
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 p-4">
        {/* Foto clickeable */}
        <Link href={`/tecnico/${tecnico.slug}`} className="relative h-28 sm:h-32 rounded-md overflow-hidden bg-papel block hover:opacity-90 transition-opacity">
          {tecnico.foto_portada ? (
            <Image
              src={tecnico.foto_portada}
              alt={tecnico.nombre_empresa}
              fill
              sizes="120px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-3xl text-gris-3 font-display font-bold">
              {tecnico.nombre_empresa.charAt(0)}
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <Link href={`/tecnico/${tecnico.slug}`}>
                <h3 className="font-display font-bold text-lg text-azul hover:text-azul-mid transition-colors leading-tight">
                  {tecnico.nombre_empresa}
                </h3>
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-gris-3 mt-0.5">
                <MapPin size={12} />
                {tecnico.comuna}{tecnico.region_nombre ? `, ${tecnico.region_nombre}` : ''}
              </div>
            </div>
            <RatingDisplay value={tecnico.rating_promedio || 0} totalResenas={tecnico.total_resenas} />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tecnico.verificado && <Badge tone="verde"><ShieldCheck size={11} />Verificado</Badge>}
            {tecnico.atiende_24h && <Badge tone="rojo">24/7</Badge>}
            {abierto && <Badge tone="verde"><Clock size={11} />Abierto ahora</Badge>}
            {tecnico.badge_respuesta_rapida && <Badge tone="azul">Responde rápido</Badge>}
            {tecnico.atiende_domicilio && <Badge tone="gris">A domicilio</Badge>}
          </div>

          {!compact && tecnico.descripcion_corta && (
            <p className="text-sm text-gris-4 leading-snug mb-2 line-clamp-2">
              {truncar(tecnico.descripcion_corta, 140)}
            </p>
          )}

          {/* Chips servicios */}
          {servicios.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {servicios.slice(0, 4).map(s => (
                <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-papel text-gris-4">{s}</span>
              ))}
              {servicios.length > 4 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-papel text-gris-3">+{servicios.length - 4}</span>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <Link href={`/tecnico/${tecnico.slug}#cotizar`}>
              <Button size="sm">
                <MessageCircle size={14} />Contactar
              </Button>
            </Link>
            <Link href={`/tecnico/${tecnico.slug}`}>
              <Button variant="outline" size="sm">Ver perfil</Button>
            </Link>
            <label className="ml-auto flex items-center gap-1.5 text-xs text-gris-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggle(tecnico)}
                className="rounded border-borde text-azul focus:ring-azul/20"
              />
              Comparar
            </label>
          </div>
        </div>
      </div>
    </article>
  )
}
