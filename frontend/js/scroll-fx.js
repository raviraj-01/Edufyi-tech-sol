// Scroll effects: nav shadow and fade-up reveal
// Uses IntersectionObserver (supported in all modern browsers)

// ---- Nav scroll shadow ----
// Adds a "scrolled" class to the header when the user scrolls past 60px.
// CSS in scroll-fx.css uses that class to show a shadow under the nav.
function initNavScroll() {
  const header = document.getElementById("site-header");
  if (!header) return;

  let pending = false;
  function check() {
    if (window.scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    pending = false;
  }

  window.addEventListener("scroll", () => {
    if (!pending) {
      pending = true;
      requestAnimationFrame(check);
    }
  }, { passive: true });
}

// ---- Fade-up reveal ----
// Watches each .reveal-on-scroll element. When it enters the viewport
// the observer adds the "revealed" class which triggers the CSS transition.
function initReveal() {
  const els = document.querySelectorAll(".reveal-on-scroll");
  if (!els.length || !("IntersectionObserver" in window)) {
    // Fallback: make everything visible immediately
    els.forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; });
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          obs.unobserve(entry.target); // only trigger once
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => obs.observe(el));
}

// ---- Entry point ----
export function initScrollFx() {
  // Skip animations if the user has enabled "reduce motion" in their OS settings
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
      el.classList.add("revealed");
    });
    return;
  }

  initNavScroll();
  initReveal();
}
