-- ─── Patch v1.9 — Tabla actividades + gastos de hoteles ──────────────────────
-- Supabase Dashboard → SQL Editor → New Query → Run

-- 1. Crear tabla actividades
CREATE TABLE IF NOT EXISTS actividades (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id      UUID REFERENCES viajes(id) ON DELETE CASCADE,
  ciudad        TEXT NOT NULL,
  nombre        TEXT NOT NULL,
  categoria     TEXT DEFAULT 'entrada',   -- entrada | show | tour | restaurante | otro
  fecha         DATE,
  hora          TEXT,
  confirmacion  TEXT,
  precio        TEXT,
  confirmada    BOOLEAN DEFAULT false,
  notas         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS para actividades
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "actividades_select" ON actividades FOR SELECT USING (true);
CREATE POLICY "actividades_insert" ON actividades FOR INSERT WITH CHECK (true);
CREATE POLICY "actividades_update" ON actividades FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "actividades_delete" ON actividades FOR DELETE USING (true);

-- 3. Columna entidad_id en documentos (para asociar vouchers a actividades)
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS entidad_id UUID;
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS entidad_tipo TEXT DEFAULT 'persona';

-- 4. Seed — Entradas y actividades por ciudad
INSERT INTO actividades (viaje_id, ciudad, nombre, categoria, fecha, confirmacion, precio, confirmada, notas) VALUES

-- LONDRES
((SELECT id FROM viajes LIMIT 1), 'Londres', 'Premier League — partido', 'entrada',
 NULL, NULL, 'De pago', false, 'Reservar en cuanto salgan — disponibilidad 19/06/2026'),

((SELECT id FROM viajes LIMIT 1), 'Londres', 'Natural History Museum', 'entrada',
 NULL, NULL, 'Gratis con reserva', false, 'Reservar online para evitar fila'),

((SELECT id FROM viajes LIMIT 1), 'Londres', 'British Museum', 'entrada',
 NULL, NULL, 'Gratis con reserva', false, 'Entrar por Montague Place — menos cola'),

((SELECT id FROM viajes LIMIT 1), 'Londres', 'Tower of London', 'entrada',
 NULL, NULL, 'GBP ~30 pp', false, NULL),

-- PARIS
((SELECT id FROM viajes LIMIT 1), 'Paris', 'Louvre — entrada + reserva horaria', 'entrada',
 NULL, NULL, 'EUR ~22 pp', false, 'Obligatorio reservar online — evitar colas'),

((SELECT id FROM viajes LIMIT 1), 'Paris', 'Torre Eiffel — acceso a la cima', 'entrada',
 NULL, NULL, 'EUR ~29 pp', false, 'Reservar con meses de anticipación — imprescindible'),

((SELECT id FROM viajes LIMIT 1), 'Paris', 'Palacio de Versalles', 'entrada',
 NULL, NULL, 'EUR ~21 pp', false, 'A 40 min de París — reservar online, muy concurrido'),

((SELECT id FROM viajes LIMIT 1), 'Paris', 'Teatro / espectáculo', 'show',
 NULL, NULL, 'Variable', false, 'Definir qué obra o show'),

-- BRUSELAS
((SELECT id FROM viajes LIMIT 1), 'Bruselas', 'Atomium', 'entrada',
 NULL, NULL, 'EUR ~16 pp', false, NULL),

((SELECT id FROM viajes LIMIT 1), 'Bruselas', 'Musée Magritte', 'entrada',
 NULL, NULL, 'EUR ~10 pp', false, 'Arte surrealista — cerca de la Grand Place'),

-- ROMA
((SELECT id FROM viajes LIMIT 1), 'Roma', 'Coliseo + Foro Romano', 'entrada',
 NULL, NULL, 'EUR ~18 pp', false, 'Reservar online obligatorio — colas enormes sin reserva'),

((SELECT id FROM viajes LIMIT 1), 'Roma', 'Museos Vaticanos + Capilla Sixtina', 'entrada',
 NULL, NULL, 'EUR ~20 pp', false, 'Reservar con meses de anticipación — muy demandado'),

((SELECT id FROM viajes LIMIT 1), 'Roma', 'Galería Borghese', 'entrada',
 NULL, NULL, 'EUR ~13 pp', false, 'Entrada limitada — reservar con mucha anticipación'),

-- MADRID
((SELECT id FROM viajes LIMIT 1), 'Madrid', 'Museo del Prado', 'entrada',
 NULL, NULL, 'EUR ~15 pp', false, NULL),

((SELECT id FROM viajes LIMIT 1), 'Madrid', 'Reina Sofía (Guernica)', 'entrada',
 NULL, NULL, 'EUR ~12 pp', false, NULL),

((SELECT id FROM viajes LIMIT 1), 'Madrid', 'Espectáculo de flamenco', 'show',
 NULL, NULL, 'EUR ~45 pp', false, 'Reservar con anticipación — Tablao Villarosa o similar');

-- 5. Gastos de hoteles (importar desde reservas)
-- Nota: ajustá los montos y moneda según las reservas reales

-- AHMAD
INSERT INTO gastos (viaje_id, descripcion, monto, moneda, categoria, ciudad, fecha, pagado_por) VALUES
((SELECT id FROM viajes LIMIT 1), 'Hotel Londres — Voco', 0, 'GBP', 'alojamiento', 'Londres', '2027-01-28', 'Ahmad'),
((SELECT id FROM viajes LIMIT 1), 'Hotel Paris — Mercure Opera', 0, 'EUR', 'alojamiento', 'Paris', '2027-02-01', 'Ahmad'),
((SELECT id FROM viajes LIMIT 1), 'Hotel Bruselas — NH Brussels', 0, 'EUR', 'alojamiento', 'Bruselas', '2027-02-04', 'Ahmad'),
((SELECT id FROM viajes LIMIT 1), 'Hotel Roma — TBD', 0, 'EUR', 'alojamiento', 'Roma', '2027-02-06', 'Ahmad'),
((SELECT id FROM viajes LIMIT 1), 'Hotel Madrid — TBD', 0, 'EUR', 'alojamiento', 'Madrid', '2027-02-11', 'Ahmad');

-- BARRERA
INSERT INTO gastos (viaje_id, descripcion, monto, moneda, categoria, ciudad, fecha, pagado_por) VALUES
((SELECT id FROM viajes LIMIT 1), 'Hotel Londres — Voco', 0, 'GBP', 'alojamiento', 'Londres', '2027-01-28', 'Barrera'),
((SELECT id FROM viajes LIMIT 1), 'Hotel Paris — Mercure Opera', 0, 'EUR', 'alojamiento', 'Paris', '2027-02-01', 'Barrera'),
((SELECT id FROM viajes LIMIT 1), 'Hotel Bruselas — NH Brussels', 0, 'EUR', 'alojamiento', 'Bruselas', '2027-02-04', 'Barrera'),
((SELECT id FROM viajes LIMIT 1), 'Hotel Roma — TBD', 0, 'EUR', 'alojamiento', 'Roma', '2027-02-06', 'Barrera'),
((SELECT id FROM viajes LIMIT 1), 'Hotel Madrid — TBD', 0, 'EUR', 'alojamiento', 'Madrid', '2027-02-11', 'Barrera');

-- NADER
INSERT INTO gastos (viaje_id, descripcion, monto, moneda, categoria, ciudad, fecha, pagado_por) VALUES
((SELECT id FROM viajes LIMIT 1), 'Hotel Londres — Voco', 0, 'GBP', 'alojamiento', 'Londres', '2027-01-28', 'Nader'),
((SELECT id FROM viajes LIMIT 1), 'Hotel Paris — Mercure Opera', 0, 'EUR', 'alojamiento', 'Paris', '2027-02-01', 'Nader'),
((SELECT id FROM viajes LIMIT 1), 'Hotel Bruselas — NH Brussels', 0, 'EUR', 'alojamiento', 'Bruselas', '2027-02-04', 'Nader'),
((SELECT id FROM viajes LIMIT 1), 'Hotel Roma — TBD', 0, 'EUR', 'alojamiento', 'Roma', '2027-02-06', 'Nader'),
((SELECT id FROM viajes LIMIT 1), 'Hotel Madrid — TBD', 0, 'EUR', 'alojamiento', 'Madrid', '2027-02-11', 'Nader');
