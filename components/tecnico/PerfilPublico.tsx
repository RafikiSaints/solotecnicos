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
import { useCotizacionStore } from '@/store/useCotizacionStore'
import { RedesSociales } from './RedesSociales'
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
  esPropietario?: boolean
}

export function PerfilPublico({ tecnico, region, categorias, fotos, servicios, resenas, trabajos, certificaciones, esPropietario = false }: Props) {
  const setServicio = useCotizacionStore(s => s.setServicio)
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
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-white border-4 border-white shadow-card overflow-hidden flex items-center justify-center text-4xl text-azul font-display font-bold shrink-0 p-2">
              {tecnico.logo_url ? (
                <Image src={tecnico.logo_url} alt={tecnico.nombre_empresa} width={128} height={128} className="object-contain h-full w-full" />
              ) : portada ? (
                <Image src={portada.url} alt={tecnico.nombre_empresa} width={128} height={128} className="object-cover h-full w-full" />
              ) : (
                tecnico.nombre_empresa.charAt(0)
              )}
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
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {/* Rating SoloTécnicos (siempre se muestra) */}
                <div className="flex items-center gap-2">
                  <Star size={28} className="text-oro" fill="#F59E0B" />
                  <span className="font-display text-3xl font-bold !text-white">{(tecnico.rating_promedio || 0).toFixed(1)}</span>
                  <span className="text-white/70 text-sm">
                    / 5 ({tecnico.total_resenas} reseña{tecnico.total_resenas !== 1 ? 's' : ''} aquí)
                  </span>
                </div>

                {/* Rating de Google.
                    - Si el técnico NO tiene reseñas propias: card grande con
                      rating + estrellas + cantidad (prueba social inicial).
                    - Si YA tiene reseñas propias: chip compacto "Ver reseñas
                      de Google" (las reseñas propias ya transmiten confianza). */}
                {tecnico.google_total_resenas > 0 && tecnico.total_resenas === 0 ? (
                  // CARD GRANDE — solo cuando no hay reseñas propias
                  <a
                    href={tecnico.link_google_business || tecnico.link_google_maps || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 bg-white hover:bg-white/95 rounded-lg px-4 py-2.5 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    title="Ver reseñas en Google"
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" className="shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <div className="flex flex-col">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-gris-3 leading-none">
                        Reseñas de Google
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map(n => {
                            const filled = (tecnico.google_rating || 0) >= n
                            const half = !filled && (tecnico.google_rating || 0) >= n - 0.5
                            return (
                              <Star
                                key={n}
                                size={16}
                                fill={filled ? '#FBBC05' : half ? 'url(#half-google)' : 'none'}
                                className={filled || half ? 'text-[#FBBC05]' : 'text-gray-300'}
                                strokeWidth={1.5}
                              />
                            )
                          })}
                        </div>
                        <span className="font-display text-xl font-extrabold text-azul leading-none">
                          {(tecnico.google_rating || 0).toFixed(1)}
                        </span>
                      </div>
                      <div className="text-xs text-gris-4 mt-0.5">
                        {tecnico.google_total_resenas} reseña{tecnico.google_total_resenas !== 1 ? 's' : ''} en Google ↗
                      </div>
                    </div>
                  </a>
                ) : (tecnico.link_google_maps || tecnico.link_google_business) ? (
                  // CHIP COMPACTO — cuando ya hay reseñas propias o cuando hay
                  // link pero sin rating cargado todavía
                  <a
                    href={tecnico.link_google_business || tecnico.link_google_maps || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 bg-white hover:bg-white/95 rounded-lg px-3.5 py-2 transition-all shadow-md hover:shadow-lg"
                    title="Ver reseñas en Google"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-semibold text-azul">
                      Ver reseñas de Google
                    </span>
                    <span className="text-azul-mid text-xs group-hover:translate-x-0.5 transition-transform">↗</span>
                  </a>
                ) : null}
              </div>

              {/* Redes sociales — solo si están cargadas */}
              <div className="pt-1">
                <RedesSociales
                  facebook={tecnico.facebook_url}
                  instagram={tecnico.instagram_url}
                  youtube={tecnico.youtube_url}
                  tiktok={tecnico.tiktok_url}
                  variant="card"
                />
              </div>

              {/* SVG gradient para estrellas a la mitad */}
              <svg width="0" height="0" className="absolute">
                <defs>
                  <linearGradient id="half-google">
                    <stop offset="50%" stopColor="#FBBC05" />
                    <stop offset="50%" stopColor="transparent" stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>
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
                      <div className="text-sm flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <span className="text-xs text-gris-3">desde</span>{' '}
                          <span className="font-bold text-azul-mid text-base">{clpFormat(s.precio_desde)}</span>
                        </div>
                        <a
                          href="#cotizar"
                          onClick={() => setServicio(s.nombre)}
                          className="text-xs font-semibold text-rojo hover:text-rojo-hover"
                        >
                          Cotizar →
                        </a>
                      </div>
                    ) : (
                      <a
                        href="#cotizar"
                        onClick={() => setServicio(s.nombre)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-rojo hover:text-rojo-hover"
                      >
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
              esPropietario={esPropietario}
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
