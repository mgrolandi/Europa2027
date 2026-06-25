-- ─── Patch — Horario tren Paris-Bruselas (Eurostar) ──────────────────────────
-- Supabase Dashboard → SQL Editor → New Query → Paste → Run

UPDATE vuelos
SET
  origen   = 'Paris (Gare du Nord)',
  destino  = 'Bruselas (Brussels-Midi)',
  empresa  = 'Eurostar',
  salida   = '08:55',
  llegada  = '10:16'
WHERE id = 'PAR-BRU';
