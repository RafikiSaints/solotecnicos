-- ═══════════════════════════════════════════
-- SOLOTECNICOS - SCHEMA COMPLETO SUPABASE
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════

-- EXTENSIONES
create extension if not exists "uuid-ossp";
create extension if not exists "unaccent";
create extension if not exists "pg_trgm";

-- ENUM TYPES
do $$ begin create type plan_tipo as enum ('gratis','pro','elite'); exception when duplicate_object then null; end $$;
do $$ begin create type pago_estado as enum ('activo','vencido','cancelado','pendiente','gracia'); exception when duplicate_object then null; end $$;
do $$ begin create type pago_tipo as enum ('mensual','anual','unico'); exception when duplicate_object then null; end $$;
do $$ begin create type cotizacion_estado as enum ('pendiente','vista','respondida','cerrada'); exception when duplicate_object then null; end $$;
do $$ begin create type mensaje_estado as enum ('no_leido','leido'); exception when duplicate_object then null; end $$;
do $$ begin create type urgencia_tipo as enum ('normal','urgente','24h'); exception when duplicate_object then null; end $$;
do $$ begin create type cert_estado as enum ('pendiente','aprobada','rechazada'); exception when duplicate_object then null; end $$;

-- ═══════════════════════════════════════════
-- TABLA: regiones
-- ═══════════════════════════════════════════
create table if not exists regiones (
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
  ('Aysén','aysen',15),('Magallanes','magallanes',16)
on conflict (slug) do nothing;

-- ═══════════════════════════════════════════
-- TABLA: categorias
-- ═══════════════════════════════════════════
create table if not exists categorias (
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
  ('Redes y WiFi','redes','📡',15)
on conflict (slug) do nothing;

-- ═══════════════════════════════════════════
-- TABLA: tecnicos
-- ═══════════════════════════════════════════
create table if not exists tecnicos (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid references auth.users(id) on delete cascade,
  slug                  text unique,

  nombre_empresa        text not null,
  nombre_contacto       text,
  rut                   text,
  descripcion           text,
  descripcion_corta     text,

  region_id             int references regiones(id),
  comuna                text,
  direccion             text,
  lat                   decimal(10,8),
  lng                   decimal(11,8),
  comunas_cobertura     text[],

  telefono              text,
  whatsapp              text,
  email_publico         text,
  sitio_web             text,
  link_personalizado    text unique,

  plan                  plan_tipo default 'gratis',
  plan_vence_en         timestamptz,
  verificado            boolean default false,
  activo                boolean default true,
  destacado             boolean default false,

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

  badge_respuesta_rapida boolean default false,
  atiende_24h            boolean default false,
  atiende_domicilio      boolean default false,

  horarios jsonb default '{
    "lunes":     {"abre":"08:00","cierra":"18:00","abierto":true},
    "martes":    {"abre":"08:00","cierra":"18:00","abierto":true},
    "miercoles": {"abre":"08:00","cierra":"18:00","abierto":true},
    "jueves":    {"abre":"08:00","cierra":"18:00","abierto":true},
    "viernes":   {"abre":"08:00","cierra":"18:00","abierto":true},
    "sabado":    {"abre":"09:00","cierra":"14:00","abierto":true},
    "domingo":   {"abre":null,"cierra":null,"abierto":false}
  }'::jsonb,

  ultima_alerta_demanda timestamptz,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_tecnicos_region on tecnicos(region_id);
create index if not exists idx_tecnicos_plan on tecnicos(plan);
create index if not exists idx_tecnicos_activo on tecnicos(activo);
create index if not exists idx_tecnicos_rating on tecnicos(rating_promedio desc);
create index if not exists idx_tecnicos_slug on tecnicos(slug);

-- tecnico_categorias (M:N)
create table if not exists tecnico_categorias (
  tecnico_id   uuid references tecnicos(id) on delete cascade,
  categoria_id int  references categorias(id) on delete cascade,
  primary key (tecnico_id, categoria_id)
);

-- tecnico_servicios
create table if not exists tecnico_servicios (
  id           uuid primary key default uuid_generate_v4(),
  tecnico_id   uuid references tecnicos(id) on delete cascade,
  nombre       text not null,
  descripcion  text,
  precio_desde int,
  orden        int default 0
);

-- tecnico_fotos
create table if not exists tecnico_fotos (
  id           uuid primary key default uuid_generate_v4(),
  tecnico_id   uuid references tecnicos(id) on delete cascade,
  url          text not null,
  storage_path text,
  caption      text,
  es_portada   boolean default false,
  orden        int default 0,
  created_at   timestamptz default now()
);

-- tecnico_certificaciones
create table if not exists tecnico_certificaciones (
  id               uuid primary key default uuid_generate_v4(),
  tecnico_id       uuid references tecnicos(id) on delete cascade,
  nombre           text not null,
  entidad_emisora  text,
  documento_url    text,
  estado           cert_estado default 'pendiente',
  aprobada_por     uuid,
  aprobada_en      timestamptz,
  created_at       timestamptz default now()
);

-- tecnico_trabajos (portafolio antes/después)
create table if not exists tecnico_trabajos (
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

-- resenas
create table if not exists resenas (
  id               uuid primary key default uuid_generate_v4(),
  tecnico_id       uuid references tecnicos(id) on delete cascade,
  autor_nombre     text not null,
  autor_email      text,
  autor_user_id    uuid,
  autor_verificado boolean default false,
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
  respuesta_tecnico    text,
  respondido_en        timestamptz,
  aprobada             boolean default false,
  reportada            boolean default false,
  created_at           timestamptz default now()
);

create index if not exists idx_resenas_tecnico on resenas(tecnico_id);
create index if not exists idx_resenas_aprobada on resenas(aprobada);

-- cotizaciones
create table if not exists cotizaciones (
  id               uuid primary key default uuid_generate_v4(),
  tecnico_id       uuid references tecnicos(id) on delete cascade,
  cliente_nombre   text not null,
  cliente_email    text not null,
  cliente_telefono text,
  cliente_user_id  uuid,
  categoria_id     int references categorias(id),
  descripcion      text not null,
  fotos_urls       text[],
  urgencia         urgencia_tipo default 'normal',
  comuna_servicio  text,
  estado           cotizacion_estado default 'pendiente',
  respuesta        text,
  precio_cotizado  int,
  leida_en         timestamptz,
  respondida_en    timestamptz,
  created_at       timestamptz default now()
);

create index if not exists idx_cotizaciones_tecnico on cotizaciones(tecnico_id);
create index if not exists idx_cotizaciones_estado on cotizaciones(estado);

-- mensajes (hilo por cotización)
create table if not exists mensajes (
  id            uuid primary key default uuid_generate_v4(),
  tecnico_id    uuid references tecnicos(id) on delete cascade,
  cotizacion_id uuid references cotizaciones(id),
  remitente     text not null check (remitente in ('cliente','tecnico')),
  contenido     text not null,
  estado        mensaje_estado default 'no_leido',
  created_at    timestamptz default now()
);

-- suscripciones
create table if not exists suscripciones (
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

-- visitas
create table if not exists visitas (
  id               uuid primary key default uuid_generate_v4(),
  tecnico_id       uuid references tecnicos(id) on delete cascade,
  tipo             text check (tipo in ('perfil','contacto','whatsapp','cotizacion','telefono')),
  fecha            date default current_date,
  hora             int,
  region_visitante text
);

create index if not exists idx_visitas_tecnico_fecha on visitas(tecnico_id, fecha);

-- agenda
create table if not exists agenda (
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

-- clientes
create table if not exists clientes (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references auth.users(id) on delete cascade,
  nombre         text,
  email          text,
  telefono       text,
  created_at     timestamptz default now()
);

create table if not exists cliente_historial (
  id             uuid primary key default uuid_generate_v4(),
  cliente_id     uuid references clientes(id) on delete cascade,
  tecnico_id     uuid references tecnicos(id) on delete cascade,
  tipo           text check (tipo in ('contacto','cotizacion','resena')),
  created_at     timestamptz default now()
);

create table if not exists cliente_alertas (
  id             uuid primary key default uuid_generate_v4(),
  email          text not null,
  nombre         text,
  region_id      int references regiones(id),
  categoria_id   int references categorias(id),
  activa         boolean default true,
  created_at     timestamptz default now(),
  unique(email, region_id, categoria_id)
);

-- blog
create table if not exists blog_articulos (
  id             uuid primary key default uuid_generate_v4(),
  slug           text unique not null,
  titulo         text not null,
  resumen        text,
  contenido      text,
  imagen_url     text,
  categoria_id   int references categorias(id),
  region_id      int references regiones(id),
  autor          text default 'Equipo SoloTécnicos',
  publicado      boolean default false,
  visitas        int default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- comparaciones
create table if not exists comparaciones (
  id             uuid primary key default uuid_generate_v4(),
  tecnicos_ids   uuid[] not null,
  created_at     timestamptz default now()
);

-- ═══════════════════════════════════════════
-- FUNCIONES Y TRIGGERS
-- ═══════════════════════════════════════════
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

drop trigger if exists trigger_actualizar_ratings on resenas;
create trigger trigger_actualizar_ratings
after insert or update on resenas
for each row execute function actualizar_ratings_tecnico();

create or replace function generar_slug_tecnico()
returns trigger as $$
declare
  base_slug  text;
  final_slug text;
  contador   int := 0;
begin
  if NEW.slug is not null and NEW.slug != '' then
    return NEW;
  end if;
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

drop trigger if exists trigger_slug_tecnico on tecnicos;
create trigger trigger_slug_tecnico
before insert on tecnicos
for each row execute function generar_slug_tecnico();

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

create or replace function actualizar_badge_respuesta()
returns void as $$
begin
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

-- ═══════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════
alter table tecnicos                enable row level security;
alter table tecnico_fotos           enable row level security;
alter table tecnico_servicios       enable row level security;
alter table tecnico_certificaciones enable row level security;
alter table tecnico_trabajos        enable row level security;
alter table resenas                 enable row level security;
alter table cotizaciones            enable row level security;
alter table mensajes                enable row level security;
alter table suscripciones           enable row level security;
alter table visitas                 enable row level security;
alter table agenda                  enable row level security;
alter table clientes                enable row level security;
alter table cliente_historial       enable row level security;

drop policy if exists "tecnicos_publicos"     on tecnicos;
drop policy if exists "tecnico_edita_propio"  on tecnicos;
drop policy if exists "tecnico_crea"          on tecnicos;
create policy "tecnicos_publicos"     on tecnicos for select using (activo=true);
create policy "tecnico_edita_propio"  on tecnicos for update using (auth.uid()=user_id);
create policy "tecnico_crea"          on tecnicos for insert with check (auth.uid()=user_id);

drop policy if exists "fotos_publicas" on tecnico_fotos;
drop policy if exists "fotos_propias"  on tecnico_fotos;
create policy "fotos_publicas"        on tecnico_fotos for select using (true);
create policy "fotos_propias"         on tecnico_fotos for all using (
  tecnico_id in (select id from tecnicos where user_id=auth.uid()));

drop policy if exists "servicios_publicos" on tecnico_servicios;
drop policy if exists "servicios_propios"  on tecnico_servicios;
create policy "servicios_publicos"    on tecnico_servicios for select using (true);
create policy "servicios_propios"     on tecnico_servicios for all using (
  tecnico_id in (select id from tecnicos where user_id=auth.uid()));

drop policy if exists "trabajos_publicos" on tecnico_trabajos;
drop policy if exists "trabajos_propios"  on tecnico_trabajos;
create policy "trabajos_publicos"     on tecnico_trabajos for select using (true);
create policy "trabajos_propios"      on tecnico_trabajos for all using (
  tecnico_id in (select id from tecnicos where user_id=auth.uid()));

drop policy if exists "certs_publicas" on tecnico_certificaciones;
drop policy if exists "certs_propias"  on tecnico_certificaciones;
create policy "certs_publicas"        on tecnico_certificaciones for select using (estado='aprobada');
create policy "certs_propias"         on tecnico_certificaciones for all using (
  tecnico_id in (select id from tecnicos where user_id=auth.uid()));

drop policy if exists "resenas_publicas" on resenas;
drop policy if exists "resenas_insertar" on resenas;
create policy "resenas_publicas"      on resenas for select using (aprobada=true);
create policy "resenas_insertar"      on resenas for insert with check (true);

drop policy if exists "cotizaciones_tecnico" on cotizaciones;
drop policy if exists "cotizaciones_cliente" on cotizaciones;
create policy "cotizaciones_tecnico"  on cotizaciones for select using (
  tecnico_id in (select id from tecnicos where user_id=auth.uid()));
create policy "cotizaciones_cliente"  on cotizaciones for insert with check (true);

drop policy if exists "suscripciones_propias" on suscripciones;
create policy "suscripciones_propias" on suscripciones for select using (
  tecnico_id in (select id from tecnicos where user_id=auth.uid()));

drop policy if exists "clientes_propios" on clientes;
create policy "clientes_propios"      on clientes for all using (auth.uid()=user_id);

-- ═══════════════════════════════════════════
-- STORAGE BUCKETS
-- Crear en Supabase Dashboard → Storage:
--   tecnico-fotos       (público,  5MB, jpg/png/webp)
--   tecnico-documentos  (privado, 10MB, pdf/jpg/png)
--   cotizacion-fotos    (privado,  5MB, jpg/png/webp)
--   blog-imagenes       (público,  5MB, jpg/png/webp)
-- ═══════════════════════════════════════════
