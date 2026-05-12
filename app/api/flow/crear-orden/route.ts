import { NextResponse } from 'next/server'
import { crearOrdenPago } from '@/lib/flow'

export async function POST(req: Request) {
  try {
    const { tecnicoId, email, plan, tipo } = await req.json()
    if (!tecnicoId || !email || !plan || !tipo) {
      return NextResponse.json({ error: 'faltan datos' }, { status: 400 })
    }
    if (!process.env.FLOW_API_KEY || process.env.FLOW_API_KEY === 'YOUR_FLOW_API_KEY') {
      return NextResponse.json({ error: 'Flow no configurado — agrega FLOW_API_KEY y FLOW_SECRET en Vercel' }, { status: 503 })
    }
    const { url } = await crearOrdenPago({
      tecnicoId, email, plan, tipo,
      urlRetorno: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plan?ok=1`,
    })
    return NextResponse.json({ url })
  } catch (e: any) {
    console.error('[flow/crear-orden] error:', e)
    return NextResponse.json({
      error: e.message || 'Error desconocido',
      detalle: 'Revisa Vercel Logs para más info'
    }, { status: 500 })
  }
}
