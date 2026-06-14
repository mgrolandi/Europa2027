-- ─── Patch v1.7 — Datos de pasaporte por persona ─────────────────────────────
-- Supabase Dashboard → SQL Editor → New Query → Paste → Run

-- 1. Agregar columnas de pasaporte
ALTER TABLE personas ADD COLUMN IF NOT EXISTS pasaporte_numero TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS pasaporte_vencimiento DATE;

-- 2. Familia Nader — datos de pasaporte
UPDATE personas
SET pasaporte_numero = 'AAL639979', pasaporte_vencimiento = '2035-06-10'
WHERE nombre ILIKE '%Gabriela%' AND familia = 'Nader';

UPDATE personas
SET pasaporte_numero = 'AAL639978', pasaporte_vencimiento = '2035-06-10'
WHERE nombre ILIKE '%Francisco%' AND familia = 'Nader';

UPDATE personas
SET pasaporte_numero = 'AAH682644', pasaporte_vencimiento = '2032-04-22'
WHERE nombre ILIKE '%Juan Jose%' AND familia = 'Nader';

-- Tomas y Santiago: pasaporte pendiente de renovación (sin número aún)
UPDATE personas
SET pasaporte_status = 'pending'
WHERE nombre ILIKE '%Tomas%' AND familia = 'Nader';

UPDATE personas
SET pasaporte_status = 'pending'
WHERE nombre ILIKE '%Santiago%' AND familia = 'Nader';
