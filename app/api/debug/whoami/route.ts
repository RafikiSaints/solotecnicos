import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sql } from '@/lib/pg'

/**
 * Endpoint de diagnóstico. Muestra a qué Supabase y a qué DB está conectada
 * la app desplegada. Útil para confirmar que NEXT_PUBLIC_SUPABASE_URL y
 * DATABASE_URL apuntan al MISMO proyecto.
 *
 * Abrí: https://[tu-vercel].vercel.app/api/debug/whoami
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NO CONFIGURADO'
  const databaseUrl = process.env.DATABASE_URL || ''
  // Extraer el host de DATABASE_URL (sin password) para identificar el proyecto
  let pgHost = 'NO CONFIGURADO'
  let pgDbName = '?'
  try {
    const u = new URL(databaseUrl)
    pgHost = u.host
    pgDbName = u.pathname.replace('/', '') || 'postgres'
  } catch {}

  // Contar técnicos vía PostgREST (Supabase JS)
  let countViaPostgrest: number | string = '?'
  let ultimosPostgrest: any[] = []
  try {
    const sb = createServiceClient()
    const { count, error } = await sb.from('tecnicos').select('id', { count: 'exact', head: true })
    if (error) countViaPostgrest = `ERROR: ${error.message}`
    else countViaPostgrest = count ?? 0
    const { data } = await sb
      .from('tecnicos')
      .select('id, nombre_empresa, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    ultimosPostgrest = data || []
  } catch (e: any) {
    countViaPostgrest = `THROW: ${e.message}`
  }

  // Contar técnicos vía pg directo
  let countViaPg: number | string = '?'
  let ultimosPg: any[] = []
  let pgServerAddr = '?'
  try {
    const rows = await sql`SELECT count(*)::int as c FROM tecnicos`
    countViaPg = rows[0]?.c ?? 0
    const last = await sql`SELECT id, nombre_empresa, created_at FROM tecnicos ORDER BY created_at DESC LIMIT 5`
    ultimosPg = last
    const addr = await sql`SELECT inet_server_addr()::text as a, current_database() as db`
    pgServerAddr = `${addr[0]?.a || '?'} / db=${addr[0]?.db || '?'}`
  } catch (e: any) {
    countViaPg = `ERROR: ${e.message}`
  }

  return NextResponse.json({
    supabaseUrl,
    pgHost,
    pgDbName,
    pgServerAddr,
    cuentas: {
      tecnicosViaPostgrest: countViaPostgrest,
      tecnicosViaPgDirecto: countViaPg,
    },
    ultimosTecnicosPostgrest: ultimosPostgrest,
    ultimosTecnicosPgDirecto: ultimosPg,
    diagnostico: countViaPostgrest === countViaPg
      ? '✅ Las dos conexiones ven la misma cantidad de técnicos.'
      : `⚠️ MISMATCH: PostgREST ve ${countViaPostgrest}, pg directo ve ${countViaPg}. Las connection strings apuntan a bases DIFERENTES.`,
  })
}
