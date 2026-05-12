-- ═══════════════════════════════════════════
-- MIGRATION V11: Sistema completo de cuentas cliente
-- ═══════════════════════════════════════════

-- Asegurar columnas existen (la tabla clientes ya estaba en el schema base)
alter table clientes
  add column if not exists nombre text,
  add column if not exists email text,
  add column if not exists telefono text;

-- Policies: cliente puede gestionar su propio perfil
drop policy if exists "clientes_propios" on clientes;
create policy "clientes_select_propio" on clientes for select using (auth.uid() = user_id);
create policy "clientes_insert_propio" on clientes for insert with check (auth.uid() = user_id);
create policy "clientes_update_propio" on clientes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- COTIZACIONES: cliente puede ver las suyas (las que envió como cliente_user_id)
drop policy if exists "cotizaciones_cliente_select" on cotizaciones;
create policy "cotizaciones_cliente_select" on cotizaciones for select
  using (cliente_user_id = auth.uid());

-- RESEÑAS: cliente puede ver/editar/eliminar las suyas
drop policy if exists "resenas_cliente_select_propias" on resenas;
create policy "resenas_cliente_select_propias" on resenas for select
  using (autor_user_id = auth.uid());

drop policy if exists "resenas_cliente_update_propias" on resenas;
create policy "resenas_cliente_update_propias" on resenas for update
  using (autor_user_id = auth.uid())
  with check (autor_user_id = auth.uid());

drop policy if exists "resenas_cliente_delete_propias" on resenas;
create policy "resenas_cliente_delete_propias" on resenas for delete
  using (autor_user_id = auth.uid());
