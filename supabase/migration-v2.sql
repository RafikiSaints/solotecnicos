-- ═══════════════════════════════════════════
-- MIGRATION V2: Google integrations + locales
-- Ejecutar en SQL Editor de Supabase
-- ═══════════════════════════════════════════

alter table tecnicos
  add column if not exists link_google_maps text,
  add column if not exists link_google_business text;

-- Actualizar tipos
comment on column tecnicos.link_google_maps is 'URL completa a Google Maps (ej: https://maps.app.goo.gl/xxx)';
comment on column tecnicos.link_google_business is 'URL del perfil de Google My Business';
