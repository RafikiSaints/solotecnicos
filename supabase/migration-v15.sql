-- ═══════════════════════════════════════════
-- MIGRATION V15: Rating de Google (importado manualmente)
-- ═══════════════════════════════════════════

alter table tecnicos
  add column if not exists google_rating decimal(3,2) default 0,
  add column if not exists google_total_resenas int default 0;

comment on column tecnicos.google_rating is 'Rating actual del técnico en Google My Business / Maps (ingresado manualmente)';
comment on column tecnicos.google_total_resenas is 'Cantidad de reseñas en Google (ingresado manualmente)';

notify pgrst, 'reload schema';
