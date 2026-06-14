import { useRef, useState } from 'react'
import { usePersonas, useVuelos, useHoteles, useDocumentos, useUploadDocumento } from '../lib/queries'
import { isConfigured } from '../lib/supabase'
import { FAMILIAS } from '../context/FamilyFilterContext'
import FamiliaBadge from '../components/FamiliaBadge'
import SupabaseBanner from '../components/SupabaseBanner'

const PASSPORT_STYLE = {
  ok:      { label: 'OK',       cls: 'bg-green-100 text-green-700 border-green-200' },
  pending: { label: 'Pendiente',cls: 'bg-red-100 text-red-700 border-red-200' },
  expired: { label: 'Vencido',  cls: 'bg-red-100 text-red-700 border-red-200' },
}

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function UploadBtn({ label, personaId, entidadId, tipoDoc, documentos }) {
  const ref    = useRef()
  const upload = useUploadDocumento()

  // Strict match when both ids provided (boarding pass per person per flight)
  const existing = (documentos ?? []).find(d => {
    if (d.tipo_doc !== tipoDoc) return false
    if (personaId && entidadId) return d.persona_id === personaId && d.entidad_id === entidadId
    if (personaId) return d.persona_id === personaId
    return d.entidad_id === entidadId
  })

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    upload.mutate({
      file,
      persona_id:   personaId  ?? null,
      entidad_id:   entidadId  ?? null,
      tipo_doc:     tipoDoc,
      entidad_tipo: entidadId  ? 'vuelo' : 'persona',
    })
    e.target.value = ''
  }

  if (existing) {
    return (
      <span className="font-mono text-[10px] px-2 py-0.5 rounded border bg-green-100 text-green-700 border-green-200">
        ✓ {label}
      </span>
    )
  }

  return (
    <>
      <input ref={ref} type="file" className="hidden" onChange={handleFile} />
      <button
        onClick={() => ref.current?.click()}
        disabled={upload.isPending}
        className="font-mono text-[10px] px-2 py-0.5 rounded border border-cream-dark text-ink-light hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
      >
        {upload.isPending ? '…' : `+ ${label}`}
      </button>
    </>
  )
}

function fmtDate(iso) {
  if (!iso) return null
  return new Date(iso + 'T12:00:00').toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function PersonaCard({ persona, documentos }) {
  const ps   = PASSPORT_STYLE[persona.pasaporte_status] ?? PASSPORT_STYLE.ok
  const auth = persona.autorizacion_status
  const needsActa = auth === 'pendiente' || auth === 'ok'

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-ink text-sm">{persona.nombre}</p>
          <p className="font-mono text-[10px] text-ink-light mt-0.5">{persona.rol}</p>
          {persona.pasaporte_numero && (
            <p className="font-mono text-[10px] text-ink-light mt-0.5">
              {persona.pasaporte_numero}
              {persona.pasaporte_vencimiento && (
                <span className="ml-1 text-ink-light/60">· vto {fmtDate(persona.pasaporte_vencimiento)}</span>
              )}
            </p>
          )}
          {persona.pasaporte_status === 'pending' && !persona.pasaporte_numero && (
            <p className="font-mono text-[10px] text-amber-600 mt-0.5">Renovar pasaporte</p>
          )}
        </div>
        <span className={`font-mono text-[10px] px-2 py-0.5 rounded border shrink-0 ${ps.cls}`}>
          Pasaporte {ps.label}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <UploadBtn label="Pasaporte" personaId={persona.id} tipoDoc="pasaporte" documentos={documentos} />
        <UploadBtn label="Seguro"    personaId={persona.id} tipoDoc="seguro"    documentos={documentos} />
        {needsActa && (
          <UploadBtn label="Acta" personaId={persona.id} tipoDoc="autorizacion" documentos={documentos} />
        )}
      </div>
    </div>
  )
}

function FamiliaPanel({ familia, personas, vuelos, hoteles, documentos }) {
  const miembros = (personas ?? []).filter(p => p.familia === familia)
  const vuelosFam = (vuelos ?? []).filter(v => v.pnr?.[familia] !== undefined)
  const hotelesFam = (hoteles ?? []).filter(h => h.familia === familia)

  return (
    <div className="mb-10">
      <h2 className="font-serif text-2xl text-ink mb-4 flex items-center gap-3">
        <FamiliaBadge familia={familia} className="text-sm px-3 py-1" />
        Familia {familia}
      </h2>

      {/* Integrantes */}
      <h3 className="font-mono text-[10px] text-ink-light uppercase tracking-widest mb-2">
        Integrantes
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {miembros.map(p => (
          <PersonaCard key={p.id} persona={p} documentos={documentos} />
        ))}
      </div>

      {/* Boarding passes — por persona por vuelo */}
      <h3 className="font-mono text-[10px] text-ink-light uppercase tracking-widest mb-2">
        Boarding Passes
      </h3>
      <div className="space-y-2 mb-6">
        {vuelosFam.map(v => {
          const pnr = v.pnr?.[familia]
          return (
            <div key={v.id} className={`card ${v.confirmado ? 'border-green-200' : 'border-amber-200'}`}>
              <div className="mb-2">
                <p className="text-sm font-medium text-ink">{v.origen} → {v.destino}</p>
                <div className="flex flex-wrap gap-x-3 font-mono text-xs text-ink-light mt-0.5">
                  <span>{fmt(v.fecha)}</span>
                  {v.empresa && <span>{v.empresa}</span>}
                  {v.numero  && <span>{v.numero}</span>}
                  <span className={pnr ? 'text-ink' : 'text-amber-600'}>
                    PNR: {pnr ?? 'pendiente'}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 border-t border-cream-dark pt-2">
                {miembros.map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-ink-light truncate">
                      {p.nombre.split(' ')[0]}
                    </span>
                    <UploadBtn
                      label="BP"
                      personaId={p.id}
                      entidadId={v.id}
                      tipoDoc="boarding_pass"
                      documentos={documentos}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Hoteles */}
      <h3 className="font-mono text-[10px] text-ink-light uppercase tracking-widest mb-2">
        Alojamiento
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {hotelesFam.map(h => (
          <div key={h.id} className={`card ${h.confirmacion ? 'border-green-200' : 'border-amber-200 bg-amber-50/20'}`}>
            <p className="font-mono text-[10px] text-ink-light uppercase tracking-wider">{h.ciudad}</p>
            <p className="font-serif text-base mt-1">{h.nombre ?? 'Por confirmar'}</p>
            {h.habitacion && <p className="font-mono text-xs text-ink-light">{h.habitacion}</p>}
            <div className="flex flex-wrap gap-x-3 font-mono text-xs text-ink-light mt-1">
              <span>{fmt(h.checkin)} → {fmt(h.checkout)}</span>
              {h.precio && <span>{h.precio}</span>}
              {h.confirmacion && <span>#{h.confirmacion}</span>}
            </div>
            {h.notas && <p className="text-xs text-ink-light italic mt-1">{h.notas}</p>}
            {h.como_llegar_aeropuerto && (
              <p className="text-xs text-ink-light mt-1.5 border-l-2 border-gold pl-2">
                {h.como_llegar_aeropuerto}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3">
              {h.maps_url && (
                <a href={h.maps_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-mono text-gold hover:underline underline-offset-2">
                  Ver en Maps
                </a>
              )}
            </div>
            <div className="mt-2">
              <UploadBtn label="Voucher" entidadId={h.id} tipoDoc="voucher" documentos={documentos} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Familias() {
  if (!isConfigured) return <SupabaseBanner />

  const [active, setActive] = useState(null)

  const { data: personas }  = usePersonas()
  const { data: vuelos }    = useVuelos()
  const { data: hoteles }   = useHoteles()
  const { data: documentos }= useDocumentos()

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-ink">Familias</h1>
        <p className="font-mono text-xs text-ink-light mt-1">Integrantes · Documentos · Boarding passes · Alojamiento</p>
      </div>

      {/* Family selector */}
      <div className="flex gap-3 mb-8">
        {FAMILIAS.map(f => (
          <button
            key={f}
            onClick={() => setActive(active === f ? null : f)}
            className={`px-4 py-2 rounded-full font-mono text-sm border transition-colors ${
              active === f
                ? f === 'Barrera' ? 'bg-blue-600 text-white border-blue-600'
                : f === 'Nader'   ? 'bg-green-600 text-white border-green-600'
                :                    'bg-purple-600 text-white border-purple-600'
                : 'bg-cream border-cream-dark text-ink-light hover:border-ink-light'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {(active ? [active] : FAMILIAS).map(f => (
        <FamiliaPanel
          key={f}
          familia={f}
          personas={personas}
          vuelos={vuelos}
          hoteles={hoteles}
          documentos={documentos}
        />
      ))}
    </div>
  )
}
