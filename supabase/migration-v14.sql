-- ═══════════════════════════════════════════
-- MIGRATION V14: Categorías destacadas + 10 nuevas categorías
-- (idempotente — se puede ejecutar varias veces sin problema)
-- ═══════════════════════════════════════════

-- 1. Agregar columna 'destacada' a categorias
alter table categorias
  add column if not exists destacada boolean default false;

-- 2. Insertar las 10 categorías nuevas (con destacada en false por defecto)
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

-- 3. Marcar las más populares como destacadas (top 10)
update categorias set destacada = true where slug in (
  'climatizacion',
  'electricidad',
  'gasfiteria',
  'computadores',
  'celulares',
  'lavadoras',
  'mecanica',
  'cerrajeria',
  'refrigeracion',
  'pintura'
);

-- Las demás quedan en false (se ven en /categorias pero no en el home)
