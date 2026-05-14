-- ═══════════════════════════════════════════
-- MIGRATION V19: separar "oculta" (admin) de "reportada" (técnico)
-- ═══════════════════════════════════════════
-- Cambio de semántica:
--   oculta=true   → admin la sacó del perfil público (no se muestra ni cuenta)
--   reportada=true → el técnico marcó la reseña como problemática (sigue
--                    visible y contando, hasta que admin decida).
--
-- Antes ambas vivían en `reportada` (la habíamos repurposeado para "oculta").
-- ═══════════════════════════════════════════

-- Nuevas columnas
alter table resenas
  add column if not exists oculta boolean default false,
  add column if not exists reportada_motivo text,
  add column if not exists reportada_en timestamptz;

-- Migrar datos viejos: lo que estaba como reportada=true (era nuestro "hide")
-- pasa a oculta=true; reportada se resetea para uso real del técnico.
update resenas set oculta = true where reportada = true;
update resenas set reportada = false where reportada = true;

create index if not exists idx_resenas_reportada on resenas(reportada) where reportada = true;
create index if not exists idx_resenas_oculta on resenas(oculta);

-- ─── Actualizar trigger: ahora la visibilidad/conteo dependen de oculta ───
create or replace function actualizar_ratings_tecnico()
returns trigger as $$
declare
  tid uuid;
begin
  if (TG_OP = 'DELETE') then
    tid := OLD.tecnico_id;
  else
    tid := NEW.tecnico_id;
  end if;

  update tecnicos set
    rating_atencion   = coalesce((select avg(rating_atencion)   from resenas where tecnico_id=tid and oculta=false), 0),
    rating_calidad    = coalesce((select avg(rating_calidad)    from resenas where tecnico_id=tid and oculta=false), 0),
    rating_respuesta  = coalesce((select avg(rating_respuesta)  from resenas where tecnico_id=tid and oculta=false), 0),
    rating_resolucion = coalesce((select avg(rating_resolucion) from resenas where tecnico_id=tid and oculta=false), 0),
    rating_rapidez    = coalesce((select avg(rating_rapidez)    from resenas where tecnico_id=tid and oculta=false), 0),
    rating_precio     = coalesce((select avg(rating_precio)     from resenas where tecnico_id=tid and oculta=false), 0),
    rating_garantia   = coalesce((select avg(rating_garantia)   from resenas where tecnico_id=tid and oculta=false), 0),
    rating_promedio   = coalesce((select avg(rating_promedio)   from resenas where tecnico_id=tid and oculta=false), 0),
    total_resenas     = (select count(*) from resenas where tecnico_id=tid and oculta=false),
    updated_at        = now()
  where id = tid;

  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

drop trigger if exists trigger_actualizar_ratings on resenas;
create trigger trigger_actualizar_ratings
after insert or update or delete on resenas
for each row execute function actualizar_ratings_tecnico();

-- Recalculo masivo aplicando el nuevo criterio
update tecnicos t set
  rating_atencion   = coalesce((select avg(rating_atencion)   from resenas where tecnico_id=t.id and oculta=false), 0),
  rating_calidad    = coalesce((select avg(rating_calidad)    from resenas where tecnico_id=t.id and oculta=false), 0),
  rating_respuesta  = coalesce((select avg(rating_respuesta)  from resenas where tecnico_id=t.id and oculta=false), 0),
  rating_resolucion = coalesce((select avg(rating_resolucion) from resenas where tecnico_id=t.id and oculta=false), 0),
  rating_rapidez    = coalesce((select avg(rating_rapidez)    from resenas where tecnico_id=t.id and oculta=false), 0),
  rating_precio     = coalesce((select avg(rating_precio)     from resenas where tecnico_id=t.id and oculta=false), 0),
  rating_garantia   = coalesce((select avg(rating_garantia)   from resenas where tecnico_id=t.id and oculta=false), 0),
  rating_promedio   = coalesce((select avg(rating_promedio)   from resenas where tecnico_id=t.id and oculta=false), 0),
  total_resenas     = (select count(*) from resenas where tecnico_id=t.id and oculta=false);

notify pgrst, 'reload schema';
