-- ─── Patch v1.8 — Entradas y actividades por ciudad + pasaportes ──────────────
-- Supabase Dashboard → SQL Editor → New Query → Run
-- Incluye lo de patch-v1.7 también, podés correr ambos o solo este.

-- 1. Columnas de pasaporte (si no se corrió patch-v1.7)
ALTER TABLE personas ADD COLUMN IF NOT EXISTS pasaporte_numero TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS pasaporte_vencimiento DATE;

-- 2. Datos de pasaporte Nader
UPDATE personas SET pasaporte_numero = 'AAL639979', pasaporte_vencimiento = '2035-06-10'
WHERE nombre ILIKE '%Gabriela%' AND familia = 'Nader';

UPDATE personas SET pasaporte_numero = 'AAL639978', pasaporte_vencimiento = '2035-06-10'
WHERE nombre ILIKE '%Francisco%' AND familia = 'Nader';

UPDATE personas SET pasaporte_numero = 'AAH682644', pasaporte_vencimiento = '2032-04-22'
WHERE nombre ILIKE '%Juan Jose%' AND familia = 'Nader';

-- 3. Entradas y actividades por ciudad
INSERT INTO pendientes (viaje_id, categoria, titulo, descripcion, hecho, urgente, prioridad, ciudad, fecha_limite, fecha_limite_label, precio_info) VALUES

-- LONDRES
((SELECT id FROM viajes LIMIT 1), 'entradas', 'Premier League — partido en Londres',
 'Salen el 19/06/2026 — reservar inmediatamente', false, true, 'alta', 'Londres',
 '2026-06-19', 'Salen el 19/06/2026 — ¡urgente!', 'De pago'),

((SELECT id FROM viajes LIMIT 1), 'entradas', 'Natural History Museum',
 'Reservar online para evitar fila. Entrada gratuita.', false, false, 'media', 'Londres',
 '2026-07-29', 'Antes del 29/07/2026', 'Gratis con reserva'),

((SELECT id FROM viajes LIMIT 1), 'entradas', 'British Museum',
 'Entrar por puerta trasera Montague Place — menos cola.', false, false, 'media', 'Londres',
 '2026-10-29', 'Antes del 29/10/2026', 'Gratis con reserva'),

((SELECT id FROM viajes LIMIT 1), 'entradas', 'Tower of London',
 null, false, false, 'baja', 'Londres', null, null, 'De pago'),

-- PARIS
((SELECT id FROM viajes LIMIT 1), 'entradas', 'Louvre — entrada y reserva horaria',
 'Obligatorio reservar online. Evitar colas.', false, true, 'alta', 'Paris',
 null, null, 'EUR ~22 pp'),

((SELECT id FROM viajes LIMIT 1), 'entradas', 'Torre Eiffel — acceso a la cima',
 'Reservar con meses de anticipación. Imprescindible.', false, true, 'alta', 'Paris',
 null, null, 'EUR ~29 pp'),

((SELECT id FROM viajes LIMIT 1), 'entradas', 'Palacio de Versalles',
 'A 40 min de París. Reservar online, muy concurrido.', false, false, 'media', 'Paris',
 null, null, 'EUR ~21 pp'),

((SELECT id FROM viajes LIMIT 1), 'entradas', 'Teatro / espectáculo en París',
 'Definir qué obra o show.', false, false, 'baja', 'Paris',
 null, null, 'Variable'),

-- BRUSELAS
((SELECT id FROM viajes LIMIT 1), 'entradas', 'Atomium',
 null, false, false, 'baja', 'Bruselas', null, null, 'EUR ~16 pp'),

((SELECT id FROM viajes LIMIT 1), 'entradas', 'Musée Magritte',
 'Arte surrealista. Cerca de la Grand Place.', false, false, 'baja', 'Bruselas',
 null, null, 'EUR ~10 pp'),

-- ROMA
((SELECT id FROM viajes LIMIT 1), 'entradas', 'Coliseo + Foro Romano',
 'Reservar online obligatorio — colas enormes sin reserva.', false, true, 'alta', 'Roma',
 null, null, 'EUR ~18 pp'),

((SELECT id FROM viajes LIMIT 1), 'entradas', 'Museos Vaticanos + Capilla Sixtina',
 'Reservar con meses de anticipación. Muy demandado.', false, true, 'alta', 'Roma',
 null, null, 'EUR ~20 pp'),

((SELECT id FROM viajes LIMIT 1), 'entradas', 'Galería Borghese',
 'Entrada limitada — reservar con mucha anticipación.', false, false, 'media', 'Roma',
 null, null, 'EUR ~13 pp'),

-- MADRID
((SELECT id FROM viajes LIMIT 1), 'entradas', 'Museo del Prado',
 null, false, false, 'media', 'Madrid', null, null, 'EUR ~15 pp'),

((SELECT id FROM viajes LIMIT 1), 'entradas', 'Reina Sofía (Guernica)',
 null, false, false, 'baja', 'Madrid', null, null, 'EUR ~12 pp'),

((SELECT id FROM viajes LIMIT 1), 'entradas', 'Espectáculo de flamenco',
 'Reservar con anticipación. Tablao Villarosa o similar.', false, false, 'media', 'Madrid',
 null, null, 'EUR ~45 pp');
