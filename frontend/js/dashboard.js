import { request } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  let user = null;

  // Verify auth
  try {
    const authRes = await request("/api/auth/me");
    if (!authRes || !authRes.user) {
      window.location.href = "/";
      return;
    }
    user = authRes.user;
  } catch {
    window.location.href = "/";
    return;
  }

  // Populate user header
  const userNameEl = document.getElementById("dash-user-name");
  if (userNameEl) userNameEl.textContent = user.name;

  // Logout button
  const logoutBtn = document.getElementById("dash-btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await request("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    });
  }

  // Load founder applications
  await loadFounderApplications();

  // If admin, load admin view
  if (user.role === "admin") {
    const adminSection = document.getElementById("admin-section");
    if (adminSection) {
      adminSection.style.display = "block";
      await loadAdminApplications();
    }
  }
});

async function loadFounderApplications() {
  const container = document.getElementById("applications-container");
  if (!container) return;

  try {
    const res = await request("/api/applications/mine");
    const apps = res.applications || [];

    if (apps.length === 0) {
      container.innerHTML = `
        <div class="empty-state glass">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <h3>No applications submitted yet</h3>
          <p>You haven't submitted any startup applications for review. Get started by applying for evaluation.</p>
          <a href="/?apply=true" class="btn-primary" style="margin-top: 12px;">Apply for Funding</a>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    apps.forEach((app) => {
      const card = document.createElement("div");
      card.className = "application-card glass";

      const historyHtml = (app.history || [])
        .map((h) => {
          const dateStr = h.at ? new Date(h.at).toLocaleDateString() : "";
          return `
            <li class="timeline-item">
              <strong>${escapeHtml(h.status.replace("_", " "))}</strong>: ${escapeHtml(h.note || "No notes")}
              <span class="timeline-time">${dateStr}</span>
            </li>
          `;
        })
        .join("");

      card.innerHTML = `
        <div class="app-card-header">
          <div class="app-main-info">
            <h2>${escapeHtml(app.startup_name)}</h2>
            <div class="app-meta-tags">
              <span class="meta-chip">${escapeHtml(app.industry)}</span>
              <span class="meta-chip">${escapeHtml(app.stage)}</span>
              <span class="meta-chip">$${parseInt(app.funding_ask, 10).toLocaleString()} USD</span>
              ${app.website_url ? `<a href="${escapeHtml(app.website_url)}" target="_blank" rel="noopener noreferrer" class="meta-chip">Website ↗</a>` : ""}
            </div>
          </div>
          <span class="status-badge ${escapeHtml(app.status)}">${escapeHtml(app.status.replace("_", " "))}</span>
        </div>

        <div class="app-pitch-box">
          <h4>Elevator Pitch</h4>
          <p>${escapeHtml(app.pitch)}</p>
        </div>

        <div class="app-timeline-box">
          <div class="timeline-title">Review Milestones</div>
          <ul class="timeline-list">
            ${historyHtml}
          </ul>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p style="color: var(--danger);">Failed to load applications: ${escapeHtml(err.message)}</p>`;
  }
}

async function loadAdminApplications() {
  const tableBody = document.getElementById("admin-table-body");
  if (!tableBody) return;

  try {
    const res = await request("/api/admin/applications");
    const apps = res.applications || [];

    tableBody.innerHTML = "";
    apps.forEach((app) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHtml(app.startup_name)}</strong></td>
        <td>${escapeHtml(app.industry)} / ${escapeHtml(app.stage)}</td>
        <td>$${parseInt(app.funding_ask, 10).toLocaleString()}</td>
        <td><span class="status-badge ${escapeHtml(app.status)}">${escapeHtml(app.status)}</span></td>
        <td>
          <select class="form-select admin-status-select" data-app-id="${app.id}" style="height: 36px; padding: 0 8px; font-size: 0.8rem;">
            <option value="submitted" ${app.status === "submitted" ? "selected" : ""}>Submitted</option>
            <option value="in_review" ${app.status === "in_review" ? "selected" : ""}>In Review</option>
            <option value="shortlisted" ${app.status === "shortlisted" ? "selected" : ""}>Shortlisted</option>
            <option value="funded" ${app.status === "funded" ? "selected" : ""}>Funded</option>
            <option value="rejected" ${app.status === "rejected" ? "selected" : ""}>Rejected</option>
          </select>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    document.querySelectorAll(".admin-status-select").forEach((select) => {
      select.addEventListener("change", async (e) => {
        const appId = e.target.getAttribute("data-app-id");
        const newStatus = e.target.value;
        const note = prompt("Enter status update note (optional):") || `Updated to ${newStatus}`;
        try {
          await request(`/api/admin/applications/${appId}`, {
            method: "PATCH",
            body: { status: newStatus, note },
          });
          await loadAdminApplications();
          await loadFounderApplications();
        } catch (err) {
          alert(`Update failed: ${err.message}`);
        }
      });
    });
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5" style="color: var(--danger);">Error loading admin table</td></tr>`;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
