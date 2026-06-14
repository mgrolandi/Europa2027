import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Usuario o contraseña incorrectos')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-5xl text-ink">Europa</h1>
          <h1 className="font-serif text-5xl text-ink">2027</h1>
          <p className="font-mono text-xs text-ink-light mt-3 tracking-widest uppercase">
            28 ene — 15 feb · 3 familias
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-[10px] text-ink-light uppercase tracking-widest block mb-1">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full border border-cream-dark rounded-lg px-4 py-3 text-sm bg-white/60 focus:outline-none focus:border-ink transition-colors"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] text-ink-light uppercase tracking-widest block mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-cream-dark rounded-lg px-4 py-3 text-sm bg-white/60 focus:outline-none focus:border-ink transition-colors"
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-ink text-cream font-mono text-sm hover:bg-ink/90 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="font-mono text-[10px] text-ink-light text-center mt-8">
          Acceso privado — familia Barrera · Nader · Ahmad
        </p>
      </div>
    </div>
  )
}
