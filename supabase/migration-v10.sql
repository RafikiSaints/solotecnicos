-- ═══════════════════════════════════════════
-- MIGRATION V10: Video promocional (Elite)
-- ═══════════════════════════════════════════

alter table tecnicos
  add column if not exists video_url text;

comment on column tecnicos.video_url is 'URL de video YouTube/Vimeo para mostrar en el perfil. Solo plan Elite.';
