// Forms module: application modal and contact form submission
import { request, ApiError } from "./api.js";
import { getCurrentUser } from "./auth.js";

export function initForms() {
  const getStartedBtn = document.getElementById("btn-get-started");
  const appModal = document.getElementById("application-modal");
  const appCloseBtn = document.getElementById("application-modal-close");
  const appForm = document.getElementById("application-form");
  const appSuccessMsg = document.getElementById("application-success-msg");

  const contactForm = document.getElementById("contact-form");
  const contactSuccessMsg = document.getElementById("contact-success-msg");

  let lastFocused = null;

  function openAppModal() {
    const user = getCurrentUser();
    if (!user) {
      if (window.openAuthModal) {
        window.openAuthModal("login");
      }
      return;
    }

    lastFocused = document.activeElement;
    clearFormErrors(appForm);
    if (appSuccessMsg) appSuccessMsg.style.display = "none";
    if (appForm) appForm.style.display = "block";
    appModal.classList.add("open");
    appModal.setAttribute("aria-hidden", "false");

    const firstInput = appForm.querySelector("input, select, textarea");
    if (firstInput) firstInput.focus();
  }

  function closeAppModal() {
    if (!appModal) return;
    appModal.classList.remove("open");
    appModal.setAttribute("aria-hidden", "true");
    clearFormErrors(appForm);
    if (lastFocused) lastFocused.focus();
  }

  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", openAppModal);
  }

  window.openAppModal = openAppModal;

  // Auto-open application modal if linked from dashboard or CTA URL
  if (window.location.search.includes("apply=true") || window.location.hash === "#apply" || window.location.hash === "#application-form") {
    setTimeout(openAppModal, 350);
  }

  if (appCloseBtn) {
    appCloseBtn.addEventListener("click", closeAppModal);
  }

  if (appModal) {
    appModal.addEventListener("click", (e) => {
      if (e.target === appModal) closeAppModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && appModal && appModal.classList.contains("open")) {
      closeAppModal();
    }
  });

  // Client validation functions
  function validateAppForm(data) {
    const errors = {};
    if (!data.startup_name || data.startup_name.length < 2 || data.startup_name.length > 80) {
      errors.startup_name = "Startup name must be between 2 and 80 characters";
    }
    if (data.website_url && !data.website_url.startsWith("http://") && !data.website_url.startsWith("https://")) {
      errors.website_url = "Website URL must start with http:// or https://";
    }
    const ask = parseInt(data.funding_ask, 10);
    if (isNaN(ask) || ask < 1000 || ask > 5000000) {
      errors.funding_ask = "Funding ask must be between $1,000 and $5,000,000";
    }
    if (!data.pitch || data.pitch.length < 30 || data.pitch.length > 1000) {
      errors.pitch = "Pitch must be between 30 and 1000 characters";
    }
    return errors;
  }

  function validateContactForm(data) {
    const errors = {};
    if (!data.name || data.name.length < 2 || data.name.length > 60) {
      errors.name = "Name must be between 2 and 60 characters";
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!data.message || data.message.length < 10 || data.message.length > 1000) {
      errors.message = "Message must be between 10 and 1000 characters";
    }
    return errors;
  }

  function clearFormErrors(form) {
    if (!form) return;
    form.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
    form.querySelectorAll("[aria-invalid='true']").forEach((el) => el.removeAttribute("aria-invalid"));
    const gen = form.querySelector(".form-general-error");
    if (gen) {
      gen.textContent = "";
      gen.classList.remove("show");
    }
  }

  function showErrors(form, errors, generalMsg = null) {
    clearFormErrors(form);
    for (const [field, msg] of Object.entries(errors)) {
      const input = form.querySelector(`[name="${field}"]`);
      const errEl = form.querySelector(`[data-error-for="${field}"]`);
      if (input) input.setAttribute("aria-invalid", "true");
      if (errEl) errEl.textContent = msg;
    }
    if (generalMsg) {
      const gen = form.querySelector(".form-general-error");
      if (gen) {
        gen.textContent = generalMsg;
        gen.classList.add("show");
      }
    }
  }

  // Application Form Submit
  if (appForm) {
    appForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = appForm.querySelector("button[type='submit']");
      const formData = {
        startup_name: appForm.startup_name.value.trim(),
        website_url: appForm.website_url.value.trim(),
        industry: appForm.industry.value,
        stage: appForm.stage.value,
        funding_ask: appForm.funding_ask.value.trim(),
        pitch: appForm.pitch.value.trim(),
      };

      const clientErrors = validateAppForm(formData);
      if (Object.keys(clientErrors).length > 0) {
        showErrors(appForm, clientErrors);
        return;
      }

      try {
        submitBtn.disabled = true;
        await request("/api/applications", {
          method: "POST",
          body: formData,
        });
        appForm.style.display = "none";
        if (appSuccessMsg) {
          appSuccessMsg.style.display = "block";
        }
        appForm.reset();
      } catch (err) {
        if (err.field) {
          showErrors(appForm, { [err.field]: err.message });
        } else {
          showErrors(appForm, {}, err.message);
        }
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // Contact Form Submit
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector("button[type='submit']");
      const formData = {
        name: contactForm.name.value.trim(),
        email: contactForm.email.value.trim(),
        topic: contactForm.topic.value,
        message: contactForm.message.value.trim(),
        website_confirm: contactForm.website_confirm ? contactForm.website_confirm.value : "",
      };

      const clientErrors = validateContactForm(formData);
      if (Object.keys(clientErrors).length > 0) {
        showErrors(contactForm, clientErrors);
        return;
      }

      try {
        submitBtn.disabled = true;
        await request("/api/contact", {
          method: "POST",
          body: formData,
        });
        contactForm.reset();
        clearFormErrors(contactForm);
        if (contactSuccessMsg) {
          contactSuccessMsg.style.display = "block";
          setTimeout(() => {
            contactSuccessMsg.style.display = "none";
          }, 6000);
        }
      } catch (err) {
        if (err.field) {
          showErrors(contactForm, { [err.field]: err.message });
        } else {
          showErrors(contactForm, {}, err.message);
        }
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
}
