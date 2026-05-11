/* eslint-disable no-console */
/**
 * Script seed para poblar la base con datos de prueba.
 *
 * Uso:
 *   1. Asegúrate de que SUPABASE_SERVICE_ROLE_KEY esté configurada en .env.local
 *   2. Ejecuta:  npm run seed
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  console.log('🌱 Sembrando datos de prueba...\n')

  // 1. Crear usuarios de prueba
  console.log('👤 Creando usuarios...')
  const tecnicoUser = await sb.auth.admin.createUser({
    email: 'tecnico@test.cl',
    password: 'Test1234!',
    email_confirm: true,
    user_metadata: { role: 'tecnico' },
  })
  const adminUser = await sb.auth.admin.createUser({
    email: 'admin@test.cl',
    password: 'Admin1234!',
    email_confirm: true,
    user_metadata: { role: 'admin' },
  })
  console.log('   ✓ tecnico@test.cl / Test1234!')
  console.log('   ✓ admin@test.cl / Admin1234!')

  // 2. Categorías y regiones
  const { data: categorias } = await sb.from('categorias').select('*')
  const { data: regiones } = await sb.from('regiones').select('*')
  if (!categorias || !regiones) throw new Error('Falta ejecutar schema.sql primero')

  const climatizacion = categorias.find(c => c.slug === 'climatizacion')!
  const computadores = categorias.find(c => c.slug === 'computadores')!
  const celulares = categorias.find(c => c.slug === 'celulares')!
  const electricidad = categorias.find(c => c.slug === 'electricidad')!
  const gasfiteria = categorias.find(c => c.slug === 'gasfiteria')!
  const rm = regiones.find(r => r.slug === 'metropolitana')!
  const valpo = regiones.find(r => r.slug === 'valparaiso')!
  const biobio = regiones.find(r => r.slug === 'biobio')!

  // 3. Crear 6 técnicos
  console.log('\n🔧 Creando técnicos...')
  const tecnicosData = [
    {
      nombre_empresa: 'ClimaTech Pro',
      nombre_contacto: 'Juan Pérez',
      descripcion_corta: 'Especialistas en aires acondicionados y climatización. 15 años de experiencia en Santiago.',
      descripcion: 'Empresa familiar dedicada a la instalación, mantención y reparación de equipos de climatización. Trabajamos con todas las marcas: LG, Samsung, Daikin, Mitsubishi.',
      region_id: rm.id, comuna: 'Las Condes', lat: -33.4172, lng: -70.5476,
      telefono: '+56 9 8765 4321', whatsapp: '+56987654321', email_publico: 'tecnico@test.cl',
      plan: 'elite', verificado: true, atiende_24h: true, atiende_domicilio: true,
      plan_vence_en: new Date(Date.now() + 365 * 86400000).toISOString(),
      categoria: climatizacion.id, user_id: tecnicoUser.data.user?.id,
    },
    {
      nombre_empresa: 'TecnoFix Computación',
      nombre_contacto: 'María González',
      descripcion_corta: 'Reparación de notebooks, PCs y soporte técnico a domicilio en Santiago.',
      descripcion: 'Más de 10 años reparando equipos de computación. Trabajamos con todas las marcas. Servicio rápido y garantizado.',
      region_id: rm.id, comuna: 'Providencia', lat: -33.4262, lng: -70.6182,
      telefono: '+56 9 9876 5432', whatsapp: '+56998765432', email_publico: 'maria@tecnofix.cl',
      plan: 'pro', verificado: true, atiende_domicilio: true,
      plan_vence_en: new Date(Date.now() + 180 * 86400000).toISOString(),
      categoria: computadores.id,
    },
    {
      nombre_empresa: 'CellRepair Valparaíso',
      nombre_contacto: 'Carlos Soto',
      descripcion_corta: 'Reparación de celulares y tablets. Cambio de pantallas y baterías en el día.',
      descripcion: 'Tienda física en Valparaíso. Reparamos iPhone, Samsung, Xiaomi, Motorola. Garantía 3 meses.',
      region_id: valpo.id, comuna: 'Valparaíso', lat: -33.0472, lng: -71.6127,
      telefono: '+56 9 7654 3210', email_publico: 'carlos@cellrepair.cl',
      plan: 'pro', verificado: true,
      plan_vence_en: new Date(Date.now() + 90 * 86400000).toISOString(),
      categoria: celulares.id,
    },
    {
      nombre_empresa: 'Electricidad Hogar',
      nombre_contacto: 'Pedro Muñoz',
      descripcion_corta: 'Instalaciones eléctricas certificadas SEC. Atiendo en Bío Bío y alrededores.',
      descripcion: 'Eléctrico certificado SEC. Instalaciones residenciales, comerciales y emergencias 24/7.',
      region_id: biobio.id, comuna: 'Concepción', lat: -36.8270, lng: -73.0498,
      telefono: '+56 9 5544 3322', email_publico: 'pedro@electricidad.cl',
      plan: 'gratis', verificado: false,
      categoria: electricidad.id,
    },
    {
      nombre_empresa: 'Gasfitería Express',
      descripcion_corta: 'Reparación de fugas, instalación de calefont, destape. 24 horas.',
      region_id: rm.id, comuna: 'Maipú', lat: -33.5111, lng: -70.7581,
      telefono: '+56 9 3322 1100', email_publico: 'gasfit@test.cl',
      plan: 'gratis', atiende_24h: true,
      categoria: gasfiteria.id,
    },
    {
      nombre_empresa: 'TecnoServicio Integral',
      descripcion_corta: 'Computadores, celulares e impresoras. Más de 200 reparaciones al mes.',
      region_id: rm.id, comuna: 'Ñuñoa', lat: -33.4543, lng: -70.5917,
      telefono: '+56 9 4433 5566', email_publico: 'integral@test.cl',
      plan: 'gratis',
      categoria: computadores.id,
    },
  ]

  const tecnicosCreados: any[] = []
  for (const t of tecnicosData) {
    const { categoria, ...rest } = t
    const { data, error } = await sb.from('tecnicos').insert(rest as any).select().single()
    if (error) { console.error('   ✗', t.nombre_empresa, error.message); continue }
    if (data) {
      tecnicosCreados.push(data)
      await sb.from('tecnico_categorias').insert({ tecnico_id: data.id, categoria_id: categoria })
      console.log('   ✓', data.nombre_empresa, `(${data.plan})`)
    }
  }

  // 4. Servicios
  console.log('\n💼 Creando servicios...')
  for (const t of tecnicosCreados.slice(0, 3)) {
    await sb.from('tecnico_servicios').insert([
      { tecnico_id: t.id, nombre: 'Diagnóstico inicial', precio_desde: 15000, orden: 0 },
      { tecnico_id: t.id, nombre: 'Reparación estándar', precio_desde: 35000, orden: 1 },
      { tecnico_id: t.id, nombre: 'Mantención preventiva', precio_desde: 25000, orden: 2 },
    ])
  }
  console.log('   ✓ servicios creados')

  // 5. Reseñas
  console.log('\n⭐ Creando reseñas...')
  const nombres = ['Andrea M.', 'Roberto S.', 'Camila L.', 'Diego R.', 'Patricia V.', 'Felipe A.', 'Isidora T.', 'Matías O.', 'Valeria H.']
  const titulos = ['Excelente servicio', 'Muy profesional', 'Recomendado 100%', 'Volvería a contratarlo', 'Buen trabajo', 'Rápido y eficiente']
  const comentarios = [
    'Llegó en el horario acordado, diagnosticó rápido y arregló todo en una visita. Muy recomendado.',
    'Trabajo impecable. Explicó cada paso y dejó todo funcionando perfecto. Precios justos.',
    'Atención de primera. Resolvió mi problema más rápido de lo esperado. Volveré a llamarlo sin dudar.',
    'Profesional, puntual y limpio. El trabajo terminado quedó como nuevo.',
    'Recomendado. Buen servicio, garantía clara y trato amable durante todo el proceso.',
  ]

  let count = 0
  for (const t of tecnicosCreados) {
    const numResenas = t.plan === 'elite' ? 5 : t.plan === 'pro' ? 4 : 3
    for (let i = 0; i < numResenas; i++) {
      const r = () => Math.round((3.5 + Math.random() * 1.5) * 10) / 10
      await sb.from('resenas').insert({
        tecnico_id: t.id,
        autor_nombre: nombres[count % nombres.length],
        autor_verificado: Math.random() > 0.5,
        titulo: titulos[Math.floor(Math.random() * titulos.length)],
        comentario: comentarios[Math.floor(Math.random() * comentarios.length)] + ' Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        rating_atencion: r(), rating_calidad: r(), rating_respuesta: r(),
        rating_resolucion: r(), rating_rapidez: r(), rating_precio: r(), rating_garantia: r(),
        aprobada: true,
      })
      count++
    }
  }
  console.log(`   ✓ ${count} reseñas`)

  // 6. Cotizaciones
  console.log('\n📋 Creando cotizaciones...')
  for (const t of tecnicosCreados.slice(0, 4)) {
    await sb.from('cotizaciones').insert([
      {
        tecnico_id: t.id,
        cliente_nombre: 'Cliente Test 1',
        cliente_email: 'cliente1@test.cl',
        cliente_telefono: '+56 9 1111 1111',
        descripcion: 'Mi aire acondicionado dejó de enfriar. Es un split LG de 12.000 BTU instalado hace 4 años. Hace ruido extraño al encenderlo.',
        urgencia: 'urgente',
        comuna_servicio: 'Las Condes',
        estado: 'pendiente',
      },
    ])
  }
  console.log('   ✓ cotizaciones creadas')

  // 7. Blog
  console.log('\n📰 Creando artículos de blog...')
  await sb.from('blog_articulos').insert([
    {
      slug: 'como-limpiar-split-invierno',
      titulo: 'Cómo limpiar un aire acondicionado split antes del invierno',
      resumen: 'Una mantención bien hecha puede ahorrarte hasta 30% en la cuenta de luz y duplicar la vida útil de tu equipo.',
      contenido: '<p>El invierno es la mejor época para revisar tu split. Aquí te contamos los pasos básicos…</p><p>1. Apaga el equipo y desconéctalo de la corriente.</p><p>2. Retira los filtros frontales y lávalos con agua tibia y jabón neutro.</p><p>3. Inspecciona las aletas con una linterna y aspira el polvo acumulado.</p><p>4. Llama a un técnico para revisar el gas refrigerante cada 2 años.</p>',
      categoria_id: climatizacion.id,
      publicado: true,
    },
    {
      slug: 'cuando-cambiar-bateria-celular',
      titulo: '5 señales de que tu celular necesita batería nueva',
      resumen: 'Si tu teléfono se apaga al 30%, se calienta o dura la mitad de antes, probablemente la batería esté llegando a su fin.',
      contenido: '<p>La batería del celular tiene una vida útil de 2 a 3 años…</p>',
      categoria_id: celulares.id,
      publicado: true,
    },
    {
      slug: 'checklist-mantencion-refrigerador',
      titulo: 'Checklist de mantención del refrigerador (mensual)',
      resumen: 'Mantener tu refrigerador en óptimas condiciones ahorra energía y previene fallas costosas.',
      contenido: '<p>El refrigerador funciona 24/7 y es el electrodoméstico que más consume…</p>',
      publicado: true,
    },
  ])
  console.log('   ✓ 3 artículos publicados')

  // 8. Portafolio para técnicos PRO
  console.log('\n📸 Creando portafolio...')
  for (const t of tecnicosCreados.filter(t => t.plan !== 'gratis').slice(0, 2)) {
    await sb.from('tecnico_trabajos').insert([
      {
        tecnico_id: t.id,
        titulo: 'Instalación de split en departamento',
        descripcion: 'Cliente necesitaba climatización en sala de estar. Trabajo completo en 4 horas.',
        foto_antes: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        foto_despues: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800',
        orden: 0,
      },
    ])
  }
  console.log('   ✓ trabajos de portafolio')

  console.log('\n✅ Seed completo!\n')
  console.log('Credenciales de prueba:')
  console.log('  Técnico: tecnico@test.cl / Test1234!')
  console.log('  Admin:   admin@test.cl  / Admin1234!')
}

main().catch(e => {
  console.error('❌ Error:', e)
  process.exit(1)
})
