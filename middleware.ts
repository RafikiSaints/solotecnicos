import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(req: NextRequest) {
  const { response, session } = await updateSession(req)

  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const isAdmin = session?.user?.user_metadata?.role === 'admin'
    if (!session || !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
