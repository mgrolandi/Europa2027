-- ─── Patch v1.10 — Mamma Mia confirmada + vuelo SAO-LON BA0246 confirmado ────
-- Supabase Dashboard → SQL Editor → New Query → Paste → Run

-- 1. Mamma Mia — West End (actividad confirmada en Londres)
--    Novello Theatre · Aldwych, London WC2B 4LD
--    Lunes 1/feb/2027 · 19:30 · £17.50 / USD 42 por persona
INSERT INTO actividades (viaje_id, ciudad, nombre, categoria, fecha, hora, precio, confirmada, notas)
VALUES (
  (SELECT id FROM viajes LIMIT 1),
  'Londres',
  'Mamma Mia — West End',
  'show',
  '2027-02-01',
  '19:30',
  'GBP 17.50 / USD 42 pp',
  true,
  'Novello Theatre · Aldwych, London WC2B 4LD. Subir voucher de entrada.'
);

-- 2. Vuelo SAO-LON BA0246 — marcar como confirmado
--    (PNR de Barrera y Ahmad aún pendiente, pero el vuelo está confirmado)
UPDATE vuelos
SET confirmado = true
WHERE numero = 'BA0246'
   OR (origen ILIKE '%São Paulo%' AND destino ILIKE '%Londres%')
   OR (origen = 'SAO' AND destino = 'LON');
