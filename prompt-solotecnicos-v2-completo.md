# PROMPT MAESTRO V2 — SoloTécnicos
## Para usar en Claude Code — pegar completo al inicio del proyecto

---

## ROL Y CONTEXTO

Eres un desarrollador fullstack senior especializado en Next.js y Supabase. Vas a construir **SoloTécnicos** — el directorio de servicios técnicos más completo de Chile — desde cero, con diseño profesional de nivel agencia, autenticación, base de datos completa, pagos reales y todas las funcionalidades descritas aquí.

Trabaja de forma autónoma. Crea todos los archivos necesarios sin pedir confirmación en cada paso. Al terminar, entrega un resumen de todo lo construido.

---

## STACK TÉCNICO OBLIGATORIO

- **Framework:** Next.js 14 con App Router
- **Base de datos + Auth:** Supabase (PostgreSQL + Auth + Storage)
- **Estilos:** Tailwind CSS + CSS Modules para componentes complejos
- **Pagos:** Flow.cl (Chile) — suscripciones recurrentes y pago único
- **Mapas:** Leaflet.js (open source, gratis) — directorio + perfil técnico
- **Email:** Resend.com (transaccional)
- **Formularios:** React Hook Form + Zod (validación)
- **Estado global:** Zustand
- **Iconos:** Lucide React
- **Tipografías:** Fraunces (display/títulos) + Instrument Sans (cuerpo) — Google Fonts
- **Deploy target:** Vercel

---

## IDENTIDAD VISUAL — SEGUIR ESTRICTAMENTE

### Paleta de colores
```css
--azul:       #0D2444   /* dominante: headers, nav, sidebar */
--azul-mid:   #163660
--azul-soft:  #1E4A82
--rojo:       #C8102E   /* CTAs principales, acción */
--rojo-hover: #A50D25
--blanco:     #FAFAF8   /* fondo principal */
--papel:      #F2F1EE   /* fondo secundario, inputs */
--borde:      #D8D5CE
--gris-3:     #8A877F   /* texto secundario */
--gris-4:     #4A4840   /* texto cuerpo */
--oro:        #C89A2E   /* plan PRO/Elite, badges premium */
--verde:      #1A7A4A   /* verificado, abierto, éxito */
```

### Tipografía
- Títulos: `'Fraunces', Georgia, serif` — pesos 300 italic, 700, 900
- Cuerpo/UI: `'Instrument Sans', system-ui, sans-serif` — pesos 400, 500, 600, 700

### Principios de diseño
- Estética **editorial chilena** — limpia, seria, confiable. NO genérica ni "IA".
- Bordes finos (1.5px), border-radius pequeños y consistentes (4–14px)
- Sombras sutiles y elegantes, nunca agresivas
- Hero con corte diagonal en la base (`clip-path: polygon`)
- **Logo:** cuadrado azul oscuro con franja roja izquierda y estrella blanca (bandera abstracta) + wordmark "SoloTécnicos" en Fraunces
- Números grandes decorativos en Fraunces para pasos y estadísticas
- Transiciones suaves en hover (0.15s–0.2s ease)
- Mobile first en todo

---

## ARQUITECTURA COMPLETA DE RUTAS

```
/                               → Home con directorio, buscador y mapa
/buscar                         → Resultados con filtros avanzados + mapa lateral
/tecnico/[slug]                 → Perfil público completo del técnico
/categoria/[slug]               → Listado por categoría con SEO
/categoria/[slug]/[regionSlug]  → Listado categoría+región (SEO combinado)
/region/[slug]                  → Listado por región
/emergencias                    → Técnicos disponibles 24/7 destacados
/comparar                       → Comparador de hasta 3 técnicos lado a lado
/planes                         → Precios con toggle mensual/anual
/registro-tecnico               → Landing de conversión + formulario registro
/login                          → Login técnicos (email + Google OAuth)
/recuperar-password             → Recuperar contraseña
/blog                           → Listado de artículos SEO
/blog/[slug]                    → Artículo individual

/dashboard                      → Dashboard técnico (protegido)
/dashboard/perfil               → Editor de perfil público
/dashboard/mensajes             → Bandeja de cotizaciones y mensajes
/dashboard/resenas              → Ver y responder reseñas
/dashboard/agenda               → Sistema de citas (PRO)
/dashboard/estadisticas         → Métricas + alertas de demanda (PRO)
/dashboard/plan                 → Gestión de suscripción y pagos
/dashboard/fotos                → Galería drag & drop
/dashboard/certificaciones      → Subir y gestionar insignias

/admin                          → Panel admin SoloTécnicos
/admin/tecnicos                 → Gestión de técnicos
/admin/resenas                  → Moderación de reseñas
/admin/certificaciones          → Aprobar insignias de técnicos
/admin/pagos                    → Control de suscripciones e ingresos
/admin/blog                     → CMS del blog
/admin/estadisticas             → Métricas globales de la plataforma

/api/webhooks/flow              → Webhook pagos Flow.cl
/api/resenas                    → CRUD reseñas
/api/cotizaciones               → Solicitudes de servicio
/api/contacto                   → Formulario contacto
/api/visitas                    → Registrar visitas y acciones
/api/comparar                   → Datos para comparador
/api/alertas-demanda            → Cron: notificar técnicos con alta demanda
/api/cron/verificar-planes      → Cron diario: desactivar planes vencidos
/api/cron/alertas-vencimiento   → Cron: avisar 7 días antes del vencimiento
```

---

## BASE DE DATOS — ESQUEMA SUPABASE COMPLETO

```sql
-- ═══════════════════════════════════════════
-- EXTENSIONES
-- ═══════════════════════════════════════════
create extension if not exists "uuid-ossp";
create extension if not exists "unaccent";
create extension if not exists "pg_trgm";

-- ═══════════════════════════════════════════
-- ENUM TYPES
-- ═══════════════════════════════════════════
create type plan_tipo        as enum ('gratis', 'pro', 'elite');
create type pago_estado      as enum ('activo', 'vencido', 'cancelado', 'pendiente', 'gracia');
create type pago_tipo        as enum ('mensual', 'anual', 'unico');
create type cotizacion_estado as enum ('pendiente', 'vista', 'respondida', 'cerrada');
create type mensaje_estado   as enum ('no_leido', 'leido');
create type urgencia_tipo    as enum ('normal', 'urgente', '24h');
create type cert_estado      as enum ('pendiente', 'aprobada', 'rechazada');

-- ═══════════════════════════════════════════
-- TABLA: regiones
-- ═══════════════════════════════════════════
create table regiones (
  id      serial primary key,
  nombre  text not null,
  slug    text not null unique,
  orden   int default 0
);

insert into regiones (nombre, slug, orden) values
  ('Región Metropolitana','metropolitana',1),('Valparaíso','valparaiso',2),
  ('Biobío','biobio',3),('La Araucanía','araucania',4),
  ('Los Lagos','los-lagos',5),('O''Higgins','ohiggins',6),
  ('Maule','maule',7),('Coquimbo','coquimbo',8),
  ('Antofagasta','antofagasta',9),('Tarapacá','tarapaca',10),
  ('Arica y Parinacota','arica',11),('Ñuble','nuble',12),
  ('Los Ríos','los-rios',13),('Atacama','atacama',14),
  ('Aysén','aysen',15),('Magallanes','magallanes',16);

-- ═══════════════════════════════════════════
-- TABLA: categorias
-- ═══════════════════════════════════════════
create table categorias (
  id          serial primary key,
  nombre      text not null,
  slug        text not null unique,
  icono       text,
  descripcion text,
  orden       int default 0
);

insert into categorias (nombre, slug, icono, orden) values
  ('Climatización','climatizacion','❄️',1),
  ('Computadores y notebooks','computadores','💻',2),
  ('Celulares y smartphones','celulares','📱',3),
  ('Electricidad','electricidad','⚡',4),
  ('Gasfitería','gasfiteria','🚿',5),
  ('TV y audio','tv-audio','📺',6),
  ('Refrigeración','refrigeracion','🧊',7),
  ('Lavadoras y secadoras','lavadoras','🧺',8),
  ('Mecánica automotriz','mecanica','🔧',9),
  ('Cerrajería','cerrajeria','🔒',10),
  ('Impresoras','impresoras','🖨️',11),
  ('Industrial y maquinaria','industrial','⚙️',12),
  ('Calefacción','calefaccion','🔥',13),
  ('Cámaras de seguridad','camaras','📷',14),
  ('Redes y WiFi','redes','📡',15);

-- ═══════════════════════════════════════════
-- TABLA: tecnicos
-- ═══════════════════════════════════════════
create table tecnicos (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid references auth.users(id) on delete cascade,
  slug                  text unique,

  -- Datos básicos
  nombre_empresa        text not null,
  nombre_contacto       text,
  rut                   text,
  descripcion           text,
  descripcion_corta     text,           -- máx 160 caracteres, para cards

  -- Ubicación
  region_id             int references regiones(id),
  comuna                text,
  direccion             text,
  lat                   decimal(10,8),
  lng                   decimal(11,8),
  comunas_cobertura     text[],

  -- Contacto
  telefono              text,
  whatsapp              text,           -- solo visible en PRO+
  email_publico         text,
  sitio_web             text,
  link_personalizado    text unique,    -- ej: solotecnicos.cl/t/climatech → redirige a slug

  -- Plan y estado
  plan                  plan_tipo default 'gratis',
  plan_vence_en         timestamptz,
  verificado            boolean default false,
  activo                boolean default true,
  destacado             boolean default false,

  -- Métricas cacheadas
  rating_promedio       decimal(3,2) default 0,
  rating_atencion       decimal(3,2) default 0,
  rating_calidad        decimal(3,2) default 0,
  rating_respuesta      decimal(3,2) default 0,
  rating_resolucion     decimal(3,2) default 0,
  rating_rapidez        decimal(3,2) default 0,
  rating_precio         decimal(3,2) default 0,
  rating_garantia       decimal(3,2) default 0,
  total_resenas         int default 0,
  total_visitas         int default 0,
  total_contactos       int default 0,
  total_cotizaciones    int default 0,

  -- Badges
  badge_respuesta_rapida boolean default false,
  atiende_24h            boolean default false,
  atiende_domicilio      boolean default false,

  -- Horarios JSON
  horarios jsonb default '{
    "lunes":     {"abre":"08:00","cierra":"18:00","abierto":true},
    "martes":    {"abre":"08:00","cierra":"18:00","abierto":true},
    "miercoles": {"abre":"08:00","cierra":"18:00","abierto":true},
    "jueves":    {"abre":"08:00","cierra":"18:00","abierto":true},
    "viernes":   {"abre":"08:00","cierra":"18:00","abierto":true},
    "sabado":    {"abre":"09:00","cierra":"14:00","abierto":true},
    "domingo":   {"abre":null,"cierra":null,"abierto":false}
  }'::jsonb,

  -- Alertas de demanda (última enviada)
  ultima_alerta_demanda timestamptz,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ═══════════════════════════════════════════
-- TABLA: tecnico_categorias
-- ═══════════════════════════════════════════
create table tecnico_categorias (
  tecnico_id   uuid references tecnicos(id) on delete cascade,
  categoria_id int  references categorias(id) on delete cascade,
  primary key (tecnico_id, categoria_id)
);

-- ═══════════════════════════════════════════
-- TABLA: tecnico_servicios
-- ═══════════════════════════════════════════
create table tecnico_servicios (
  id           uuid primary key default uuid_generate_v4(),
  tecnico_id   uuid references tecnicos(id) on delete cascade,
  nombre       text not null,
  descripcion  text,
  precio_desde int,          -- CLP, null = a cotizar
  orden        int default 0
);

-- ═══════════════════════════════════════════
-- TABLA: tecnico_fotos
-- ═══════════════════════════════════════════
create table tecnico_fotos (
  id           uuid primary key default uuid_generate_v4(),
  tecnico_id   uuid references tecnicos(id) on delete cascade,
  url          text not null,
  storage_path text,
  caption      text,
  es_portada   boolean default false,
  orden        int default 0,
  created_at   timestamptz default now()
);

-- ═══════════════════════════════════════════
-- TABLA: tecnico_certificaciones
-- ═══════════════════════════════════════════
create table tecnico_certificaciones (
  id               uuid primary key default uuid_generate_v4(),
  tecnico_id       uuid references tecnicos(id) on delete cascade,
  nombre           text not null,       -- ej: "Certificado Samsung", "SEC"
  entidad_emisora  text,
  documento_url    text,                -- imagen del certificado (storage)
  estado           cert_estado default 'pendiente',
  aprobada_por     uuid,                -- admin user_id
  aprobada_en      timestamptz,
  created_at       timestamptz default now()
);

-- ═══════════════════════════════════════════
-- TABLA: tecnico_trabajos (portafolio)
-- ═══════════════════════════════════════════
create table tecnico_trabajos (
  id           uuid primary key default uuid_generate_v4(),
  tecnico_id   uuid references tecnicos(id) on delete cascade,
  titulo       text not null,
  descripcion  text,
  foto_antes   text,
  foto_despues text,
  categoria_id int references categorias(id),
  fecha        date,
  orden        int default 0,
  created_at   timestamptz default now()
);

-- ═══════════════════════════════════════════
-- TABLA: resenas
-- ═══════════════════════════════════════════
create table resenas (
  id               uuid primary key default uuid_generate_v4(),
  tecnico_id       uuid references tecnicos(id) on delete cascade,

  autor_nombre     text not null,
  autor_email      text,
  autor_user_id    uuid,          -- si se autenticó con Google
  autor_verificado boolean default false,

  -- 7 dimensiones (1.0–5.0)
  rating_atencion   decimal(3,1) not null check (rating_atencion  between 1 and 5),
  rating_calidad    decimal(3,1) not null check (rating_calidad   between 1 and 5),
  rating_respuesta  decimal(3,1) not null check (rating_respuesta between 1 and 5),
  rating_resolucion decimal(3,1) not null check (rating_resolucion between 1 and 5),
  rating_rapidez    decimal(3,1) not null check (rating_rapidez   between 1 and 5),
  rating_precio     decimal(3,1) not null check (rating_precio    between 1 and 5),
  rating_garantia   decimal(3,1) not null check (rating_garantia  between 1 and 5),
  rating_promedio   decimal(3,2) generated always as (
    (rating_atencion+rating_calidad+rating_respuesta+rating_resolucion+rating_rapidez+rating_precio+rating_garantia)/7.0
  ) stored,

  titulo               text,
  comentario           text not null,
  respuesta_tecnico    text,           -- PRO puede responder
  respondido_en        timestamptz,
  aprobada             boolean default false,
  reportada            boolean default false,

  created_at           timestamptz default now()
);

-- ═══════════════════════════════════════════
-- TABLA: cotizaciones
-- ═══════════════════════════════════════════
create table cotizaciones (
  id               uuid primary key default uuid_generate_v4(),
  tecnico_id       uuid references tecnicos(id) on delete cascade,

  cliente_nombre   text not null,
  cliente_email    text not null,
  cliente_telefono text,
  cliente_user_id  uuid,              -- si tiene cuenta

  categoria_id     int references categorias(id),
  descripcion      text not null,
  fotos_urls       text[],            -- hasta 3 fotos (blur en plan gratis)
  urgencia         urgencia_tipo default 'normal',
  comuna_servicio  text,

  estado           cotizacion_estado default 'pendiente',
  respuesta        text,
  precio_cotizado  int,

  leida_en         timestamptz,
  respondida_en    timestamptz,
  created_at       timestamptz default now()
);

-- ═══════════════════════════════════════════
-- TABLA: mensajes (hilo por cotización)
-- ═══════════════════════════════════════════
create table mensajes (
  id            uuid primary key default uuid_generate_v4(),
  tecnico_id    uuid references tecnicos(id) on delete cascade,
  cotizacion_id uuid references cotizaciones(id),
  remitente     text not null check (remitente in ('cliente','tecnico')),
  contenido     text not null,
  estado        mensaje_estado default 'no_leido',
  created_at    timestamptz default now()
);

-- ═══════════════════════════════════════════
-- TABLA: suscripciones
-- ═══════════════════════════════════════════
create table suscripciones (
  id                   uuid primary key default uuid_generate_v4(),
  tecnico_id           uuid references tecnicos(id) on delete cascade,

  flow_subscription_id text,
  flow_order_id        text,
  flow_customer_id     text,

  plan                 plan_tipo not null,
  tipo_pago            pago_tipo not null,
  monto                int not null,
  estado               pago_estado default 'pendiente',
  dias_gracia          int default 3,

  inicio_en            timestamptz,
  vence_en             timestamptz,
  cancelado_en         timestamptz,
  renovaciones         int default 0,
  proximo_cobro        timestamptz,

  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ═══════════════════════════════════════════
-- TABLA: visitas
-- ═══════════════════════════════════════════
create table visitas (
  id               uuid primary key default uuid_generate_v4(),
  tecnico_id       uuid references tecnicos(id) on delete cascade,
  tipo             text check (tipo in ('perfil','contacto','whatsapp','cotizacion','telefono')),
  fecha            date default current_date,
  hora             int,
  region_visitante text
);

-- ═══════════════════════════════════════════
-- TABLA: agenda
-- ═══════════════════════════════════════════
create table agenda (
  id               uuid primary key default uuid_generate_v4(),
  tecnico_id       uuid references tecnicos(id) on delete cascade,
  cotizacion_id    uuid references cotizaciones(id),
  cliente_nombre   text not null,
  cliente_telefono text,
  descripcion      text,
  fecha            date not null,
  hora_inicio      time not null,
  hora_fin         time,
  estado           text default 'confirmada' check (estado in ('confirmada','completada','cancelada')),
  notas            text,
  created_at       timestamptz default now()
);

-- ═══════════════════════════════════════════
-- TABLA: clientes (historial)
-- ═══════════════════════════════════════════
create table clientes (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references auth.users(id) on delete cascade,
  nombre         text,
  email          text,
  telefono       text,
  created_at     timestamptz default now()
);

-- historial de técnicos contactados por el cliente
create table cliente_historial (
  id             uuid primary key default uuid_generate_v4(),
  cliente_id     uuid references clientes(id) on delete cascade,
  tecnico_id     uuid references tecnicos(id) on delete cascade,
  tipo           text check (tipo in ('contacto','cotizacion','resena')),
  created_at     timestamptz default now()
);

-- alertas de email para clientes (nuevos técnicos en su zona)
create table cliente_alertas (
  id             uuid primary key default uuid_generate_v4(),
  email          text not null,
  nombre         text,
  region_id      int references regiones(id),
  categoria_id   int references categorias(id),
  activa         boolean default true,
  created_at     timestamptz default now(),
  unique(email, region_id, categoria_id)
);

-- ═══════════════════════════════════════════
-- TABLA: blog_articulos
-- ═══════════════════════════════════════════
create table blog_articulos (
  id             uuid primary key default uuid_generate_v4(),
  slug           text unique not null,
  titulo         text not null,
  resumen        text,
  contenido      text,                  -- HTML o Markdown
  imagen_url     text,
  categoria_id   int references categorias(id),
  region_id      int references regiones(id),
  autor          text default 'Equipo SoloTécnicos',
  publicado      boolean default false,
  visitas        int default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ═══════════════════════════════════════════
-- TABLA: comparaciones (sesiones del comparador)
-- ═══════════════════════════════════════════
create table comparaciones (
  id             uuid primary key default uuid_generate_v4(),
  tecnicos_ids   uuid[] not null,       -- array de 2 o 3 UUIDs
  created_at     timestamptz default now()
);

-- ═══════════════════════════════════════════
-- FUNCIONES Y TRIGGERS
-- ═══════════════════════════════════════════

-- 1. Actualizar ratings automáticamente
create or replace function actualizar_ratings_tecnico()
returns trigger as $$
begin
  update tecnicos set
    rating_atencion   = (select avg(rating_atencion)   from resenas where tecnico_id=NEW.tecnico_id and aprobada=true),
    rating_calidad    = (select avg(rating_calidad)    from resenas where tecnico_id=NEW.tecnico_id and aprobada=true),
    rating_respuesta  = (select avg(rating_respuesta)  from resenas where tecnico_id=NEW.tecnico_id and aprobada=true),
    rating_resolucion = (select avg(rating_resolucion) from resenas where tecnico_id=NEW.tecnico_id and aprobada=true),
    rating_rapidez    = (select avg(rating_rapidez)    from resenas where tecnico_id=NEW.tecnico_id and aprobada=true),
    rating_precio     = (select avg(rating_precio)     from resenas where tecnico_id=NEW.tecnico_id and aprobada=true),
    rating_garantia   = (select avg(rating_garantia)   from resenas where tecnico_id=NEW.tecnico_id and aprobada=true),
    rating_promedio   = (select avg(rating_promedio)   from resenas where tecnico_id=NEW.tecnico_id and aprobada=true),
    total_resenas     = (select count(*)               from resenas where tecnico_id=NEW.tecnico_id and aprobada=true),
    updated_at        = now()
  where id = NEW.tecnico_id;
  return NEW;
end;
$$ language plpgsql;

create trigger trigger_actualizar_ratings
after insert or update on resenas
for each row execute function actualizar_ratings_tecnico();

-- 2. Auto-generar slug
create or replace function generar_slug_tecnico()
returns trigger as $$
declare
  base_slug  text;
  final_slug text;
  contador   int := 0;
begin
  base_slug  := lower(unaccent(regexp_replace(NEW.nombre_empresa,'[^a-zA-Z0-9\s]','','g')));
  base_slug  := regexp_replace(base_slug,'\s+','-','g');
  base_slug  := trim(both '-' from base_slug);
  final_slug := base_slug;
  while exists (select 1 from tecnicos where slug=final_slug and id!=NEW.id) loop
    contador   := contador + 1;
    final_slug := base_slug || '-' || contador;
  end loop;
  NEW.slug := final_slug;
  return NEW;
end;
$$ language plpgsql;

create trigger trigger_slug_tecnico
before insert on tecnicos
for each row execute function generar_slug_tecnico();

-- 3. Degradar plan vencido (llamar desde cron diario)
create or replace function verificar_planes_vencidos()
returns void as $$
begin
  update tecnicos set
    plan       = 'gratis',
    verificado = false,
    destacado  = false
  where plan != 'gratis'
    and plan_vence_en is not null
    and plan_vence_en < now();
end;
$$ language plpgsql;

-- 4. Actualizar badge de respuesta rápida (llamar periódicamente)
create or replace function actualizar_badge_respuesta()
returns void as $$
begin
  -- Técnicos que responden cotizaciones en menos de 2h en promedio (últimos 30 días)
  update tecnicos t set badge_respuesta_rapida = (
    select coalesce(
      avg(extract(epoch from (c.respondida_en - c.created_at))/3600) < 2,
      false
    )
    from cotizaciones c
    where c.tecnico_id = t.id
      and c.respondida_en is not null
      and c.created_at > now() - interval '30 days'
  );
end;
$$ language plpgsql;

-- ═══════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════
alter table tecnicos              enable row level security;
alter table tecnico_fotos         enable row level security;
alter table tecnico_servicios     enable row level security;
alter table tecnico_certificaciones enable row level security;
alter table tecnico_trabajos      enable row level security;
alter table resenas               enable row level security;
alter table cotizaciones          enable row level security;
alter table mensajes              enable row level security;
alter table suscripciones         enable row level security;
alter table visitas               enable row level security;
alter table agenda                enable row level security;
alter table clientes              enable row level security;
alter table cliente_historial     enable row level security;

create policy "tecnicos_publicos"     on tecnicos for select using (activo=true);
create policy "tecnico_edita_propio"  on tecnicos for update using (auth.uid()=user_id);
create policy "tecnico_crea"          on tecnicos for insert with check (auth.uid()=user_id);

create policy "fotos_publicas"        on tecnico_fotos for select using (true);
create policy "fotos_propias"         on tecnico_fotos for all using (
  tecnico_id in (select id from tecnicos where user_id=auth.uid()));

create policy "trabajos_publicos"     on tecnico_trabajos for select using (true);
create policy "trabajos_propios"      on tecnico_trabajos for all using (
  tecnico_id in (select id from tecnicos where user_id=auth.uid()));

create policy "resenas_publicas"      on resenas for select using (aprobada=true);
create policy "resenas_insertar"      on resenas for insert with check (true);

create policy "cotizaciones_tecnico"  on cotizaciones for select using (
  tecnico_id in (select id from tecnicos where user_id=auth.uid()));
create policy "cotizaciones_cliente"  on cotizaciones for insert with check (true);

create policy "suscripciones_propias" on suscripciones for select using (
  tecnico_id in (select id from tecnicos where user_id=auth.uid()));

create policy "clientes_propios"      on clientes for all using (auth.uid()=user_id);

-- ═══════════════════════════════════════════
-- STORAGE BUCKETS (crear en Supabase Dashboard)
-- ═══════════════════════════════════════════
-- "tecnico-fotos"       → público,  máx 5MB, jpg/png/webp
-- "tecnico-documentos"  → privado,  máx 10MB, pdf/jpg/png
-- "cotizacion-fotos"    → privado,  máx 5MB,  jpg/png/webp
-- "blog-imagenes"       → público,  máx 5MB,  jpg/png/webp
```

---

## LÓGICA DE PLANES — IMPLEMENTAR EXACTAMENTE

```typescript
// lib/planes.ts
export const PLANES = {
  gratis: {
    nombre: 'Gratuito',
    precio_mensual: 0,
    precio_anual: 0,
    limites: {
      fotos: 3,
      trabajos_portafolio: 2,
      servicios: 5,
      puede_responder_resenas: false,
      whatsapp_visible: false,
      estadisticas: false,
      badge_verificado: false,
      posicion_destacada: false,
      primera_posicion: false,
      banner_resultados: false,
      puede_ver_fotos_cotizacion: false,   // fotos en blur
      agenda: false,
      video: false,
      sucursales: 1,
      certificaciones: false,
      link_personalizado: true,            // todos tienen link corto
      alertas_demanda: false,
    }
  },
  pro: {
    nombre: 'PRO',
    precio_mensual: 14990,
    precio_anual: 149900,                  // = 2 meses gratis
    limites: {
      fotos: 20,
      trabajos_portafolio: 20,
      servicios: 50,
      puede_responder_resenas: true,
      whatsapp_visible: true,
      estadisticas: true,
      badge_verificado: true,
      posicion_destacada: true,
      primera_posicion: false,
      banner_resultados: false,
      puede_ver_fotos_cotizacion: true,
      agenda: true,
      video: true,
      sucursales: 1,
      certificaciones: true,
      link_personalizado: true,
      alertas_demanda: true,
    }
  },
  elite: {
    nombre: 'Elite',
    precio_mensual: 34990,
    precio_anual: 349900,
    limites: {
      fotos: Infinity,
      trabajos_portafolio: Infinity,
      servicios: Infinity,
      puede_responder_resenas: true,
      whatsapp_visible: true,
      estadisticas: true,
      badge_verificado: true,
      posicion_destacada: true,
      primera_posicion: true,              // 1.° lugar región/categoría
      banner_resultados: true,
      puede_ver_fotos_cotizacion: true,
      agenda: true,
      video: true,
      sucursales: 5,
      certificaciones: true,
      link_personalizado: true,
      alertas_demanda: true,
    }
  }
}

export type PlanFeature = keyof typeof PLANES.gratis.limites

export function puedeHacer(tecnico: Tecnico, feature: PlanFeature): boolean {
  if (tecnico.plan !== 'gratis' && tecnico.plan_vence_en) {
    if (new Date(tecnico.plan_vence_en) < new Date()) {
      return !!PLANES.gratis.limites[feature]
    }
  }
  return !!PLANES[tecnico.plan]?.limites[feature]
}

export function limiteNumerico(tecnico: Tecnico, feature: 'fotos'|'servicios'|'trabajos_portafolio'|'sucursales'): number {
  if (tecnico.plan !== 'gratis' && tecnico.plan_vence_en && new Date(tecnico.plan_vence_en) < new Date()) {
    return PLANES.gratis.limites[feature] as number
  }
  const val = PLANES[tecnico.plan]?.limites[feature]
  return val === Infinity ? 9999 : val as number
}
```

---

## INTEGRACIÓN FLOW.CL

```typescript
// lib/flow.ts
import crypto from 'crypto'

const API_KEY    = process.env.FLOW_API_KEY!
const SECRET_KEY = process.env.FLOW_SECRET!
const API_URL    = process.env.NODE_ENV === 'production'
  ? 'https://www.flow.cl/api'
  : 'https://sandbox.flow.cl/api'

function firmar(params: Record<string,string>): string {
  const keys   = Object.keys(params).sort()
  const cadena = keys.map(k => `${k}${params[k]}`).join('')
  return crypto.createHmac('sha256', SECRET_KEY).update(cadena).digest('hex')
}

// Crear orden de pago (suscripción o pago único)
export async function crearOrdenPago(params: {
  tecnicoId: string
  email: string
  plan: 'pro' | 'elite'
  tipo: 'mensual' | 'anual'
  urlRetorno: string
}) {
  const monto = PLANES[params.plan][`precio_${params.tipo}`]
  const body: Record<string,string> = {
    apiKey:      API_KEY,
    amount:      String(monto),
    currency:    'CLP',
    subject:     `SoloTécnicos ${PLANES[params.plan].nombre} - ${params.tipo}`,
    email:       params.email,
    urlConfirmation: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/flow`,
    urlReturn:   params.urlRetorno,
    commerceOrder: `ST-${params.tecnicoId}-${Date.now()}`,
    paymentMethod: 9,  // todos los métodos disponibles
  }
  body.s = firmar(body)
  // POST a Flow → retorna token → redirigir al cliente a URL de pago
}

// Webhook handler — /api/webhooks/flow/route.ts
// Verificar firma HMAC → según evento:
// payment.created      → marcar suscripción pendiente
// payment.confirmed    → activar plan en tecnicos + suscripciones
// payment.rejected     → notificar por email
// subscription.renewal → extender plan_vence_en + registrar renovación
// subscription.cancel  → degradar a gratis al vencer
// subscription.failed  → dar 3 días de gracia + email aviso
```

---

## AUTENTICACIÓN — SUPABASE AUTH

### Flujos de auth

**Técnicos:**
- Registro: email + password → verificación por email → completar perfil
- Login: email/password O Google OAuth
- Recuperar contraseña: email con link de reset

**Clientes:**
- Sin registro obligatorio para buscar y contactar
- Registro opcional con Google OAuth para: dejar reseñas verificadas, ver historial, recibir alertas

**Admin:**
- Solo email + password, rol `admin` en `auth.users.user_metadata`

```typescript
// middleware.ts — proteger rutas
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res  = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const isAdmin = session?.user?.user_metadata?.role === 'admin'
    if (!session || !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
  return res
}
```

---

## COMPONENTES CLAVE — DESCRIPCIÓN DETALLADA

### 1. `<TarjetaTecnico />`
Card en directorio — grid 3 columnas [foto | info | acciones]:
- Foto portada (placeholder si no tiene)
- Badge dorado "Elite" o "PRO Destacado" con ribbon en esquina
- Tags: categoría, región, verificado
- Nombre en Fraunces bold
- Descripción corta (2 líneas máx)
- Chips de servicios principales (máx 4 + "+N más")
- Rating: número grande + estrellas + total reseñas
- Indicador abierto/cerrado calculado en tiempo real según horarios
- Botones: "Contactar" (rojo) + "Ver perfil" (outline) + "Comparar" (checkbox)
- Click en card → modal preview rápida; click en "Ver perfil" → navega al slug

### 2. `<PerfilPublico />` — `/tecnico/[slug]`

**Hero:**
- Foto portada full-width con gradiente overlay azul marino
- Avatar/logo empresa (círculo)
- Nombre, categorías (pills), región, badges verificado/PRO
- Rating global prominente + total reseñas
- Botones sticky en mobile: Llamar / WhatsApp / Cotizar

**Layout 60/40:**

*Izquierda:*
- Descripción completa con "ver más" si es larga
- Servicios con precios (tabla o chips)
- Galería de fotos (grid uniforme, lightbox al click)
- Portafolio "Antes y después" (slider por trabajo)
- Certificaciones aprobadas (badges con ícono)
- Reseñas paginadas con las 7 dimensiones en barras
- Formulario nueva reseña (expandible)

*Derecha (sticky):*
- Card de contacto: teléfono, WhatsApp (PRO), email, link web
- Formulario de cotización inline
- Horarios semanales con indicador de abierto ahora
- Mapa Leaflet con pin de ubicación
- Zonas de cobertura (lista de comunas)
- Compartir perfil (copiar link personalizado)

### 3. `<ComparadorTecnicos />` — `/comparar`
- Seleccionar hasta 3 técnicos (desde directorio con checkbox, o buscador)
- Tabla lado a lado con: foto, nombre, rating global, cada dimensión con barra visual, servicios, plan, precio rango, horarios, badges
- Botón "Contactar" bajo cada columna
- URL compartible: `/comparar?t=slug1,slug2,slug3`

### 4. `<SistemaResenas />`

Formulario de nueva reseña:
- 7 sliders de estrellas interactivos (clic en estrella 1–5)
- Etiqueta descriptiva por nivel: 1=Muy malo, 2=Regular, 3=Bueno, 4=Muy bueno, 5=Excelente
- Promedio general calculado en tiempo real mientras completa
- Campos: nombre (obligatorio), email (no público), título opcional, comentario (obligatorio, mín 30 chars)
- Si tiene Google OAuth: autocompletado + badge "Reseña verificada"
- Captcha básico (honeypot) para evitar spam
- Al enviar: estado pendiente → email admin → badge "En revisión" al usuario

Visualización de reseñas:
- Lista paginada (10 por página)
- Cada reseña muestra las 7 dimensiones como mini-barras
- Respuesta del técnico si existe (indentada, con badge "Respuesta del técnico")
- Filtros: ordenar por fecha o rating

### 5. Dashboard `/dashboard`

**Layout:**
- Sidebar izquierdo (240px) con logo, items de navegación, badge de plan, indicador de vencimiento
- Área principal con breadcrumbs

**Sidebar items:**
- 📊 Resumen
- 👤 Mi perfil
- 📷 Fotos y portafolio
- 📩 Mensajes `(badge rojo con no leídos)`
- ⭐ Reseñas
- 📅 Agenda `(🔒 si plan gratis)`
- 📈 Estadísticas `(🔒 si plan gratis)`
- 🏅 Certificaciones
- 💳 Mi plan

**Página resumen muestra:**
- Métricas 7/30 días: visitas, contactos, cotizaciones, mensajes
- Minigráfico de barras de visitas (últimas 2 semanas)
- Rating actual con radarchart de las 7 dimensiones (recharts)
- Bandeja de últimas 3 cotizaciones sin responder
- Alerta de plan (si vence en ≤7 días: banner amarillo; si vencido: banner rojo)
- CTA de upgrade si plan gratis, con métricas de "podrías tener X% más contactos"

### 6. Editor de perfil `/dashboard/perfil`

Secciones en acordeón con guardado automático (debounce 2s):

1. **Información básica** — nombre empresa, nombre contacto, descripción corta (con contador), descripción completa (editor simple) ✅ GRATIS
2. **Contacto** — teléfono, email público ✅ GRATIS | WhatsApp 🔒 PRO | sitio web ✅ GRATIS
3. **Ubicación** — región (select), comuna, dirección | mapa Leaflet clickeable para ajustar pin | comunas de cobertura (multi-select con chips) ✅ GRATIS
4. **Categorías** — multi-select de categorías (máx 5) ✅ GRATIS
5. **Servicios** — agregar/editar/reordenar servicios con nombre + descripción + precio | hasta 5 GRATIS, ilimitado PRO
6. **Horarios** — toggle abierto/cerrado por día + time pickers | toggle "Atiendo 24/7" | toggle "Atiendo a domicilio" ✅ GRATIS
7. **Fotos** — drag & drop upload | reordenar con drag | marcar foto de portada | barra de uso "3/3 fotos usadas" con CTA upgrade | GRATIS: 3, PRO: 20, Elite: ∞
8. **Portafolio** — agregar trabajos con título, descripción, foto antes + foto después | GRATIS: 2, PRO+: ilimitado
9. **Certificaciones** — subir documento + nombre + entidad | estado: pendiente revisión 🔒 PRO

**Preview en tiempo real:** panel derecho (oculto en mobile) que muestra cómo queda el perfil público mientras edita.

En cada campo/sección bloqueada: overlay semitransparente con 🔒 y botón "Desbloquear con PRO →" que abre modal de upgrade.

### 7. Gestión de Mensajes `/dashboard/mensajes`

- Lista de cotizaciones agrupadas por estado (pendientes primero)
- Cada fila: avatar cliente, nombre, servicio, tiempo transcurrido, urgencia (chip color), estado
- Click → panel derecho con hilo de mensajes (tipo chat)
- Caja de respuesta con envío
- Fotos adjuntas del cliente: visibles en PRO, con blur + 🔒 en gratis
- Marcar como respondida, cerrada
- Filtros: pendientes / respondidas / cerradas

### 8. Estadísticas `/dashboard/estadisticas` (PRO)

Métricas disponibles:
- Visitas al perfil (gráfico línea, 30 días)
- Tipo de acción: ver perfil / click teléfono / click WhatsApp / cotización enviada
- Origen por región del visitante
- Reseñas recibidas por período
- Posición promedio en resultados de búsqueda (aproximada)
- **Alertas de demanda:** "Esta semana X personas buscaron [categoría] en [región] sin encontrar técnico con buen rating. ¡Actualiza tu perfil!" — enviadas también por email

### 9. Gestión de Plan `/dashboard/plan`

- Estado actual con fecha de vencimiento prominente
- Si plan gratis: comparador de planes con toggle mensual/anual y ahorro calculado
- Si plan activo: próximo cobro, opción de cancelar, historial de pagos
- Botón upgrade/downgrade
- Al hacer clic en "Activar PRO" → redirigir a Flow.cl para pago

### 10. Página de Planes `/planes`

- Toggle mensual / anual (con badge "2 meses gratis")
- Precios que cambian con animación según toggle
- Tabla de 3 columnas (Gratis / PRO / Elite) con checklist detallado
- Sección FAQ ("¿Puedo cancelar cuando quiera?", "¿Qué pasa si no pago?", etc.)
- Testimonios de técnicos que mejoraron con PRO (placeholder para el inicio)
- CTA final: "Empieza gratis, sin tarjeta"

### 11. Sección Emergencias `/emergencias`

- Listado de técnicos con `atiende_24h = true`
- Filtro por región (prioritario)
- Cards con badge destacado "🚨 24/7"
- Ordenados por rating + región del visitante (si disponible)
- Banner de urgencia en el hero de esta página

### 12. Mapa Interactivo (Home + Buscar)

En la página de búsqueda `/buscar`:
- Panel izquierdo: lista de resultados (scrollable)
- Panel derecho: mapa Leaflet con pins por técnico
- Click en pin → popup con nombre, rating, botón "Ver perfil"
- Pins con colores distintos: azul (gratis), dorado (PRO), rojo (Elite)
- Clustering de pins cuando hay muchos cerca
- Sincronizado: hover en card → pin resaltado en mapa y viceversa

### 13. Comparador `/comparar`

- Desde el directorio: checkbox "Comparar" en cada card (máx 3)
- Barra fija en bottom cuando hay técnicos seleccionados: "Comparando 2/3 técnicos → Ver comparación"
- Página de comparación: tabla con filas = características, columnas = técnicos
- Filas: foto/nombre, rating global, cada dimensión (barra visual), servicios, horarios, plan, zona de cobertura, certificaciones, total reseñas
- URL compartible para que el cliente pueda pedir opinión

### 14. Blog `/blog`

- Listado de artículos con imagen, categoría, extracto, tiempo de lectura
- Artículos optimizados para SEO local: "Cómo limpiar un split en invierno", "Cuándo cambiar la batería del celular", "Checklist de mantención del refrigerador"
- Sidebar con técnicos destacados de la categoría del artículo
- CTA al final: "¿Buscas un técnico para esto? Encuentra el mejor en tu región"
- Admin CMS simple para crear/editar artículos en `/admin/blog`

### 15. Landing de Registro `/registro-tecnico`

1. Hero: "Llega a más clientes en tu región — completamente gratis"
2. Stats dinámicas: "X personas buscaron [categoría más popular] en Chile esta semana"
3. Proceso en 3 pasos con números grandes
4. Formulario de registro (nombre empresa, email, teléfono, región, categoría principal, contraseña)
5. Login con Google también disponible
6. Testimonios de técnicos (placeholder)
7. Comparador de planes
8. FAQ

---

## ALGORITMO DE RANKING

```sql
-- Función de score para ordenamiento
create or replace function calcular_score(t tecnicos)
returns decimal as $$
declare
  score decimal := 0;
  dias_sin_update int;
begin
  dias_sin_update := extract(day from now() - t.updated_at);
  score := (
    (coalesce(t.rating_promedio, 0) * 30)
    + (ln(coalesce(t.total_resenas, 0) + 1) * 15)
    + (case t.plan when 'elite' then 40 when 'pro' then 20 else 0 end)
    + (case when t.verificado then 10 else 0 end)
    + (case when t.badge_respuesta_rapida then 5 else 0 end)
    + (case when t.atiende_24h then 3 else 0 end)
    - (dias_sin_update * 0.1)
  );
  return score;
end;
$$ language plpgsql immutable;
```

---

## QUERY DE BÚSQUEDA PRINCIPAL

```sql
select
  t.*,
  r.nombre as region_nombre,
  array_agg(distinct c.nombre) as categorias_nombres,
  array_agg(distinct c.slug)   as categorias_slugs,
  (select url from tecnico_fotos where tecnico_id=t.id and es_portada=true limit 1) as foto_portada,
  calcular_score(t) as score
from tecnicos t
join regiones r on t.region_id = r.id
left join tecnico_categorias tc on t.id = tc.tecnico_id
left join categorias c on tc.categoria_id = c.id
where t.activo = true
  and ($1::int    is null or t.region_id = $1)
  and ($2::int    is null or tc.categoria_id = $2)
  and ($3::decimal is null or t.rating_promedio >= $3)
  and ($4::boolean is false or t.atiende_domicilio = true)
  and ($5::boolean is false or t.verificado = true)
  and ($6::boolean is false or t.atiende_24h = true)
  and ($7::text   is null or (
    to_tsvector('spanish',
      coalesce(t.nombre_empresa,'') || ' ' ||
      coalesce(t.descripcion,'') || ' ' ||
      coalesce(t.comuna,'')
    ) @@ plainto_tsquery('spanish', $7)
  ))
group by t.id, r.nombre
order by
  case when t.plan='elite' then 1 when t.plan='pro' then 2 else 3 end,
  calcular_score(t) desc
limit 20 offset $8;
```

---

## EMAILS TRANSACCIONALES (Resend + React Email)

Crear en `/emails/`:

1. **Bienvenida.tsx** — al registrarse, link para completar perfil, primeros pasos
2. **PerfilIncompleto.tsx** — recordatorio 24h después si no completó el perfil
3. **NuevaCotizacion.tsx** — llega solicitud al técnico con resumen (sin fotos si gratis)
4. **NuevoMensaje.tsx** — notificación de mensaje nuevo en hilo
5. **ResenaRecibida.tsx** — al técnico cuando llega reseña (pendiente de aprobación)
6. **ResenaAprobada.tsx** — al admin para moderar
7. **PlanActivado.tsx** — confirmación pago exitoso con fecha de vencimiento
8. **PlanPorVencer.tsx** — 7 días antes, CTA para renovar
9. **PlanVencido.tsx** — beneficios desactivados + link renovar
10. **PagoFallido.tsx** — 3 días de gracia + link actualizar tarjeta
11. **AlertaDemanda.tsx** — al técnico: "X búsquedas en tu zona esta semana"
12. **NuevoTecnicoZona.tsx** — al cliente con alerta activa: "Nuevo técnico en tu región"

---

## PANEL ADMIN `/admin`

### Técnicos `/admin/tecnicos`
- Tabla con búsqueda, filtros por región/plan/estado
- Acciones: activar/desactivar, verificar manualmente, cambiar plan manualmente (para dar trials), ver perfil público
- Crear perfil manualmente (para cargar técnicos iniciales sin que ellos se registren)

### Reseñas `/admin/resenas`
- Cola de moderación: aprobar / rechazar / spam
- Ver el perfil del técnico al que corresponde
- Filtro: pendientes primero

### Certificaciones `/admin/certificaciones`
- Lista de certificaciones subidas pendientes de aprobación
- Ver imagen del documento
- Aprobar → aparece en perfil del técnico con badge
- Rechazar con motivo → email al técnico

### Pagos `/admin/pagos`
- Tabla de suscripciones activas
- MRR (Monthly Recurring Revenue) calculado
- Historial de pagos
- Opción de cancelar/extender manualmente

### Blog `/admin/blog`
- Listado de artículos con estado (publicado/borrador)
- Editor de artículo: título, slug (auto), imagen, categoría relacionada, contenido (textarea HTML simple o Markdown)
- Publicar / despublicar

### Estadísticas globales `/admin/estadisticas`
- Técnicos registrados por región (barras)
- Conversión gratis → PRO (%)
- Búsquedas más frecuentes
- Regiones con más demanda sin cobertura suficiente
- Ingresos del mes actual vs mes anterior

---

## SEO — METADATA DINÁMICA

```typescript
// Implementar generateMetadata en cada página dinámica:

// /tecnico/[slug]
title: `${tecnico.nombre_empresa} — Servicio Técnico en ${tecnico.comuna}, ${region.nombre} | SoloTécnicos`
description: tecnico.descripcion_corta || `Contacta a ${tecnico.nombre_empresa}. Rating ${tecnico.rating_promedio}/5 con ${tecnico.total_resenas} reseñas verificadas.`

// /categoria/[slug]
title: `Técnicos de ${categoria.nombre} en Chile | Directorio verificado | SoloTécnicos`

// /categoria/[slug]/[regionSlug]
title: `Técnicos de ${categoria.nombre} en ${region.nombre} | SoloTécnicos`

// /region/[slug]
title: `Servicios Técnicos en ${region.nombre} | Directorio verificado | SoloTécnicos`

// /blog/[slug]
title: `${articulo.titulo} | Blog SoloTécnicos`

// Generar sitemap.xml dinámico con todos los perfiles activos + categorías + regiones + blog
// Robots.txt: permitir todo excepto /dashboard y /admin
```

---

## LINK PERSONALIZADO PARA TÉCNICOS

Cada técnico tiene un link corto único:
- Automático: `solotecnicos.cl/t/[slug]` → redirige a `/tecnico/[slug]`
- El técnico puede personalizar el sufijo en el editor de perfil (ej: `solotecnicos.cl/t/climatech`)
- Botón "Copiar mi link" en dashboard con animación de copiado
- Compartir directo: botón WhatsApp, copiar al portapapeles

Implementar en `/app/t/[codigo]/route.ts` como redirect + registrar visita.

---

## ALERTAS DE DEMANDA AL TÉCNICO

```typescript
// /api/cron/alertas-demanda/route.ts
// Ejecutar semanalmente (Vercel Cron: cada lunes 9:00)

// 1. Agrupar búsquedas de la semana por región + categoría
// 2. Para cada combinación con >5 búsquedas y sin técnico PRO disponible:
//    → encontrar técnicos de esa categoría/región con plan gratis
//    → si no recibieron alerta en los últimos 7 días:
//       → enviar email AlertaDemanda con las estadísticas
//       → actualizar ultima_alerta_demanda en tecnicos
```

---

## ESTRUCTURA DE ARCHIVOS COMPLETA

```
solotecnicos/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                        # Home
│   │   ├── buscar/page.tsx                 # Resultados + mapa
│   │   ├── tecnico/[slug]/page.tsx         # Perfil público
│   │   ├── categoria/[slug]/page.tsx
│   │   ├── categoria/[slug]/[region]/page.tsx
│   │   ├── region/[slug]/page.tsx
│   │   ├── emergencias/page.tsx
│   │   ├── comparar/page.tsx
│   │   ├── planes/page.tsx
│   │   ├── registro-tecnico/page.tsx
│   │   └── blog/
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── recuperar-password/page.tsx
│   ├── t/[codigo]/route.ts                 # Redirect link personalizado
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── dashboard/perfil/page.tsx
│   │   ├── dashboard/fotos/page.tsx
│   │   ├── dashboard/mensajes/page.tsx
│   │   ├── dashboard/resenas/page.tsx
│   │   ├── dashboard/agenda/page.tsx
│   │   ├── dashboard/estadisticas/page.tsx
│   │   ├── dashboard/plan/page.tsx
│   │   └── dashboard/certificaciones/page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── admin/page.tsx
│   │   ├── admin/tecnicos/page.tsx
│   │   ├── admin/resenas/page.tsx
│   │   ├── admin/certificaciones/page.tsx
│   │   ├── admin/pagos/page.tsx
│   │   ├── admin/blog/page.tsx
│   │   └── admin/estadisticas/page.tsx
│   ├── api/
│   │   ├── webhooks/flow/route.ts
│   │   ├── resenas/route.ts
│   │   ├── cotizaciones/route.ts
│   │   ├── visitas/route.ts
│   │   ├── comparar/route.ts
│   │   ├── cron/verificar-planes/route.ts
│   │   ├── cron/alertas-demanda/route.ts
│   │   └── cron/alertas-vencimiento/route.ts
│   ├── layout.tsx                          # Root layout con fuentes
│   ├── sitemap.ts                          # Sitemap dinámico
│   └── robots.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   ├── StarRating.tsx                  # Slider interactivo 1-5
│   │   ├── UpgradePrompt.tsx               # Overlay de upgrade con 🔒
│   │   └── Toast.tsx
│   ├── tecnico/
│   │   ├── TarjetaTecnico.tsx
│   │   ├── TarjetaTecnicoSkeleton.tsx
│   │   ├── PerfilPublico.tsx
│   │   ├── SistemaResenas.tsx
│   │   ├── FormularioCotizacion.tsx
│   │   ├── GaleriaFotos.tsx
│   │   ├── PortafolioTrabajos.tsx
│   │   ├── HorarioDisplay.tsx
│   │   ├── CertificacionesBadges.tsx
│   │   ├── ContactoCard.tsx
│   │   └── CompartirLink.tsx
│   ├── directorio/
│   │   ├── FiltroBusqueda.tsx
│   │   ├── FiltroCategorias.tsx
│   │   ├── FiltroRegiones.tsx
│   │   ├── MapaDirectorio.tsx              # Leaflet con pins
│   │   ├── ComparadorBarra.tsx             # Barra inferior de comparar
│   │   └── SeccionEmergencias.tsx
│   ├── dashboard/
│   │   ├── SidebarDashboard.tsx
│   │   ├── EditorPerfil.tsx
│   │   ├── GaleriaEditor.tsx              # Drag & drop upload
│   │   ├── PortafolioEditor.tsx
│   │   ├── BandejaMensajes.tsx
│   │   ├── HiloMensajes.tsx
│   │   ├── AgendaCalendario.tsx
│   │   ├── EstadisticasGraficos.tsx
│   │   ├── RadarRatings.tsx               # Recharts radar
│   │   └── PlanCard.tsx
│   ├── planes/
│   │   ├── TablaPlanes.tsx
│   │   └── TogglePeriodo.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── TopStrip.tsx
│   └── blog/
│       ├── ArticuloCard.tsx
│       └── SidebarTecnicosRelacionados.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── planes.ts
│   ├── flow.ts
│   ├── resend.ts
│   ├── ranking.ts
│   └── utils.ts
├── emails/
│   ├── Bienvenida.tsx
│   ├── NuevaCotizacion.tsx
│   ├── AlertaDemanda.tsx
│   ├── PlanActivado.tsx
│   ├── PlanPorVencer.tsx
│   ├── PlanVencido.tsx
│   ├── PagoFallido.tsx
│   └── NuevoTecnicoZona.tsx
├── types/
│   └── database.types.ts
├── store/
│   ├── useComparadorStore.ts              # Técnicos seleccionados para comparar
│   └── useAuthStore.ts
├── hooks/
│   ├── useTecnico.ts
│   ├── useBusqueda.ts
│   └── usePlan.ts
├── middleware.ts
├── tailwind.config.ts
├── next.config.ts
└── .env.local
```

---

## VARIABLES DE ENTORNO

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FLOW_API_KEY=
FLOW_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=https://solotecnicos.cl
CRON_SECRET=                    # token para proteger rutas de cron
```

---

## VERCEL CRON JOBS (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/cron/verificar-planes",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/alertas-vencimiento",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/alertas-demanda",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

---

## SEED DE DATOS (`/scripts/seed.ts`)

Insertar al final:
- 6 técnicos de prueba distribuidos en distintas regiones y categorías (2 gratis, 2 PRO, 1 Elite, 1 gratis con muchas reseñas)
- 15 reseñas aprobadas con valores variados en las 7 dimensiones
- 5 cotizaciones en distintos estados
- 3 artículos de blog publicados
- 2 trabajos de portafolio por técnico PRO
- Usuarios: `tecnico@test.cl` / `Test1234!` | `admin@test.cl` / `Admin1234!`

---

## ORDEN DE CONSTRUCCIÓN

Construye estrictamente en este orden:

1. Setup Next.js 14 + Tailwind + Google Fonts (Fraunces + Instrument Sans)
2. Variables de entorno y configuración Supabase
3. Ejecutar SQL completo en Supabase
4. Tipos TypeScript desde Supabase (`supabase gen types`)
5. `lib/planes.ts` — lógica de planes
6. Layout base: TopStrip + Navbar + Footer
7. Home page con directorio, buscador y categorías
8. Componente `TarjetaTecnico` con skeleton
9. Mapa Leaflet en búsqueda (`/buscar`)
10. Página perfil público `/tecnico/[slug]` completa
11. Sistema de reseñas (visualización + formulario con 7 dimensiones)
12. Formulario de cotización
13. Comparador de técnicos (`/comparar`)
14. Sección emergencias (`/emergencias`)
15. Blog (listado + artículo + CMS admin básico)
16. Registro técnico (landing + formulario + Supabase Auth)
17. Google OAuth para clientes
18. Login + middleware de rutas protegidas
19. Dashboard layout + sidebar
20. Editor de perfil con restricciones por plan y preview
21. Subida de fotos drag & drop (Supabase Storage)
22. Editor portafolio antes/después
23. Bandeja de mensajes y cotizaciones
24. Agenda/calendario (PRO)
25. Estadísticas con gráficos (PRO)
26. Gestión de certificaciones
27. Link personalizado `/t/[codigo]`
28. Integración Flow.cl + webhook
29. Emails con Resend + React Email
30. Cron jobs (verificar planes + alertas demanda + vencimiento)
31. Panel admin (todas las secciones)
32. SEO completo: generateMetadata + sitemap + robots
33. Alertas de demanda al técnico
34. Sistema de alertas para clientes (nuevo técnico en zona)
35. Script seed con datos de prueba
36. `vercel.json` con cron jobs
37. README con instrucciones completas

---

## INSTRUCCIÓN FINAL

Construye **absolutamente todo** lo descrito. Si una integración externa (Flow, Resend) requiere credenciales reales, deja el código completo con placeholders correctos y un comentario `// TODO: credenciales en .env.local`.

Al terminar entrega:
1. Lista completa de archivos creados
2. `npm install` con todas las dependencias
3. Instrucciones paso a paso: Supabase → variables → seed → dev
4. Credenciales de prueba para testear
