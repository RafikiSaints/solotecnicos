// Tipos generados manualmente. En producción usar:
//   supabase gen types typescript --project-id YOUR_ID > types/database.types.ts

export type PlanTipo = 'gratis' | 'pro' | 'elite'
export type PagoEstado = 'activo' | 'vencido' | 'cancelado' | 'pendiente' | 'gracia'
export type PagoTipo = 'mensual' | 'anual' | 'unico'
export type CotizacionEstado = 'pendiente' | 'vista' | 'respondida' | 'contactada' | 'cerrada'
export type MensajeEstado = 'no_leido' | 'leido'
export type UrgenciaTipo = 'normal' | 'urgente' | '24h'
export type CertEstado = 'pendiente' | 'aprobada' | 'rechazada'

export interface HorarioDia {
  abre: string | null
  cierra: string | null
  abierto: boolean
}
export interface Horarios {
  lunes: HorarioDia
  martes: HorarioDia
  miercoles: HorarioDia
  jueves: HorarioDia
  viernes: HorarioDia
  sabado: HorarioDia
  domingo: HorarioDia
}

export interface Region {
  id: number
  nombre: string
  slug: string
  orden: number
}

export interface Categoria {
  id: number
  nombre: string
  slug: string
  icono: string | null
  descripcion: string | null
  orden: number
}

export interface Tecnico {
  id: string
  user_id: string | null
  slug: string | null
  nombre_empresa: string
  nombre_contacto: string | null
  rut: string | null
  descripcion: string | null
  descripcion_corta: string | null
  region_id: number | null
  comuna: string | null
  direccion: string | null
  lat: number | null
  lng: number | null
  comunas_cobertura: string[] | null
  telefono: string | null
  whatsapp: string | null
  email_publico: string | null
  sitio_web: string | null
  link_personalizado: string | null
  link_google_maps: string | null
  link_google_business: string | null
  etiquetas: string[] | null
  sucursales_texto: string | null
  plan: PlanTipo
  plan_vence_en: string | null
  verificado: boolean
  activo: boolean
  destacado: boolean
  rating_promedio: number
  rating_atencion: number
  rating_calidad: number
  rating_respuesta: number
  rating_resolucion: number
  rating_rapidez: number
  rating_precio: number
  rating_garantia: number
  total_resenas: number
  total_visitas: number
  total_contactos: number
  total_cotizaciones: number
  badge_respuesta_rapida: boolean
  atiende_24h: boolean
  atiende_domicilio: boolean
  horarios: Horarios
  ultima_alerta_demanda: string | null
  created_at: string
  updated_at: string
}

export interface TecnicoConRelaciones extends Tecnico {
  region?: Region
  region_nombre?: string
  categorias?: Categoria[]
  categorias_nombres?: string[]
  categorias_slugs?: string[]
  foto_portada?: string | null
  score?: number
}

export interface Servicio {
  id: string
  tecnico_id: string
  nombre: string
  descripcion: string | null
  precio_desde: number | null
  orden: number
}

export interface Foto {
  id: string
  tecnico_id: string
  url: string
  storage_path: string | null
  caption: string | null
  es_portada: boolean
  orden: number
  created_at: string
}

export interface Certificacion {
  id: string
  tecnico_id: string
  nombre: string
  entidad_emisora: string | null
  documento_url: string | null
  estado: CertEstado
  aprobada_por: string | null
  aprobada_en: string | null
  created_at: string
}

export interface Trabajo {
  id: string
  tecnico_id: string
  titulo: string
  descripcion: string | null
  foto_antes: string | null
  foto_despues: string | null
  categoria_id: number | null
  fecha: string | null
  orden: number
  created_at: string
}

export interface Resena {
  id: string
  tecnico_id: string
  autor_nombre: string
  autor_email: string | null
  autor_user_id: string | null
  autor_verificado: boolean
  rating_atencion: number
  rating_calidad: number
  rating_respuesta: number
  rating_resolucion: number
  rating_rapidez: number
  rating_precio: number
  rating_garantia: number
  rating_promedio: number
  titulo: string | null
  comentario: string
  respuesta_tecnico: string | null
  respondido_en: string | null
  aprobada: boolean
  reportada: boolean
  created_at: string
}

export interface Cotizacion {
  id: string
  tecnico_id: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string | null
  cliente_user_id: string | null
  categoria_id: number | null
  descripcion: string
  fotos_urls: string[] | null
  urgencia: UrgenciaTipo
  comuna_servicio: string | null
  estado: CotizacionEstado
  respuesta: string | null
  precio_cotizado: number | null
  notas_internas: string | null
  leida_en: string | null
  respondida_en: string | null
  created_at: string
}

export interface Mensaje {
  id: string
  tecnico_id: string
  cotizacion_id: string | null
  remitente: 'cliente' | 'tecnico'
  contenido: string
  estado: MensajeEstado
  created_at: string
}

export interface Suscripcion {
  id: string
  tecnico_id: string
  flow_subscription_id: string | null
  flow_order_id: string | null
  flow_customer_id: string | null
  plan: PlanTipo
  tipo_pago: PagoTipo
  monto: number
  estado: PagoEstado
  dias_gracia: number
  inicio_en: string | null
  vence_en: string | null
  cancelado_en: string | null
  renovaciones: number
  proximo_cobro: string | null
  created_at: string
  updated_at: string
}

export interface Visita {
  id: string
  tecnico_id: string
  tipo: 'perfil' | 'contacto' | 'whatsapp' | 'cotizacion' | 'telefono'
  fecha: string
  hora: number | null
  region_visitante: string | null
}

export interface Cita {
  id: string
  tecnico_id: string
  cotizacion_id: string | null
  cliente_nombre: string
  cliente_telefono: string | null
  descripcion: string | null
  fecha: string
  hora_inicio: string
  hora_fin: string | null
  estado: 'confirmada' | 'completada' | 'cancelada'
  notas: string | null
  created_at: string
}

export interface BlogArticulo {
  id: string
  slug: string
  titulo: string
  resumen: string | null
  contenido: string | null
  imagen_url: string | null
  categoria_id: number | null
  region_id: number | null
  autor: string
  publicado: boolean
  visitas: number
  created_at: string
  updated_at: string
}
