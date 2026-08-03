/**
 * Keepalive ping — runs on a schedule to prevent Supabase from pausing
 * the project due to 7 days of inactivity (free tier auto-pause).
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_ANON_KEY=your-anon-key node scripts/keepalive.js
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌  Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})

const { error } = await supabase.from('viajes').select('id').limit(1)

if (error) {
  console.error('❌  Keepalive query failed:', error.message)
  process.exit(1)
}

console.log('✅  Keepalive ping OK —', new Date().toISOString())
