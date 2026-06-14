import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useFichaCiudad, useHoteles, useVuelos, useLugares, usePendientes, useAddPendiente, useTogglePendiente } from '../lib/queries'
import { isConfigured } from '../lib/supabase'
import { useFamilyFilter } from '../context/FamilyFilterContext'
import FamilyFilter from '../components/FamilyFilter'
import FamiliaBadge from '../components/FamiliaBadge'
import LugarCard from '../components/LugarCard'
import SupabaseBanner from '../components/SupabaseBanner'

const CATS = {
  miradores: 'Miradores',
  bares:     'Bares',
  iconicos:  'Icónicos',
  musica:    'Música',
}

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Skeleton() {
  return <div className="h-8 rounded bg-cream-dark animate-pulse" />
}

function HotelCard({ h, comoLlegar }) {
  const confirmed = !!h.confirmacion
  return (
    <div className={`card ${confirmed ? 'border-green-200' : 'border-amber-200 bg-amber-50/30'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <FamiliaBadge familia={h.familia} />
          <h3 className="font-serif text-lg mt-1">{h.nombre ?? 'Por confirmar'}</h3>
          {h.habitacion && (
            <p className="font-mono text-xs text-ink-light">{h.habitacion}</p>
          )}
        </div>
        <span className={`font-mono text-xs px-2 py-1 rounded border shrink-0 ${
          confirmed
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-amber-100 text-amber-700 border-amber-200'
        }`}>
          {confirmed ? '✓ Conf.' : 'Pendiente'}
        </span>
      </div>

      {h.direccion && (
        <p className="text-sm text-ink-light mb-2">📍 {h.direccion}</p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-ink-light">
        {h.checkin  && <span>In: {fmt(h.checkin)}</span>}
        {h.checkout && <span>Out: {fmt(h.checkout)}</span>}
        {h.precio   && <span>{h.precio}</span>}
        {h.confirmacion && <span>#{h.confirmacion}</span>}
      </div>

      {h.notas && <p className="text-xs text-ink-light mt-2 italic">{h.notas}</p>}

      {comoLlegar && (
        <div className="mt-2 text-xs text-ink-light border-l-2 border-gold pl-2">
          {comoLlegar}
        </div>
      )}

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

function VueloCard({ v, tag }) {
  const confirmed = v.confirmado
  const familias = Object.entries(v.pnr ?? {})
  return (
    <div className={`card ${confirmed ? 'border-green-200' : 'border-amber-200'}`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <p className="font-mono text-[10px] text-ink-light uppercase tracking-widest">
            {v.tipo} · {tag}
          </p>
          <p className="font-medium text-ink">{v.origen} → {v.destino}</p>
          {(v.empresa || v.numero) && (
            <p className="font-mono text-xs text-ink-light">
              {[v.empresa, v.numero].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <span className={`font-mono text-xs px-2 py-1 rounded border shrink-0 ${
          confirmed
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-amber-100 text-amber-700 border-amber-200'
        }`}>
          {confirmed ? '✓' : 'Pendiente'}
        </span>
      </div>

      <p className="font-mono text-xs text-ink-light mb-2">
        {fmt(v.fecha)}{v.salida ? `  ·  ${v.salida}` : ''}{v.llegada ? ` → ${v.llegada}` : ''}
      </p>

      <div className="flex flex-wrap gap-2">
        {familias.map(([fam, pnr]) => (
          <div key={fam} className="flex items-center gap-1">
            <FamiliaBadge familia={fam} />
            <span className={`font-mono text-xs ${pnr ? 'text-ink' : 'text-amber-600'}`}>
              {pnr ?? 'sin PNR'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CityDetail() {
  const { ciudad } = useParams()
  const { selectedFamily } = useFamilyFilter()
  const [activeCat, setActiveCat]     = useState('miradores')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitulo, setNewTitulo]     = useState('')
  const [newCat, setNewCat]           = useState('logistica')

  if (!isConfigured) return <SupabaseBanner />

  const { data: ficha, isLoading: loadF } = useFichaCiudad(ciudad)
  const { data: hoteles }                 = useHoteles(ciudad)
  const { data: vuelos }                  = useVuelos()
  const { data: lugares }                 = useLugares(ciudad, activeCat)
  const { data: cityPendientes }          = usePendientes(null, ciudad)
  const addPendiente                      = useAddPendiente()
  const togglePendiente                   = useTogglePendiente()

  const { data: entradas } = usePendientes('entradas', ciudad)

  const openPendientes = (cityPendientes ?? []).filter(p => !p.hecho)
  const donePendientes = (cityPendientes ?? []).filter(p => p.hecho)
  const openEntradas   = (entradas ?? []).filter(p => !p.hecho)
  const doneEntradas   = (entradas ?? []).filter(p => p.hecho)

  function handleAddPendiente(e) {
    e.preventDefault()
    if (!newTitulo.trim()) return
    addPendiente.mutate(
      { categoria: newCat, titulo: newTitulo.trim(), ciudad, hecho: false },
      {
        onSuccess: () => {
          setNewTitulo('')
          setShowAddForm(false)
        },
      }
    )
  }

  const hotelesFiltered = (hoteles ?? []).filter(
    h => !selectedFamily || h.familia === selectedFamily
  )

  const entrada = (vuelos ?? []).filter(v => v.ciudad_llegada === ciudad)
  const salida  = (vuelos ?? []).filter(v => v.ciudad_salida  === ciudad)

  return (
    <div>
      {/* Breadcrumb */}
      <div className="font-mono text-xs text-ink-light mb-4">
        <Link to="/" className="hover:text-gold">Inicio</Link>
        <span className="mx-2">/</span>
        <span>{ciudad}</span>
      </div>

      {/* Header */}
      {loadF ? (
        <div className="mb-6 space-y-2"><Skeleton /><Skeleton /></div>
      ) : (
        <div className="mb-6">
          <h1 className="font-serif text-4xl text-ink">{ciudad}</h1>
          {ficha && (
            <p className="font-mono text-sm text-ink-light mt-1">
              {fmt(ficha.fecha_llegada)} — {fmt(ficha.fecha_salida)}
              {ficha.noches ? ` · ${ficha.noches} noches` : ''}
            </p>
          )}
        </div>
      )}

      {/* Ficha ciudad */}
      {ficha && (
        <section className="mb-6">
          <h2 className="section-title">Info ciudad</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {[
              ['País',         ficha.pais],
              ['Idioma',       ficha.idioma],
              ['Moneda',       ficha.moneda],
              ['Enchufe',      ficha.tipo_enchufe],
              ['Zona horaria', ficha.zona_horaria],
              ['Visa',         ficha.visa_info],
            ].map(([label, val]) => val && (
              <div key={label} className="rounded-lg bg-cream-dark p-3">
                <p className="font-mono text-[10px] text-ink-light uppercase tracking-wider">{label}</p>
                <p className="text-sm text-ink mt-1">{val}</p>
              </div>
            ))}
          </div>

          {ficha.emergencias && Object.keys(ficha.emergencias).length > 0 && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="font-mono text-[10px] text-red-700 uppercase tracking-wider mb-1">Emergencias</p>
              <div className="flex flex-wrap gap-4">
                {Object.entries(ficha.emergencias).map(([k, v]) => (
                  <span key={k} className="font-mono text-sm">
                    <span className="text-ink-light">{k}:</span>{' '}
                    <strong className="text-ink">{v}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Family filter */}
      <FamilyFilter className="mb-6" />

      {/* Hotels */}
      <section className="mb-6">
        <h2 className="section-title">Alojamiento</h2>
        {hotelesFiltered.length === 0 ? (
          <p className="text-sm text-ink-light italic">Sin reservas{selectedFamily ? ` para ${selectedFamily}` : ''}</p>
        ) : (
          <div className="space-y-3">
            {hotelesFiltered.map(h => (
              <HotelCard key={h.id} h={h} comoLlegar={ficha?.como_llegar_aeropuerto} />
            ))}
          </div>
        )}

        {ficha?.como_llegar_aeropuerto && (
          <div className="mt-3 border-l-4 border-gold pl-4 bg-gold-bg rounded-r-lg py-3 pr-3">
            <p className="font-mono text-[10px] text-gold uppercase tracking-wider mb-1">
              Traslado desde aeropuerto
            </p>
            <p className="text-sm text-ink">{ficha.como_llegar_aeropuerto}</p>
          </div>
        )}
      </section>

      {/* Transport */}
      {(entrada.length > 0 || salida.length > 0) && (
        <section className="mb-6">
          <h2 className="section-title">Transporte</h2>
          <div className="space-y-3">
            {entrada.map(v => <VueloCard key={v.id} v={v} tag="Llegada" />)}
            {salida.map(v  => <VueloCard key={v.id} v={v} tag="Salida"  />)}
          </div>

          {ficha?.tips_transporte?.length > 0 && (
            <div className="mt-3 rounded-lg bg-cream-dark p-3">
              <p className="font-mono text-[10px] text-ink-light uppercase tracking-wider mb-2">
                Tips de transporte
              </p>
              <ul className="space-y-1.5">
                {ficha.tips_transporte.map((t, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink">
                    <span className="text-gold shrink-0">·</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Entradas y actividades */}
      {(openEntradas.length > 0 || doneEntradas.length > 0) && (
        <section className="mb-6">
          <h2 className="section-title">Entradas y actividades</h2>
          <div className="space-y-2">
            {[...openEntradas, ...doneEntradas].map(p => (
              <div
                key={p.id}
                className={`card flex items-start gap-3 ${p.hecho ? 'opacity-60' : p.urgente ? 'border-red-200 bg-red-50/30' : ''}`}
              >
                <button
                  onClick={() => togglePendiente.mutate({ id: p.id, hecho: p.hecho })}
                  className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 transition-colors ${
                    p.hecho
                      ? 'border-green-500 bg-green-500'
                      : 'border-ink-light/50 hover:border-ink'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm text-ink ${p.hecho ? 'line-through text-ink-light' : ''}`}>
                    {p.titulo}
                  </p>
                  {p.descripcion && (
                    <p className="font-mono text-[10px] text-ink-light mt-0.5">{p.descripcion}</p>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    {p.fecha_limite_label && (
                      <span className={`font-mono text-[10px] ${p.urgente ? 'text-red-600' : 'text-ink-light'}`}>
                        {p.fecha_limite_label}
                      </span>
                    )}
                    {p.precio_info && (
                      <span className="font-mono text-[10px] text-ink-light">{p.precio_info}</span>
                    )}
                  </div>
                </div>
                {p.urgente && !p.hecho && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 shrink-0">
                    Urgente
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* City pendientes */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title mb-0">Pendientes</h2>
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="font-mono text-xs text-ink-light border border-cream-dark rounded-lg px-3 py-1.5 hover:border-ink hover:text-ink transition-colors"
          >
            {showAddForm ? 'Cancelar' : '+ Agregar'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddPendiente} className="card mb-3 space-y-2">
            <input
              value={newTitulo}
              onChange={e => setNewTitulo(e.target.value)}
              placeholder="Descripción del pendiente…"
              required
              className="w-full border border-cream-dark rounded-lg px-3 py-2 text-sm font-mono bg-white/60 focus:outline-none focus:border-ink transition-colors"
            />
            <div className="flex gap-2">
              <select
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                className="border border-cream-dark rounded-lg px-3 py-2 text-xs font-mono bg-white/60 focus:outline-none"
              >
                <option value="logistica">Logística</option>
                <option value="transportes">Transportes</option>
                <option value="documentacion">Documentación</option>
              </select>
              <button
                type="submit"
                disabled={addPendiente.isPending}
                className="flex-1 py-2 rounded-lg bg-ink text-cream font-mono text-xs hover:bg-ink/90 transition-colors disabled:opacity-50"
              >
                {addPendiente.isPending ? 'Guardando…' : 'Agregar'}
              </button>
            </div>
          </form>
        )}

        {openPendientes.length === 0 && donePendientes.length === 0 ? (
          <p className="text-sm text-ink-light italic">Sin pendientes para {ciudad}</p>
        ) : (
          <div className="space-y-1.5">
            {openPendientes.map(p => (
              <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl border border-cream-dark bg-white/60">
                <button
                  onClick={() => togglePendiente.mutate({ id: p.id, hecho: p.hecho })}
                  className="mt-0.5 w-4 h-4 rounded border-2 border-ink-light/50 shrink-0 hover:border-ink transition-colors"
                />
                <div>
                  <p className="text-sm text-ink">{p.titulo}</p>
                  <p className="font-mono text-[10px] text-ink-light mt-0.5 capitalize">{p.categoria}</p>
                </div>
              </div>
            ))}
            {donePendientes.map(p => (
              <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl border border-cream-dark bg-white/30 opacity-50">
                <button
                  onClick={() => togglePendiente.mutate({ id: p.id, hecho: p.hecho })}
                  className="mt-0.5 w-4 h-4 rounded border-2 border-green-500 bg-green-500 shrink-0"
                />
                <p className="text-sm text-ink-light line-through">{p.titulo}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Places */}
      <section>
        <h2 className="section-title">Qué hacer</h2>

        {/* Category tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4">
          {Object.entries(CATS).map(([cat, label]) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-mono border whitespace-nowrap transition-colors ${
                activeCat === cat
                  ? 'bg-ink text-cream border-ink'
                  : 'bg-cream text-ink-light border-cream-dark hover:border-ink-light'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {lugares && lugares.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lugares.map(l => <LugarCard key={l.id} lugar={l} />)}
          </div>
        ) : (
          <p className="text-sm text-ink-light italic">Sin lugares cargados</p>
        )}
      </section>
    </div>
  )
}
