-- ═══════════════════════════════════════════
-- MIGRATION V6: Policies categorías (admin manage)
-- ═══════════════════════════════════════════

-- Por defecto categorías era pública para SELECT, pero no había policies para insert/update/delete.
-- Permitir todo a usuarios con rol "admin" en user_metadata.

alter table categorias enable row level security;

drop policy if exists "categorias_select_public" on categorias;
create policy "categorias_select_public" on categorias for select using (true);

drop policy if exists "categorias_admin_all" on categorias;
create policy "categorias_admin_all" on categorias for all
  using ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin')
  with check ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');

-- Mismo para regiones por si quieres editarlas
alter table regiones enable row level security;
drop policy if exists "regiones_select_public" on regiones;
create policy "regiones_select_public" on regiones for select using (true);

drop policy if exists "regiones_admin_all" on regiones;
create policy "regiones_admin_all" on regiones for all
  using ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin')
  with check ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');
