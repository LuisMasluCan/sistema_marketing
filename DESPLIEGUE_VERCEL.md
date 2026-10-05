# Despliegue en Vercel

La aplicación está preparada para desplegarse como **un solo proyecto Vercel**: Fastify atiende `/api/*` y sirve la aplicación web y sus rutas de cliente desde el mismo dominio. Neon sigue siendo la base de datos. Vercel no necesita conectarse a un servidor local.

## Antes de desplegar

1. Sube el repositorio completo a GitHub, GitLab o Bitbucket. No subas `apps/api/.env`, contraseñas, tokens ni cadenas de conexión.
2. En Neon, copia la cadena de conexión de producción con SSL. Usa el endpoint pooled (host con `-pooler`) si el pooler está habilitado para el proyecto.
3. **La base debe tener aplicadas todas las migraciones**, incluida `20261005120000_workspace_records`. Sin ella no funcionarán las áreas operativas que guardan catálogos, campañas, tareas, contenido, Marketplace, activos y prospección. Para otra base o entorno donde falte, aplica las migraciones desde un entorno autorizado con:

   ```powershell
   npm run db:deploy --workspace @rgr/api
   ```

   Comprueba que `DATABASE_URL` apunta a la base correcta antes de ejecutarlo. No se ejecutan migraciones automáticamente durante el despliegue. La base Neon de producción asociada a este proyecto ya tiene registrada esta migración.

## Crear el proyecto

1. En Vercel, selecciona **Add New → Project** e importa el repositorio.
2. Usa la carpeta raíz del repositorio como **Root Directory** (`.`); no selecciones `apps/web` ni `apps/api`.
3. Mantén el gestor **npm**. El repositorio tiene `package-lock.json` en la raíz.
4. Agrega estas variables para **Production**, **Preview** y **Development** según corresponda:

   | Variable | Valor |
   | --- | --- |
   | `DATABASE_URL` | Cadena de Neon de producción con SSL y conexión pooled |
   | `JWT_SECRET` | Secreto aleatorio propio, mínimo 32 caracteres |

   Para generar un secreto localmente, ejecuta `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"` y pega el resultado en Vercel. No uses el secreto de desarrollo del archivo `.env.example`.

5. No configures `WEB_ORIGIN`: la web y el API se sirven desde el mismo origen. Vercel proporciona `NODE_ENV=production`.
6. Deja `ENABLE_WORKERS` y `ENABLE_STORAGE` en `false` (o sin configurar) para este despliegue inicial. No habilites trabajadores BullMQ en funciones serverless.
7. Pulsa **Deploy**. El proyecto ejecuta `npm ci` y `npm run build` según `vercel.json`.

## Comprobación después del despliegue

1. Abre `https://<tu-dominio>/health/ready`. Debe responder `{"status":"ready"}`.
2. Abre el dominio principal. En una base sin usuarios aparecerá el formulario para crear la primera cuenta administradora. En una base ya configurada, inicia sesión con una cuenta existente.
3. Crea un canal en Administración y prueba guardar un lead. Luego verifica que el lead siga visible al recargar la página.
4. Prueba también guardar una tarea o registro de catálogo para confirmar que la migración de `workspace_records` está desplegada.

Si `/health/ready` responde `503`, revisa `DATABASE_URL`, la conectividad de Neon y que la base esté activa. Si una sección operativa da error al guardar, confirma la migración antes de volver a intentar.

## Funciones y servicios externos

- Los datos de las operaciones principales, la autenticación, los leads y los reportes manuales usan Neon y la API del mismo despliegue.
- Las automatizaciones BullMQ (escaneo de SLA y generación semanal automática) necesitan un worker persistente y Redis; no se deben iniciar dentro de la función de Vercel. El reporte puede guardarse manualmente desde la pantalla.
- La carga real de archivos necesita un bucket S3 compatible y sus credenciales; sin esa configuración, el banco audiovisual solo permite registrar metadatos.
- WhatsApp, Meta/Instagram, TikTok y Facebook Marketplace no envían mensajes ni publican automáticamente; requieren sus integraciones y credenciales externas.

## Despliegues posteriores

Al conectar Git, Vercel generará un despliegue de producción para la rama configurada y despliegues Preview para otras ramas. Mantén el `package-lock.json` junto con los cambios de `package.json`; Vercel instala las dependencias reproducibles mediante `npm ci`.
