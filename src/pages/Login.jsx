import { useState } from 'react'
import { supabase } from '../lib/supabase'

const SHARED_EMAIL = 'viaje@europa2027.com'

export default function Login() {
  const [pin, setPin]         = useState('')
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: SHARED_EMAIL,
      password: pin,
    })
    if (error) setError('PIN incorrecto')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-12">
          <h1 className="font-serif text-6xl text-ink leading-none">Europa</h1>
          <h1 className="font-serif text-6xl text-ink leading-none">2027</h1>
          <p className="font-mono text-[10px] text-ink-light mt-4 tracking-widest uppercase">
            28 ene — 15 feb · Barrera · Nader · Ahmad
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-[10px] text-ink-light uppercase tracking-widest block mb-2 text-center">
              PIN de acceso
            </label>
            <input
              type="password"
              required
              autoComplete="off"
              value={pin}
              onChange={e => setPin(e.target.value.toUpperCase())}
              placeholder="······"
              className="w-full border border-cream-dark rounded-xl px-4 py-4 text-center text-xl font-mono tracking-[0.5em] bg-white/60 focus:outline-none focus:border-ink transition-colors"
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-ink text-cream font-mono text-sm hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
