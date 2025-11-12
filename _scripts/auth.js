/* global document, fetch */

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:4001/api/v1';

  // --- DOM Elements ---
  const sessionInfo = document.getElementById('session-info');
  const authForms = document.getElementById('auth-forms');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authResponse = document.getElementById('auth-response');
  const toggleLink = document.getElementById('toggle-link');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.querySelector('.auth-subtitle');
  const userDetails = document.getElementById('user-details');
  const logoutButton = document.getElementById('logout-button');
  const adminActions = document.getElementById('admin-actions');
  const refreshTokenButton = document.getElementById('refresh-token-button');
  const getUsersButton = document.getElementById('get-users-button');
  const registerPasswordInput = document.getElementById('register-password');
  const passwordConstraintsList = document.getElementById('password-constraints');

  // --- State ---
  let isLoginView = true;

  // --- Password Validation ---
  const validatePassword = () => {
    if (!registerPasswordInput || !passwordConstraintsList) return;

    const value = registerPasswordInput.value;
    const constraints = {
      length: passwordConstraintsList.querySelector('[data-constraint="length"]'),
      lowercase: passwordConstraintsList.querySelector('[data-constraint="lowercase"]'),
      uppercase: passwordConstraintsList.querySelector('[data-constraint="uppercase"]'),
      number: passwordConstraintsList.querySelector('[data-constraint="number"]'),
      symbol: passwordConstraintsList.querySelector('[data-constraint="symbol"]'),
    };

    const validations = {
      length: value.length >= 8,
      lowercase: /[a-z]/.test(value),
      uppercase: /[A-Z]/.test(value),
      number: /[0-9]/.test(value),
      symbol: /[^A-Za-z0-9]/.test(value),
    };

    let allValid = true;
    for (const key in validations) {
      if (constraints[key]) {
        constraints[key].classList.toggle('valid', validations[key]);
      }
      if (!validations[key]) {
        allValid = false;
      }
    }
    return allValid;
  };

  if (registerPasswordInput) {
    registerPasswordInput.addEventListener('focus', () => {
      if (passwordConstraintsList) passwordConstraintsList.style.display = 'block';
    });
    registerPasswordInput.addEventListener('input', validatePassword);
  }

  // --- API Communication ---
  const apiRequest = async (endpoint, options = {}) => {
    const { body, method = 'POST', requiresAuth = false } = options;
    
    const headers = { 'Content-Type': 'application/json' };
    if (requiresAuth) {
      // The backend now uses HttpOnly cookies, so no Authorization header is needed.
      // The browser will send the cookie automatically.
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Necessary for sending/receiving cookies
      });

      const data = await response.json();

      if (!response.ok) {
        // Use detailed error messages from backend if available
        const errorMessage = data.errors ? data.errors.map(e => e.msg).join(', ') : (data.message || `Error ${response.status}`);
        throw new Error(errorMessage);
      }
      return data;
    } catch (error) {
      console.error(`API request to ${endpoint} failed:`, error);
      throw error;
    }
  };

  // --- UI Updates ---
  const showMessage = (message, type = 'error') => {
    authResponse.textContent = message;
    authResponse.className = `auth-response ${type}`;
    authResponse.style.display = 'block';
    setTimeout(() => {
      authResponse.style.display = 'none';
    }, 5000);
  };

  const setButtonLoading = (button, isLoading) => {
    const buttonText = button.querySelector('.button-text');
    const spinner = button.querySelector('.spinner');
    if (isLoading) {
      button.disabled = true;
      buttonText.style.display = 'none';
      spinner.style.display = 'inline-block';
    } else {
      button.disabled = false;
      buttonText.style.display = 'inline-block';
      spinner.style.display = 'none';
    }
  };

  const togglePasswordVisibility = (event) => {
    const icon = event.currentTarget.querySelector('i');
    const input = event.currentTarget.previousElementSibling;
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  };

  const updateView = () => {
    if (isLoginView) {
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      authTitle.textContent = 'Iniciar Sesión';
      authSubtitle.innerHTML = '¿No tienes una cuenta? <a href="#" id="toggle-link">Regístrate</a>';
    } else {
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      authTitle.textContent = 'Crear Cuenta';
      authSubtitle.innerHTML = '¿Ya tienes una cuenta? <a href="#" id="toggle-link">Inicia Sesión</a>';
    }
    // Re-bind the toggle link since innerHTML removes the old one
    document.getElementById('toggle-link').addEventListener('click', handleToggleView);
  };

  const showLoggedInState = (user) => {
    authForms.style.display = 'none';
    sessionInfo.style.display = 'block';

    userDetails.innerHTML = `
      <p><strong>ID:</strong> ${user.id}</p>
      <p><strong>Username:</strong> ${user.username}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Role:</strong> ${user.role}</p>
    `;

    if (user.role === 'admin') {
      adminActions.style.display = 'block';
    }
  };

  const showLoggedOutState = () => {
    authForms.style.display = 'block';
    sessionInfo.style.display = 'none';
    adminActions.style.display = 'none';
    isLoginView = true;
    updateView();
  };

  // --- Event Handlers ---
  const handleToggleView = (e) => {
    e.preventDefault();
    isLoginView = !isLoginView;
    updateView();
  };

  const handleLoginFormSubmit = async (e) => {
    e.preventDefault();
    const button = e.target.querySelector('button[type="submit"]');
    setButtonLoading(button, true);

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const { user } = await apiRequest('/auth/login', { body: { email, password } });
      showMessage('Inicio de sesión exitoso.', 'success');
      showLoggedInState(user);
    } catch (error) {
      showMessage(error.message);
    } finally {
      setButtonLoading(button, false);
    }
  };

  const handleRegisterFormSubmit = async (e) => {
    e.preventDefault();
    const button = e.target.querySelector('button[type="submit"]');
    setButtonLoading(button, true);

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
      const { user } = await apiRequest('/auth/register', { body: { username, email, password } });
      showMessage('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
      isLoginView = true;
      updateView();
      loginForm.reset();
      registerForm.reset();
    } catch (error) {
      showMessage(error.message);
    } finally {
      setButtonLoading(button, false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { requiresAuth: true });
      showMessage('Sesión cerrada exitosamente.', 'success');
    } catch (error) {
      // Even if logout fails on the server, clear the client state
      console.error('Logout failed:', error.message);
    } finally {
      showLoggedOutState();
    }
  };

  const handleRefreshToken = async () => {
    const button = refreshTokenButton;
    setButtonLoading(button, true);
    try {
      const { user } = await apiRequest('/auth/refresh', { requiresAuth: true });
      showMessage('Token refrescado exitosamente.', 'success');
      showLoggedInState(user); // Re-render with potentially updated info
    } catch (error) {
      showMessage(error.message);
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showLoggedOutState();
      }
    } finally {
      setButtonLoading(button, false);
    }
  };

  const handleGetUsers = async () => {
    const button = getUsersButton;
    setButtonLoading(button, true);
    try {
      const data = await apiRequest('/admin/users', { method: 'GET', requiresAuth: true });
      // Displaying the raw JSON in the user details section for simplicity
      userDetails.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      showMessage('Usuarios obtenidos.', 'success');
    } catch (error) {
      showMessage(error.message);
    } finally {
      setButtonLoading(button, false);
    }
  };
  
  const checkInitialSession = async () => {
      try {
        // A "refresh" endpoint is perfect for checking an existing session
        const { user } = await apiRequest('/auth/refresh', { requiresAuth: true });
        showLoggedInState(user);
      } catch (error) {
        // If it fails, it just means there's no active session.
        showLoggedOutState();
      }
  };

  // --- Initialization ---
  const init = () => {
    // Bind main forms
    loginForm.addEventListener('submit', handleLoginFormSubmit);
    registerForm.addEventListener('submit', handleRegisterFormSubmit);
    toggleLink.addEventListener('click', handleToggleView);

    // Bind session actions
    logoutButton.addEventListener('click', handleLogout);
    refreshTokenButton.addEventListener('click', handleRefreshToken);
    getUsersButton.addEventListener('click', handleGetUsers);

    // Bind all password toggles
    document.querySelectorAll('.password-toggle').forEach(toggle => {
      toggle.addEventListener('click', togglePasswordVisibility);
    });
    
    // Check for an active session on page load
    checkInitialSession();
  };

  init();
});
