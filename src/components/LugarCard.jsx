export default function LugarCard({ lugar }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-mono text-[10px] text-ink-light uppercase tracking-widest mb-0.5">
            {lugar.zona}
          </p>
          <h3 className="font-serif text-base text-ink leading-snug">{lugar.nombre}</h3>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {lugar.es_gratis ? (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded border bg-green-100 text-green-700 border-green-200 whitespace-nowrap">
              Gratis
            </span>
          ) : (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded border bg-amber-100 text-amber-700 border-amber-200 whitespace-nowrap">
              {lugar.precio ?? 'Pago'}
            </span>
          )}
          {lugar.requiere_reserva && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded border bg-blue-100 text-blue-700 border-blue-200 whitespace-nowrap">
              Reservar
            </span>
          )}
        </div>
      </div>

      {lugar.descripcion && (
        <p className="text-sm text-ink-light mb-2 leading-relaxed">{lugar.descripcion}</p>
      )}

      {lugar.tip && (
        <p className="text-xs text-gold border-l-2 border-gold pl-2 leading-relaxed">
          {lugar.tip}
        </p>
      )}

      {lugar.maps_url && (
        <a
          href={lugar.maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs font-mono text-ink-light hover:text-gold underline underline-offset-2 transition-colors"
        >
          Ver en Maps
        </a>
      )}
    </div>
  )
}
