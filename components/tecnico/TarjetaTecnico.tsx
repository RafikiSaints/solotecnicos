'use client'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, ShieldCheck, MessageCircle, Phone, Map as MapIcon } from 'lucide-react'
import { RatingDisplay } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { estaAbiertoAhora, truncar } from '@/lib/utils'
import { useComparadorStore } from '@/store/useComparadorStore'
import { useTecnicoSeleccionadoStore } from '@/store/useTecnicoSeleccionadoStore'
import type { TecnicoConRelaciones } from '@/types/database.types'

interface TarjetaTecnicoProps {
  tecnico: TecnicoConRelaciones
  servicios?: string[]
  compact?: boolean
  /** Mostrar botón "Ver en mapa" — solo aplica en la página /buscar donde
   *  efectivamente hay un mapa al lado. Default true. */
  mostrarBotonMapa?: boolean
}

export function TarjetaTecnico({ tecnico, servicios = [], compact = false, mostrarBotonMapa = true }: TarjetaTecnicoProps) {
  const { toggle, isSelected } = useComparadorStore()
  const selectMapa = useTecnicoSeleccionadoStore(s => s.select)
  const enfocadoId = useTecnicoSeleccionadoStore(s => s.selectedId)
  const selected = isSelected(tecnico.id)
  const enfocado = enfocadoId === tecnico.id
  const abierto = estaAbiertoAhora(tecnico.horarios)
  const isElite = tecnico.plan === 'elite'
  const isPro = tecnico.plan === 'pro'
  const tieneCoords = tecnico.lat != null && tecnico.lng != null
  const tieneResenasPropias = (tecnico.total_resenas || 0) > 0
  const tieneRatingGoogle = (tecnico.google_total_resenas || 0) > 0
  const tieneLinkGoogle = !!(tecnico.link_google_business || tecnico.link_google_maps)

  return (
    <article className={`relative rounded-lg overflow-hidden hover:shadow-card transition-shadow duration-200 group ${
      isElite
        ? 'bg-gradient-to-br from-oro/10 via-white to-white border-2 border-oro shadow-soft'
        : enfocado
          ? 'bg-white border-2 border-azul shadow-card ring-2 ring-azul/20'
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
        {/* Foto clickeable: prioriza logo, después portada, después inicial */}
        <Link href={`/tecnico/${tecnico.slug}`} className="relative h-28 sm:h-32 rounded-md overflow-hidden bg-papel block hover:opacity-90 transition-opacity">
          {tecnico.logo_url ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white p-2">
              <Image
                src={tecnico.logo_url}
                alt={tecnico.nombre_empresa}
                fill
                sizes="120px"
                className="object-contain p-2"
              />
            </div>
          ) : tecnico.foto_portada ? (
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

          {/* Reseñas Google adaptativas:
              - Sin reseñas propias + rating Google cargado → mini card con rating + cuenta
              - Con reseñas propias o sin rating pero con link → solo link "Ver Google" */}
          {!tieneResenasPropias && tieneRatingGoogle ? (
            <a
              href={tecnico.link_google_business || tecnico.link_google_maps || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-2 bg-papel hover:bg-papel/80 border border-borde rounded-md px-2.5 py-1 mb-2 transition-colors w-fit"
              title="Ver reseñas en Google"
            >
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-xs font-semibold text-azul">
                {(tecnico.google_rating || 0).toFixed(1)}
              </span>
              <span className="text-[11px] text-gris-3">
                ({tecnico.google_total_resenas} en Google) ↗
              </span>
            </a>
          ) : tieneLinkGoogle ? (
            <a
              href={tecnico.link_google_business || tecnico.link_google_maps || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs text-azul-mid hover:underline mb-2 w-fit"
              title="Ver reseñas en Google"
            >
              <svg width="12" height="12" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Ver reseñas de Google ↗
            </a>
          ) : null}

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
            {mostrarBotonMapa && tieneCoords && (
              <button
                type="button"
                onClick={() => selectMapa(tecnico.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  enfocado
                    ? 'bg-azul text-white border-azul'
                    : 'bg-white text-azul-mid border-borde hover:border-azul-mid hover:bg-azul-mid/5'
                }`}
                title="Ver ubicación en el mapa"
              >
                <MapIcon size={12} />
                {enfocado ? 'En mapa ✓' : 'Ver en mapa'}
              </button>
            )}
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
