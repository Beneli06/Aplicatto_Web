---
title: Autenticación
layout: default
nav:
  order: 60
  tooltip: Gestiona tu sesión
permalink: /auth/
---

# Iniciar sesión o registrarse

La plataforma Aplicatto Bookstore contará con autenticación basada en tokens JWT y flujos seguros sobre HTTPS. Mientras el backend está en desarrollo, esta página describe cómo interactuar con el API y dónde se mostrará el formulario de acceso.

## Próximos pasos en la interfaz
- **Botón de acceso:** El botón "Iniciar sesión / Registro" en la barra superior abre esta vista.
- **Formulario React:** Aquí vivirá el formulario definitivo con campos para correo electrónico, contraseña y recuperación.
- **Mensajes en vivo:** Se mostrarán alertas de éxito o error reutilizando la misma lógica que se valida en Postman.

## Flujo automatizado de pruebas (Postman)
Consulta la guía completa en [`docs/postman-auth-workflow.md`](../docs/postman-auth-workflow.md) para:
- Probar el endpoint `POST /auth/login` con credenciales de prueba.
- Ejecutar el registro automático si el usuario no existe.
- Validar acceso a endpoints protegidos como `/user/profile`.

## Integración con el backend
1. **Enviar credenciales** desde el formulario React al API.
2. **Manejar respuestas** replicando el flujo Postman (login → registro → reintento).
3. **Guardar tokens** en cookies HttpOnly (refresh) y memoria segura (access).
4. **Redirigir** al catálogo o al panel de administración según rol.

¿Necesitas soporte adicional? Añade un ticket en el tablero de Scrum o contacta al equipo de backend para coordinar credenciales de prueba.
