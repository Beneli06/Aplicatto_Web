---
title: Autenticación
layout: default
nav:
  order: 60
  tooltip: Gestiona tu sesión
permalink: /auth/
---

# Autenticación Aplicatto

Activa tu sesión directamente desde el navegador y experimenta el mismo flujo que validamos con Postman. El backend expone los endpoints en `{{ site.api_base_url }}` y esta vista ya está conectada para consumirlos.

## Cómo usar esta página
1. **Levanta la API** con `npm run dev` dentro de `backend/`.
2. **Recarga** este sitio (Jekyll) y completa cualquiera de los formularios.
3. **Consulta tu estado** en la parte inferior y usa el botón *Cerrar sesión* en la cabecera o aquí mismo.

<div class="auth-wrapper">
  <section>
    <p>
      Todos los envíos utilizan <code>fetch</code> con <strong>cookies HttpOnly</strong> para el refresh token y almacenan el access token en memoria local.
      Si el login falla, el frontend replica la lógica “login → registro → reintento” descrita en la guía de Postman.
    </p>
  </section>

  <div class="auth-feedback" data-auth-feedback hidden>
    <span data-auth-feedback-message></span>
  </div>

  <div class="auth-grid">
    <section class="auth-card">
      <h2>Crear una cuenta</h2>
      <p>Registra a un nuevo miembro y obtén tokens inmediatamente.</p>
      <form class="auth-form" data-auth-form="register" autocomplete="on">
        <label>
          Nombre completo
          <input type="text" name="fullName" placeholder="Valeria Torres" autocomplete="name">
        </label>
        <label>
          Correo electrónico
          <input type="email" name="email" placeholder="valeria@example.com" autocomplete="email" required>
        </label>
        <label>
          Contraseña
          <input type="password" name="password" placeholder="Mínimo 8 caracteres" autocomplete="new-password" required>
        </label>
        <button type="submit">Registrarme</button>
      </form>
    </section>

    <section class="auth-card">
      <h2>Iniciar sesión</h2>
      <p>Accede con tus credenciales para obtener un nuevo par de tokens.</p>
      <form class="auth-form" data-auth-form="login" autocomplete="on">
        <label>
          Correo electrónico
          <input type="email" name="email" placeholder="correo@ejemplo.com" autocomplete="email" required>
        </label>
        <label>
          Contraseña
          <input type="password" name="password" placeholder="••••••••" autocomplete="current-password" required>
        </label>
        <button type="submit">Ingresar</button>
      </form>
    </section>
  </div>

  <section class="auth-status" data-auth-status data-visible="false">
    <h2>Sesión activa</h2>
    <p>Cuando te autentiques verás tus datos y podrás probar endpoints protegidos.</p>
    <div class="auth-status__meta">
      <span data-auth-status-email></span>
      <span data-auth-status-role></span>
      <span data-auth-status-updated></span>
    </div>
    <div class="auth-actions" data-auth-actions hidden>
      <button type="button" data-auth-refresh>Renovar tokens</button>
      <button type="button" data-auth-admin>Listar usuarios (admin)</button>
    </div>
    <pre data-auth-output hidden></pre>
  </section>

  <section>
    <h2>Compatibilidad con Postman</h2>
    <p>
      Los mismos headers, scripts y validaciones definidos en <a href="{{ '/docs/postman-auth-workflow.md' | relative_url }}">la guía de Postman</a> se aplican aquí.
      Puedes reutilizar las credenciales de prueba del curso (`admin@aplicatto.dev / Admin#1234`).
    </p>
  </section>
</div>
