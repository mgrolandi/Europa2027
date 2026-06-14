import { useHoteles } from '../lib/queries'
import { isConfigured } from '../lib/supabase'
import { useFamilyFilter } from '../context/FamilyFilterContext'
import FamilyFilter from '../components/FamilyFilter'
import FamiliaBadge from '../components/FamiliaBadge'
import SupabaseBanner from '../components/SupabaseBanner'

const CITIES = ['Londres', 'Paris', 'Bruselas', 'Roma', 'Madrid']

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function HotelCard({ h }) {
  const confirmed = !!h.confirmacion
  return (
    <div className={`card ${confirmed ? 'border-green-200' : 'border-amber-200 bg-amber-50/20'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <FamiliaBadge familia={h.familia} />
          <h3 className="font-serif text-base mt-1">{h.nombre ?? 'Por confirmar'}</h3>
          {h.habitacion && <p className="font-mono text-xs text-ink-light">{h.habitacion}</p>}
        </div>
        <span className={`font-mono text-[10px] px-2 py-1 rounded border shrink-0 ${
          confirmed
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-amber-100 text-amber-700 border-amber-200'
        }`}>
          {confirmed ? 'Confirmado' : 'Pendiente'}
        </span>
      </div>

      {h.direccion && <p className="text-xs text-ink-light mb-2">📍 {h.direccion}</p>}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-ink-light">
        <span>In: {fmt(h.checkin)}</span>
        <span>Out: {fmt(h.checkout)}</span>
        {h.precio && <span>{h.precio}</span>}
        {h.confirmacion && <span>#{h.confirmacion}</span>}
      </div>

      {h.notas && <p className="text-xs text-ink-light mt-2 italic">{h.notas}</p>}

      {h.maps_url && (
        <a
          href={h.maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs font-mono text-gold hover:text-gold-light underline underline-offset-2"
        >
          Ver en Maps
        </a>
      )}
    </div>
  )
}

export default function Reservas() {
  if (!isConfigured) return <SupabaseBanner />

  const { selectedFamily } = useFamilyFilter()
  const { data: hoteles, isLoading } = useHoteles(null, selectedFamily ?? undefined)

  const byCity = CITIES.reduce((acc, c) => {
    acc[c] = (hoteles ?? []).filter(h => h.ciudad === c)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ink">Reservas</h1>
          <p className="font-mono text-xs text-ink-light mt-1">Alojamiento por ciudad</p>
        </div>
        <FamilyFilter />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-32 rounded-xl bg-cream-dark animate-pulse" />)}
        </div>
      ) : (
        CITIES.map(ciudad => {
          const list = byCity[ciudad]
          if (!list?.length) return null
          return (
            <section key={ciudad} className="mb-8">
              <h2 className="font-serif text-xl text-ink mb-3 border-b border-cream-dark pb-2">
                {ciudad}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map(h => <HotelCard key={h.id} h={h} />)}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
