# RGR · Sistema operativo de marketing

Monorepo npm para coordinar demanda, contenido, prospección y seguimiento comercial de Taller Automotriz y Maquinaria / Vehículos / Camiones.

## Stack y versiones

- Frontend: React 19, Vite 8, TypeScript, TanStack Router, Zustand en memoria, Tailwind CSS 4, React Hook Form, Zod y Recharts.
- El API Fastify autentica sesiones y conecta Prisma con Neon PostgreSQL.
- Node.js: compatible con Node 22 o superior; el entorno de desarrollo inicial se verificó con Node 24.6 y npm 11.5.
- Prisma 8 aparece como release candidate en el tag `latest` de npm; el proyecto fija la estable 7.10.0.
- npm workspaces y un solo `package-lock.json`. No se usa pnpm ni yarn.

## Inicio local

La guía de operación para el equipo está en [MANUAL_USO.md](./MANUAL_USO.md).
Para publicar la aplicación completa en Vercel, sigue [DESPLIEGUE_VERCEL.md](./DESPLIEGUE_VERCEL.md).

Requiere Node.js 22+ y npm. El modo desarrollo inicia la web y el API.

1. Instala dependencias: `npm install`.
2. Configura `apps/api/.env` con la URL de Neon y un `JWT_SECRET` propio de al menos 32 caracteres. No compartas ni subas este archivo.
3. Inicia ambos servicios: `npm run dev`.

Frontend: http://localhost:5173
API: http://localhost:3001

Inicia sesión con la cuenta administradora ya registrada en Neon. Los leads se guardan en sus tablas relacionales; prospección, campañas, contenido, tareas, Marketplace, WhatsApp, activos y catálogos se leen y guardan en `workspace_records` a través del API. Las colecciones comienzan vacías: agrega tus datos reales desde la aplicación; no se insertan fixtures automáticamente.

La persistencia de esas colecciones necesita la migración `20261005120000_workspace_records`. Antes de usar estas áreas en un entorno nuevo, aplica las migraciones con `npm run db:deploy --workspace @rgr/api`. En la base de producción enlazada, esa migración está probada en una rama temporal y espera autorización explícita antes de aplicarse.

Redis y S3/MinIO son opcionales para iniciar el CRM; se usan para trabajos programados y archivos, respectivamente. Permanecen desactivados por defecto en desarrollo. Configura `ENABLE_WORKERS=true` y `ENABLE_STORAGE=true` solo después de configurar esos servicios.

Build de producción:

```powershell
npm run build -w @rgr/shared && npm run build -w @rgr/web
```

Los artefactos quedan en `apps/web/dist/`.

## Comandos

- `npm run build`: compila schemas compartidos, API y frontend.
- `npm run lint`: ejecuta Oxlint.
- `npm run db:generate --workspace @rgr/api`: regenera Prisma Client.
- `npm run db:deploy --workspace @rgr/api`: aplica migraciones existentes en despliegue.

## Áreas iniciales

- Leads con unidad, fecha, contacto, teléfono, servicio/producto, canal, ciudad, cita, llegada, venta y monto; los leads de maquinaria exigen producto y necesidad.
- Pipeline con los estados Nuevo lead, Contactado, Cita, Cotizado, Seguimiento, Cliente, No responde y Perdido.
- Prospección, campañas, calendario, seguimiento de leads por WhatsApp, Marketplace, banco audiovisual y reporte semanal de seis secciones. El reporte se puede guardar para revisión en Neon, descargar como CSV compatible con Excel e imprimir como PDF.
- Catálogo inicial con CAT 320, dos Mitsubishi L200, Isuzu KV600 + compactadora, servicios del taller y restricción de motocarros a TikTok Live.
- Si Redis está configurado y `ENABLE_WORKERS=true`, el sistema ejecuta el control de SLA cada minuto y genera el corte semanal los lunes a las 08:00 de Perú. El reporte también se puede guardar manualmente desde la aplicación.

WhatsApp Business, Meta/Instagram y TikTok aún requieren coordinación, configuración y credenciales externas. Las pantallas registran el trabajo de operación en Neon; no publican contenido ni responden mensajes automáticamente.
