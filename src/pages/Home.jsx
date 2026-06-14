import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFichasCiudad, usePendientes, useVuelos } from '../lib/queries'
import { isConfigured } from '../lib/supabase'
import SupabaseBanner from '../components/SupabaseBanner'
import FamiliaBadge from '../components/FamiliaBadge'

const CITY_PHOTOS = {
  Londres:  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
  Paris:    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
  Bruselas: 'https://images.unsplash.com/photo-1548533819-69e4db0c0eda?auto=format&fit=crop&w=600&q=80',
  Roma:     'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
  Madrid:   'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80',
}

const EUROPEAN_CITIES = new Set(['Londres', 'Paris', 'Bruselas', 'Roma', 'Madrid'])

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function cityOf(text) {
  return (text ?? '').split(' (')[0].trim()
}

function SegmentModal({ vuelo, onClose }) {
  if (!vuelo) return null
  const origin = cityOf(vuelo.origen)
  const dest   = cityOf(vuelo.destino)
  const empresa = vuelo.empresa ?? vuelo.aerolinea
  const pnrEntries = Object.entries(vuelo.pnr ?? {})

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-cream rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-cream-dark" />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <span className="font-mono text-[10px] bg-cream-dark px-2 py-0.5 rounded uppercase tracking-wider text-ink-light">
                {vuelo.tipo === 'vuelo' ? 'Vuelo' : 'Tren'}
              </span>
              <h3 className="font-serif text-2xl text-ink mt-2 leading-tight">
                {origin} → {dest}
              </h3>
            </div>
            <button onClick={onClose} className="text-ink-light hover:text-ink text-2xl leading-none shrink-0 ml-3 mt-1">
              ×
            </button>
          </div>

          <dl className="space-y-2 mb-5">
            <div className="flex gap-3 text-sm">
              <dt className="font-mono text-ink-light w-16 shrink-0">Fecha</dt>
              <dd className="text-ink">{fmt(vuelo.fecha)}</dd>
            </div>
            {empresa && (
              <div className="flex gap-3 text-sm">
                <dt className="font-mono text-ink-light w-16 shrink-0">Empresa</dt>
                <dd className="text-ink">{empresa}</dd>
              </div>
            )}
            {vuelo.numero && (
              <div className="flex gap-3 text-sm">
                <dt className="font-mono text-ink-light w-16 shrink-0">Número</dt>
                <dd className="font-mono text-ink">{vuelo.numero}</dd>
              </div>
            )}
            {(vuelo.salida || vuelo.llegada) && (
              <div className="flex gap-3 text-sm">
                <dt className="font-mono text-ink-light w-16 shrink-0">Horario</dt>
                <dd className="font-mono text-ink">
                  {[vuelo.salida, vuelo.llegada].filter(Boolean).join(' → ')}
                </dd>
              </div>
            )}
            <div className="flex gap-3 text-sm">
              <dt className="font-mono text-ink-light w-16 shrink-0">Estado</dt>
              <dd className={`font-mono font-medium ${vuelo.confirmado ? 'text-green-600' : 'text-amber-600'}`}>
                {vuelo.confirmado ? 'Confirmado ✓' : 'Pendiente'}
              </dd>
            </div>
          </dl>

          {pnrEntries.length > 0 && (
            <div className="border-t border-cream-dark pt-4 mb-5">
              <p className="font-mono text-[10px] text-ink-light uppercase tracking-wider mb-2">PNR</p>
              <div className="space-y-2">
                {pnrEntries.map(([fam, pnr]) => (
                  <div key={fam} className="flex items-center gap-2">
                    <FamiliaBadge familia={fam} />
                    <span className={`font-mono text-sm ${pnr ? 'text-ink font-medium' : 'text-amber-500'}`}>
                      {pnr ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            to="/transportes"
            onClick={onClose}
            className="block text-center font-mono text-xs text-ink-light hover:text-ink transition-colors border border-cream-dark rounded-xl py-2.5"
          >
            Ver todos los transportes →
          </Link>
        </div>
      </div>
    </div>
  )
}

function CityCard({ c }) {
  const photo = CITY_PHOTOS[c.ciudad]
  return (
    <Link
      to={`/ciudad/${c.ciudad}`}
      className="relative rounded-2xl overflow-hidden flex flex-col justify-end shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all group"
      style={{ minHeight: 180 }}
    >
      {photo && (
        <img
          src={photo}
          alt={c.ciudad}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      <div className="relative p-4">
        <h3 className="font-serif text-xl text-white font-bold leading-tight">{c.ciudad}</h3>
        <p className="font-mono text-xs text-white/70 mt-0.5">
          {fmt(c.fecha_llegada)} — {fmt(c.fecha_salida)}
          {c.noches ? <span className="ml-1.5 text-white/50">· {c.noches}n</span> : null}
        </p>
      </div>
    </Link>
  )
}

function RouteTimeline({ vuelos, onSelect }) {
  const segs = (vuelos ?? []).filter(v => {
    const from = v.ciudad_salida ?? cityOf(v.origen)
    return EUROPEAN_CITIES.has(from)
  })
  if (!segs.length) return null

  return (
    <div className="overflow-x-auto -mx-2">
      <div className="flex items-start px-4 py-3 min-w-max">
        {segs.map((v, i) => {
          const from   = v.ciudad_salida ?? cityOf(v.origen)
          const to     = v.ciudad_llegada ?? cityOf(v.destino)
          const isLast = i === segs.length - 1

          return (
            <div key={v.id ?? i} className="flex items-start">
              {/* City node */}
              <div className="flex flex-col items-center gap-1.5 pt-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-ink ring-2 ring-cream mt-0.5" />
                <span className="font-mono text-[10px] text-ink-light whitespace-nowrap">{from}</span>
              </div>

              {/* Connector + icon */}
              <button
                onClick={() => onSelect(v)}
                title={`${from} → ${to}`}
                className="flex items-center mt-1.5 mx-1 group"
              >
                <div className="h-px w-8 sm:w-12 bg-ink/25 group-hover:bg-ink transition-colors" />
                <span className="text-lg mx-0.5 group-hover:scale-125 transition-transform select-none">
                  {v.tipo === 'vuelo' ? '✈️' : '🚄'}
                </span>
                <div className="h-px w-8 sm:w-12 bg-ink/25 group-hover:bg-ink transition-colors" />
              </button>

              {isLast && (
                <div className="flex flex-col items-center gap-1.5 pt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-ink ring-2 ring-cream mt-0.5" />
                  <span className="font-mono text-[10px] text-ink-light whitespace-nowrap">{to}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const QUICK = [
  { to: '/familias',      label: 'Familias',   desc: 'Integrantes y documentos' },
  { to: '/reservas',      label: 'Reservas',   desc: 'Hoteles por ciudad'        },
  { to: '/transportes',   label: 'Tramos',     desc: 'Vuelos y trenes'           },
  { to: '/documentacion', label: 'Documentos', desc: 'Pasaportes y seguros'      },
  { to: '/gastos',        label: 'Gastos',     desc: 'Registro de gastos'        },
]

export default function Home() {
  if (!isConfigured) return <SupabaseBanner />

  const [selectedVuelo, setSelectedVuelo] = useState(null)
  const { data: ciudades, isLoading } = useFichasCiudad()
  const { data: pendientes }          = usePendientes()
  const { data: vuelos }              = useVuelos()

  const pendienteCount = (pendientes ?? []).filter(p => !p.hecho).length

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-ink">Europa 2027</h1>
          <p className="font-mono text-xs text-ink-light mt-1 tracking-wide">
            28 ene — 15 feb · 3 familias · 14 personas
          </p>
        </div>
        {pendienteCount > 0 && (
          <Link
            to="/pendientes"
            className="shrink-0 flex items-center gap-1.5 font-mono text-xs px-3 py-2 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-colors mt-1"
          >
            <span className="font-bold text-sm leading-none">{pendienteCount}</span>
            <span className="hidden sm:inline">pendientes</span>
          </Link>
        )}
      </div>

      {/* City cards */}
      <section className="mb-8">
        <h2 className="section-title">Ciudades</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="rounded-2xl bg-cream-dark animate-pulse" style={{ minHeight: 180 }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ciudades?.map(c => <CityCard key={c.id} c={c} />)}
          </div>
        )}
      </section>

      {/* Route timeline */}
      <section className="mb-8">
        <h2 className="section-title">Ruta del viaje</h2>
        <div className="card overflow-hidden py-3 px-0">
          {vuelos?.length ? (
            <RouteTimeline vuelos={vuelos} onSelect={setSelectedVuelo} />
          ) : (
            <div className="h-10 mx-4 rounded animate-pulse bg-cream-dark" />
          )}
        </div>
        <p className="font-mono text-[10px] text-ink-light mt-1.5 text-center">
          Toca ✈️ o 🚄 para ver detalles del tramo
        </p>
      </section>

      {/* Quick access */}
      <section>
        <h2 className="section-title">Accesos rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK.map(q => (
            <Link
              key={q.to}
              to={q.to}
              className="card hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <p className="font-mono text-sm font-medium text-ink">{q.label}</p>
              <p className="font-mono text-[10px] text-ink-light mt-0.5">{q.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {selectedVuelo && (
        <SegmentModal vuelo={selectedVuelo} onClose={() => setSelectedVuelo(null)} />
      )}
    </div>
  )
}
