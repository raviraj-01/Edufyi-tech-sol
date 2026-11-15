// Hero video playback module
// Plays an intro video once, then crossfades to a looping video.
// Falls back to a still image if video fails or the user prefers reduced motion.

export function initHero() {
  const container = document.getElementById("hero-media-container");
  const introVideo = document.getElementById("hero-intro");
  const loopVideo = document.getElementById("hero-loop");
  const posterImg = document.getElementById("hero-poster");
  const stillImg = document.getElementById("hero-still");
  const placeholder = document.querySelector(".hero-placeholder-card");

  if (!container) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);

  // Show a static image instead of video
  function showFallback() {
    if (introVideo) introVideo.style.display = "none";
    if (loopVideo) loopVideo.style.display = "none";
    if (stillImg) {
      stillImg.classList.add("active");
      if (placeholder) placeholder.style.display = "none";
    } else if (posterImg && posterImg.complete && posterImg.naturalWidth > 0) {
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
    // When the intro finishes, switch to the looping video
    introVideo.addEventListener("ended", () => {
      if (!videoAvailable) return;
      introVideo.classList.remove("active");
      loopVideo.classList.add("active");
      loopVideo.play().catch(handleError);
    });

    // Start the intro
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

    // Pause the loop video when the hero is scrolled off screen (saves resources)
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
}
