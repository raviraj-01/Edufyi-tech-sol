// Navigation and scroll spy module

export function initNav() {
  const trigger = document.querySelector(".dropdown-trigger");
  const menu = document.querySelector(".dropdown-menu");
  const hamburger = document.querySelector(".nav-hamburger");
  const navPill = document.querySelector(".nav-pill");
  const navLinks = document.querySelectorAll(".nav-link[href^='#']");

  // Dropdown toggle with keyboard and click
  if (trigger && menu) {
    function toggleDropdown(open) {
      const willOpen = open !== undefined ? open : !menu.classList.contains("show");
      menu.classList.toggle("show", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    }

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      toggleDropdown();
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("show")) {
        toggleDropdown(false);
        trigger.focus();
      }
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!trigger.contains(e.target) && !menu.contains(e.target)) {
        toggleDropdown(false);
      }
    });
  }

  // Hamburger menu for mobile
  if (hamburger && navPill) {
    hamburger.addEventListener("click", () => {
      const isOpen = navPill.classList.toggle("mobile-open");
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });

    // Close mobile menu when clicking any nav link
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navPill.classList.remove("mobile-open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Scroll spy with IntersectionObserver
  const sections = document.querySelectorAll("section[id]");
  if (sections.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              const active = link.getAttribute("href") === `#${id}`;
              link.classList.toggle("active", active);
            });
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    sections.forEach((s) => observer.observe(s));
  }
}
