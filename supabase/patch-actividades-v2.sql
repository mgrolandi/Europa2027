-- Actividades por ciudad (patch-actividades-v2.sql)
-- Corre en Supabase Console > SQL Editor

INSERT INTO actividades (ciudad, nombre, precio, confirmada) VALUES
  -- Londres
  ('Londres', 'Mamma Mia! — Musical West End · Teatro Novello, Aldwych WC2B 4LD', 'Desde £25', false),
  ('Londres', 'Natural History Museum', 'Gratis con reserva', false),
  ('Londres', 'British Museum', 'Gratis con reserva', false),
  ('Londres', 'Tower of London', 'GBP ~30 pp', false),
  ('Londres', 'Premier League — partido en Londres', 'De pago · entradas 19/06/2026', false),

  -- París
  ('París', 'Louvre — entrada + reserva horaria', 'EUR ~22 pp', false),
  ('París', 'Torre Eiffel — acceso a la cima', 'EUR ~29 pp', false),
  ('París', 'Palacio de Versalles', 'EUR ~21 pp', false),
  ('París', 'Notre-Dame de Paris — interior', 'Gratis con reserva', false),

  -- Bruselas
  ('Bruselas', 'Atomium', 'EUR ~16 pp', false),
  ('Bruselas', 'Musée Magritte', 'EUR ~15 pp', false),

  -- Roma
  ('Roma', 'Coliseo + Foro Romano + Palatino', 'EUR ~18 pp', false),
  ('Roma', 'Museos Vaticanos + Capilla Sixtina', 'EUR ~20 pp', false),
  ('Roma', 'Galería Borghese', 'EUR ~13 pp', false),
  ('Roma', 'Panteón', 'Gratis con reserva', false),

  -- Madrid
  ('Madrid', 'Museo del Prado', 'EUR ~15 pp', false),
  ('Madrid', 'Museo Reina Sofía — El Guernica', 'EUR ~12 pp', false),
  ('Madrid', 'Espectáculo de flamenco — Corral de la Morería', 'EUR ~45 pp', false),
  ('Madrid', 'El Rastro (solo domingos — 14 feb 2027)', 'Gratis', false);
