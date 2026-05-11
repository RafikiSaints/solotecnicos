# SoloTécnicos

> Directorio de servicios técnicos verificados en Chile. Next.js 14 + Supabase + Flow.cl + Resend.

---

## Stack

- **Framework**: Next.js 14 (App Router)
- **Base de datos + Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Pagos**: Flow.cl
- **Email transaccional**: Resend + React Email
- **Mapas**: Leaflet + react-leaflet (open-source)
- **Estilos**: Tailwind CSS
- **Formularios**: react-hook-form + zod
- **Estado**: Zustand
- **Charts**: Recharts
- **Tipografía**: Fraunces + Instrument Sans (Google Fonts)

---

## Setup paso a paso

### 1. Instalar dependencias

```bash
cd C:\Users\edres\Documents\solotecnicos
npm install
```

### 2. Crear proyecto Supabase

1. Ve a [supabase.com](https://supabase.com) → crea un proyecto nuevo.
2. En el dashboard, copia las credenciales: **Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (secreta, nunca cliente)
3. **Ejecuta el SQL del esquema**: en el SQL Editor de Supabase, copia y pega el contenido de [`supabase/schema.sql`](./supabase/schema.sql) y ejecútalo.

### 3. Crear los Storage Buckets

En Supabase Dashboard → **Storage**, crea estos 4 buckets:

| Bucket              | Privacidad | Tamaño max | Tipos                |
|---------------------|------------|------------|----------------------|
| `tecnico-fotos`     | público    | 5 MB       | jpg, png, webp       |
| `tecnico-documentos`| privado    | 10 MB      | pdf, jpg, png        |
| `cotizacion-fotos`  | privado    | 5 MB       | jpg, png, webp       |
| `blog-imagenes`     | público    | 5 MB       | jpg, png, webp       |

### 4. (Opcional) Habilitar Google OAuth

Supabase Dashboard → **Authentication → Providers → Google** → completa Client ID y Secret obtenidos de Google Cloud Console.

### 5. Configurar variables de entorno

Edita `.env.local` y completa con tus credenciales reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx…
SUPABASE_SERVICE_ROLE_KEY=eyJxxx…

# Flow.cl (sandbox para dev, producción para deploy)
FLOW_API_KEY=tu_api_key
FLOW_SECRET=tu_secret

# Resend
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=hola@solotecnicos.cl

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron (token aleatorio largo)
CRON_SECRET=cualquier-token-aleatorio-largo
```

### 6. Crear cuentas de servicios externos (cuando estés listo para producción)

- **Flow.cl**: [flow.cl](https://www.flow.cl) → crea cuenta de comercio → obtén `apiKey` y `secretKey` desde el panel.
- **Resend**: [resend.com](https://resend.com) → crea cuenta gratis → verifica tu dominio (`solotecnicos.cl`) → genera `API key`.

### 7. Sembrar datos de prueba

```bash
npm run seed
```

Esto crea:
- 2 usuarios: `tecnico@test.cl` / `Test1234!` y `admin@test.cl` / `Admin1234!`
- 6 técnicos en distintas regiones y planes
- ~22 reseñas aprobadas
- 4 cotizaciones
- 3 artículos de blog publicados
- 2 trabajos de portafolio

### 8. Iniciar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Estructura del proyecto

```
solotecnicos/
├── app/
│   ├── (public)/          # Home, búsqueda, perfiles, blog, planes, etc.
│   ├── (auth)/            # Login, recuperar password
│   ├── (dashboard)/       # Dashboard técnico (protegido)
│   ├── (admin)/           # Panel admin (rol=admin)
│   ├── api/               # API routes (webhooks, crons, CRUD)
│   ├── t/[codigo]/        # Redirect link personalizado
│   ├── layout.tsx         # Root layout con fuentes
│   ├── sitemap.ts         # Sitemap dinámico
│   └── robots.ts
├── components/
│   ├── ui/                # Button, Input, Modal, Badge, Skeleton, StarRating, Toast, Logo, UpgradePrompt
│   ├── layout/            # Navbar, Footer, TopStrip
│   ├── tecnico/           # TarjetaTecnico, PerfilPublico, SistemaResenas, FormularioCotizacion,
│   │                      # GaleriaFotos, PortafolioTrabajos, HorarioDisplay, ContactoCard, etc.
│   ├── directorio/        # Filtros, MapaDirectorio (Leaflet), ComparadorBarra
│   ├── dashboard/         # SidebarDashboard, EditorPerfil, GaleriaEditor, PortafolioEditor,
│   │                      # BandejaMensajes, HiloMensajes, AgendaCalendario, EstadisticasGraficos, etc.
│   ├── planes/            # TablaPlanes, TogglePeriodo
│   └── blog/              # ArticuloCard, SidebarTecnicosRelacionados
├── lib/
│   ├── supabase/          # Clients (client, server, middleware, service)
│   ├── planes.ts          # Lógica de planes y feature gating
│   ├── flow.ts            # Integración Flow.cl + firma HMAC
│   ├── resend.ts          # Wrapper Resend
│   ├── ranking.ts         # Algoritmo de score
│   └── utils.ts           # Helpers (formatos, horarios, slugs)
├── emails/                # Plantillas React Email
├── types/                 # Tipos TypeScript
├── store/                 # Zustand stores (comparador, auth)
├── hooks/                 # Hooks (useTecnico, useBusqueda, usePlan)
├── scripts/seed.ts        # Seed con datos de prueba
├── supabase/schema.sql    # Esquema completo SQL
├── middleware.ts          # Protección de rutas /dashboard y /admin
├── vercel.json            # Cron jobs
└── tailwind.config.ts
```

---

## Rutas principales

### Públicas
- `/` — Home con buscador y técnicos destacados
- `/buscar` — Resultados con filtros + mapa
- `/tecnico/[slug]` — Perfil público completo
- `/categoria/[slug]` y `/categoria/[slug]/[regionSlug]` — Listados SEO
- `/region/[slug]` — Listado por región
- `/emergencias` — Técnicos 24/7
- `/comparar?t=slug1,slug2,slug3` — Comparador lado a lado
- `/planes` — Precios + FAQ
- `/blog` y `/blog/[slug]`
- `/registro-tecnico` — Landing + form de registro
- `/t/[codigo]` — Redirect link personalizado

### Auth
- `/login`, `/recuperar-password`

### Dashboard (protegido)
- `/dashboard` — Resumen con métricas
- `/dashboard/perfil` — Editor con auto-save
- `/dashboard/fotos` — Galería + portafolio (drag & drop)
- `/dashboard/mensajes` — Bandeja de cotizaciones
- `/dashboard/resenas` — Ver y responder (PRO)
- `/dashboard/agenda` — Calendario (PRO)
- `/dashboard/estadisticas` — Métricas (PRO)
- `/dashboard/certificaciones` — Subir documentos (PRO)
- `/dashboard/plan` — Gestionar suscripción

### Admin (rol=admin)
- `/admin/tecnicos`, `/admin/resenas`, `/admin/certificaciones`, `/admin/pagos`, `/admin/blog`, `/admin/estadisticas`

### API
- `/api/cotizaciones` — Nueva cotización
- `/api/cotizaciones/responder` — Respuesta técnico
- `/api/resenas` — Nueva reseña
- `/api/visitas` — Registrar visita
- `/api/comparar` — Datos del comparador
- `/api/flow/crear-orden` — Iniciar pago
- `/api/webhooks/flow` — Webhook de Flow.cl
- `/api/cron/verificar-planes` — Diario 06:00
- `/api/cron/alertas-vencimiento` — Diario 09:00
- `/api/cron/alertas-demanda` — Lunes 09:00

---

## Lógica de planes

Tres niveles definidos en [`lib/planes.ts`](./lib/planes.ts):

| Feature                       | Gratis | PRO    | Elite |
|-------------------------------|--------|--------|-------|
| Fotos                         | 3      | 20     | ∞     |
| Trabajos portafolio           | 2      | 20     | ∞     |
| Servicios                     | 5      | 50     | ∞     |
| WhatsApp visible              | ❌     | ✅     | ✅    |
| Responder reseñas             | ❌     | ✅     | ✅    |
| Estadísticas                  | ❌     | ✅     | ✅    |
| Agenda                        | ❌     | ✅     | ✅    |
| Posición destacada            | ❌     | ✅     | ✅    |
| **Primera posición**          | ❌     | ❌     | ✅    |
| Banner en resultados          | ❌     | ❌     | ✅    |
| **Precio mensual**            | $0     | $14.990| $34.990|
| **Precio anual**              | $0     | $149.900 (2 meses gratis) | $349.900 |

Usa `puedeHacer(tecnico, 'feature')` o `limiteNumerico(tecnico, 'fotos')` en cualquier componente.

---

## Sistema de reseñas (7 dimensiones)

Cada reseña califica de 1.0 a 5.0:
1. **Atención al cliente**
2. **Calidad del trabajo**
3. **Tiempo de respuesta**
4. **Resolución del problema**
5. **Rapidez de ejecución**
6. **Precio justo**
7. **Garantía ofrecida**

El **promedio general** se calcula automáticamente (columna generada en SQL) y un trigger actualiza los ratings cacheados del técnico.

---

## Flujo de pago Flow.cl

1. Técnico hace click en "Activar PRO" → `POST /api/flow/crear-orden`.
2. Backend genera orden firmada (HMAC SHA256) y devuelve URL de Flow.
3. Cliente redirige a Flow → completa pago.
4. Flow envía webhook a `/api/webhooks/flow` con `token`.
5. Backend verifica firma + consulta estado → activa plan en BD + envía email confirmación.

Eventos manejados: `payment.created`, `payment.confirmed`, `payment.rejected`, `subscription.renewal`, `subscription.cancel`, `subscription.failed` (3 días de gracia).

---

## Cron Jobs (Vercel)

Configurados en [`vercel.json`](./vercel.json). Protegidos con `Authorization: Bearer $CRON_SECRET`.

| Path                                  | Schedule        | Función                                   |
|---------------------------------------|-----------------|-------------------------------------------|
| `/api/cron/verificar-planes`          | Diario 06:00    | Degrada técnicos con plan vencido         |
| `/api/cron/alertas-vencimiento`       | Diario 09:00    | Email 7 días antes del vencimiento        |
| `/api/cron/alertas-demanda`           | Lunes 09:00     | Avisa técnicos gratis de alta demanda     |

---

## Deploy en Vercel

1. Conecta el repo a Vercel.
2. Configura **todas las variables de entorno** del `.env.local` en el panel de Vercel.
3. Define `NEXT_PUBLIC_APP_URL` a tu dominio (ej: `https://solotecnicos.cl`).
4. Vercel detectará `vercel.json` y activará los cron jobs automáticamente.
5. Actualiza la URL de confirmación de Flow.cl a `https://solotecnicos.cl/api/webhooks/flow`.

---

## Identidad visual

- **Paleta**: azul marino `#0D2444`, rojo `#C8102E`, oro `#C89A2E`, papel `#F2F1EE`, blanco `#FAFAF8`.
- **Display**: Fraunces (italic 300, bold 700, black 900) — para títulos y números decorativos.
- **Cuerpo**: Instrument Sans (400-700) — UI y body.
- **Estética**: editorial chilena, bordes finos (1.5px), border-radius 4-14px, sombras sutiles, hero con corte diagonal (`clip-path`).

---

## TODO antes de producción

- [ ] Crear cuenta y configurar credenciales en `.env.local` (Supabase, Flow.cl, Resend)
- [ ] Ejecutar `supabase/schema.sql` en el SQL Editor de Supabase
- [ ] Crear los 4 storage buckets
- [ ] (Opcional) Habilitar Google OAuth
- [ ] Cambiar `CRON_SECRET` por un token aleatorio largo
- [ ] Verificar dominio en Resend
- [ ] Probar webhook de Flow.cl en sandbox antes de pasar a producción
- [ ] Configurar dominio personalizado en Vercel
- [ ] Subir logo y assets a `/public`

---

## Comandos

```bash
npm run dev       # Iniciar dev server
npm run build     # Build producción
npm run start     # Producción local
npm run lint      # Lint
npm run seed      # Sembrar datos de prueba
```

---

**Credenciales de prueba** (después de `npm run seed`):
- Técnico: `tecnico@test.cl` / `Test1234!`
- Admin:   `admin@test.cl` / `Admin1234!`
#   s o l o t e c n i c o s  
 