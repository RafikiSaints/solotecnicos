import { NextResponse } from 'next/server'
import { crearOrdenPago } from '@/lib/flow'

export async function POST(req: Request) {
  try {
    const { tecnicoId, email, plan, tipo } = await req.json()
    if (!tecnicoId || !email || !plan || !tipo) {
      return NextResponse.json({ error: 'faltan datos' }, { status: 400 })
    }
    if (!process.env.FLOW_API_KEY || process.env.FLOW_API_KEY === 'YOUR_FLOW_API_KEY') {
      return NextResponse.json({ error: 'Flow no configurado — agrega credenciales en .env.local' }, { status: 503 })
    }
    const { url } = await crearOrdenPago({
      tecnicoId, email, plan, tipo,
      urlRetorno: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plan?ok=1`,
    })
    return NextResponse.json({ url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
