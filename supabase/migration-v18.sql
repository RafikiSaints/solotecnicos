-- ═══════════════════════════════════════════
-- MIGRATION V18: rating cuenta TODAS las reseñas visibles
-- ═══════════════════════════════════════════
-- Cambio de criterio:
--   ANTES: solo reseñas con aprobada=true contaban en el rating.
--   AHORA: cuentan todas las reseñas visibles (reportada=false), sin
--          importar si están "Por revisar" o "Verificadas".
-- Razón: el badge "Por revisar" pasa a ser solo un sello visual de moderación.
-- La verificación admin no cambia el cálculo de rating, solo el badge.
-- ═══════════════════════════════════════════

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
    rating_atencion   = coalesce((select avg(rating_atencion)   from resenas where tecnico_id=tid and reportada=false), 0),
    rating_calidad    = coalesce((select avg(rating_calidad)    from resenas where tecnico_id=tid and reportada=false), 0),
    rating_respuesta  = coalesce((select avg(rating_respuesta)  from resenas where tecnico_id=tid and reportada=false), 0),
    rating_resolucion = coalesce((select avg(rating_resolucion) from resenas where tecnico_id=tid and reportada=false), 0),
    rating_rapidez    = coalesce((select avg(rating_rapidez)    from resenas where tecnico_id=tid and reportada=false), 0),
    rating_precio     = coalesce((select avg(rating_precio)     from resenas where tecnico_id=tid and reportada=false), 0),
    rating_garantia   = coalesce((select avg(rating_garantia)   from resenas where tecnico_id=tid and reportada=false), 0),
    rating_promedio   = coalesce((select avg(rating_promedio)   from resenas where tecnico_id=tid and reportada=false), 0),
    total_resenas     = (select count(*) from resenas where tecnico_id=tid and reportada=false),
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
  rating_atencion   = coalesce((select avg(rating_atencion)   from resenas where tecnico_id=t.id and reportada=false), 0),
  rating_calidad    = coalesce((select avg(rating_calidad)    from resenas where tecnico_id=t.id and reportada=false), 0),
  rating_respuesta  = coalesce((select avg(rating_respuesta)  from resenas where tecnico_id=t.id and reportada=false), 0),
  rating_resolucion = coalesce((select avg(rating_resolucion) from resenas where tecnico_id=t.id and reportada=false), 0),
  rating_rapidez    = coalesce((select avg(rating_rapidez)    from resenas where tecnico_id=t.id and reportada=false), 0),
  rating_precio     = coalesce((select avg(rating_precio)     from resenas where tecnico_id=t.id and reportada=false), 0),
  rating_garantia   = coalesce((select avg(rating_garantia)   from resenas where tecnico_id=t.id and reportada=false), 0),
  rating_promedio   = coalesce((select avg(rating_promedio)   from resenas where tecnico_id=t.id and reportada=false), 0),
  total_resenas     = (select count(*) from resenas where tecnico_id=t.id and reportada=false);

notify pgrst, 'reload schema';
