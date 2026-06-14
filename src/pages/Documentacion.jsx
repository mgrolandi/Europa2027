import { useRef } from 'react'
import { usePersonas, useDocumentos, useUploadDocumento, useUpdatePersona } from '../lib/queries'
import { isConfigured } from '../lib/supabase'
import { useFamilyFilter, FAMILIAS } from '../context/FamilyFilterContext'
import FamilyFilter from '../components/FamilyFilter'
import FamiliaBadge from '../components/FamiliaBadge'
import SupabaseBanner from '../components/SupabaseBanner'

const STATUS_LABEL = { ok: 'OK', pending: 'Pendiente', expired: 'Vencido' }
const STATUS_STYLE = {
  ok:      'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  expired: 'bg-red-100   text-red-700   border-red-200',
}

const STATUS_CYCLE = { ok: 'pending', pending: 'expired', expired: 'ok' }

function PersonaRow({ persona, documentos }) {
  const upload = useUploadDocumento()
  const updatePersona = useUpdatePersona()
  const fileRef = useRef()
  const docsPers = (documentos ?? []).filter(d => d.persona_id === persona.id)

  const passport = persona.pasaporte_status ?? 'ok'
  const auth     = persona.autorizacion_status

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    upload.mutate({ file, persona_id: persona.id, tipo_doc: 'pasaporte' })
    e.target.value = ''
  }

  function cyclePassport() {
    updatePersona.mutate({ id: persona.id, updates: { pasaporte_status: STATUS_CYCLE[passport] } })
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-ink">{persona.nombre}</p>
          <p className="font-mono text-xs text-ink-light">{persona.rol}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={cyclePassport}
            title="Click para cambiar estado"
            className={`font-mono text-[10px] px-2 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity ${STATUS_STYLE[passport] ?? STATUS_STYLE.pending}`}
          >
            Pasaporte: {STATUS_LABEL[passport] ?? passport}
          </button>
          {auth && auth !== 'no_aplica' && (
            <button
              onClick={() => updatePersona.mutate({
                id: persona.id,
                updates: { autorizacion_status: auth === 'pendiente' ? 'ok' : 'pendiente' },
              })}
              title="Click para cambiar estado"
              className={`font-mono text-[10px] px-2 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity ${
                auth === 'ok'
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-purple-100 text-purple-700 border-purple-200'
              }`}
            >
              Autorización: {auth === 'ok' ? 'OK' : 'Pendiente'}
            </button>
          )}
          {persona.rol === 'Menor' && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded border bg-blue-100 text-blue-700 border-blue-200">
              Menor
            </span>
          )}
        </div>
      </div>

      {/* Uploaded docs */}
      {docsPers.length > 0 && (
        <div className="mt-3 space-y-1">
          {docsPers.map(d => (
            <div key={d.id} className="flex items-center gap-2 text-xs font-mono text-ink-light">
              <span>·</span>
              <span>{d.tipo_doc}</span>
              <span className="text-ink-light/50">—</span>
              <span>{d.nombre_archivo}</span>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div className="mt-3 flex gap-2">
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={upload.isPending}
          className="text-xs font-mono px-3 py-1.5 rounded border border-ink-light text-ink-light hover:border-ink hover:text-ink transition-colors disabled:opacity-50"
        >
          {upload.isPending ? 'Subiendo…' : 'Subir documento'}
        </button>
        {upload.isError && (
          <span className="text-xs text-red-600 font-mono">{upload.error?.message}</span>
        )}
      </div>
    </div>
  )
}

export default function Documentacion() {
  if (!isConfigured) return <SupabaseBanner />

  const { selectedFamily } = useFamilyFilter()
  const { data: personas, isLoading } = usePersonas(selectedFamily ?? undefined)
  const { data: documentos } = useDocumentos()

  const byFamily = FAMILIAS.reduce((acc, f) => {
    acc[f] = (personas ?? []).filter(p => p.familia === f)
    return acc
  }, {})

  const pendingPassports = (personas ?? []).filter(p => p.pasaporte_status === 'pending')

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ink">Documentación</h1>
          <p className="font-mono text-xs text-ink-light mt-1">Pasaportes y documentos por persona</p>
        </div>
        <FamilyFilter />
      </div>

      {/* Alerts */}
      {pendingPassports.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-mono text-xs text-red-700 font-medium mb-2 uppercase tracking-wider">
            Pasaportes pendientes
          </p>
          <ul className="space-y-1">
            {pendingPassports.map(p => (
              <li key={p.id} className="text-sm text-ink flex gap-2 items-center">
                <FamiliaBadge familia={p.familia} />
                {p.nombre}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Visa reminders */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card border-amber-200 bg-amber-50/30">
          <p className="font-mono text-[10px] text-amber-700 uppercase tracking-wider mb-1">ETA — Reino Unido</p>
          <p className="text-sm text-ink">Requerida para Londres. Tramitar en <span className="font-mono">eta.homeoffice.gov.uk</span></p>
        </div>
        <div className="card border-amber-200 bg-amber-50/30">
          <p className="font-mono text-[10px] text-amber-700 uppercase tracking-wider mb-1">ETIAS — Schengen</p>
          <p className="text-sm text-ink">Requerido para París, Bruselas, Roma y Madrid. Tramitar cuando abra el sistema.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 rounded-xl bg-cream-dark animate-pulse" />)}
        </div>
      ) : (
        FAMILIAS.filter(f => !selectedFamily || f === selectedFamily).map(familia => {
          const list = byFamily[familia]
          if (!list?.length) return null
          return (
            <section key={familia} className="mb-8">
              <h2 className="font-serif text-xl text-ink mb-3 flex items-center gap-2">
                <FamiliaBadge familia={familia} className="text-sm px-3 py-1" />
                Familia {familia}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {list.map(p => (
                  <PersonaRow key={p.id} persona={p} documentos={documentos} />
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
