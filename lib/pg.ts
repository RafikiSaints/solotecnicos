import postgres from 'postgres'

/**
 * Cliente Postgres DIRECTO (no usa PostgREST/Supabase JS).
 * Útil cuando el schema cache de PostgREST está pegado.
 *
 * Es LAZY: el cliente se construye en la PRIMERA query, no al importar.
 * Si DATABASE_URL no está configurada, el módulo carga igual y el error
 * solo aparece cuando alguien intenta usar `sql`. Así no rompe páginas
 * que no dependen de pg directo.
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

// Proxy lazy: el cliente real se crea al primer uso.
// Esto evita que módulos que solo importan `sql` crashen al cargar
// si DATABASE_URL falta en el entorno.
function getClient() {
  if (!global.__pg__) {
    global.__pg__ = makeClient()
  }
  return global.__pg__
}

// `sql` se comporta como el cliente postgres-js — soporta tagged templates
// y también la forma `sql(obj)` para INSERT/UPDATE dinámicos.
export const sql: ReturnType<typeof postgres> = new Proxy(
  (() => {}) as any,
  {
    apply(_t, _thisArg, args) {
      const client = getClient() as any
      return client(...args)
    },
    get(_t, prop) {
      const client = getClient() as any
      const value = client[prop]
      return typeof value === 'function' ? value.bind(client) : value
    },
  }
) as any
