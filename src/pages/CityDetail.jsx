import { useParams, Link } from 'react-router-dom'
import { useState, useRef } from 'react'
import { useFichaCiudad, useHoteles, useVuelos, useLugares, usePendientes, useAddPendiente, useTogglePendiente, useActividades, useAddActividad, useUpdateActividad, useUploadDocumento, useDocumentos } from '../lib/queries'
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

function ActividadCard({ a, hasVoucher, onToggleConfirm, onUploadVoucher }) {
  const fileRef = useRef()
  const upload  = useUploadDocumento()

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    onUploadVoucher(file)
    e.target.value = ''
  }

  function fmtLocal(iso) {
    if (!iso) return null
    return new Date(iso + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className={`card ${a.confirmada ? 'border-green-200' : 'border-amber-200 bg-amber-50/20'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink text-sm">{a.nombre}</p>
          {a.descripcion && <p className="text-xs text-ink-light mt-0.5">{a.descripcion}</p>}
          <div className="flex flex-wrap gap-x-3 text-xs font-mono text-ink-light mt-1">
            {a.fecha && <span>{fmtLocal(a.fecha)}</span>}
            {a.hora  && <span>{a.hora}</span>}
            {a.precio && <span className="text-ink">{a.precio}</span>}
            {a.confirmacion && <span>#{a.confirmacion}</span>}
          </div>
        </div>
        <button
          onClick={onToggleConfirm}
          className={`font-mono text-[10px] px-2 py-0.5 rounded border shrink-0 hover:opacity-80 transition-opacity cursor-pointer ${
            a.confirmada
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-amber-100 text-amber-700 border-amber-200'
          }`}
        >
          {a.confirmada ? 'Confirmada ✓' : 'Pendiente'}
        </button>
      </div>
      <div className="mt-2">
        {hasVoucher ? (
          <span className="font-mono text-[10px] px-2 py-0.5 rounded border bg-green-100 text-green-700 border-green-200">
            ✓ Voucher subido
          </span>
        ) : (
          <>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={upload.isPending}
              className="font-mono text-[10px] px-2 py-0.5 rounded border border-cream-dark text-ink-light hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
            >
              {upload.isPending ? 'Subiendo…' : '+ Voucher'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function VoucherBtn({ a, uploadDoc }) {
  const ref = useRef()
  return (
    <>
      <input ref={ref} type="file" className="hidden" onChange={e => {
        const f = e.target.files?.[0]
        if (f) uploadDoc.mutate({ file: f, entidad_id: a.id, tipo_doc: 'voucher', entidad_tipo: 'actividad' })
        e.target.value = ''
      }} />
      <button
        onClick={() => ref.current?.click()}
        className="font-mono text-[10px] px-2 py-0.5 rounded border border-cream-dark text-ink-light hover:border-ink hover:text-ink transition-colors"
      >+ Voucher</button>
    </>
  )
}

export default function CityDetail() {
  const { ciudad } = useParams()
  const { selectedFamily } = useFamilyFilter()
  const [activeCat, setActiveCat]     = useState('miradores')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitulo, setNewTitulo]     = useState('')
  const [newCat, setNewCat]           = useState('logistica')
  const [showAddActividad, setShowAddActividad] = useState(false)
  const [newActividad, setNewActividad] = useState({ nombre: '', fecha: '', precio: '', confirmada: false, confirmacion: '' })

  if (!isConfigured) return <SupabaseBanner />

  const { data: ficha, isLoading: loadF } = useFichaCiudad(ciudad)
  const { data: hoteles }                 = useHoteles(ciudad)
  const { data: vuelos }                  = useVuelos()
  const { data: lugares }                 = useLugares(ciudad, activeCat)
  const { data: cityPendientes }          = usePendientes(null, ciudad)
  const addPendiente                      = useAddPendiente()
  const togglePendiente                   = useTogglePendiente()

  const { data: entradas } = usePendientes('entradas', ciudad)

  const { data: actividades }  = useActividades(ciudad)
  const addActividad           = useAddActividad()
  const updateActividad        = useUpdateActividad()
  const uploadDoc              = useUploadDocumento()
  const { data: documentos }   = useDocumentos()

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

  function handleAddActividad(e) {
    e.preventDefault()
    if (!newActividad.nombre.trim()) return
    addActividad.mutate(
      {
        ciudad,
        nombre:      newActividad.nombre.trim(),
        fecha:       newActividad.fecha || null,
        precio:      newActividad.precio.trim() || null,
        confirmada:  newActividad.confirmada,
        confirmacion: newActividad.confirmacion.trim() || null,
      },
      { onSuccess: () => { setNewActividad({ nombre: '', fecha: '', precio: '', confirmada: false, confirmacion: '' }); setShowAddActividad(false) } }
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

      {/* Ficha ciudad — card compacta */}
      {ficha && (
        <div className="rounded-xl border border-cream-dark bg-cream-dark/40 px-4 py-3 mb-6 flex flex-wrap gap-x-6 gap-y-1.5 text-xs font-mono">
          {[
            ['🌍', ficha.pais],
            ['💬', ficha.idioma],
            ['💰', ficha.moneda],
            ['🔌', ficha.tipo_enchufe],
            ['🕐', ficha.zona_horaria],
            ['✈️', ficha.visa_info],
          ].filter(([, v]) => v).map(([icon, val]) => (
            <span key={val} className="text-ink-light">
              {icon} <span className="text-ink">{val}</span>
            </span>
          ))}
        </div>
      )}

      {/* Nav interno */}
      <div className="flex gap-2 flex-wrap mb-6 pb-6 border-b border-cream-dark">
        {[
          { id: 'alojamiento', icon: '🏨', label: 'Alojamiento' },
          { id: 'transporte',  icon: '🚇', label: 'Transporte'  },
          { id: 'actividades', icon: '🎭', label: 'Actividades' },
          { id: 'guia',        icon: '📋', label: 'Guía'        },
        ].map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ink text-cream font-mono text-xs border-2 border-ink hover:bg-transparent hover:text-ink transition-all cursor-pointer"
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Family filter */}
      <FamilyFilter className="mb-6" />

      {/* Hotels */}
      <section className="mb-6" id="alojamiento">
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
      <section className="mb-6" id="transporte">
        <h2 className="section-title">Transporte</h2>
        {(entrada.length > 0 || salida.length > 0) ? (
          <div className="space-y-3">
            {entrada.map(v => <VueloCard key={v.id} v={v} tag="Llegada" />)}
            {salida.map(v  => <VueloCard key={v.id} v={v} tag="Salida"  />)}
          </div>
        ) : (
          <p className="text-sm text-ink-light italic">Sin vuelos cargados para {ciudad}</p>
        )}
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

      {/* Actividades — agenda + opciones */}
      <section className="mb-6" id="actividades">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Actividades</h2>
          <button
            onClick={() => setShowAddActividad(v => !v)}
            className="font-mono text-xs text-ink-light border border-cream-dark rounded-lg px-3 py-1.5 hover:border-ink hover:text-ink transition-colors"
          >
            {showAddActividad ? 'Cancelar' : '+ Agregar'}
          </button>
        </div>

        {showAddActividad && (
          <form onSubmit={handleAddActividad} className="card mb-4 space-y-2">
            <input
              value={newActividad.nombre}
              onChange={e => setNewActividad(v => ({ ...v, nombre: e.target.value }))}
              placeholder="Nombre de la actividad o entrada…"
              required
              className="w-full border border-cream-dark rounded-lg px-3 py-2 text-sm font-mono bg-white/60 focus:outline-none focus:border-ink transition-colors"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="date"
                value={newActividad.fecha}
                onChange={e => setNewActividad(v => ({ ...v, fecha: e.target.value }))}
                className="border border-cream-dark rounded-lg px-3 py-2 text-sm font-mono bg-white/60 focus:outline-none focus:border-ink"
              />
              <input
                type="time"
                value={newActividad.hora ?? ''}
                onChange={e => setNewActividad(v => ({ ...v, hora: e.target.value }))}
                className="border border-cream-dark rounded-lg px-3 py-2 text-sm font-mono bg-white/60 focus:outline-none focus:border-ink"
              />
              <input
                value={newActividad.precio}
                onChange={e => setNewActividad(v => ({ ...v, precio: e.target.value }))}
                placeholder="Precio"
                className="border border-cream-dark rounded-lg px-3 py-2 text-sm font-mono bg-white/60 focus:outline-none focus:border-ink"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={newActividad.confirmacion}
                onChange={e => setNewActividad(v => ({ ...v, confirmacion: e.target.value }))}
                placeholder="N° de confirmación"
                className="border border-cream-dark rounded-lg px-3 py-2 text-sm font-mono bg-white/60 focus:outline-none focus:border-ink"
              />
              <label className="flex items-center gap-2 cursor-pointer px-3">
                <input
                  type="checkbox"
                  checked={newActividad.confirmada}
                  onChange={e => setNewActividad(v => ({ ...v, confirmada: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <span className="font-mono text-sm text-ink">Confirmada</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={addActividad.isPending}
              className="w-full py-2 rounded-lg bg-ink text-cream font-mono text-xs hover:bg-ink/90 transition-colors disabled:opacity-50"
            >
              {addActividad.isPending ? 'Guardando…' : 'Agregar'}
            </button>
          </form>
        )}

        {/* Agenda — días de la estadía con actividades confirmadas */}
        {ficha && (() => {
          const days = []
          const d = new Date(ficha.fecha_llegada + 'T12:00:00')
          const end = new Date(ficha.fecha_salida + 'T12:00:00')
          while (d <= end) { days.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1) }

          const agendadas = (actividades ?? []).filter(a => a.fecha && a.confirmada)
          const opciones  = (actividades ?? []).filter(a => !a.fecha || !a.confirmada)

          const byDay = {}
          agendadas.forEach(a => {
            if (!byDay[a.fecha]) byDay[a.fecha] = []
            byDay[a.fecha].push(a)
            byDay[a.fecha].sort((x, y) => (x.hora ?? '').localeCompare(y.hora ?? ''))
          })

          const fmtDay = iso => new Date(iso + 'T12:00:00').toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()

          return (
            <>
              {/* Timeline de días */}
              <div className="border border-cream-dark rounded-xl overflow-hidden mb-6">
                {days.map((day, i) => {
                  const acts = byDay[day] ?? []
                  return (
                    <div key={day} className={`${i > 0 ? 'border-t border-cream-dark' : ''}`}>
                      <div className={`flex items-center gap-3 px-4 py-2 ${acts.length > 0 ? 'bg-ink text-cream' : 'bg-cream-dark/40'}`}>
                        <span className={`font-mono text-xs font-semibold tracking-wider ${acts.length > 0 ? 'text-gold' : 'text-ink-light'}`}>
                          {fmtDay(day)}
                        </span>
                        {acts.length === 0 && <span className="font-mono text-[10px] text-ink-light/60">sin actividades confirmadas</span>}
                      </div>
                      {acts.map(a => {
                        const actDocs = (documentos ?? []).filter(d => d.entidad_id === a.id && d.tipo_doc === 'voucher')
                        return (
                          <div key={a.id} className="px-4 py-3 flex items-start gap-3 border-t border-cream-dark/50 bg-white/60">
                            <div className="font-mono text-sm text-gold font-semibold w-12 shrink-0 pt-0.5">
                              {a.hora ? a.hora.slice(0,5) : '—'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-ink">{a.nombre}</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                {a.precio && <span className="font-mono text-xs text-ink-light">{a.precio}</span>}
                                {a.confirmacion && <span className="font-mono text-xs text-ink-light">#{a.confirmacion}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {actDocs.length > 0
                                ? <span className="font-mono text-[10px] px-2 py-0.5 rounded border bg-green-100 text-green-700 border-green-200">✓ Voucher</span>
                                : <VoucherBtn a={a} uploadDoc={uploadDoc} />
                              }
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded border bg-green-100 text-green-700 border-green-200">
                                Confirmada ✓
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>

              {/* Opciones / ideas sin fecha comprometida */}
              {opciones.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] text-ink-light uppercase tracking-wider mb-3">Ideas · sin fecha comprometida</p>
                  <div className="space-y-1.5">
                    {opciones.map(a => {
                      const actDocs = (documentos ?? []).filter(d => d.entidad_id === a.id && d.tipo_doc === 'voucher')
                      return (
                        <ActividadCard
                          key={a.id}
                          a={a}
                          hasVoucher={actDocs.length > 0}
                          onToggleConfirm={() => updateActividad.mutate({ id: a.id, updates: { confirmada: !a.confirmada } })}
                          onUploadVoucher={(file) => uploadDoc.mutate({ file, entidad_id: a.id, tipo_doc: 'voucher', entidad_tipo: 'actividad' })}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )
        })()}
      </section>

      {/* City pendientes */}
      <section className="mb-6" id="guia">
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
