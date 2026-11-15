import { initNav } from "./nav.js";
import { initStats } from "./stats.js";
import { initHero } from "./hero.js";
import { initAuth } from "./auth.js";
import { initForms } from "./forms.js";
import { initPricing } from "./pricing.js";
import { initReveal } from "./reveal.js";
import { initScrollFx } from "./scroll-fx.js";

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initStats();
  initHero();
  initAuth();
  initForms();
  initPricing();
  initReveal();
  initScrollFx();
});
