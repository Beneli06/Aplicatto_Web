# Backend Aplicatto Bookstore — Plan de implementación

## Objetivos de esta fase
1. Proveer un API REST con autenticación JWT que permita registrar, iniciar sesión, refrescar tokens y cerrar sesión.
2. Exponer endpoints administrativos para que usuarios con rol `admin` puedan crear, listar, actualizar y eliminar cuentas.
3. Entregar endpoints de autogestión (`/users/me`) para que cada usuario pueda consultar y actualizar su perfil.
4. Integrar MongoDB como capa de persistencia mediante Mongoose, con esquemas y validaciones acordes al dominio.
5. Configurar un entorno de desarrollo en TypeScript con herramientas de calidad (ESLint, Prettier) y pruebas (Jest + Supertest) respaldadas con `mongodb-memory-server`.

## Arquitectura propuesta
```
backend/
├── src/
│   ├── app.ts               # Configuración de Express, middlewares globales
│   ├── server.ts            # Punto de entrada, arranca la app y la conexión a Mongo
│   ├── config/
│   │   └── env.ts           # Gestión de variables de entorno (.env)
│   ├── db/
│   │   └── connection.ts    # Inicializa conexión con MongoDB
│   ├── models/
│   │   └── user.model.ts    # Esquema User + hooks de hash de contraseña
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── admin.controller.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── admin.routes.ts
│   │   └── user.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   └── utils/
│       ├── jwt.ts
│       └── logger.ts
├── tests/
│   └── auth.e2e.test.ts     # Prueba de integración de registro/login
├── package.json
├── tsconfig.json
├── jest.config.ts
├── .eslintrc.json
├── .prettierrc
└── .env.example
```

## Dependencias clave
- **Runtime:** `express`, `mongoose`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `helmet`, `cors`, `express-rate-limit`, `celebrate`.
- **Dev:** `typescript`, `ts-node-dev`, `eslint`, `@typescript-eslint/*`, `prettier`, `jest`, `ts-jest`, `supertest`, `mongodb-memory-server`.

## Estrategia de seguridad
- Hash de contraseñas con `bcryptjs` y factor 12.
- Tokens de acceso firmados con `JWT_ACCESS_SECRET` y expiración 15 min.
- Tokens de refresco (`JWT_REFRESH_SECRET`) almacenados como hash dentro del usuario para poder invalidarlos.
- Middleware de autorización por rol con comprobación de claims JWT.
- Limitador de tasa global (`express-rate-limit`) y sanitización de inputs (Celebrate/Joi).

## Flujo de autenticación
1. **Registro:** crea usuario `member`, envía respuesta 201 sin exponer contraseña.
2. **Login:** valida credenciales, genera par de tokens, envía access en JSON y refresh en cookie HttpOnly (Secure + SameSite strict).
3. **Refresh:** valida cookie, verifica hash guardado y responde con nuevo access token.
4. **Logout:** invalida refresh borrando hash almacenado y resetea cookie.

## Roadmap incremental
- **Sprint 1:** Scaffold + conexión Mongo + modelo Usuario + auth básica (register/login) + pruebas.
- **Sprint 2:** Refresh/logout, endpoints `/users/me`, admin CRUD.
- **Sprint 3:** Hardening (rate limit, logs, auditoría), CI con pruebas y Postman collection exportada.

Este plan guía las acciones inmediatas. A continuación construiremos el scaffolding en `backend/` siguiendo esta arquitectura.
