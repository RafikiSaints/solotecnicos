-- ═══════════════════════════════════════════
-- MIGRATION V7: Campo libre "Puntos de atención"
-- ═══════════════════════════════════════════

alter table tecnicos
  add column if not exists sucursales_texto text;

comment on column tecnicos.sucursales_texto is 'Descripción libre de sucursales / puntos de atención adicionales. Visible solo PRO/Elite.';
