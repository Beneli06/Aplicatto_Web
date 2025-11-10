# Postman Authentication Workflow Test Plan

## Overview
- **Objective:** Validate the Aplicatto Bookstore authentication flow end-to-end using Postman, ensuring seamless login, conditional registration, and clear error feedback.
- **Target API:** `POST {{baseUrl}}/auth/login` (adjust path as needed).
- **Prerequisites:**
  - Postman Desktop v10+
  - Aplicatto API accessible over HTTPS
  - Test database seeded with at least one known user for positive scenarios
  - Postman environment with `baseUrl`, `username`, `password`, and optional `email`
  - Herramienta de captura de pantalla / grabador de pantalla (OBS, Loom, etc.)

---

## Collection Structure
Create a collection named **"Authentication Workflow"** with these requests:

1. **Login** – `POST {{baseUrl}}/auth/login`
2. **Register** – `POST {{baseUrl}}/auth/register`
3. **Get Profile** – `GET {{baseUrl}}/user/profile`

Add a folder `Protected Flows` for any additional authorized endpoints (e.g., `/orders`).

---

## Environment Variables
| Variable | Example | Notes |
| --- | --- | --- |
| `baseUrl` | `https://api.aplicatto.dev` | Root URL |
| `username` | `testuser@example.com` | Used in login/registration |
| `password` | `Str0ngP@ssword!` | Matches password policy |
| `email` | `testuser@example.com` | Optional if username is different |
| `authToken` | *(set by tests)* | JWT access token |
| `refreshToken` | *(set by tests)* | JWT refresh token |

Set `Persist variables` off for sensitive data; rely on environments.

---

## Request Definitions
### 1. Login Request (Primary)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "username": "{{username}}",
    "password": "{{password}}"
  }
  ```
- **Tests Script:**
  ```javascript
  const status = pm.response.code;
  const body = pm.response.json();

  pm.test('Response has JSON body', () => {
    pm.response.to.have.header('Content-Type');
    pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
  });

  if (status === 200) {
    pm.test('Login successful', () => {
      pm.expect(body.token).to.be.a('string');
    });
    pm.environment.set('authToken', body.token);
    if (body.refreshToken) {
      pm.environment.set('refreshToken', body.refreshToken);
    }
    pm.environment.set('userId', body.user?.id);
    postman.setNextRequest('Get Profile');
  } else if (status === 401 || status === 404) {
    pm.test('User missing – trigger registration', () => {
      pm.expect(body.message).to.match(/not\s+found|unauthorized/i);
    });
    postman.setNextRequest('Register');
  } else {
    pm.test('Unexpected status handled', () => {
      pm.expect(status).to.be.oneOf([400, 422, 429, 500]);
    });
    console.error('Login error:', status, body.message);
    postman.setNextRequest(null);
  }
  ```

### 2. Register Request (Fallback)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "username": "{{username}}",
    "email": "{{email}}",
    "password": "{{password}}"
  }
  ```
- **Tests Script:**
  ```javascript
  const status = pm.response.code;
  const body = pm.response.json();

  if (status === 201 || status === 200) {
    pm.test('Registration succeeded', () => {
      pm.expect(body.user).to.be.an('object');
    });
    postman.setNextRequest('Login');
  } else {
    pm.test('Registration failed gracefully', () => {
      pm.expect(status).to.be.oneOf([400, 409, 422, 500]);
    });
    console.warn('Registration error:', status, body.message);
    postman.setNextRequest(null);
  }
  ```

### 3. Get Profile (Protected Endpoint)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/user/profile`
- **Headers:**
  - `Authorization: Bearer {{authToken}}`
- **Tests Script:**
  ```javascript
  pm.test('Profile accessible with token', () => {
    pm.response.to.have.status(200);
    const body = pm.response.json();
    pm.expect(body.email).to.eql(pm.environment.get('username'));
  });
  postman.setNextRequest(null);
  ```

---

## Automation Flow
1. Run the **Login** request manually or via Collection Runner.
2. Scripts automatically branch:
   - **200 OK:** Token stored, `Get Profile` executes.
   - **401/404:** `Register` executes, then returns to `Login`.
   - **Other codes:** Execution stops with descriptive logs.
3. Inspect console (View → Show Postman Console) for debug output.
4. Use Runner/Newman for batch execution and reporting.

---

## Edge Cases & Negative Tests
| Scenario | Expected Status | Handling |
| --- | --- | --- |
| Valid user credentials | 200 | Store token → access profile |
| Non-existent user | 404/401 | Register → re-login |
| Wrong password | 401 | Stop, display "Invalid credentials" |
| Missing password field | 400 | Validation message shown |
| Rate limited | 429 | Retry logic external to collection |
| Server error | 500 | Alert dev team, inspect logs |

Optional: Use data files in Runner to iterate over multiple credential sets.

---

## Integration With Website
- **Login UI:** React button/link in header directs users to `/auth/login` page; use Axios to hit `/auth/login` endpoint.
- **Feedback:** Display success/error toast messages mirroring Postman responses.
- **Token Storage:** Use HttpOnly cookies for refresh token (server set) and React Query/Context to store access token in memory.
- **Developer Workflow:** QA runs the Postman collection before merging auth-related branches. Include collection JSON and environment file in repo under `test/postman/`.

---

## Newman Command (CI Example)
```bash
newman run postman/authentication-workflow.postman_collection.json \
  --environment postman/authentication-env.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export reports/auth-workflow.html
```

Include this command in GitHub Actions to ensure authentication flows remain functional.

---

## Evidencias requeridas (entregables del curso)

- **Instalación de Postman:**
  1. Descarga desde [https://www.postman.com/downloads/](https://www.postman.com/downloads/).
  2. Guarda un pantallazo de la pantalla de instalación completada y adjúntalo en la bitácora del proyecto.
- **Video de pruebas:**
  - Graba con OBS/Loom mientras ejecutas la colección "Authentication Workflow".
  - Narra brevemente cada escenario (login correcto, usuario inexistente → registro, error de contraseña).
  - Exporta el video en formato MP4 o comparte enlace privado.
- **Pantallazos en el reporte:**
  - Login exitoso (status 200 + token).
  - Registro automático tras respuesta 404/401.
  - Acceso a `/user/profile` con token válido.
  - Caso negativo (401 por contraseña errónea).
- **Documentación de endpoints:**
  - Refiérete a [`docs/auth-api-spec.md`](./auth-api-spec.md) y agrega una tabla-resumen en el informe final.

> **Nota:** Este repositorio aún no incluye el backend; para generar las evidencias, utiliza un ambiente backend real (cuando esté disponible) o un mock server en Postman mientras se termina el desarrollo.
