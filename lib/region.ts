import { cookies } from 'next/headers'

const COOKIE_NAME = 'st_region'

/**
 * Lee la región seleccionada del usuario (server-side).
 * Retorna el slug o null si no hay seleccionada (= todas las regiones).
 */
export function getRegionCookie(): string | null {
  const c = cookies().get(COOKIE_NAME)
  return c?.value ? c.value : null
}
