-- ═══════════════════════════════════════════
-- MIGRATION V17: trigger de ratings considera DELETE + recalculo masivo
-- ═══════════════════════════════════════════
-- Fix: cuando se elimina una reseña, los ratings cacheados en `tecnicos`
-- no se actualizaban porque el trigger solo escuchaba INSERT/UPDATE.
-- Esta migración:
--   1. Reescribe la función para que use OLD.tecnico_id en DELETE.
--   2. Agrega DELETE al trigger.
--   3. Usa COALESCE para que sin reseñas el rating quede 0 (no NULL).
--   4. Recalcula todos los técnicos UNA VEZ para limpiar estado corrupto.
-- ═══════════════════════════════════════════

create or replace function actualizar_ratings_tecnico()
returns trigger as $$
declare
  tid uuid;
begin
  -- En DELETE no hay NEW, así que usamos OLD.
  if (TG_OP = 'DELETE') then
    tid := OLD.tecnico_id;
  else
    tid := NEW.tecnico_id;
  end if;

  update tecnicos set
    rating_atencion   = coalesce((select avg(rating_atencion)   from resenas where tecnico_id=tid and aprobada=true), 0),
    rating_calidad    = coalesce((select avg(rating_calidad)    from resenas where tecnico_id=tid and aprobada=true), 0),
    rating_respuesta  = coalesce((select avg(rating_respuesta)  from resenas where tecnico_id=tid and aprobada=true), 0),
    rating_resolucion = coalesce((select avg(rating_resolucion) from resenas where tecnico_id=tid and aprobada=true), 0),
    rating_rapidez    = coalesce((select avg(rating_rapidez)    from resenas where tecnico_id=tid and aprobada=true), 0),
    rating_precio     = coalesce((select avg(rating_precio)     from resenas where tecnico_id=tid and aprobada=true), 0),
    rating_garantia   = coalesce((select avg(rating_garantia)   from resenas where tecnico_id=tid and aprobada=true), 0),
    rating_promedio   = coalesce((select avg(rating_promedio)   from resenas where tecnico_id=tid and aprobada=true), 0),
    total_resenas     = (select count(*) from resenas where tecnico_id=tid and aprobada=true),
    updated_at        = now()
  where id = tid;

  -- Retornar la fila adecuada según la operación
  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

-- Recrear el trigger para que también dispare en DELETE
drop trigger if exists trigger_actualizar_ratings on resenas;
create trigger trigger_actualizar_ratings
after insert or update or delete on resenas
for each row execute function actualizar_ratings_tecnico();

-- Recalculo masivo: arregla cualquier técnico con rating desactualizado
-- (incluyendo el que acabás de quedar con la reseña fantasma)
update tecnicos t set
  rating_atencion   = coalesce((select avg(rating_atencion)   from resenas where tecnico_id=t.id and aprobada=true), 0),
  rating_calidad    = coalesce((select avg(rating_calidad)    from resenas where tecnico_id=t.id and aprobada=true), 0),
  rating_respuesta  = coalesce((select avg(rating_respuesta)  from resenas where tecnico_id=t.id and aprobada=true), 0),
  rating_resolucion = coalesce((select avg(rating_resolucion) from resenas where tecnico_id=t.id and aprobada=true), 0),
  rating_rapidez    = coalesce((select avg(rating_rapidez)    from resenas where tecnico_id=t.id and aprobada=true), 0),
  rating_precio     = coalesce((select avg(rating_precio)     from resenas where tecnico_id=t.id and aprobada=true), 0),
  rating_garantia   = coalesce((select avg(rating_garantia)   from resenas where tecnico_id=t.id and aprobada=true), 0),
  rating_promedio   = coalesce((select avg(rating_promedio)   from resenas where tecnico_id=t.id and aprobada=true), 0),
  total_resenas     = (select count(*) from resenas where tecnico_id=t.id and aprobada=true);

notify pgrst, 'reload schema';
