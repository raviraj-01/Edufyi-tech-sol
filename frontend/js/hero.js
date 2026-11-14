// Hero video playback and 3D tilt module

export function initHero() {
  const container = document.getElementById("hero-media-container");
  const introVideo = document.getElementById("hero-intro");
  const loopVideo = document.getElementById("hero-loop");
  const posterImg = document.getElementById("hero-poster");
  const placeholder = document.querySelector(".hero-placeholder-card");

  if (!container) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);

  function showFallback() {
    if (introVideo) introVideo.style.display = "none";
    if (loopVideo) loopVideo.style.display = "none";
    if (posterImg && posterImg.complete && posterImg.naturalWidth > 0) {
      posterImg.style.display = "block";
      if (placeholder) placeholder.style.display = "none";
    } else if (placeholder) {
      placeholder.style.display = "block";
    }
  }

  // Skip video for reduced motion or data saver
  if (prefersReduced || saveData) {
    showFallback();
    return;
  }

  let videoAvailable = true;

  function handleError() {
    videoAvailable = false;
    showFallback();
  }

  if (introVideo) introVideo.addEventListener("error", handleError);
  if (loopVideo) loopVideo.addEventListener("error", handleError);

  if (introVideo && loopVideo) {
    // Intro video ended -> crossfade to loop
    introVideo.addEventListener("ended", () => {
      if (!videoAvailable) return;
      introVideo.classList.remove("active");
      loopVideo.classList.add("active");
      loopVideo.play().catch(handleError);
    });

    // Start playing intro video
    const playPromise = introVideo.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          introVideo.classList.add("active");
          if (placeholder) placeholder.style.display = "none";
        })
        .catch(() => {
          handleError();
        });
    }

    // Pause loop video when hero is off-screen
    const heroSection = document.getElementById("hero");
    if (heroSection && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && !loopVideo.paused) {
            loopVideo.pause();
          } else if (entry.isIntersecting && loopVideo.classList.contains("active")) {
            loopVideo.play().catch(() => {});
          }
        });
      });
      observer.observe(heroSection);
    }
  } else {
    showFallback();
  }

  // Mouse tilt
  initHeroTilt(container, prefersReduced);
}

// Subtle 3D tilt tracking mouse
function initHeroTilt(container, prefersReduced) {
  if (prefersReduced) return;
  const hero = document.getElementById("hero");
  if (!hero) return;

  // Disable on touch devices
  if (window.matchMedia("(pointer: coarse)").matches) return;

  let rafId = null;
  const maxMove = 12; // px
  const maxRotate = 4; // deg

  hero.addEventListener("pointermove", (e) => {
    const rect = hero.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const moveX = normX * maxMove;
      const moveY = normY * maxMove;
      const rotY = normX * maxRotate;
      const rotX = -normY * maxRotate;

      container.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
  });

  hero.addEventListener("pointerleave", () => {
    if (rafId) cancelAnimationFrame(rafId);
    container.style.transform = "translate(-50%, -50%)";
  });
}
