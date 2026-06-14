const COLORS = {
  ok:          'bg-green-100 text-green-800 border-green-200',
  confirmado:  'bg-green-100 text-green-800 border-green-200',
  hecho:       'bg-gray-100  text-gray-500  border-gray-200',
  pending:     'bg-amber-100 text-amber-800 border-amber-200',
  pendiente:   'bg-amber-100 text-amber-800 border-amber-200',
  urgente:     'bg-red-100   text-red-800   border-red-200',
}

export default function StatusBadge({ status, label, className = '' }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-xs font-mono border ${
        COLORS[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'
      } ${className}`}
    >
      {label ?? status}
    </span>
  )
}
