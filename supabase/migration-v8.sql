-- ═══════════════════════════════════════════
-- MIGRATION V8: Policies de admin para lectura/escritura amplia
-- ═══════════════════════════════════════════
-- NOTA: las páginas admin del lado servidor usan service_role (saltan RLS),
-- pero estas policies sirven para client-side actions (ej: moderar reseñas desde UI).

create or replace function es_admin() returns boolean as $$
  select coalesce(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  );
$$ language sql stable;

-- TECNICOS: admin puede update/delete
drop policy if exists "tecnicos_admin_all" on tecnicos;
create policy "tecnicos_admin_all" on tecnicos for all
  using (es_admin())
  with check (es_admin());

-- RESEÑAS: admin puede ver todas, aprobar, eliminar
drop policy if exists "resenas_admin_all" on resenas;
create policy "resenas_admin_all" on resenas for all
  using (es_admin())
  with check (es_admin());

-- Permitir SELECT también de no aprobadas para admin (mantener la pública)
drop policy if exists "resenas_admin_select" on resenas;
create policy "resenas_admin_select" on resenas for select using (es_admin());

-- CERTIFICACIONES: admin puede aprobar/rechazar/eliminar
drop policy if exists "certs_admin_all" on tecnico_certificaciones;
create policy "certs_admin_all" on tecnico_certificaciones for all
  using (es_admin())
  with check (es_admin());

-- SUSCRIPCIONES: admin puede ver todas
drop policy if exists "suscripciones_admin_select" on suscripciones;
create policy "suscripciones_admin_select" on suscripciones for select using (es_admin());

-- BLOG: admin puede crear/editar/eliminar
alter table blog_articulos enable row level security;

drop policy if exists "blog_select_public" on blog_articulos;
create policy "blog_select_public" on blog_articulos for select using (publicado = true or es_admin());

drop policy if exists "blog_admin_all" on blog_articulos;
create policy "blog_admin_all" on blog_articulos for all
  using (es_admin())
  with check (es_admin());
