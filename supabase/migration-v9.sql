-- ═══════════════════════════════════════════
-- MIGRATION V9: Claim profile (técnicos pre-cargados reclaman su cuenta)
-- ═══════════════════════════════════════════

create table if not exists claim_requests (
  id              uuid primary key default uuid_generate_v4(),
  tecnico_id      uuid references tecnicos(id) on delete cascade,
  email           text not null,
  telefono        text,
  nombre_solicitante text,
  mensaje         text,
  estado          text not null default 'pendiente' check (estado in ('pendiente','aprobada','rechazada')),
  motivo_rechazo  text,
  aprobada_por    uuid,
  aprobada_en     timestamptz,
  user_id_creado  uuid references auth.users(id),
  created_at      timestamptz default now()
);

create index if not exists idx_claims_tecnico on claim_requests(tecnico_id);
create index if not exists idx_claims_estado on claim_requests(estado);

alter table claim_requests enable row level security;

-- Cualquiera puede INSERT (es público — desde el perfil del técnico)
drop policy if exists "claims_insert_public" on claim_requests;
create policy "claims_insert_public" on claim_requests for insert with check (true);

-- Solo admin puede ver/actualizar
drop policy if exists "claims_admin_all" on claim_requests;
create policy "claims_admin_all" on claim_requests for all
  using (es_admin())
  with check (es_admin());
