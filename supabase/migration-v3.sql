-- ═══════════════════════════════════════════
-- MIGRATION V3: notas internas + estado "contactada"
-- ═══════════════════════════════════════════

-- Notas privadas del técnico sobre cada cotización
alter table cotizaciones
  add column if not exists notas_internas text;

-- Agregar nuevo estado "contactada" si no existe
-- (en el enum cotizacion_estado)
do $$
begin
  if not exists (select 1 from pg_enum where enumtypid = 'cotizacion_estado'::regtype and enumlabel = 'contactada') then
    alter type cotizacion_estado add value 'contactada' before 'cerrada';
  end if;
end $$;
