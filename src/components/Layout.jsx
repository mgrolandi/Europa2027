import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const NAV = [
  { to: '/',              label: 'Ciudades',    short: 'Ciudades' },
  { to: '/familias',      label: 'Familias',    short: 'Familias' },
  { to: '/reservas',      label: 'Reservas',    short: 'Hoteles'  },
  { to: '/transportes',   label: 'Transportes', short: 'Vuelos'   },
  { to: '/documentacion', label: 'Documentos',  short: 'Docs'     },
  { to: '/gastos',        label: 'Gastos',      short: 'Gastos'   },
  { to: '/pendientes',    label: 'Pendientes',  short: 'Tasks'    },
]

const ICONS = {
  '/':              '⌂',
  '/familias':      '👨‍👩‍👧‍👦',
  '/reservas':      '▣',
  '/transportes':   '→',
  '/documentacion': '≡',
  '/gastos':        '€',
  '/pendientes':    '✓',
}

export default function Layout({ children }) {
  const { pathname } = useLocation()

  async function handleSignOut() {
    await supabase?.auth.signOut()
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header */}
      <header className="bg-ink text-cream sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg font-bold hover:text-gold transition-colors">
            Europa 2027
          </Link>
          <div className="hidden md:flex items-center gap-5">
            <nav className="flex items-center gap-5 text-sm font-mono">
              {NAV.slice(1).map(n => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`hover:text-gold transition-colors ${
                    pathname === n.to ? 'text-gold' : 'text-cream/70'
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <button
              onClick={handleSignOut}
              className="text-xs font-mono text-cream/40 hover:text-cream/70 transition-colors ml-2"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-ink border-t border-white/10 z-40">
        <div className="flex">
          {NAV.map(n => (
            <Link
              key={n.to}
              to={n.to}
              className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-mono gap-0.5 transition-colors ${
                pathname === n.to ? 'text-gold' : 'text-cream/50'
              }`}
            >
              <span className="text-base leading-none">{ICONS[n.to] ?? '·'}</span>
              <span>{n.short}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
