-- ═══════════════════════════════════════════
-- MIGRATION V21: redes sociales del técnico
-- ═══════════════════════════════════════════
-- 4 nuevas columnas opcionales para mostrar los links a redes sociales
-- en el perfil público. Si están null, no aparecen los botones.
-- ═══════════════════════════════════════════

alter table tecnicos
  add column if not exists facebook_url  text,
  add column if not exists instagram_url text,
  add column if not exists youtube_url   text,
  add column if not exists tiktok_url    text;

notify pgrst, 'reload schema';
