import { useVuelos } from '../lib/queries'
import { isConfigured } from '../lib/supabase'
import { useFamilyFilter } from '../context/FamilyFilterContext'
import FamilyFilter from '../components/FamilyFilter'
import FamiliaBadge from '../components/FamiliaBadge'
import SupabaseBanner from '../components/SupabaseBanner'

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function VueloRow({ v, selectedFamily }) {
  const confirmed = v.confirmado
  const pnrEntries = Object.entries(v.pnr ?? {}).filter(
    ([f]) => !selectedFamily || f === selectedFamily
  )

  return (
    <div className={`card ${confirmed ? 'border-green-200' : 'border-amber-200'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        {/* Left: route */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] bg-cream-dark px-2 py-0.5 rounded uppercase tracking-wider text-ink-light">
              {v.tipo}
            </span>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
              confirmed
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-amber-100 text-amber-700 border-amber-200'
            }`}>
              {confirmed ? 'Confirmado' : 'Pendiente'}
            </span>
          </div>

          <p className="font-medium text-ink">
            {v.origen} → {v.destino}
          </p>

          <div className="flex flex-wrap gap-x-3 text-xs font-mono text-ink-light mt-1">
            <span>{fmt(v.fecha)}</span>
            {v.empresa && <span>{v.empresa}</span>}
            {v.numero  && <span>{v.numero}</span>}
            {v.salida  && <span>{v.salida}{v.llegada ? ` → ${v.llegada}` : ''}</span>}
          </div>
        </div>

        {/* Right: PNRs */}
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-[10px] text-ink-light uppercase tracking-wider">PNR</p>
          {pnrEntries.map(([fam, pnr]) => (
            <div key={fam} className="flex items-center gap-2">
              <FamiliaBadge familia={fam} />
              <span className={`font-mono text-sm ${pnr ? 'text-ink' : 'text-amber-500'}`}>
                {pnr ?? '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Transportes() {
  if (!isConfigured) return <SupabaseBanner />

  const { data: vuelos, isLoading } = useVuelos()
  const { selectedFamily } = useFamilyFilter()

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ink">Transportes</h1>
          <p className="font-mono text-xs text-ink-light mt-1">
            Vuelos y trenes del viaje · {vuelos?.length ?? '…'} tramos
          </p>
        </div>
        <FamilyFilter />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-xl bg-cream-dark animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {vuelos?.map(v => (
            <VueloRow key={v.id} v={v} selectedFamily={selectedFamily} />
          ))}
          {!vuelos?.length && (
            <p className="text-sm text-ink-light italic">Sin tramos cargados</p>
          )}
        </div>
      )}
    </div>
  )
}
