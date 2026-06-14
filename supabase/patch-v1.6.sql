-- ─── Patch v1.6 — Eurostar PNR, pasaportes, autorizaciones, ETIAS por ciudad ──
-- Run AFTER patch-v1.5.sql
-- Supabase Dashboard → SQL Editor → New Query → Paste → Run

-- 1. Add autorizacion_status column to personas
ALTER TABLE personas ADD COLUMN IF NOT EXISTS autorizacion_status TEXT DEFAULT 'no_aplica';

-- 2. Eurostar LON-PAR: PNR Nader + marcar confirmado
UPDATE vuelos
SET pnr       = pnr || '{"Nader": "RZN7P2"}'::jsonb,
    confirmado = true
WHERE id = 'LON-PAR';

-- 3. Santiago Nader: pasaporte pendiente
UPDATE personas
SET pasaporte_status = 'pending'
WHERE nombre ILIKE '%Santiago%' AND familia = 'Nader';

-- 4. Julieta Ahmad: necesita autorización de viaje / acta de nacimiento
UPDATE personas
SET autorizacion_status = 'pendiente'
WHERE nombre ILIKE '%Julieta%' AND familia = 'Ahmad';

-- 5. Macarena Barrera Posleman: necesita autorización de viaje / acta de nacimiento
UPDATE personas
SET autorizacion_status = 'pendiente'
WHERE nombre ILIKE '%Macarena%' AND familia = 'Barrera';

-- 6. Agregar pendiente para pasaporte de Santiago Nader
INSERT INTO pendientes (viaje_id, categoria, titulo, hecho, urgente, prioridad, familia)
SELECT id, 'documentacion', 'Pasaporte Santiago Nader', false, true, 'alta', 'Nader'
FROM viajes LIMIT 1;

-- 7. Pendientes de autorización de viaje
INSERT INTO pendientes (viaje_id, categoria, titulo, hecho, urgente, prioridad, familia) VALUES
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'Autorización de viaje / acta de nacimiento — Julieta Ahmad', false, true, 'alta', 'Ahmad'),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'Autorización de viaje / acta de nacimiento — Macarena Barrera Posleman', false, true, 'alta', 'Barrera');

-- 8. ETA y ETIAS por ciudad
-- Londres ya tiene ETA en patch-v1.5, y ETIAS Paris también.
-- Agregar ETIAS para las ciudades Schengen restantes:
INSERT INTO pendientes (viaje_id, categoria, titulo, hecho, urgente, prioridad, familia, ciudad) VALUES
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'ETIAS Schengen — tramitar cuando abra el sistema', false, false, 'media', 'Todas', 'Bruselas'),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'ETIAS Schengen — tramitar cuando abra el sistema', false, false, 'media', 'Todas', 'Roma'),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'ETIAS Schengen — tramitar cuando abra el sistema', false, false, 'media', 'Todas', 'Madrid');
