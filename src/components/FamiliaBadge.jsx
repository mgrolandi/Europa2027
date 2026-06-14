const COLORS = {
  Barrera: 'bg-blue-100 text-blue-700 border-blue-200',
  Nader:   'bg-green-100 text-green-700 border-green-200',
  Ahmad:   'bg-purple-100 text-purple-700 border-purple-200',
}

export default function FamiliaBadge({ familia, className = '' }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-xs font-mono border ${
        COLORS[familia] ?? 'bg-gray-100 text-gray-600 border-gray-200'
      } ${className}`}
    >
      {familia}
    </span>
  )
}
