-- ─── Patch combinado v1.4 + v1.5 + v1.6 ─────────────────────────────────────
-- Correr en: Supabase Dashboard → SQL Editor → New Query → Run
-- Si ya corriste alguno antes, no pasa nada — los UPDATE son idempotentes.

-- ══════════════════════════════════════════════════════════════════
-- PATCH v1.4 — Hotel Bruselas + reset pendientes
-- ══════════════════════════════════════════════════════════════════

UPDATE hoteles
SET nombre    = 'Hotel NH Brussels Carrefour de l''Europe',
    direccion = 'Rue du Marché aux Herbes 110, 1000 Bruxelles, Bélgica',
    maps_url  = 'https://maps.google.com/?q=Rue+du+Marche+aux+Herbes+110+1000+Bruxelles'
WHERE ciudad = 'Bruselas';

UPDATE hoteles
SET confirmacion = '73474107361490 / 73474100905258',
    precio       = 'EUR 423.00',
    habitacion   = '1 doble (2 Barrera) + 2 Barrera en Cuadruple A + 1 Barrera en Cuadruple B',
    notas        = '5 pax repartidos entre 3 habitaciones'
WHERE ciudad = 'Bruselas' AND familia = 'Barrera';

UPDATE hoteles
SET confirmacion = '73474107361490 / 73474100905258',
    precio       = 'EUR 423.00',
    habitacion   = '1 doble (2 Nader) + Cuadruple B (3 Nader)',
    notas        = '5 pax repartidos entre 2 habitaciones'
WHERE ciudad = 'Bruselas' AND familia = 'Nader';

UPDATE hoteles
SET confirmacion = '73474107361490 / 73474100905258',
    precio       = 'EUR 351.41',
    habitacion   = '1 doble (2 Ahmad) + Cuadruple A (2 Ahmad)',
    notas        = '4 pax repartidos entre 2 habitaciones'
WHERE ciudad = 'Bruselas' AND familia = 'Ahmad';

DELETE FROM pendientes;

INSERT INTO pendientes (viaje_id, categoria, titulo, hecho, urgente, prioridad, familia, ciudad) VALUES
((SELECT id FROM viajes LIMIT 1), 'transportes',   'PNR Barrera y Ahmad — BA0246 SAO-LON',               false, true,  'alta',  'Barrera/Ahmad', null),
((SELECT id FROM viajes LIMIT 1), 'transportes',   'PNR Barrera y Ahmad — IB0648 ROM-MAD',               false, true,  'alta',  'Barrera/Ahmad', 'Roma'),
((SELECT id FROM viajes LIMIT 1), 'transportes',   'PNR todas las familias — IB0101 MAD-EZE',            false, true,  'alta',  'Todas',         'Madrid'),
((SELECT id FROM viajes LIMIT 1), 'transportes',   'Reserva tren Eurostar LON-PAR (PNR Barrera y Ahmad)', false, true,  'alta',  'Barrera/Ahmad', 'Londres'),
((SELECT id FROM viajes LIMIT 1), 'transportes',   'Reserva tren Thalys PAR-BRU',                        false, true,  'alta',  'Todas',         'Paris'),
((SELECT id FROM viajes LIMIT 1), 'transportes',   'Vuelo BRU-ROM (aerolínea y número)',                  false, true,  'alta',  'Todas',         'Bruselas'),
((SELECT id FROM viajes LIMIT 1), 'transportes',   'Alojamiento París — Barrera',                        false, true,  'alta',  'Barrera',       'Paris'),
((SELECT id FROM viajes LIMIT 1), 'logistica',     'Asignación habitaciones Roma entre familias',         false, false, 'baja',  'Todas',         'Roma'),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'Pasaporte Lucas Barrera Posleman',                   false, true,  'alta',  'Barrera',       null),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'Pasaporte Tomas Nader',                              false, true,  'alta',  'Nader',         null),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'Pasaporte Santiago Nader',                           false, true,  'alta',  'Nader',         null),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'Pasaporte Maria Julieta Ahmad',                      false, true,  'alta',  'Ahmad',         null),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'Autorización de viaje — Macarena Barrera Posleman',  false, true,  'alta',  'Barrera',       null),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'Autorización de viaje — Maria Julieta Ahmad',        false, true,  'alta',  'Ahmad',         null),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'Boarding passes subir a la app',                     false, false, 'media', 'Todas',         null),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'ETA Reino Unido — tramitar en eta.homeoffice.gov.uk', false, true, 'alta',  'Todas',         'Londres'),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'ETIAS Schengen — tramitar cuando abra el sistema',   false, false, 'media', 'Todas',         'Paris'),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'ETIAS Schengen — tramitar cuando abra el sistema',   false, false, 'media', 'Todas',         'Bruselas'),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'ETIAS Schengen — tramitar cuando abra el sistema',   false, false, 'media', 'Todas',         'Roma'),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'ETIAS Schengen — tramitar cuando abra el sistema',   false, false, 'media', 'Todas',         'Madrid'),
((SELECT id FROM viajes LIMIT 1), 'logistica',     'Botón cómo llegar con Google Maps',                  true,  false, 'baja',  null,            null);

-- ══════════════════════════════════════════════════════════════════
-- PATCH v1.5 — Permisos de edición desde la app
-- ══════════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE POLICY "public_update" ON personas FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "public_update" ON hoteles FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "public_update" ON vuelos FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ══════════════════════════════════════════════════════════════════
-- PATCH v1.6 — Eurostar, pasaportes, autorizaciones
-- ══════════════════════════════════════════════════════════════════

ALTER TABLE personas ADD COLUMN IF NOT EXISTS autorizacion_status TEXT DEFAULT 'no_aplica';

-- Eurostar LON-PAR: PNR Nader confirmado (Barrera y Ahmad pendientes)
UPDATE vuelos
SET pnr        = pnr || '{"Nader": "RZN7P2"}'::jsonb,
    confirmado = true
WHERE id = 'LON-PAR';

-- Santiago Nader: pasaporte pendiente
UPDATE personas
SET pasaporte_status = 'pending'
WHERE nombre ILIKE '%Santiago%' AND familia = 'Nader';

-- Macarena Barrera y Julieta Ahmad: necesitan autorización
UPDATE personas
SET autorizacion_status = 'pendiente'
WHERE nombre ILIKE '%Macarena%' AND familia = 'Barrera';

UPDATE personas
SET autorizacion_status = 'pendiente'
WHERE nombre ILIKE '%Julieta%' AND familia = 'Ahmad';
