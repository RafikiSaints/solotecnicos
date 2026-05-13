-- ═══════════════════════════════════════════
-- MIGRATION V12: Logo de empresa
-- ═══════════════════════════════════════════

alter table tecnicos
  add column if not exists logo_url text,
  add column if not exists logo_storage_path text;

comment on column tecnicos.logo_url is 'URL del logo de empresa (avatar circular del perfil)';
