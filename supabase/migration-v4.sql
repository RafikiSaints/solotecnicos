-- ═══════════════════════════════════════════
-- MIGRATION V4: Etiquetas de servicio (tags)
-- ═══════════════════════════════════════════

-- Columna de etiquetas (array de texto)
alter table tecnicos
  add column if not exists etiquetas text[] default '{}';

-- Índice GIN para búsqueda rápida por etiqueta
create index if not exists idx_tecnicos_etiquetas on tecnicos using gin(etiquetas);

comment on column tecnicos.etiquetas is 'Etiquetas de servicio (palabras clave) — ej: lavadoras, computadores, climatización';
