// Premium scroll animation engine
// Runs on scroll and resize, respects prefers-reduced-motion

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- Utilities ----

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// Returns 0..1 progress of el through viewport (0=just entered bottom, 1=just left top)
function scrollProgress(el) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return clamp(1 - rect.bottom / (vh + rect.height), 0, 1);
}

// Returns 0..1 representing how far el has entered the viewport
function enterProgress(el, offset = 0.15) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const entered = vh - rect.top - offset * rect.height;
  return clamp(entered / (rect.height * (1 - offset)), 0, 1);
}

// Lerp
function lerp(a, b, t) { return a + (b - a) * t; }

// ---- 1. Staggered card reveal with slide variants ----
function initStaggerReveal() {
  const groups = document.querySelectorAll("[data-stagger]");

  if (!("IntersectionObserver" in window)) {
    groups.forEach((g) => {
      g.querySelectorAll("[data-stagger-item]").forEach((el) => {
        el.style.opacity = 1;
        el.style.transform = "none";
      });
    });
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const items = entry.target.querySelectorAll("[data-stagger-item]");
        const delay = Number(entry.target.dataset.staggerDelay || 80);
        items.forEach((el, i) => {
          setTimeout(() => {
            el.classList.add("stagger-visible");
          }, i * delay);
        });
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );

  groups.forEach((g) => obs.observe(g));
}

// ---- 2. Parallax backgrounds ----
function initParallax() {
  const els = document.querySelectorAll("[data-parallax]");
  if (!els.length) return;

  function tick() {
    els.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax || 0.3);
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
      el.style.transform = `translateY(${offset.toFixed(2)}px)`;
    });
    rafPending = false;
  }

  let rafPending = false;
  window.addEventListener("scroll", () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(tick);
    }
  }, { passive: true });

  tick();
}

// ---- 3. Scroll-driven number counters ----
function initScrollCounters() {
  const els = document.querySelectorAll("[data-scroll-count]");
  if (!els.length || !("IntersectionObserver" in window)) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const el = entry.target;
        const target = parseFloat(el.dataset.scrollCount);
        const decimals = (el.dataset.scrollCountDecimals | 0) || 0;
        const suffix = el.dataset.scrollCountSuffix || "";
        const duration = 1400;
        const start = performance.now();
        function step(now) {
          const p = clamp((now - start) / duration, 0, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.6 }
  );

  els.forEach((el) => obs.observe(el));
}

// ---- 4. Section divider glowing line animate-in ----
function initDividers() {
  const els = document.querySelectorAll(".section-divider-line");
  if (!els.length || !("IntersectionObserver" in window)) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("divider-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  els.forEach((el) => obs.observe(el));
}

// ---- 5. Gradient text shimmer on scroll ----
function initShimmer() {
  const els = document.querySelectorAll("[data-shimmer]");
  if (!els.length) return;

  let rafPending = false;
  function tick() {
    const scrollY = window.scrollY;
    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const pct = clamp(1 - (rect.top / window.innerHeight), 0, 1);
      const angle = lerp(170, 220, pct);
      el.style.backgroundImage =
        `linear-gradient(${angle}deg, var(--text) 20%, var(--lime) 50%, var(--accent) 70%, var(--text) 90%)`;
      el.style.backgroundSize = "200% auto";
      el.style.webkitBackgroundClip = "text";
      el.style.backgroundClip = "text";
      el.style.webkitTextFillColor = "transparent";
      el.style.backgroundPosition = `${pct * 100}% center`;
    });
    rafPending = false;
  }

  window.addEventListener("scroll", () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(tick);
    }
  }, { passive: true });

  tick();
}

// ---- 6. Floating ambient orbs that drift on scroll ----
function initOrbs() {
  const orbs = document.querySelectorAll(".scroll-orb");
  if (!orbs.length) return;

  let rafPending = false;
  function tick() {
    const sy = window.scrollY;
    orbs.forEach((orb) => {
      const speed = parseFloat(orb.dataset.orbSpeed || 0.12);
      const drift = parseFloat(orb.dataset.orbDrift || 0.04);
      const y = -sy * speed;
      const x = Math.sin(sy * 0.001) * 30 * drift;
      orb.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    });
    rafPending = false;
  }

  window.addEventListener("scroll", () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(tick);
    }
  }, { passive: true });
}

// ---- 7. Progress bar at top of page ----
function initScrollProgressBar() {
  const bar = document.getElementById("scroll-progress-bar");
  if (!bar) return;

  let rafPending = false;
  function tick() {
    const scrollTop = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (scrollTop / docH) * 100 : 0;
    bar.style.width = pct.toFixed(2) + "%";
    rafPending = false;
  }

  window.addEventListener("scroll", () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(tick);
    }
  }, { passive: true });
}

// ---- 8. Magnetic hover on CTA buttons ----
function initMagneticButtons() {
  const btns = document.querySelectorAll("[data-magnetic]");
  if (!btns.length || window.matchMedia("(pointer: coarse)").matches) return;

  btns.forEach((btn) => {
    const strength = parseFloat(btn.dataset.magnetic || 0.4);

    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      btn.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

// ---- 9. Skew section on fast scroll ----
function initScrollSkew() {
  const sections = document.querySelectorAll("[data-scroll-skew]");
  if (!sections.length) return;

  let lastScrollY = window.scrollY;
  let velocity = 0;
  let rafId = null;

  function update() {
    const sy = window.scrollY;
    velocity = sy - lastScrollY;
    lastScrollY = sy;
    const skew = clamp(velocity * -0.04, -2, 2);
    sections.forEach((el) => {
      el.style.transform = `skewY(${skew.toFixed(3)}deg)`;
    });
    velocity *= 0.85;
    if (Math.abs(velocity) < 0.01) {
      sections.forEach((el) => { el.style.transform = ""; });
      rafId = null;
    } else {
      rafId = requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", () => {
    if (!rafId) rafId = requestAnimationFrame(update);
  }, { passive: true });
}

// ---- 10. Nav scroll-shrink ----
function initNavScroll() {
  const header = document.getElementById("site-header");
  if (!header) return;

  let rafPending = false;
  function tick() {
    if (window.scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    rafPending = false;
  }

  window.addEventListener("scroll", () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(tick);
    }
  }, { passive: true });
}

// ---- 11. Section eyebrow animate-in ----
function initEyebrowAnimate() {
  const els = document.querySelectorAll(".section-eyebrow-animate");
  if (!els.length || !("IntersectionObserver" in window)) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  els.forEach((el) => obs.observe(el));
}

// ---- Init ----
export function initScrollFx() {
  if (reduced) {
    // For reduced motion: just ensure stagger items are visible
    document.querySelectorAll("[data-stagger-item]").forEach((el) => {
      el.classList.add("stagger-visible");
    });
    return;
  }

  initStaggerReveal();
  initParallax();
  initScrollCounters();
  initDividers();
  initShimmer();
  initOrbs();
  initScrollProgressBar();
  initMagneticButtons();
  initScrollSkew();
  initNavScroll();
  initEyebrowAnimate();
}
