-- ═══════════════════════════════════════════
-- MIGRATION V13: Nuevas categorías de oficios
-- (idempotente — usa on conflict do nothing)
-- ═══════════════════════════════════════════

insert into categorias (nombre, slug, icono, orden) values
  ('Pintura y construcción',         'pintura',       '🎨', 16),
  ('Albañilería y obra menor',       'albanileria',   '🧱', 17),
  ('Jardinería y áreas verdes',      'jardineria',    '🌿', 18),
  ('Mudanzas y fletes',              'mudanzas',      '🚛', 19),
  ('Limpieza profunda',              'limpieza',      '🧹', 20),
  ('Reparación de muebles',          'muebleria',     '🛋️', 21),
  ('Carpintería',                    'carpinteria',   '🪵', 22),
  ('Soldadura y herrería',           'soldadura',     '🔥', 23),
  ('Aire acondicionado de auto',     'aire-auto',     '🚗', 24),
  ('Plomería industrial',            'plomeria-industrial', '🔧', 25)
on conflict (slug) do nothing;
