-- ═══════════════════════════════════════════
-- MIGRATION V5: Policies para agenda y suscripciones
-- ═══════════════════════════════════════════

-- AGENDA: el técnico puede ver/crear/editar/borrar sus propias citas
drop policy if exists "agenda_select" on agenda;
drop policy if exists "agenda_insert" on agenda;
drop policy if exists "agenda_update" on agenda;
drop policy if exists "agenda_delete" on agenda;

create policy "agenda_select" on agenda for select
  using (tecnico_id in (select id from tecnicos where user_id = auth.uid()));

create policy "agenda_insert" on agenda for insert
  with check (tecnico_id in (select id from tecnicos where user_id = auth.uid()));

create policy "agenda_update" on agenda for update
  using (tecnico_id in (select id from tecnicos where user_id = auth.uid()))
  with check (tecnico_id in (select id from tecnicos where user_id = auth.uid()));

create policy "agenda_delete" on agenda for delete
  using (tecnico_id in (select id from tecnicos where user_id = auth.uid()));

-- SUSCRIPCIONES: el técnico puede actualizar sus propias (para cancelar)
drop policy if exists "suscripciones_update_propias" on suscripciones;
create policy "suscripciones_update_propias" on suscripciones for update
  using (tecnico_id in (select id from tecnicos where user_id = auth.uid()))
  with check (tecnico_id in (select id from tecnicos where user_id = auth.uid()));
