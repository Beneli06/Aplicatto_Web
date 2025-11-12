[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.17228741.svg)](https://doi.org/10.5281/zenodo.17228741)

<h1 align="center">Aplicatto Platform</h1>
<p align="center">
	API segura + sitio público de autenticación para el Semillero Aplicatto.
</p>

## 🚀 Arquitectura

- **Frontend:** sitio Jekyll que consume la API con `fetch`, muestra formularios de inicio de sesión/registro y administra tokens de acceso únicamente en memoria/localStorage.
- **Backend:** API REST en Node.js (Express + TypeScript + MongoDB) con autenticación JWT, refresh tokens en cookies HttpOnly, validaciones Celebrate y pruebas E2E con Jest.
- **Seguridad:** cookies endurecidas, CORS estricto por origen, cabeceras Helmet, rate limiting, y validación de variables con Joi.

## 📦 Requisitos

| Dependencia | Versión recomendada |
|-------------|---------------------|
| Node.js     | ≥ 18.18 (se usa 24.x en dev) |
| npm         | ≥ 8 |
| MongoDB     | ≥ 5 (local o remoto) |
| Ruby        | ≥ 3.1 con Bundler |

## ⚙️ Configuración backend

1. Copia el archivo de ejemplo y ajusta los valores:

	 ```bash
	 cd backend
	 cp .env.example .env
	 ```

2. Edítalo con tus credenciales seguras (32+ caracteres para las llaves JWT). Variables clave:

	 - `CLIENT_ORIGINS`: lista separada por comas de orígenes permitidos para CORS (ej. `http://127.0.0.1:4000,http://localhost:4000`).
	 - `COOKIE_SECURE_MODE`: `auto` usa `secure` solo en producción, `always` fuerza HTTPS y `never` lo desactiva.
	 - `COOKIE_SAMESITE`: `lax` (recomendado) o `strict`. `none` requiere HTTPS.
	 - `COOKIE_DOMAIN`: dominio raíz si vas a servir la API bajo subdominios.

3. Instala dependencias y levanta la API:

	 ```bash
	 npm install
	 npm run dev
	 ```

	 La consola debe mostrar:

	 ```
	 [INFO] MongoDB conectado: aplicatto
	 [INFO] Servidor escuchando en http://localhost:4001
	 ```

## 🌐 Sitio Jekyll (frontend)

Ejecuta estos comandos desde la raíz del repositorio:

```bash
bundle install
bundle exec jekyll serve --livereload
```

El sitio quedará disponible en `http://127.0.0.1:4000/`. El archivo `_config.yaml` expone la URL base de la API en `api_base_url` (por defecto `http://localhost:4001/api/v1`).

## 🔐 Flujo de autenticación

1. Visita `http://127.0.0.1:4000/auth`.
2. El formulario predeterminado es **Iniciar sesión**. Usa el enlace “¿Necesitas una cuenta?” para crear usuario.
3. Al autenticarte se obtiene un token de acceso en memoria y un refresh token HttpOnly (`SameSite` configurable + `secure` en producción).
4. En la tarjeta “Sesión activa” puedes renovar tokens o consultar usuarios (si tienes rol `admin`).

Los botones están conectados vía `fetch` con `credentials: 'include'`. Si la API no responde se muestra un mensaje de red amigable. La sesión puede cerrarse desde el header o el panel.

## 🧪 Tests y builds

- Ejecutar pruebas automáticas (usa `mongodb-memory-server`):

	```bash
	cd backend
	npm test
	```

- Compilar la API:

	```bash
	npm run build
	```

- Generar el sitio estático:

	```bash
	cd ..
	bundle exec jekyll build
	```

## ✅ Checklist de seguridad

- [x] Rate limiting global (100 requests / 15 min).
- [x] CORS con lista blanca (`CLIENT_ORIGINS`).
- [x] Cookies HttpOnly con `Secure` y `SameSite` configurables.
- [x] Cabeceras Helmet + ocultar `x-powered-by`.
- [x] Validación Joi de variables y payloads.
- [x] Tokens de refresco nunca viajan en el cuerpo de la respuesta.

## 🤝 Contribuciones

1. Abre un issue describiendo cambios propuestos.
2. Trabaja en un branch, ejecuta `npm test` y `bundle exec jekyll build`.
3. Envía PR con descripción y capturas si aplica.

---

Hecho con ❤️ para el Semillero Aplicatto.
