// Stats animation and API loader module

export function initStats() {
  const card = document.querySelector(".stats-card");
  if (!card) return;

  const successEl = card.querySelector("[data-stat='success_rate']");
  const failureEl = card.querySelector("[data-stat='failure_rate']");
  const scoreEl = card.querySelector("[data-stat='launch_score']");
  const growthEl = card.querySelector("[data-stat='growth_pct']");
  const ringFill = card.querySelector(".ring-fill");

  // Default targets from HTML
  let targets = {
    success_rate: parseFloat(successEl?.textContent) || 83,
    failure_rate: parseFloat(failureEl?.textContent) || 17,
    launch_score: parseFloat(scoreEl?.textContent) || 86,
    growth_pct: parseFloat(growthEl?.textContent) || 4.52,
  };

  const RADIUS = 42;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // 263.89

  let animated = false;

  async function fetchLiveStats() {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) return; // Keep defaults on error
      const data = await res.json();
      const stats = data.launching_startups;
      if (stats) {
        targets.success_rate = stats.success_rate ?? targets.success_rate;
        targets.failure_rate = stats.failure_rate ?? targets.failure_rate;
        targets.launch_score = stats.launch_score ?? targets.launch_score;
        targets.growth_pct = stats.growth_pct ?? targets.growth_pct;
      }
    } catch {
      // Offline fallback: defaults stay intact
    }
  }

  function countUp(el, target, decimals = 0, suffix = "") {
    if (!el) return;
    const duration = 1200;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      // Cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = ease * target;
      el.textContent = current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }
    requestAnimationFrame(frame);
  }

  function triggerAnimation() {
    if (animated) return;
    animated = true;

    // Numbers count-up
    countUp(successEl, targets.success_rate, 0, "%");
    countUp(failureEl, targets.failure_rate, 0, "%");
    countUp(scoreEl, targets.launch_score, 0);
    countUp(growthEl, targets.growth_pct, 2, "%");

    // Animate SVG ring
    if (ringFill) {
      const offset = CIRCUMFERENCE * (1 - targets.launch_score / 100);
      ringFill.style.strokeDashoffset = String(offset);
    }
  }

  // Fetch data in background
  fetchLiveStats().then(() => {
    // If already in view, re-trigger with fresh data
    if (animated) {
      animated = false;
      triggerAnimation();
    }
  });

  // Start animation when card is scrolled into view
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerAnimation();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(card);
  } else {
    triggerAnimation();
  }
}
