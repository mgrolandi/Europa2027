-- ─── Patch — Tren Paris-Bruselas confirmado (Eurostar) ───────────────────────
-- Supabase Dashboard → SQL Editor → New Query → Paste → Run

-- 1. Horario y empresa correctos, reserva confirmada
UPDATE vuelos
SET
  origen      = 'Paris (Gare du Nord)',
  destino     = 'Bruselas (Brussels-Midi)',
  empresa     = 'Eurostar',
  salida      = '08:55',
  llegada     = '10:16',
  confirmado  = true
WHERE id = 'PAR-BRU';

-- 2. Pendiente de reserva ya resuelto — corregir nombre y marcar como hecho
UPDATE pendientes
SET
  titulo = replace(replace(titulo, 'Thalys', 'Eurostar'), 'thalys', 'Eurostar'),
  hecho  = true
WHERE categoria = 'transportes' AND titulo ILIKE '%thalys%';
