import postgres from 'postgres'

/**
 * Cliente Postgres DIRECTO (no usa PostgREST/Supabase JS).
 * Útil cuando el schema cache de PostgREST está pegado.
 * Requiere env var DATABASE_URL.
 */

declare global {
  // eslint-disable-next-line no-var
  var __pg__: ReturnType<typeof postgres> | undefined
}

function makeClient() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL no configurada. Pega la connection string de Supabase en Vercel env vars.')
  }
  return postgres(url, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // necesario para pgBouncer/Supabase pooler
  })
}

// Reutilizar cliente entre invocaciones de Vercel
export const sql = global.__pg__ || makeClient()
if (process.env.NODE_ENV !== 'production') global.__pg__ = sql
