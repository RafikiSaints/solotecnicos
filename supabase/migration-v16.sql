-- ═══════════════════════════════════════════
-- MIGRATION V16: Consolidado de todas las columnas que la app necesita.
-- Idempotente: seguro ejecutarlo varias veces.
-- ═══════════════════════════════════════════

-- v2: links de Google
alter table tecnicos
  add column if not exists link_google_maps text,
  add column if not exists link_google_business text;

-- v4: etiquetas / palabras clave
alter table tecnicos
  add column if not exists etiquetas text[] default '{}';
create index if not exists idx_tecnicos_etiquetas on tecnicos using gin(etiquetas);

-- v7: sucursales en texto libre
alter table tecnicos
  add column if not exists sucursales_texto text;

-- v10: video promocional
alter table tecnicos
  add column if not exists video_url text;

-- v13: logo de empresa
alter table tecnicos
  add column if not exists logo_url text,
  add column if not exists logo_storage_path text;

-- v15: rating importado de Google
alter table tecnicos
  add column if not exists google_rating decimal(3,2) default 0,
  add column if not exists google_total_resenas int default 0;

-- categorias destacadas (v14)
alter table categorias
  add column if not exists destacada boolean default false;

-- Refrescar el schema cache de PostgREST
notify pgrst, 'reload schema';
