-- Europa 2027 — Supabase Schema
-- Run this in the Supabase SQL editor before seeding

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLES ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS viajes (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre        TEXT NOT NULL,
  familias      TEXT[] DEFAULT '{}',
  total_personas INTEGER,
  fecha_ida     DATE,
  fecha_vuelta  DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personas (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  viaje_id         UUID REFERENCES viajes(id) ON DELETE CASCADE,
  nombre           TEXT NOT NULL,
  familia          TEXT NOT NULL,
  rol              TEXT NOT NULL DEFAULT 'Adulto',
  pasaporte_status TEXT DEFAULT 'ok',   -- ok / pending / expired
  etias_status     TEXT DEFAULT 'pendiente',
  eta_status       TEXT DEFAULT 'pendiente',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Flights and trains (id matches JSON e.g. 'SAO-LON')
CREATE TABLE IF NOT EXISTS vuelos (
  id              TEXT PRIMARY KEY,
  viaje_id        UUID REFERENCES viajes(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL DEFAULT 'vuelo',   -- vuelo / tren
  origen          TEXT NOT NULL,
  destino         TEXT NOT NULL,
  ciudad_salida   TEXT,   -- city name in itinerary (e.g. 'Londres')
  ciudad_llegada  TEXT,
  fecha           DATE NOT NULL,
  empresa         TEXT,
  numero          TEXT,
  salida          TEXT,
  llegada         TEXT,
  confirmado      BOOLEAN DEFAULT FALSE,
  pnr             JSONB DEFAULT '{}',
  boarding_pass_urls JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- One row per hotel booking per family
CREATE TABLE IF NOT EXISTS hoteles (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  viaje_id     UUID REFERENCES viajes(id) ON DELETE CASCADE,
  ciudad       TEXT NOT NULL,
  familia      TEXT NOT NULL,
  nombre       TEXT,
  direccion    TEXT,
  maps_url     TEXT,
  checkin      DATE,
  checkout     DATE,
  habitacion   TEXT,
  confirmacion TEXT,
  precio       TEXT,   -- stored as-is, e.g. 'USD 1421.53'
  voucher_url  TEXT,
  notas        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fichas_ciudad (
  id                     UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ciudad                 TEXT UNIQUE NOT NULL,
  pais                   TEXT,
  idioma                 TEXT,
  moneda                 TEXT,
  moneda_simbolo         TEXT,
  tipo_enchufe           TEXT,
  zona_horaria           TEXT,
  emergencias            JSONB DEFAULT '{}',
  visa_info              TEXT,
  fecha_llegada          DATE,
  fecha_salida           DATE,
  noches                 INTEGER,
  como_llegar_aeropuerto TEXT,
  tips_transporte        TEXT[] DEFAULT '{}',
  created_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pendientes (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  viaje_id         UUID REFERENCES viajes(id) ON DELETE CASCADE,
  categoria        TEXT NOT NULL,   -- transportes / entradas / logistica / documentacion
  titulo           TEXT NOT NULL,
  descripcion      TEXT,
  hecho            BOOLEAN DEFAULT FALSE,
  urgente          BOOLEAN DEFAULT FALSE,
  prioridad        TEXT DEFAULT 'normal',   -- urgente / pronto / alta / media / normal
  familia          TEXT,
  ciudad           TEXT,
  fecha_limite     DATE,
  fecha_limite_label TEXT,
  precio_info      TEXT,
  alerta           TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lugares (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ciudad          TEXT NOT NULL,
  categoria       TEXT NOT NULL,   -- miradores / bares / iconicos / musica
  nombre          TEXT NOT NULL,
  zona            TEXT,
  descripcion     TEXT,
  precio          TEXT,
  es_gratis       BOOLEAN DEFAULT FALSE,
  requiere_reserva BOOLEAN DEFAULT FALSE,
  tip             TEXT,
  maps_url        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documentos (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  persona_id     UUID REFERENCES personas(id) ON DELETE SET NULL,
  entidad_tipo   TEXT,   -- persona / vuelo / hotel
  entidad_id     TEXT,
  tipo_doc       TEXT NOT NULL,   -- pasaporte / seguro / boarding_pass / voucher / etias / eta
  storage_path   TEXT NOT NULL,
  nombre_archivo TEXT,
  subido_por     TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gastos (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  viaje_id       UUID REFERENCES viajes(id) ON DELETE CASCADE,
  descripcion    TEXT NOT NULL,
  monto          DECIMAL(10,2) NOT NULL,
  moneda         TEXT DEFAULT 'EUR',
  categoria      TEXT DEFAULT 'otros',   -- alojamiento / transporte / comida / entradas / otros
  pagado_por     TEXT,
  dividido_entre TEXT[] DEFAULT '{}',
  ciudad         TEXT,
  fecha          DATE DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_personas_familia         ON personas(familia);
CREATE INDEX IF NOT EXISTS idx_vuelos_fecha             ON vuelos(fecha);
CREATE INDEX IF NOT EXISTS idx_vuelos_ciudad_llegada    ON vuelos(ciudad_llegada);
CREATE INDEX IF NOT EXISTS idx_vuelos_ciudad_salida     ON vuelos(ciudad_salida);
CREATE INDEX IF NOT EXISTS idx_hoteles_ciudad           ON hoteles(ciudad);
CREATE INDEX IF NOT EXISTS idx_hoteles_familia          ON hoteles(familia);
CREATE INDEX IF NOT EXISTS idx_pendientes_categoria     ON pendientes(categoria);
CREATE INDEX IF NOT EXISTS idx_pendientes_hecho         ON pendientes(hecho);
CREATE INDEX IF NOT EXISTS idx_lugares_ciudad_categoria ON lugares(ciudad, categoria);
CREATE INDEX IF NOT EXISTS idx_gastos_pagado_por        ON gastos(pagado_por);

-- ─── ROW LEVEL SECURITY ────────────────────────────────────────────────────

ALTER TABLE viajes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE vuelos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE hoteles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_ciudad ENABLE ROW LEVEL SECURITY;
ALTER TABLE pendientes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lugares       ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos        ENABLE ROW LEVEL SECURITY;

-- Public read for all tables
CREATE POLICY "public_read" ON viajes        FOR SELECT USING (true);
CREATE POLICY "public_read" ON personas      FOR SELECT USING (true);
CREATE POLICY "public_read" ON vuelos        FOR SELECT USING (true);
CREATE POLICY "public_read" ON hoteles       FOR SELECT USING (true);
CREATE POLICY "public_read" ON fichas_ciudad FOR SELECT USING (true);
CREATE POLICY "public_read" ON pendientes    FOR SELECT USING (true);
CREATE POLICY "public_read" ON lugares       FOR SELECT USING (true);
CREATE POLICY "public_read" ON documentos    FOR SELECT USING (true);
CREATE POLICY "public_read" ON gastos        FOR SELECT USING (true);

-- Writes allowed via anon key (tighten with Supabase Auth when ready)
CREATE POLICY "public_write" ON pendientes FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON pendientes FOR UPDATE USING (true);
CREATE POLICY "public_write" ON documentos FOR INSERT WITH CHECK (true);
CREATE POLICY "public_write" ON gastos     FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON gastos    FOR UPDATE USING (true);
CREATE POLICY "public_delete" ON gastos    FOR DELETE USING (true);

-- ─── STORAGE ────────────────────────────────────────────────────────────────
-- Run this separately if the bucket doesn't exist yet:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documentos-viaje', 'documentos-viaje', true);
-- CREATE POLICY "public_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documentos-viaje');
-- CREATE POLICY "public_read"   ON storage.objects FOR SELECT USING (bucket_id = 'documentos-viaje');
