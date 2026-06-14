import { useState } from 'react'
import { useVuelos, useUpdateVuelo } from '../lib/queries'
import { isConfigured } from '../lib/supabase'
import { useFamilyFilter, FAMILIAS } from '../context/FamilyFilterContext'
import FamilyFilter from '../components/FamilyFilter'
import FamiliaBadge from '../components/FamiliaBadge'
import SupabaseBanner from '../components/SupabaseBanner'

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function VueloRow({ v, selectedFamily }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    empresa:    v.empresa    ?? '',
    numero:     v.numero     ?? '',
    salida:     v.salida     ?? '',
    llegada:    v.llegada    ?? '',
    confirmado: v.confirmado ?? false,
    pnr:        { ...v.pnr },
  })
  const update = useUpdateVuelo()
  const confirmed = v.confirmado
  const pnrEntries = Object.entries(v.pnr ?? {}).filter(
    ([f]) => !selectedFamily || f === selectedFamily
  )

  function handleSave(e) {
    e.preventDefault()
    const updates = {
      empresa:    form.empresa.trim()  || null,
      numero:     form.numero.trim()   || null,
      salida:     form.salida.trim()   || null,
      llegada:    form.llegada.trim()  || null,
      confirmado: form.confirmado,
      pnr:        form.pnr,
    }
    update.mutate({ id: v.id, updates }, { onSuccess: () => setEditing(false) })
  }

  if (editing) {
    return (
      <div className="card border-ink/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-mono text-[10px] bg-cream-dark px-2 py-0.5 rounded uppercase tracking-wider text-ink-light">
              {v.tipo}
            </span>
            <p className="font-medium text-ink mt-1">{v.origen} → {v.destino}</p>
            <p className="font-mono text-xs text-ink-light">{fmt(v.fecha)}</p>
          </div>
          <button onClick={() => setEditing(false)} className="font-mono text-xs text-ink-light hover:text-ink">
            Cancelar
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['empresa',  'Empresa / aerolínea'],
              ['numero',   'Número de vuelo/tren'],
              ['salida',   'Hora salida (ej. 12:30)'],
              ['llegada',  'Hora llegada (ej. 16:00)'],
            ].map(([field, placeholder]) => (
              <input
                key={field}
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={placeholder}
                className="border border-cream-dark rounded-lg px-3 py-2 text-sm font-mono bg-white/60 focus:outline-none focus:border-ink transition-colors"
              />
            ))}
          </div>

          <div>
            <p className="font-mono text-[10px] text-ink-light uppercase tracking-wider mb-2">PNR por familia</p>
            <div className="space-y-1.5">
              {FAMILIAS.map(fam => (
                <div key={fam} className="flex items-center gap-2">
                  <FamiliaBadge familia={fam} />
                  <input
                    value={form.pnr[fam] ?? ''}
                    onChange={e => setForm(f => ({ ...f, pnr: { ...f.pnr, [fam]: e.target.value.trim() || null } }))}
                    placeholder="—"
                    className="flex-1 border border-cream-dark rounded-lg px-3 py-1.5 text-sm font-mono bg-white/60 focus:outline-none focus:border-ink transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.confirmado}
              onChange={e => setForm(f => ({ ...f, confirmado: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="font-mono text-sm text-ink">Confirmado</span>
          </label>

          <button
            type="submit"
            disabled={update.isPending}
            className="w-full py-2 rounded-lg bg-ink text-cream font-mono text-xs hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {update.isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {update.isError && (
            <p className="text-xs text-red-600 font-mono">{update.error?.message}</p>
          )}
        </form>
      </div>
    )
  }

  return (
    <div className={`card ${confirmed ? 'border-green-200' : 'border-amber-200'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
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

          <p className="font-medium text-ink">{v.origen} → {v.destino}</p>

          <div className="flex flex-wrap gap-x-3 text-xs font-mono text-ink-light mt-1">
            <span>{fmt(v.fecha)}</span>
            {v.empresa && <span>{v.empresa}</span>}
            {v.numero  && <span>{v.numero}</span>}
            {v.salida  && <span>{v.salida}{v.llegada ? ` → ${v.llegada}` : ''}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] text-ink-light uppercase tracking-wider">PNR</p>
            <button
              onClick={() => setEditing(true)}
              className="font-mono text-[10px] px-2 py-0.5 rounded border border-cream-dark text-ink-light hover:border-ink hover:text-ink transition-colors"
            >
              Editar
            </button>
          </div>
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
