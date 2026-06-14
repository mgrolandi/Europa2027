import { useState } from 'react'
import { usePendientes, useTogglePendiente } from '../lib/queries'
import { isConfigured } from '../lib/supabase'
import { useFamilyFilter } from '../context/FamilyFilterContext'
import FamilyFilter from '../components/FamilyFilter'
import FamiliaBadge from '../components/FamiliaBadge'
import SupabaseBanner from '../components/SupabaseBanner'

const CATS = {
  transportes:   'Transportes',
  entradas:      'Entradas',
  logistica:     'Logística',
  documentacion: 'Documentación',
}

const PRIORIDAD_STYLE = {
  urgente: 'text-red-600',
  pronto:  'text-amber-600',
  alta:    'text-amber-600',
  normal:  'text-ink-light',
  media:   'text-ink-light',
}

function PendienteRow({ item, onToggle }) {
  const done = item.hecho
  const prioStyle = done ? 'text-ink-light/40' : (PRIORIDAD_STYLE[item.prioridad] ?? 'text-ink-light')

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer group ${
        done
          ? 'border-cream-dark bg-cream/50 opacity-60'
          : item.urgente
            ? 'border-red-200 bg-red-50/50'
            : 'border-cream-dark bg-white/60 hover:border-ink-light/40'
      }`}
      onClick={() => onToggle(item)}
    >
      {/* Checkbox */}
      <span className={`mt-0.5 shrink-0 text-sm ${done ? 'text-green-600' : 'text-ink-light/40 group-hover:text-ink-light'}`}>
        {done ? '✓' : '○'}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`text-sm ${done ? 'line-through text-ink-light' : 'text-ink'}`}>
          {item.titulo}
        </p>

        {item.descripcion && (
          <p className={`text-xs mt-0.5 ${done ? 'text-ink-light/50' : 'text-ink-light'}`}>
            {item.descripcion}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {item.familia && item.familia !== 'Todas' && (
            <FamiliaBadge familia={item.familia} />
          )}
          {item.ciudad && (
            <span className="font-mono text-[10px] text-ink-light">{item.ciudad}</span>
          )}
          {item.fecha_limite_label && (
            <span className={`font-mono text-[10px] ${prioStyle}`}>
              {item.fecha_limite_label}
            </span>
          )}
          {item.precio_info && (
            <span className="font-mono text-[10px] text-ink-light">{item.precio_info}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Pendientes() {
  if (!isConfigured) return <SupabaseBanner />

  const { selectedFamily } = useFamilyFilter()
  const [activeCat, setActiveCat] = useState(null)
  const [showDone, setShowDone] = useState(false)

  const { data: pendientes, isLoading } = usePendientes(activeCat)
  const toggle = useTogglePendiente()

  const filtered = (pendientes ?? []).filter(p => {
    if (!showDone && p.hecho) return false
    if (selectedFamily) {
      const fam = p.familia
      if (fam && fam !== 'Todas' && !fam.includes(selectedFamily)) return false
    }
    return true
  })

  const pending = filtered.filter(p => !p.hecho)
  const done    = filtered.filter(p => p.hecho)

  const grouped = (activeCat ? [activeCat] : Object.keys(CATS)).reduce((acc, cat) => {
    acc[cat] = filtered.filter(p => p.categoria === cat)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ink">Pendientes</h1>
          <p className="font-mono text-xs text-ink-light mt-1">
            {pending.length} pendientes · {done.length} hechos
          </p>
        </div>
        <FamilyFilter />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4">
        <button
          onClick={() => setActiveCat(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-mono border whitespace-nowrap transition-colors ${
            !activeCat
              ? 'bg-ink text-cream border-ink'
              : 'bg-cream text-ink-light border-cream-dark hover:border-ink-light'
          }`}
        >
          Todos
        </button>
        {Object.entries(CATS).map(([cat, label]) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat === activeCat ? null : cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-mono border whitespace-nowrap transition-colors ${
              activeCat === cat
                ? 'bg-ink text-cream border-ink'
                : 'bg-cream text-ink-light border-cream-dark hover:border-ink-light'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Show done toggle */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setShowDone(s => !s)}
          className={`text-xs font-mono px-3 py-1 rounded-full border transition-colors ${
            showDone
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-cream text-ink-light border-cream-dark'
          }`}
        >
          {showDone ? 'Ocultar hechos' : 'Mostrar hechos'}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-lg bg-cream-dark animate-pulse" />)}
        </div>
      ) : (
        (activeCat ? [[activeCat, grouped[activeCat]]] : Object.entries(grouped)).map(([cat, list]) => {
          if (!list?.length) return null
          return (
            <section key={cat} className="mb-6">
              <h2 className="font-mono text-xs text-ink-light uppercase tracking-widest mb-2">
                {CATS[cat] ?? cat}
              </h2>
              <div className="space-y-2">
                {list.map(item => (
                  <PendienteRow
                    key={item.id}
                    item={item}
                    onToggle={p => toggle.mutate({ id: p.id, hecho: p.hecho })}
                  />
                ))}
              </div>
            </section>
          )
        })
      )}

      {filtered.length === 0 && !isLoading && (
        <p className="text-sm text-ink-light italic text-center py-8">
          {showDone ? 'Sin items.' : 'Todo al día. Mostrá los hechos para ver el historial.'}
        </p>
      )}
    </div>
  )
}
