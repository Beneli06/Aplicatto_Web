/* global window, document, localStorage, fetch */

(() => {
  const API_BASE = window.APLICATTO_API_BASE || 'http://localhost:4001/api/v1';
  const endpoints = {
    register: `${API_BASE}/auth/register`,
    login: `${API_BASE}/auth/login`,
    refresh: `${API_BASE}/auth/refresh`,
    logout: `${API_BASE}/auth/logout`,
    adminUsers: `${API_BASE}/admin/users`
  };

  const storageKey = 'aplicatto.auth';
  let feedbackTimeout;

  const selectors = {
    registerForm: document.querySelector('[data-auth-form="register"]'),
    loginForm: document.querySelector('[data-auth-form="login"]'),
    feedback: document.querySelector('[data-auth-feedback]'),
    feedbackMessage: document.querySelector('[data-auth-feedback-message]'),
    statusCard: document.querySelector('[data-auth-status]'),
    statusEmail: document.querySelector('[data-auth-status-email]'),
    statusRole: document.querySelector('[data-auth-status-role]'),
    statusUpdated: document.querySelector('[data-auth-status-updated]'),
    actions: document.querySelector('[data-auth-actions]'),
    refreshButton: document.querySelector('[data-auth-refresh]'),
    adminButton: document.querySelector('[data-auth-admin]'),
    output: document.querySelector('[data-auth-output]'),
    headerLink: document.querySelector('[data-auth-link]'),
    headerProfile: document.querySelector('[data-auth-user]'),
    headerName: document.querySelector('[data-auth-user-name]'),
    headerRole: document.querySelector('[data-auth-user-role]'),
    logoutButton: document.querySelector('[data-auth-logout]')
  };

  function loadSession() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('[Aplicatto] No se pudo cargar la sesión almacenada.', error);
      return null;
    }
  }

  let session = loadSession();

  function saveSession(data) {
    session = {
      user: data.user,
      accessToken: data.accessToken,
      lastUpdated: new Date().toISOString()
    };
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(session));
    } catch (error) {
      console.warn('[Aplicatto] No se pudo guardar la sesión.', error);
    }
    renderAuthState();
  }

  function clearSession() {
    session = null;
    try {
      window.localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('[Aplicatto] No se pudo limpiar la sesión.', error);
    }
    renderAuthState();
  }

  function clearFeedback() {
    if (!selectors.feedback) return;
    selectors.feedback.hidden = true;
    selectors.feedback.removeAttribute('data-variant');
    if (selectors.feedbackMessage) {
      selectors.feedbackMessage.textContent = '';
    }
  }

  function setFeedback(type, message) {
    if (!selectors.feedback || !selectors.feedbackMessage) return;
    clearTimeout(feedbackTimeout);

    if (!message) {
      clearFeedback();
      return;
    }

    selectors.feedback.hidden = false;
    selectors.feedback.dataset.variant = type;
    selectors.feedbackMessage.textContent = message;

    feedbackTimeout = window.setTimeout(() => {
      clearFeedback();
    }, 6000);
  }

  function friendlyName(user) {
    if (!user) return '';
    if (user.fullName && user.fullName.trim().length > 0) {
      return user.fullName.trim();
    }
    return user.email?.split('@')[0] ?? 'Semillerista';
  }

  function renderAuthState() {
    const user = session?.user ?? null;
    const hasSession = Boolean(user && session?.accessToken);

    if (selectors.headerLink) {
      selectors.headerLink.hidden = hasSession;
    }

    if (selectors.headerProfile) {
      selectors.headerProfile.hidden = !hasSession;
      if (hasSession && selectors.headerName) {
        selectors.headerName.textContent = friendlyName(user);
      }
      if (hasSession && selectors.headerRole) {
        selectors.headerRole.textContent = user.role === 'admin' ? 'Rol: Administrador' : 'Rol: Miembro';
      }
    }

    if (selectors.logoutButton) {
      selectors.logoutButton.disabled = !hasSession;
    }

    if (selectors.statusCard) {
      selectors.statusCard.dataset.visible = hasSession ? 'true' : 'false';
      if (!hasSession) {
        if (selectors.statusEmail) selectors.statusEmail.textContent = '';
        if (selectors.statusRole) selectors.statusRole.textContent = '';
        if (selectors.statusUpdated) selectors.statusUpdated.textContent = '';
      } else {
        if (selectors.statusEmail) selectors.statusEmail.textContent = `Correo: ${user.email}`;
        if (selectors.statusRole) selectors.statusRole.textContent = `Rol: ${user.role}`;
        if (selectors.statusUpdated) selectors.statusUpdated.textContent = `Actualizado: ${new Date(session.lastUpdated).toLocaleString()}`;
      }
    }

    if (selectors.actions) {
      const showActions = hasSession;
      selectors.actions.hidden = !showActions;
    }

    if (selectors.refreshButton) {
      selectors.refreshButton.disabled = !hasSession;
    }

    if (selectors.adminButton) {
      const isAdmin = hasSession && session.user.role === 'admin';
      selectors.adminButton.disabled = !isAdmin;
      selectors.adminButton.textContent = isAdmin ? 'Listar usuarios (admin)' : 'Requiere rol admin';
    }

    if (selectors.output) {
      selectors.output.hidden = true;
      selectors.output.textContent = '';
    }
  }

  async function request(endpoint, options = {}) {
    const { body, method = 'POST', auth = false } = options;
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});

    if (auth && session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    const response = await window.fetch(endpoint, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined
    });

    let data = {};
    const raw = await response.text();
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (error) {
        data = { raw };
      }
    }

    if (!response.ok) {
      const error = new Error(data?.message || `Error ${response.status}`);
      error.status = response.status;
      error.payload = data;
      throw error;
    }

    return data;
  }

  function withSubmitState(handler) {
    return async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const submitter = event.submitter || form.querySelector('button[type="submit"]');
      if (submitter) submitter.disabled = true;
      try {
        await handler(new window.FormData(form));
      } catch (error) {
        if (error.status === 401) {
          clearSession();
        }
        setFeedback('error', error.message || 'Ocurrió un error inesperado.');
      } finally {
        if (submitter) submitter.disabled = false;
      }
    };
  }

  async function handleRegister(formData) {
    setFeedback('info', 'Creando tu cuenta...');

    const payload = {
      email: String(formData.get('email') || '').trim(),
      password: String(formData.get('password') || '').trim(),
      fullName: String(formData.get('fullName') || '').trim() || undefined
    };

    const data = await request(endpoints.register, { body: payload });
    saveSession(data);
    setFeedback('success', `¡Bienvenida/o ${friendlyName(data.user)}! Tu cuenta está activa.`);
  }

  async function handleLogin(formData) {
    setFeedback('info', 'Verificando credenciales...');

    const payload = {
      email: String(formData.get('email') || '').trim(),
      password: String(formData.get('password') || '').trim()
    };

    const data = await request(endpoints.login, { body: payload });
    saveSession(data);
    setFeedback('success', `Sesión iniciada correctamente. Hola de nuevo, ${friendlyName(data.user)}.`);
  }

  async function handleLogout() {
    if (!session) {
      clearSession();
      return;
    }

    try {
      await request(endpoints.logout, { auth: true });
    } catch (error) {
      console.warn('[Aplicatto] Error cerrando sesión', error);
    } finally {
      clearSession();
      setFeedback('success', 'Sesión finalizada. ¡Hasta pronto!');
    }
  }

  async function handleRefresh() {
    if (!session) return;

    setFeedback('info', 'Renovando tokens...');
    try {
      const data = await request(endpoints.refresh, { body: {} });
      saveSession(data);
      setFeedback('success', 'Tokens renovados correctamente.');
    } catch (error) {
      if (error.status === 401) {
        clearSession();
        setFeedback('error', 'La sesión expiró. Inicia sesión nuevamente.');
        return;
      }
      throw error;
    }
  }

  async function handleAdminList() {
    if (!session) return;
    setFeedback('info', 'Consultando usuarios...');
    try {
      const data = await request(endpoints.adminUsers, { method: 'GET', auth: true });
      setFeedback('success', `Usuarios encontrados: ${data.total}`);
      if (selectors.output) {
        selectors.output.hidden = false;
        selectors.output.textContent = JSON.stringify(data, null, 2);
      }
    } catch (error) {
      setFeedback('error', error.message || 'No fue posible obtener la lista de usuarios.');
      if (error.status === 401 || error.status === 403) {
        clearSession();
      }
    }
  }

  function bindEvents() {
    if (selectors.registerForm) {
      selectors.registerForm.addEventListener('submit', withSubmitState(handleRegister));
    }

    if (selectors.loginForm) {
      selectors.loginForm.addEventListener('submit', withSubmitState(handleLogin));
    }

    if (selectors.logoutButton) {
      selectors.logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        handleLogout();
      });
    }

    if (selectors.refreshButton) {
      selectors.refreshButton.addEventListener('click', async () => {
        try {
          await handleRefresh();
        } catch (error) {
          setFeedback('error', error.message || 'No se pudo renovar la sesión.');
        }
      });
    }

    if (selectors.adminButton) {
      selectors.adminButton.addEventListener('click', async () => {
        selectors.adminButton.disabled = true;
        try {
          await handleAdminList();
        } finally {
          selectors.adminButton.disabled = false;
        }
      });
    }
  }

  function init() {
    renderAuthState();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
