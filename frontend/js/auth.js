// Auth management, state, and modal controller
import { request, ApiError } from "./api.js";

let currentUser = null;
let lastFocusedElement = null;

export function getCurrentUser() {
  return currentUser;
}

export async function initAuth() {
  const authTrigger = document.getElementById("btn-auth-trigger");
  const modalBackdrop = document.getElementById("auth-modal");
  const closeBtn = document.getElementById("auth-modal-close");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");

  // Initial session check
  await checkMe();

  function openModal(mode = "login") {
    lastFocusedElement = document.activeElement;
    setMode(mode);
    clearErrors();
    modalBackdrop.classList.add("open");
    modalBackdrop.setAttribute("aria-hidden", "false");

    // Move focus to first input
    const firstInput = (mode === "login" ? loginForm : registerForm).querySelector("input");
    if (firstInput) firstInput.focus();
  }

  window.openAuthModal = openModal;

  function closeModal() {
    modalBackdrop.classList.remove("open");
    modalBackdrop.setAttribute("aria-hidden", "true");
    clearErrors();
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function setMode(mode) {
    if (mode === "login") {
      tabLogin.classList.add("active");
      tabRegister.classList.remove("active");
      loginForm.style.display = "block";
      registerForm.style.display = "none";
    } else {
      tabRegister.classList.add("active");
      tabLogin.classList.remove("active");
      registerForm.style.display = "block";
      loginForm.style.display = "none";
    }
  }

  function clearErrors() {
    document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
    document.querySelectorAll("[aria-invalid='true']").forEach((el) => el.removeAttribute("aria-invalid"));
    const genErrors = document.querySelectorAll(".form-general-error");
    genErrors.forEach((el) => {
      el.textContent = "";
      el.classList.remove("show");
    });
  }

  function showServerError(form, err) {
    clearErrors();
    if (err.field) {
      const input = form.querySelector(`[name="${err.field}"]`);
      const errorEl = form.querySelector(`[data-error-for="${err.field}"]`);
      if (input) input.setAttribute("aria-invalid", "true");
      if (errorEl) errorEl.textContent = err.message;
    } else {
      const genEl = form.querySelector(".form-general-error");
      if (genEl) {
        genEl.textContent = err.message;
        genEl.classList.add("show");
      }
    }
  }

  // Modal triggers
  if (authTrigger) {
    authTrigger.addEventListener("click", () => {
      if (!currentUser) {
        openModal("login");
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalBackdrop && modalBackdrop.classList.contains("open")) {
      closeModal();
    }
  });

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener("click", () => setMode("login"));
    tabRegister.addEventListener("click", () => setMode("register"));
  }

  // Login submission
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = loginForm.querySelector("button[type='submit']");
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;

      try {
        submitBtn.disabled = true;
        const res = await request("/api/auth/login", {
          method: "POST",
          body: { email, password },
        });
        currentUser = res.user;
        updateNavUser(currentUser);
        closeModal();
      } catch (err) {
        showServerError(loginForm, err);
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // Register submission
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = registerForm.querySelector("button[type='submit']");
      const name = registerForm.name.value.trim();
      const email = registerForm.email.value.trim();
      const password = registerForm.password.value;

      try {
        submitBtn.disabled = true;
        const res = await request("/api/auth/register", {
          method: "POST",
          body: { name, email, password },
        });
        currentUser = res.user;
        updateNavUser(currentUser);
        closeModal();
      } catch (err) {
        showServerError(registerForm, err);
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // Expose openAuthModal for other modules (e.g. Get Started button)
  window.openAuthModal = openModal;
}

export async function checkMe() {
  try {
    const res = await request("/api/auth/me");
    currentUser = res && res.user ? res.user : null;
    updateNavUser(currentUser);
  } catch {
    currentUser = null;
    updateNavUser(null);
  }
}

export async function logout() {
  try {
    await request("/api/auth/logout", { method: "POST" });
  } finally {
    currentUser = null;
    updateNavUser(null);
    window.location.reload();
  }
}

function updateNavUser(user) {
  const container = document.querySelector(".nav-actions");
  if (!container) return;

  if (user) {
    container.innerHTML = `
      <div class="user-menu-wrapper">
        <button type="button" class="btn-user-menu" id="btn-user-menu-trigger" aria-haspopup="true" aria-expanded="false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span id="user-display-name"></span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <ul class="user-dropdown glass" id="user-dropdown-menu" role="menu">
          <li role="none"><a href="/dashboard.html" role="menuitem">Dashboard</a></li>
          <li role="none"><button type="button" id="btn-logout" role="menuitem">Log Out</button></li>
        </ul>
      </div>
      <button type="button" class="nav-hamburger" aria-label="Toggle navigation menu" aria-expanded="false">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    `;

    // Safe textContent assignment per security guidelines
    const nameSpan = document.getElementById("user-display-name");
    if (nameSpan) {
      nameSpan.textContent = user.name.split(" ")[0];
    }

    const trigger = document.getElementById("btn-user-menu-trigger");
    const menu = document.getElementById("user-dropdown-menu");
    const logoutBtn = document.getElementById("btn-logout");

    if (trigger && menu) {
      trigger.addEventListener("click", () => {
        const open = menu.classList.toggle("show");
        trigger.setAttribute("aria-expanded", String(open));
      });

      document.addEventListener("click", (e) => {
        if (!trigger.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.remove("show");
          trigger.setAttribute("aria-expanded", "false");
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", logout);
    }
  } else {
    container.innerHTML = `
      <button type="button" class="btn-nav-auth" id="btn-auth-trigger">Login / Register</button>
      <button type="button" class="nav-hamburger" aria-label="Toggle navigation menu" aria-expanded="false">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    `;
    const authBtn = document.getElementById("btn-auth-trigger");
    if (authBtn) {
      authBtn.addEventListener("click", () => {
        if (window.openAuthModal) window.openAuthModal("login");
      });
    }
  }
}
