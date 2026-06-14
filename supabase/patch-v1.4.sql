-- ─── Patch v1.4 — Hotel Bruselas + reset pendientes ─────────────────────────

-- 1. Hotel Bruselas: actualizar nombre y dirección en las 3 filas
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

-- 2. Reset pendientes (nueva estructura flat v1.4)
DELETE FROM pendientes;

INSERT INTO pendientes (viaje_id, categoria, titulo, hecho, urgente, prioridad, familia) VALUES
((SELECT id FROM viajes LIMIT 1), 'transportes',   'PNR Barrera y Ahmad — BA0246 SAO-LON',               false, true,  'alta',  'Barrera/Ahmad'),
((SELECT id FROM viajes LIMIT 1), 'transportes',   'PNR Barrera y Ahmad — IB0648 ROM-MAD',               false, true,  'alta',  'Barrera/Ahmad'),
((SELECT id FROM viajes LIMIT 1), 'transportes',   'PNR todas las familias — IB0101 MAD-EZE',            false, true,  'alta',  'Todas'),
((SELECT id FROM viajes LIMIT 1), 'transportes',   'Reserva tren Eurostar LON-PAR (tickets por familia)',false, true,  'alta',  'Todas'),
((SELECT id FROM viajes LIMIT 1), 'transportes',   'Reserva tren Thalys PAR-BRU',                       false, true,  'alta',  'Todas'),
((SELECT id FROM viajes LIMIT 1), 'transportes',   'Vuelo BRU-ROM (aerolinea y numero)',                 false, true,  'alta',  'Todas'),
((SELECT id FROM viajes LIMIT 1), 'transportes',   'Alojamiento Paris — Barrera',                       false, true,  'alta',  'Barrera'),
((SELECT id FROM viajes LIMIT 1), 'logistica',     'Asignacion habitaciones Roma entre familias',        false, false, 'baja',  'Todas'),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'Pasaporte Lucas Barrera Posleman',                   false, true,  'alta',  'Barrera'),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'Pasaporte Tomas Nader',                              false, true,  'alta',  'Nader'),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'Pasaporte Maria Julieta Ahmad',                      false, true,  'alta',  'Ahmad'),
((SELECT id FROM viajes LIMIT 1), 'documentacion', 'Boarding passes subir a la app',                     false, false, 'media', 'Todas'),
((SELECT id FROM viajes LIMIT 1), 'logistica',     'Boton como llegar con Google Maps',                  true,  false, 'baja',  null);
