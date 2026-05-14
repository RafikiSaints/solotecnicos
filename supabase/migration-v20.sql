-- ═══════════════════════════════════════════
-- MIGRATION V20: agregar comuna a clientes
-- ═══════════════════════════════════════════
-- Para auto-rellenar la cotizacion con la comuna del cliente la próxima
-- vez que la solicite. Se guarda automáticamente cuando envía una
-- cotización (último valor de comuna_servicio).
-- ═══════════════════════════════════════════

alter table clientes
  add column if not exists comuna text;

notify pgrst, 'reload schema';
