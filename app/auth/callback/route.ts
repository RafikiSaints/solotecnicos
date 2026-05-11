import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Callback de OAuth (Google, etc.). Intercambia el código por sesión
 * y redirige al destino indicado en `?next=` o al dashboard.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/dashboard'

  if (code) {
    const sb = createClient()
    await sb.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
