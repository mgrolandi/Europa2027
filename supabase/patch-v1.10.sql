-- Patch v1.10 - Mamma Mia confirmada + vuelo SAO-LON BA0246 confirmado
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste -> Run

-- Verificar primero que no exista ya (evitar duplicado)
DELETE FROM actividades WHERE ciudad = 'Londres' AND nombre ILIKE '%Mamma Mia%';

-- Insertar Mamma Mia - West End
-- Novello Theatre, Aldwych, London WC2B 4LD
-- Lunes 1/feb/2027 - 19:30 - GBP 17.50 / USD 42 por persona
INSERT INTO actividades (viaje_id, ciudad, nombre, categoria, fecha, hora, precio, confirmada, notas)
SELECT
  id,
  'Londres',
  'Mamma Mia - West End',
  'show',
  '2027-02-01',
  '19:30',
  'GBP 17.50 / USD 42 pp',
  true,
  'Novello Theatre - Aldwych, London WC2B 4LD. Subir voucher de entrada.'
FROM viajes
LIMIT 1;

-- Vuelo BA0246 SAO-LON - marcar como confirmado
UPDATE vuelos SET confirmado = true
WHERE numero = 'BA0246'
   OR (origen = 'SAO' AND destino = 'LON');

-- Verificar resultado
SELECT nombre, ciudad, fecha, hora, precio, confirmada FROM actividades WHERE ciudad = 'Londres' ORDER BY fecha;
