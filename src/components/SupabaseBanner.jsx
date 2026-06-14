export default function SupabaseBanner() {
  return (
    <div className="max-w-lg mx-auto mt-12 rounded-xl border border-amber-300 bg-amber-50 p-8 text-center">
      <p className="font-serif text-2xl text-ink mb-2">Supabase no configurado</p>
      <p className="text-sm text-ink-light mb-5">
        Creá un proyecto en{' '}
        <span className="font-mono">supabase.com</span>, ejecutá el schema y el
        seed, luego agregá las variables de entorno al proyecto.
      </p>

      <pre className="bg-ink text-cream text-xs text-left rounded-lg p-4 mb-5 overflow-x-auto">
{`# .env (en la raíz del proyecto)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key

# 1. Correr schema en el SQL Editor de Supabase:
#    supabase/schema.sql

# 2. Seed desde la terminal:
SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/seed.js`}
      </pre>

      <p className="text-xs text-ink-light">
        Ver instrucciones completas en <span className="font-mono">supabase/schema.sql</span>
      </p>
    </div>
  )
}
