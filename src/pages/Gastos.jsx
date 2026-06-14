import { useState } from 'react'
import { useGastos, useAddGasto, useDeleteGasto } from '../lib/queries'
import { isConfigured } from '../lib/supabase'
import { useFamilyFilter, FAMILIAS } from '../context/FamilyFilterContext'
import FamilyFilter from '../components/FamilyFilter'
import FamiliaBadge from '../components/FamiliaBadge'
import SupabaseBanner from '../components/SupabaseBanner'

const CATEGORIAS  = ['alojamiento', 'transporte', 'comida', 'entradas', 'otros']
const CIUDADES    = ['Londres', 'Paris', 'Bruselas', 'Roma', 'Madrid', '']
const EUR_TO_USD  = 1.178

const BLANK = {
  descripcion: '',
  monto: '',
  moneda: 'EUR',
  categoria: 'otros',
  pagado_por: 'Barrera',
  dividido_entre: ['Barrera', 'Nader', 'Ahmad'],
  ciudad: '',
  fecha: new Date().toISOString().slice(0, 10),
}

function GastoRow({ g, onDelete }) {
  return (
    <div className="card flex items-start justify-between gap-2">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <FamiliaBadge familia={g.pagado_por} />
          <span className="font-mono text-[10px] text-ink-light uppercase bg-cream-dark px-2 py-0.5 rounded">
            {g.categoria}
          </span>
          {g.ciudad && (
            <span className="font-mono text-[10px] text-ink-light">{g.ciudad}</span>
          )}
        </div>
        <p className="text-sm text-ink">{g.descripcion}</p>
        <p className="font-mono text-xs text-ink-light mt-0.5">{g.fecha}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono font-medium text-ink">
          {g.moneda} {Number(g.monto).toFixed(2)}
        </p>
        {g.moneda === 'EUR' && (
          <p className="font-mono text-[10px] text-ink-light">
            (USD {(Number(g.monto) * EUR_TO_USD).toFixed(2)})
          </p>
        )}
        <button
          onClick={() => onDelete(g.id)}
          className="text-[10px] font-mono text-ink-light/50 hover:text-red-500 transition-colors mt-1"
        >
          eliminar
        </button>
      </div>
    </div>
  )
}

export default function Gastos() {
  if (!isConfigured) return <SupabaseBanner />

  const { selectedFamily } = useFamilyFilter()
  const { data: gastos, isLoading } = useGastos(selectedFamily ?? undefined)
  const addGasto    = useAddGasto()
  const deleteGasto = useDeleteGasto()

  const [form, setForm] = useState(BLANK)
  const [showForm, setShowForm] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.descripcion || !form.monto) return
    await addGasto.mutateAsync({
      ...form,
      monto: parseFloat(form.monto),
    })
    setForm(BLANK)
    setShowForm(false)
  }

  const MONEDAS = ['EUR', 'USD']

  const toUSD = (g) => g.moneda === 'EUR' ? Number(g.monto) * EUR_TO_USD : Number(g.monto)

  const totalByMoneda = MONEDAS.reduce((acc, m) => {
    acc[m] = (gastos ?? []).filter(g => g.moneda === m).reduce((s, g) => s + Number(g.monto), 0)
    return acc
  }, {})

  const totalUSD = (gastos ?? []).reduce((s, g) => s + toUSD(g), 0)

  const byFamilyUSD = FAMILIAS.reduce((acc, f) => {
    acc[f] = (gastos ?? []).filter(g => g.pagado_por === f).reduce((s, g) => s + toUSD(g), 0)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Gastos</h1>
          <div className="flex gap-4 mt-1 flex-wrap">
            {MONEDAS.map(m => (
              <span key={m} className="font-mono text-xs text-ink-light">
                {m} {totalByMoneda[m].toFixed(0)}
              </span>
            ))}
            <span className="font-mono text-xs font-medium text-ink">
              ≈ USD {totalUSD.toFixed(0)} total
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="px-4 py-1.5 rounded-full text-sm font-mono bg-ink text-cream border border-ink hover:bg-ink/90 transition-colors shrink-0 mt-1"
        >
          + Agregar
        </button>
      </div>

      <div className="mb-6">
        <FamilyFilter />
      </div>

      {/* Summary */}
      <div className="card mb-6">
        <p className="font-mono text-[10px] text-ink-light uppercase tracking-widest mb-3">Total en USD · 1 EUR = 1.178 USD</p>
        <div className="grid grid-cols-3 gap-2">
          {FAMILIAS.map(f => (
            <div key={f} className="text-center">
              <FamiliaBadge familia={f} className="mb-1" />
              <p className="font-mono text-sm font-medium text-ink mt-1">
                USD {byFamilyUSD[f].toFixed(0)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-3">
          <p className="font-serif text-lg text-ink">Nuevo gasto</p>

          <input
            required
            placeholder="Descripción"
            value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            className="w-full border border-cream-dark rounded-lg px-3 py-2 text-sm font-sans bg-cream focus:outline-none focus:border-ink"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              step="0.01"
              min="0"
              placeholder="Monto"
              value={form.monto}
              onChange={e => set('monto', e.target.value)}
              className="border border-cream-dark rounded-lg px-3 py-2 text-sm font-mono bg-cream focus:outline-none focus:border-ink"
            />
            <select
              value={form.moneda}
              onChange={e => set('moneda', e.target.value)}
              className="border border-cream-dark rounded-lg px-3 py-2 text-sm font-mono bg-cream focus:outline-none focus:border-ink"
            >
              <option>EUR</option>
              <option>USD</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.categoria}
              onChange={e => set('categoria', e.target.value)}
              className="border border-cream-dark rounded-lg px-3 py-2 text-sm font-mono bg-cream focus:outline-none focus:border-ink"
            >
              {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
            </select>
            <select
              value={form.pagado_por}
              onChange={e => set('pagado_por', e.target.value)}
              className="border border-cream-dark rounded-lg px-3 py-2 text-sm font-mono bg-cream focus:outline-none focus:border-ink"
            >
              {FAMILIAS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.ciudad}
              onChange={e => set('ciudad', e.target.value)}
              className="border border-cream-dark rounded-lg px-3 py-2 text-sm font-mono bg-cream focus:outline-none focus:border-ink"
            >
              <option value="">— ciudad —</option>
              {CIUDADES.filter(Boolean).map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              type="date"
              value={form.fecha}
              onChange={e => set('fecha', e.target.value)}
              className="border border-cream-dark rounded-lg px-3 py-2 text-sm font-mono bg-cream focus:outline-none focus:border-ink"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={addGasto.isPending}
              className="px-4 py-2 rounded-lg bg-ink text-cream text-sm font-mono hover:bg-ink/90 transition-colors disabled:opacity-50"
            >
              {addGasto.isPending ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-cream-dark text-sm font-mono text-ink-light hover:border-ink transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-cream-dark animate-pulse" />)}
        </div>
      ) : gastos?.length ? (
        <div className="space-y-6">
          {['alojamiento', 'transporte', ...CATEGORIAS.filter(c => c !== 'alojamiento' && c !== 'transporte')]
            .filter(cat => (gastos ?? []).some(g => g.categoria === cat))
            .map(cat => {
              const items = gastos.filter(g => g.categoria === cat)
              const subtotalUSD = items.reduce((s, g) => s + toUSD(g), 0)
              return (
                <div key={cat}>
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="font-mono text-[10px] text-ink-light uppercase tracking-widest capitalize">{cat}</p>
                    <p className="font-mono text-[10px] text-ink-light">≈ USD {subtotalUSD.toFixed(0)}</p>
                  </div>
                  <div className="space-y-2">
                    {items.map(g => (
                      <GastoRow key={g.id} g={g} onDelete={id => deleteGasto.mutate(id)} />
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      ) : (
        <p className="text-sm text-ink-light italic text-center py-8">
          Sin gastos registrados. Usá "+ Agregar" para el primero.
        </p>
      )}
    </div>
  )
}
