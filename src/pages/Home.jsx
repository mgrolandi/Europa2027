import { Link } from 'react-router-dom'
import { useFichasCiudad, usePendientes } from '../lib/queries'
import { isConfigured } from '../lib/supabase'
import FamilyFilter from '../components/FamilyFilter'
import SupabaseBanner from '../components/SupabaseBanner'

const CITY_COLORS = {
  Londres:  'from-slate-700  to-slate-900',
  Paris:    'from-rose-700   to-rose-900',
  Bruselas: 'from-yellow-600 to-yellow-900',
  Roma:     'from-orange-600 to-orange-900',
  Madrid:   'from-red-700    to-red-900',
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
      className={`relative rounded-xl overflow-hidden min-h-[152px] flex flex-col justify-end bg-gradient-to-br ${CITY_COLORS[c.ciudad] ?? 'from-gray-700 to-gray-900'} shadow-md hover:shadow-xl transition-shadow group`}
    >
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
      <div className="relative p-5">
        <div className="text-3xl mb-1">{CITY_FLAGS[c.ciudad] ?? '🌍'}</div>
        <h3 className="font-serif text-2xl text-white font-bold">{c.ciudad}</h3>
        <p className="font-mono text-xs text-white/75 mt-0.5">
          {fmt(c.fecha_llegada)} — {fmt(c.fecha_salida)}
          {c.noches ? ` · ${c.noches}n` : ''}
        </p>
        <p className="font-mono text-[10px] text-white/50 mt-0.5">{c.moneda} · {c.idioma}</p>
      </div>
    </Link>
  )
}

const QUICK = [
  { to: '/transportes',   label: 'Transportes' },
  { to: '/reservas',      label: 'Reservas'    },
  { to: '/gastos',        label: 'Gastos'      },
  { to: '/documentacion', label: 'Documentos'  },
  { to: '/pendientes',    label: 'Pendientes'  },
]

export default function Home() {
  if (!isConfigured) return <SupabaseBanner />

  const { data: ciudades, isLoading } = useFichasCiudad()
  const { data: allPendientes } = usePendientes()

  const urgentes = allPendientes?.filter(p => !p.hecho && (p.urgente || p.prioridad === 'urgente')) ?? []

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-ink">Europa 2027</h1>
        <p className="font-mono text-sm text-ink-light mt-1">
          28 ene — 15 feb · 3 familias · 14 personas
        </p>
      </div>

      {/* Alerts */}
      {urgentes.length > 0 && (
        <section className="mb-8">
          <h2 className="section-title">Atención requerida</h2>
          <div className="space-y-2">
            {urgentes.slice(0, 6).map(p => (
              <div
                key={p.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50"
              >
                <span className="text-red-500 mt-0.5 shrink-0">▲</span>
                <div>
                  <p className="text-sm font-medium text-ink">{p.titulo}</p>
                  {p.descripcion && (
                    <p className="text-xs text-ink-light mt-0.5">{p.descripcion}</p>
                  )}
                  {p.fecha_limite_label && (
                    <p className="text-xs text-red-600 font-mono mt-0.5">{p.fecha_limite_label}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cities */}
      <section className="mb-8">
        <h2 className="section-title">Ciudades</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-40 rounded-xl bg-cream-dark animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ciudades?.map(c => <CityCard key={c.id} c={c} />)}
          </div>
        )}
      </section>

      {/* Quick access */}
      <section className="mb-8">
        <h2 className="section-title">Accesos rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {QUICK.map(q => (
            <Link
              key={q.to}
              to={q.to}
              className="flex items-center justify-center p-4 rounded-xl border border-cream-dark bg-white/60 hover:bg-cream-dark hover:shadow transition-all text-sm font-mono text-ink text-center"
            >
              {q.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Family filter */}
      <section>
        <h2 className="section-title">Filtrar por familia</h2>
        <FamilyFilter />
        <p className="text-xs text-ink-light mt-2 font-mono">
          El filtro aplica a todas las secciones de la app.
        </p>
      </section>
    </div>
  )
}
