-- ─── Patch v1.5 — RLS update policies + pendientes por ciudad ────────────────
-- Run AFTER patch-v1.4.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query → Paste → Run

-- 1. Allow app to update personas (pasaporte_status, etc.)
DO $$ BEGIN
  CREATE POLICY "public_update" ON personas FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Allow app to update hoteles (confirmacion, precio, notas, etc.)
DO $$ BEGIN
  CREATE POLICY "public_update" ON hoteles FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Allow app to update vuelos (PNR, confirmado, empresa, numero)
DO $$ BEGIN
  CREATE POLICY "public_update" ON vuelos FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Assign ciudad to existing pendientes
UPDATE pendientes SET ciudad = 'Londres'  WHERE titulo ILIKE '%eurostar%';
UPDATE pendientes SET ciudad = 'Paris'    WHERE titulo ILIKE '%thalys%';
UPDATE pendientes SET ciudad = 'Paris'    WHERE titulo ILIKE '%alojamiento paris%';
UPDATE pendientes SET ciudad = 'Bruselas' WHERE titulo ILIKE '%bru-rom%';
UPDATE pendientes SET ciudad = 'Roma'     WHERE titulo ILIKE '%ib0648%';
UPDATE pendientes SET ciudad = 'Madrid'   WHERE titulo ILIKE '%ib0101%';

-- 5. Add city-specific pendientes
INSERT INTO pendientes (viaje_id, categoria, titulo, hecho, urgente, prioridad, familia, ciudad) VALUES
(
  (SELECT id FROM viajes LIMIT 1),
  'documentacion',
  'ETA Reino Unido — tramitar en eta.homeoffice.gov.uk',
  false, true, 'alta', 'Todas', 'Londres'
),
(
  (SELECT id FROM viajes LIMIT 1),
  'documentacion',
  'ETIAS Schengen — tramitar cuando abra el sistema',
  false, false, 'media', 'Todas', 'Paris'
),
(
  (SELECT id FROM viajes LIMIT 1),
  'logistica',
  'Traslado privado aeropuerto FCO — confirmar con Monza/Downtown Travel',
  false, false, 'media', 'Todas', 'Roma'
);
