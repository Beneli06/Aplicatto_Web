---
layout: default
title: Autenticación
---

<div class="auth-container">
  <div id="auth-card" class="auth-card">
    <div id="session-info" class="session-info" style="display: none;">
      <h2 class="auth-title">Sesión Activa</h2>
      <p>Ya has iniciado sesión.</p>
      <div id="user-details"></div>
      <button id="logout-button" class="auth-button">Cerrar Sesión</button>
      <div id="admin-actions" style="display: none; margin-top: 20px;">
        <h4>Acciones de Administrador</h4>
        <button id="refresh-token-button" class="auth-button admin">Refrescar Token</button>
        <button id="get-users-button" class="auth-button admin">Obtener Usuarios</button>
      </div>
    </div>

    <div id="auth-forms">
      <div class="auth-header">
        <h2 id="auth-title" class="auth-title">Iniciar Sesión</h2>
        <p class="auth-subtitle">¿No tienes una cuenta? <a href="#" id="toggle-link">Regístrate</a></p>
      </div>

      <form id="login-form" class="auth-form">
        <div class="input-group">
          <label for="login-email">Correo Electrónico</label>
          <input type="email" id="login-email" required autocomplete="email">
        </div>
        <div class="input-group">
          <label for="login-password">Contraseña</label>
          <div class="password-wrapper">
            <input type="password" id="login-password" required autocomplete="current-password">
            <span class="password-toggle">
              <i class="fas fa-eye"></i>
            </span>
          </div>
        </div>
        <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
        <button type="submit" id="login-button" class="auth-button">
          <span class="button-text">Iniciar Sesión</span>
          <span class="spinner" style="display: none;"></span>
        </button>
      </form>

      <form id="register-form" class="auth-form" style="display: none;">
        <div class="input-group">
          <label for="register-username">Nombre de Usuario</label>
          <input type="text" id="register-username" required autocomplete="username">
        </div>
        <div class="input-group">
          <label for="register-email">Correo Electrónico</label>
          <input type="email" id="register-email" required autocomplete="email">
        </div>
        <div class="input-group">
          <label for="register-password">Contraseña</label>
          <div class="password-wrapper">
            <input type="password" id="register-password" required autocomplete="new-password" aria-describedby="password-constraints">
            <span class="password-toggle">
              <i class="fas fa-eye"></i>
            </span>
          </div>
          <ul id="password-constraints" class="password-constraints" style="display: none;">
            <li data-constraint="length">8 caracteres mínimo</li>
            <li data-constraint="lowercase">Una letra minúscula</li>
            <li data-constraint="uppercase">Una letra mayúscula</li>
            <li data-constraint="number">Un número</li>
            <li data-constraint="symbol">Un símbolo</li>
          </ul>
        </div>
        <button type="submit" id="register-button" class="auth-button">
          <span class="button-text">Crear Cuenta</span>
          <span class="spinner" style="display: none;"></span>
        </button>
      </form>
    </div>
  </div>
  <div id="auth-response" class="auth-response"></div>
</div>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
<link rel="stylesheet" href="{{ '/_styles/auth.css' | relative_url }}">
<script src="{{ '/_scripts/auth.js' | relative_url }}"></script>
