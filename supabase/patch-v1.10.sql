-- Patch v1.10 - Tabla actividades + Mamma Mia + vuelo SAO-LON confirmado
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste -> Run

-- 1. Crear tabla actividades
CREATE TABLE IF NOT EXISTS actividades (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id     UUID REFERENCES viajes(id) ON DELETE CASCADE,
  ciudad       TEXT NOT NULL,
  nombre       TEXT NOT NULL,
  categoria    TEXT DEFAULT 'entrada',
  fecha        DATE,
  hora         TEXT,
  confirmacion TEXT,
  precio       TEXT,
  confirmada   BOOLEAN DEFAULT false,
  notas        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "actividades_select" ON actividades FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "actividades_insert" ON actividades FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "actividades_update" ON actividades FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "actividades_delete" ON actividades FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Columnas en documentos para vouchers de actividades
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS entidad_id UUID;
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS entidad_tipo TEXT DEFAULT 'persona';

-- 4. Mamma Mia - West End (confirmada, 1/feb/2027, 19:30)
INSERT INTO actividades (viaje_id, ciudad, nombre, categoria, fecha, hora, precio, confirmada, notas)
SELECT id, 'Londres', 'Mamma Mia - West End', 'show', '2027-02-01', '19:30', 'GBP 17.50 / USD 42 pp', true, 'Novello Theatre - Aldwych, London WC2B 4LD'
FROM viajes LIMIT 1;

-- 5. Vuelo BA0246 SAO-LON - confirmado
UPDATE vuelos SET confirmado = true
WHERE numero = 'BA0246'
   OR (origen = 'SAO' AND destino = 'LON');
