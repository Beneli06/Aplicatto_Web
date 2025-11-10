# Aplicatto Auth API — Specification (Draft)

> **Estado:** Documento de diseño. El backend correspondiente aún no está implementado en este repositorio estático. Úsalo como guía para desarrollar el servicio, crear la colección de Postman y coordinar esfuerzos con el equipo backend.

## Stack objetivo
- **Backend:** Node.js 18+, Express.js 5, TypeScript.
- **Base de datos:** MongoDB Atlas (colección `users`, `sessions`).
- **Autenticación:** JWT (access 15 min) + refresh tokens (7 días) en cookies HttpOnly.
- **Seguridad:** BCrypt cost 12, Helmet, CORS restringido, rate limiting, sanitización.

## Roles
| Rol | Permisos clave |
| --- | --- |
| `admin` | CRUD de usuarios, reset de contraseñas, activar/desactivar cuentas |
| `member` | Acceso a propios datos, creación/gestión de pedidos, actualización de perfil |

## Convenciones
- Todas las rutas prefijan `/api/v1`.
- Respuestas JSON inician con `success: boolean` y, cuando aplica, `data` u `errors`.
- Las rutas protegidas requieren header `Authorization: Bearer <token>`.

## Endpoints principales

### POST `/api/v1/auth/register`
Registra a un usuario nuevo (público).

**Body**
```json
{
  "email": "user@example.com",
  "password": "Str0ngP@ss!",
  "fullName": "Nombre Apellido"
}
```

**Responses**
- `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "6510...",
        "email": "user@example.com",
        "role": "member",
        "createdAt": "2025-11-10T20:04:55.490Z"
      }
    },
    "message": "Cuenta creada. Confirma tu correo para continuar."
  }
  ```
- `409 Conflict` si el correo ya existe.

### POST `/api/v1/auth/login`
Obtiene tokens para usuario existente.

**Body**
```json
{
  "email": "user@example.com",
  "password": "Str0ngP@ss!"
}
```

**Responses**
- `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "token": "<JWT access>",
      "refreshToken": "<JWT refresh>",
      "user": {
        "id": "6510...",
        "email": "user@example.com",
        "role": "member"
      }
    }
  }
  ```
  - Cookie HttpOnly: `refreshToken`
- `401 Unauthorized` si credenciales inválidas.
- `403 Forbidden` si la cuenta está inactiva.

### POST `/api/v1/auth/refresh`
Intercambia refresh token por nuevo access token. Requiere cookie `refreshToken`.

**Responses**
- `200 OK` con nuevo access token.
- `401` si no hay cookie válida.

### POST `/api/v1/auth/logout`
Invalida refresh token actual.

**Responses**
- `204 No Content`

### Admin — gestión de usuarios
Todas requieren rol `admin`.

#### GET `/api/v1/admin/users`
Lista los usuarios con filtros opcionales (`role`, `status`).

- `200 OK` con paginación.

#### POST `/api/v1/admin/users`
Crea usuario (admin crea cuentas especiales).

**Body**
```json
{
  "email": "staff@example.com",
  "role": "admin",
  "temporaryPassword": "TempP@ss123",
  "fullName": "Staff Aplicatto"
}
```

- `201 Created`

#### PATCH `/api/v1/admin/users/:id`
Actualiza rol o estado.

**Body** (ejemplo)
```json
{
  "role": "member",
  "status": "disabled"
}
```

- `200 OK`

#### DELETE `/api/v1/admin/users/:id`
Desactiva o elimina usuario (soft delete recomendado).

- `204 No Content`

### Usuario — autogestión

#### GET `/api/v1/users/me`
Devuelve perfil del usuario autenticado.

#### PATCH `/api/v1/users/me`
Actualiza nombre, contraseña (requiere `currentPassword`).

---

## Errores estándar
```json
{
  "success": false,
  "errors": [
    {
      "code": "AUTH_INVALID_CREDENTIALS",
      "detail": "El correo o la contraseña no son válidos"
    }
  ]
}
```

Códigos sugeridos: `AUTH_INVALID_CREDENTIALS`, `AUTH_ACCOUNT_DISABLED`, `AUTH_TOKEN_EXPIRED`, `USER_ALREADY_EXISTS`, `USER_NOT_FOUND`, `VALIDATION_FAILED`.

---

## Postman collection (estructura sugerida)
1. **Auth**
   - Register
   - Login
   - Refresh token
   - Logout
2. **User**
   - Get my profile
   - Update my profile
3. **Admin**
   - List users
   - Create user
   - Update user
   - Delete user

Variables de entorno:
- `baseUrl`
- `adminToken`
- `memberToken`
- `userId`
- `newUserId`

Scripts corporativos:
- Guardar access token en `pm.environment.set('memberToken', body.data.token)`.
- `postman.setNextRequest('Auth / Register')` si login responde 404/401 para usuarios inexistentes (flujo auto-registro).

---

## Pendientes de implementación
- Configurar proyecto Express con capas MVC + servicios.
- Conectar con MongoDB usando Mongoose.
- Implementar pruebas (Jest + Supertest) para cada endpoint.
- Generar colección Postman exportable (`postman/auth-workflow.postman_collection.json`).
- Desplegar documentación OpenAPI (Swagger UI) para facilitar consumo.
