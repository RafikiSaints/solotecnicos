'use client'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { MapPin, ShieldCheck, Sparkles, Star, Phone, MessageCircle } from 'lucide-react'
import { RatingDisplay } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ContactoCard } from './ContactoCard'
import { HorarioDisplay } from './HorarioDisplay'
import { GaleriaFotos } from './GaleriaFotos'
import { PortafolioTrabajos } from './PortafolioTrabajos'
import { CertificacionesBadges } from './CertificacionesBadges'
import { CompartirLink } from './CompartirLink'
import { BannerReclamar } from './BannerReclamar'
import { FormularioCotizacion } from './FormularioCotizacion'
import { SistemaResenas } from './SistemaResenas'
import { clpFormat, youtubeEmbedUrl } from '@/lib/utils'
import { limiteNumerico, puedeHacer } from '@/lib/planes'
import { useEffect } from 'react'
import type {
  Tecnico, Region, Categoria, Foto, Servicio, Resena, Trabajo, Certificacion,
} from '@/types/database.types'

const MapaPin = dynamic(() => import('@/components/directorio/MapaPin').then(m => m.MapaPin), { ssr: false })

interface Props {
  tecnico: Tecnico
  region: Region | null
  categorias: Categoria[]
  fotos: Foto[]
  servicios: Servicio[]
  resenas: Resena[]
  trabajos: Trabajo[]
  certificaciones: Certificacion[]
}

export function PerfilPublico({ tecnico, region, categorias, fotos, servicios, resenas, trabajos, certificaciones }: Props) {
  // Limitar lo visible según el plan vigente. Las extras se quedan en BD pero no se muestran al público
  // (cuando el técnico renueve el plan, se vuelven a mostrar automáticamente).
  const limFotos = limiteNumerico(tecnico, 'fotos')
  const limTrabajos = limiteNumerico(tecnico, 'trabajos_portafolio')
  const limServicios = limiteNumerico(tecnico, 'servicios')
  const fotosVisibles = fotos.slice(0, limFotos)
  const trabajosVisibles = trabajos.slice(0, limTrabajos)
  const serviciosVisibles = servicios.slice(0, limServicios)

  const portada = fotosVisibles.find(f => f.es_portada) || fotosVisibles[0]

  useEffect(() => {
    fetch('/api/visitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tecnico_id: tecnico.id, tipo: 'perfil' }),
    }).catch(() => {})
  }, [tecnico.id])

  return (
    <>
      {/* HERO */}
      <section className="relative bg-azul hero-clip overflow-hidden">
        {portada && (
          <Image
            src={portada.url}
            alt=""
            fill
            priority
            className="object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-azul/60 via-azul/70 to-azul" />
        <div className="container-st relative py-14 md:py-20">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-papel border-4 border-white shadow-card overflow-hidden flex items-center justify-center text-4xl text-azul font-display font-bold">
              {portada ? <Image src={portada.url} alt={tecnico.nombre_empresa} width={128} height={128} className="object-cover h-full w-full" /> : tecnico.nombre_empresa.charAt(0)}
            </div>
            <div className="flex-1 text-white space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {categorias.map(c => (
                  <span key={c.id} className="px-2.5 py-0.5 rounded-full bg-white/15 text-xs text-white">
                    {c.icono} {c.nombre}
                  </span>
                ))}
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight !text-white">{tecnico.nombre_empresa}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} />
                  {tecnico.comuna}{region ? `, ${region.nombre}` : ''}
                </span>
                {tecnico.verificado && (
                  <span className="inline-flex items-center gap-1 text-verde">
                    <ShieldCheck size={14} /> Verificado
                  </span>
                )}
                {tecnico.plan !== 'gratis' && (
                  <span className="inline-flex items-center gap-1 text-oro">
                    <Sparkles size={14} /> {tecnico.plan.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Star size={28} className="text-oro" fill="#C89A2E" />
                  <span className="font-display text-3xl font-bold">{(tecnico.rating_promedio || 0).toFixed(1)}</span>
                  <span className="text-white/70 text-sm">/ 5 ({tecnico.total_resenas} reseñas)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner "reclamar perfil" si no tiene dueño */}
      {!tecnico.user_id && (
        <BannerReclamar tecnicoId={tecnico.id} tecnicoNombre={tecnico.nombre_empresa} />
      )}

      {/* MOBILE STICKY ACTIONS */}
      <div className="md:hidden sticky top-[57px] z-30 bg-white border-b border-borde">
        <div className="container-st py-2 grid grid-cols-3 gap-2">
          {tecnico.telefono && (
            <a href={`tel:${tecnico.telefono}`}>
              <Button size="sm" variant="outline" className="w-full"><Phone size={14} />Llamar</Button>
            </a>
          )}
          {tecnico.whatsapp && (
            <a href={`https://wa.me/${tecnico.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="w-full"><MessageCircle size={14} />WhatsApp</Button>
            </a>
          )}
          <a href="#cotizar">
            <Button size="sm" className="w-full">Cotizar</Button>
          </a>
        </div>
      </div>

      {/* CONTENIDO */}
      <section className="container-st py-10 grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-10">
          {/* Descripción */}
          {tecnico.descripcion && (
            <div>
              <h2 className="font-display text-2xl text-azul mb-3">Sobre {tecnico.nombre_empresa}</h2>
              <p className="text-gris-4 leading-relaxed whitespace-pre-wrap">{tecnico.descripcion}</p>
            </div>
          )}

          {/* Video promocional (solo Elite con video) */}
          {puedeHacer(tecnico, 'video') && tecnico.video_url && youtubeEmbedUrl(tecnico.video_url) && (
            <div>
              <h2 className="font-display text-2xl text-azul mb-3">Conoce nuestro trabajo</h2>
              <div className="relative aspect-video rounded-lg overflow-hidden border border-borde bg-papel">
                <iframe
                  src={youtubeEmbedUrl(tecnico.video_url) || ''}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video promocional"
                />
              </div>
            </div>
          )}

          {/* Servicios */}
          {serviciosVisibles.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-azul mb-3">Servicios</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {serviciosVisibles.map(s => (
                  <div key={s.id} className="card">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-azul">{s.nombre}</h4>
                        {s.descripcion && <p className="text-sm text-gris-4 mt-1">{s.descripcion}</p>}
                      </div>
                    </div>
                    {s.precio_desde ? (
                      <div className="text-sm">
                        <span className="text-xs text-gris-3">desde</span>{' '}
                        <span className="font-bold text-azul-mid text-base">{clpFormat(s.precio_desde)}</span>
                      </div>
                    ) : (
                      <a href="#cotizar" className="inline-flex items-center gap-1 text-sm font-semibold text-rojo hover:text-rojo-hover">
                        💬 Solicitar cotización →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Galería */}
          {fotosVisibles.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-azul mb-3">Galería</h2>
              <GaleriaFotos fotos={fotosVisibles} />
            </div>
          )}

          {/* Portafolio */}
          {trabajosVisibles.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-azul mb-3">Antes y después</h2>
              <PortafolioTrabajos trabajos={trabajosVisibles} />
            </div>
          )}

          {/* Certificaciones */}
          {certificaciones.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-azul mb-3">Certificaciones</h2>
              <CertificacionesBadges certificaciones={certificaciones} />
            </div>
          )}

          {/* Reseñas */}
          <div>
            <h2 className="font-display text-2xl text-azul mb-1">Reseñas verificadas</h2>
            <p className="text-sm text-gris-3 mb-4">Evaluación en 7 dimensiones por nuestros usuarios</p>
            <SistemaResenas
              tecnicoId={tecnico.id}
              resenas={resenas}
              ratingsTecnico={{
                rating_promedio: tecnico.rating_promedio,
                rating_atencion: tecnico.rating_atencion,
                rating_calidad: tecnico.rating_calidad,
                rating_respuesta: tecnico.rating_respuesta,
                rating_resolucion: tecnico.rating_resolucion,
                rating_rapidez: tecnico.rating_rapidez,
                rating_precio: tecnico.rating_precio,
                rating_garantia: tecnico.rating_garantia,
              }}
            />
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <ContactoCard tecnico={tecnico} />
          <FormularioCotizacion tecnicoId={tecnico.id} />
          <HorarioDisplay horarios={tecnico.horarios} atiende24h={tecnico.atiende_24h} />
          {tecnico.lat && tecnico.lng && (
            <div className="card p-0 overflow-hidden">
              <div className="p-5 pb-2">
                <h4 className="font-display text-lg text-azul">Ubicación</h4>
                <p className="text-sm text-gris-4">{tecnico.direccion || tecnico.comuna}</p>
              </div>
              <MapaPin lat={tecnico.lat} lng={tecnico.lng} nombre={tecnico.nombre_empresa} />
            </div>
          )}
          {tecnico.comunas_cobertura && tecnico.comunas_cobertura.length > 0 && (
            <div className="card">
              <h4 className="font-display text-lg text-azul mb-2 font-bold">Zonas de cobertura</h4>
              <div className="flex flex-wrap gap-1.5">
                {tecnico.comunas_cobertura.map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-full bg-papel text-gris-4 text-xs">{c}</span>
                ))}
              </div>
            </div>
          )}
          {tecnico.sucursales_texto && (
            <div className="card">
              <h4 className="font-display text-lg text-azul mb-2 font-bold flex items-center gap-2">
                <span className="text-cyan">🏢</span> Puntos de atención
              </h4>
              <p className="text-sm text-gris-4 whitespace-pre-wrap">{tecnico.sucursales_texto}</p>
            </div>
          )}
          {tecnico.etiquetas && tecnico.etiquetas.length > 0 && (
            <div className="card">
              <h4 className="font-display text-lg text-azul mb-2 font-bold">Especialidades</h4>
              <div className="flex flex-wrap gap-1.5">
                {tecnico.etiquetas.map(e => (
                  <span key={e} className="inline-flex items-center px-2.5 py-1 rounded-full bg-cyan/10 text-cyan text-xs font-medium border border-cyan/20">
                    #{e}
                  </span>
                ))}
              </div>
            </div>
          )}
          {tecnico.slug && <CompartirLink slug={tecnico.slug} nombre={tecnico.nombre_empresa} />}
        </aside>
      </section>
    </>
  )
}
