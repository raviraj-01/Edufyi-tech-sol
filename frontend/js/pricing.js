// Pricing plans loader from /api/plans
import { request } from "./api.js";

export async function initPricing() {
  const container = document.getElementById("pricing-cards-container");
  if (!container) return;

  try {
    const data = await request("/api/plans");
    if (data && data.plans && data.plans.length > 0) {
      renderPlans(container, data.plans);
    }
  } catch {
    // Keep fallback cards already present in HTML
  }
}

function renderPlans(container, plans) {
  container.innerHTML = "";
  plans.forEach((plan) => {
    const card = document.createElement("div");
    card.className = `pricing-card glass ${plan.highlighted ? "highlighted" : ""}`;

    const badgeHtml = plan.highlighted
      ? `<span class="plan-badge">Most Popular</span>`
      : "";

    const featuresList = plan.features
      .map(
        (f) => `
        <li class="plan-feature-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>${escapeHtml(f)}</span>
        </li>`
      )
      .join("");

    card.innerHTML = `
      ${badgeHtml}
      <h3 class="plan-name">${escapeHtml(plan.name)}</h3>
      <p class="plan-blurb">${escapeHtml(plan.blurb || "")}</p>
      <div class="plan-price-box">
        <span class="plan-price">$${plan.price_monthly}</span>
        <span class="plan-period">/ month</span>
      </div>
      <ul class="plan-features">
        ${featuresList}
      </ul>
      <button type="button" class="${plan.highlighted ? "btn-primary" : "btn-secondary"}" style="width: 100%;" onclick="document.getElementById('btn-get-started')?.click()">
        <span>Choose ${escapeHtml(plan.name)}</span>
      </button>
    `;

    container.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
