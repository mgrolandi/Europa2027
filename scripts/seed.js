/**
 * Seed script — runs once after schema.sql is applied.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=your-service-role-key node scripts/seed.js
 *
 * The service role key bypasses RLS so all inserts succeed.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const raw = readFileSync(join(__dirname, '../europa2027-datos.json'), 'utf8')
const data = JSON.parse(raw)

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌  Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})

// Map vuelo IDs to their cities in the itinerary
const CIUDAD_MAP = {
  'SAO-LON': { ciudad_llegada: 'Londres',  ciudad_salida: null       },
  'LON-PAR': { ciudad_llegada: 'Paris',    ciudad_salida: 'Londres'  },
  'PAR-BRU': { ciudad_llegada: 'Bruselas', ciudad_salida: 'Paris'    },
  'BRU-ROM': { ciudad_llegada: 'Roma',     ciudad_salida: 'Bruselas' },
  'ROM-MAD': { ciudad_llegada: 'Madrid',   ciudad_salida: 'Roma'     },
  'MAD-EZE': { ciudad_llegada: null,       ciudad_salida: 'Madrid'   },
}

const FICHAS_BASE = [
  {
    ciudad: 'Londres',
    pais: 'Reino Unido',
    idioma: 'Inglés',
    moneda: 'Libra esterlina (GBP)',
    moneda_simbolo: '£',
    tipo_enchufe: 'Tipo G — tres pines planos',
    zona_horaria: 'GMT / UTC+0',
    emergencias: { todos: '999', policía: '999', ambulancia: '999', bomberos: '999' },
    visa_info: 'ETA requerida — tramitar en eta.homeoffice.gov.uk antes del viaje',
    fecha_llegada: '2027-01-29',
    fecha_salida: '2027-02-02',
    noches: 4,
  },
  {
    ciudad: 'Paris',
    pais: 'Francia',
    idioma: 'Francés',
    moneda: 'Euro (EUR)',
    moneda_simbolo: '€',
    tipo_enchufe: 'Tipo C/E — dos pines redondos',
    zona_horaria: 'CET / UTC+1',
    emergencias: { todos: '112', policía: '17', ambulancia: '15', bomberos: '18' },
    visa_info: 'ETIAS requerido (Espacio Schengen) — tramitar cuando abra el sistema',
    fecha_llegada: '2027-02-02',
    fecha_salida: '2027-02-06',
    noches: 4,
  },
  {
    ciudad: 'Bruselas',
    pais: 'Bélgica',
    idioma: 'Francés / Neerlandés / Alemán',
    moneda: 'Euro (EUR)',
    moneda_simbolo: '€',
    tipo_enchufe: 'Tipo C/E — dos pines redondos',
    zona_horaria: 'CET / UTC+1',
    emergencias: { todos: '112', policía: '101', ambulancia: '100' },
    visa_info: 'ETIAS requerido (Espacio Schengen)',
    fecha_llegada: '2027-02-06',
    fecha_salida: '2027-02-07',
    noches: 1,
  },
  {
    ciudad: 'Roma',
    pais: 'Italia',
    idioma: 'Italiano',
    moneda: 'Euro (EUR)',
    moneda_simbolo: '€',
    tipo_enchufe: 'Tipo C/F/L — pines redondos',
    zona_horaria: 'CET / UTC+1',
    emergencias: { todos: '112', policía: '113', ambulancia: '118', bomberos: '115' },
    visa_info: 'ETIAS requerido (Espacio Schengen)',
    fecha_llegada: '2027-02-07',
    fecha_salida: '2027-02-11',
    noches: 4,
  },
  {
    ciudad: 'Madrid',
    pais: 'España',
    idioma: 'Español',
    moneda: 'Euro (EUR)',
    moneda_simbolo: '€',
    tipo_enchufe: 'Tipo C/F — dos pines redondos',
    zona_horaria: 'CET / UTC+1',
    emergencias: { todos: '112', policía: '091', ambulancia: '061' },
    visa_info: 'ETIAS requerido (Espacio Schengen)',
    fecha_llegada: '2027-02-11',
    fecha_salida: '2027-02-15',
    noches: 4,
  },
]

async function insert(table, rows, label) {
  const { error } = await supabase.from(table).insert(rows)
  if (error) throw new Error(`${table}: ${error.message}`)
  console.log(`  ✅ ${label}: ${rows.length} fila(s)`)
}

async function main() {
  console.log('\n🌍  Europa 2027 — Seed\n')

  // 1. Viaje
  const { data: viaje, error: vErr } = await supabase
    .from('viajes')
    .insert({
      nombre: data.viaje.nombre,
      familias: data.viaje.familias,
      total_personas: data.viaje.total_personas,
      fecha_ida: data.viaje.fecha_ida,
      fecha_vuelta: data.viaje.fecha_vuelta,
    })
    .select()
    .single()
  if (vErr) throw vErr
  console.log(`  ✅ Viaje: ${viaje.id}`)

  // 2. Personas
  const personasRows = []
  for (const [familia, list] of Object.entries(data.personas)) {
    for (const p of list) {
      personasRows.push({
        viaje_id: viaje.id,
        nombre: p.nombre,
        familia,
        rol: p.rol,
        pasaporte_status: p.pasaporte || 'ok',
      })
    }
  }
  await insert('personas', personasRows, 'Personas')

  // 3. Vuelos / trenes
  const vuelosRows = data.vuelos.map(v => ({
    id: v.id,
    viaje_id: viaje.id,
    tipo: v.tipo,
    origen: v.origen,
    destino: v.destino,
    ciudad_llegada: CIUDAD_MAP[v.id]?.ciudad_llegada ?? null,
    ciudad_salida: CIUDAD_MAP[v.id]?.ciudad_salida ?? null,
    fecha: v.fecha,
    empresa: v.aerolinea ?? v.empresa ?? null,
    numero: v.numero ?? null,
    salida: v.salida ?? null,
    llegada: v.llegada ?? null,
    confirmado: v.confirmado ?? false,
    pnr: v.pnr ?? {},
    boarding_pass_urls: {},
  }))
  await insert('vuelos', vuelosRows, 'Vuelos/trenes')

  // 4. Hoteles (one row per family per city)
  const hotelesRows = []
  for (const hotel of data.hoteles) {
    for (const [familia, reserva] of Object.entries(hotel.reservas)) {
      hotelesRows.push({
        viaje_id: viaje.id,
        ciudad: hotel.ciudad,
        familia,
        nombre: reserva.nombre ?? hotel.nombre ?? null,
        direccion: reserva.direccion ?? hotel.direccion ?? null,
        maps_url: reserva.maps_url ?? hotel.maps_url ?? null,
        checkin: hotel.fechas?.checkin ?? null,
        checkout: hotel.fechas?.checkout ?? null,
        habitacion: reserva.habitacion ?? null,
        confirmacion: reserva.confirmacion ?? null,
        precio: reserva.precio ?? null,
        notas: reserva.obs ?? null,
      })
    }
  }
  await insert('hoteles', hotelesRows, 'Hoteles')

  // 5. Fichas ciudad (enrich with tips from JSON)
  const fichasRows = FICHAS_BASE.map(f => {
    const hotelData = data.hoteles.find(h => h.ciudad === f.ciudad)
    return {
      ...f,
      como_llegar_aeropuerto: hotelData?.como_llegar_desde_aeropuerto ?? null,
      tips_transporte: data.tips_transporte?.[f.ciudad] ?? [],
    }
  })
  await insert('fichas_ciudad', fichasRows, 'Fichas ciudad')

  // 6. Pendientes (flatten categories)
  const pendientesRows = []
  for (const [categoria, items] of Object.entries(data.pendientes)) {
    for (const item of items) {
      pendientesRows.push({
        viaje_id: viaje.id,
        categoria,
        titulo: item.item,
        descripcion: item.obs ?? null,
        hecho: item.hecho ?? false,
        urgente: item.urgente ?? item.alerta === 'URGENTE',
        prioridad:
          item.alerta === 'URGENTE' ? 'urgente'
          : item.alerta === 'PROXIMO' ? 'pronto'
          : item.prioridad ?? 'normal',
        familia: item.familia ?? item.familias ?? null,
        ciudad: item.ciudad ?? null,
        fecha_limite: item.fecha_limite ?? null,
        fecha_limite_label: item.fecha_limite_label ?? null,
        precio_info: item.precio ?? null,
        alerta: item.alerta ?? null,
      })
    }
  }
  await insert('pendientes', pendientesRows, 'Pendientes')

  // 7. Lugares (flatten cities × categories)
  const lugaresRows = []
  for (const [ciudad, cats] of Object.entries(data.lugares)) {
    for (const [categoria, list] of Object.entries(cats)) {
      for (const l of list) {
        lugaresRows.push({
          ciudad,
          categoria,
          nombre: l.nombre,
          zona: l.zona ?? null,
          descripcion: l.descripcion ?? null,
          precio: l.precio ?? null,
          es_gratis: (l.precio ?? '').toLowerCase().includes('gratis'),
          requiere_reserva: l.reserva ?? false,
          tip: l.tip ?? null,
          maps_url: l.maps_url ?? null,
        })
      }
    }
  }
  await insert('lugares', lugaresRows, 'Lugares')

  console.log('\n🎉  Seed completado!\n')
}

main().catch(err => {
  console.error('\n❌ Error:', err.message)
  process.exit(1)
})
