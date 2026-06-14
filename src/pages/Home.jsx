import { Link } from 'react-router-dom'
import { useFichasCiudad, usePendientes } from '../lib/queries'
import { isConfigured } from '../lib/supabase'
import SupabaseBanner from '../components/SupabaseBanner'

const CITY_COLORS = {
  Londres:  'from-slate-600  to-slate-900',
  Paris:    'from-rose-600   to-rose-900',
  Bruselas: 'from-yellow-600 to-amber-900',
  Roma:     'from-orange-500 to-orange-900',
  Madrid:   'from-red-600    to-red-900',
}

const CITY_FLAGS = {
  Londres: '🇬🇧', Paris: '🇫🇷', Bruselas: '🇧🇪', Roma: '🇮🇹', Madrid: '🇪🇸',
}

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function CityCard({ c }) {
  return (
    <Link
      to={`/ciudad/${c.ciudad}`}
      className={`relative rounded-2xl overflow-hidden flex flex-col justify-end bg-gradient-to-br ${CITY_COLORS[c.ciudad] ?? 'from-gray-600 to-gray-900'} shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all group`}
      style={{ minHeight: 180 }}
    >
      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />
      <div className="relative p-5">
        <div className="text-4xl mb-1 leading-none">{CITY_FLAGS[c.ciudad] ?? '🌍'}</div>
        <h3 className="font-serif text-2xl text-white font-bold leading-tight">{c.ciudad}</h3>
        <p className="font-mono text-xs text-white/70 mt-1">
          {fmt(c.fecha_llegada)} — {fmt(c.fecha_salida)}
          {c.noches ? <span className="ml-2 text-white/50">· {c.noches} noches</span> : null}
        </p>
        <p className="font-mono text-[10px] text-white/45 mt-0.5">{c.moneda}</p>
      </div>
    </Link>
  )
}

const QUICK = [
  { to: '/familias',      label: 'Familias',      desc: 'Integrantes y documentos'  },
  { to: '/reservas',      label: 'Reservas',      desc: 'Hoteles por ciudad'         },
  { to: '/transportes',   label: 'Transportes',   desc: 'Vuelos y trenes'            },
  { to: '/documentacion', label: 'Documentos',    desc: 'Pasaportes y seguros'       },
  { to: '/pendientes',    label: 'Pendientes',    desc: 'Tareas y reservas'          },
  { to: '/gastos',        label: 'Gastos',        desc: 'Registro de gastos'         },
]

export default function Home() {
  if (!isConfigured) return <SupabaseBanner />

  const { data: ciudades, isLoading } = useFichasCiudad()
  const { data: pendientes }          = usePendientes()

  const urgentes = (pendientes ?? []).filter(p => !p.hecho && (p.urgente || p.prioridad === 'urgente'))

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-ink">Europa 2027</h1>
        <p className="font-mono text-xs text-ink-light mt-1 tracking-wide">
          28 ene — 15 feb · 3 familias · 14 personas
        </p>
      </div>

      {/* Alerts */}
      {urgentes.length > 0 && (
        <section className="mb-8">
          <h2 className="section-title">Atención requerida</h2>
          <div className="space-y-2">
            {urgentes.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50">
                <span className="text-red-500 shrink-0 mt-0.5 text-sm">▲</span>
                <div>
                  <p className="text-sm font-medium text-ink">{p.titulo}</p>
                  {p.fecha_limite_label && (
                    <p className="font-mono text-xs text-red-600 mt-0.5">{p.fecha_limite_label}</p>
                  )}
                  {p.descripcion && (
                    <p className="text-xs text-ink-light mt-0.5">{p.descripcion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* City cards */}
      <section className="mb-8">
        <h2 className="section-title">Ciudades</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1,2,3,4,5].map(i => <div key={i} className="rounded-2xl bg-cream-dark animate-pulse" style={{minHeight:180}} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ciudades?.map(c => <CityCard key={c.id} c={c} />)}
          </div>
        )}
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
    </div>
  )
}
