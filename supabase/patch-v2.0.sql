-- ─── Patch v2.0 — PNR familia Barrera (vuelos y trenes) ──────────────────────
-- Supabase Dashboard → SQL Editor → New Query → Run
-- Los UPDATE son idempotentes (podés correrlo más de una vez sin problema)

-- 1. Vuelo SAO-LON (BA0246) y MAD-EZE (IB0101) — mismo PNR de itinerario
UPDATE vuelos
SET pnr = pnr || '{"Barrera": "YVJ37M"}'::jsonb
WHERE id = 'SAO-LON';

UPDATE vuelos
SET pnr = pnr || '{"Barrera": "YVJ37M"}'::jsonb
WHERE id = 'MAD-EZE';

-- 2. Vuelo ROM-MAD (IB0648)
UPDATE vuelos
SET pnr = pnr || '{"Barrera": "M4WBN"}'::jsonb
WHERE id = 'ROM-MAD';

-- 3. Tren Eurostar Londres -> Paris
UPDATE vuelos
SET pnr = pnr || '{"Barrera": "2NCQG7"}'::jsonb
WHERE id = 'LON-PAR';

-- 4. Tren Thalys Paris -> Bruselas — reservado en 3 grupos separados,
--    asignación de personas por grupo pendiente de confirmar
UPDATE vuelos
SET pnr = pnr || '{"Barrera": "TKTP2J / 7HFW7N / NYJQRP (3 reservas separadas)"}'::jsonb
WHERE id = 'PAR-BRU';
