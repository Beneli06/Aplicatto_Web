# API Backend · Semillero Aplicatto

Este servicio expone la API REST para autenticación y gestión de usuarios del semillero. Está desarrollado en Node.js + TypeScript, Express y MongoDB, con autenticación mediante tokens JWT y pruebas end-to-end con Jest + Supertest.

## Requisitos

- Node.js >= 18.18
- npm >= 9
- MongoDB 6.x en ejecución local o cadena de conexión a un clúster compatible

## Configuración inicial

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea un archivo `.env` (puedes copiar el ejemplo incluido):

   ```bash
   cp .env.example .env
   ```

3. Ajusta los valores según tu entorno:

   ```env
   PORT=4001
   MONGODB_URI=mongodb://localhost:27017/aplicatto
   JWT_ACCESS_SECRET=tu-secreto-de-32caracteres-minimo
   JWT_REFRESH_SECRET=tu-secreto-de-32caracteres-minimo
   ACCESS_TOKEN_TTL_MINUTES=15
   REFRESH_TOKEN_TTL_DAYS=7
   ```

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Levanta el servidor en modo desarrollo con _hot reload_ mediante `tsx`. |
| `npm run build` | Compila TypeScript a JavaScript en `dist/`. |
| `npm start` | Ejecuta la versión compilada (`dist/server.js`). |
| `npm test` | Ejecuta pruebas integrales con Jest + Supertest usando MongoDB en memoria. |
| `npm run lint` | Analiza el código fuente con ESLint + TypeScript ESLint. |

> Las pruebas unitarias y de integración utilizan `mongodb-memory-server`, por lo que no necesitas una base real para `npm test`.

## Endpoints principales

La API está versionada bajo `/api/v1`.

### Autenticación (`/api/v1/auth`)

- `POST /register`: Registro de nuevos miembros. Devuelve usuario, access token y refresh token (también en cookie).
- `POST /login`: Inicio de sesión para usuarios registrados.
- `POST /refresh`: Regenera tokens a partir del refresh token almacenado (cookie o cuerpo).
- `POST /logout`: Invalida token de refresco y limpia la cookie (requiere autenticación).

### Administración de usuarios (`/api/v1/admin/users`)

Requiere autenticación y rol `admin`.

- `GET /`: Lista paginada con filtros por rol, estado y búsqueda.
- `GET /:userId`: Obtiene un usuario específico.
- `POST /`: Crea usuarios con rol y estado configurables.
- `PATCH /:userId`: Actualiza datos, estado, rol o resetea la contraseña.
- `DELETE /:userId`: Elimina un usuario.

## Flujo de autenticación

1. Al registrarse o iniciar sesión se generan tokens JWT (acceso + refresco). El refresh token se persiste en BD y se devuelve como cookie `HttpOnly`.
2. El frontend debe incluir el header `Authorization: Bearer <access_token>` para operaciones protegidas.
3. Cuando el access token expira, el cliente llama a `POST /auth/refresh` enviando el refresh token (por cookie o cuerpo) para obtener un nuevo par de tokens.
4. `POST /auth/logout` invalida el refresh token (sube `tokenVersion` y limpia el hash almacenado).

## Testing y automatización

- Las pruebas end-to-end cubren registro, login, refresh y el flujo administrativo.
- Puedes importar los casos en Postman o correrlos con Newman siguiendo la guía `docs/postman-auth-workflow.md`.
- Para la entrega del curso, recuerda capturar evidencias (capturas o video) y mantener el Postman Collection actualizado con los endpoints anteriores.

## Próximos pasos sugeridos

- Añadir módulo de recuperación de contraseña y verificación por email.
- Integrar auditoría/bitácora de acciones administrativas.
- Configurar pipeline CI (GitHub Actions) que ejecute `npm test` y linting en cada _push_.
- Exponer documentación OpenAPI/Swagger para facilitar consumo y pruebas.
