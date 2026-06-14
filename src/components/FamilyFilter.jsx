import { useFamilyFilter, FAMILIAS } from '../context/FamilyFilterContext'

const FAMILY_COLORS = {
  Barrera: 'bg-blue-600 text-white border-blue-600',
  Nader:   'bg-green-600 text-white border-green-600',
  Ahmad:   'bg-purple-600 text-white border-purple-600',
}

export default function FamilyFilter({ className = '' }) {
  const { selectedFamily, setSelectedFamily } = useFamilyFilter()

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        onClick={() => setSelectedFamily(null)}
        className={`px-3 py-1 rounded-full text-sm font-mono border transition-colors ${
          !selectedFamily
            ? 'bg-ink text-cream border-ink'
            : 'bg-cream text-ink-light border-cream-dark hover:border-ink-light'
        }`}
      >
        Todas
      </button>
      {FAMILIAS.map(f => (
        <button
          key={f}
          onClick={() => setSelectedFamily(selectedFamily === f ? null : f)}
          className={`px-3 py-1 rounded-full text-sm font-mono border transition-colors ${
            selectedFamily === f
              ? FAMILY_COLORS[f]
              : 'bg-cream text-ink-light border-cream-dark hover:border-ink-light'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  )
}
