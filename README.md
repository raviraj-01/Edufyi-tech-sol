# UpFound: Fuel for Startups

A dark, glassy landing site for a startup support and funding platform, with a working Flask + MongoDB backend: founder accounts, startup applications, a contact form with honeypot anti-spam, a live stats card, pricing plans, and a founder dashboard.

> Demo project. UpFound is a student demo project. It is not a real financial service. All numbers are sample data.

---

## What it does

- **Glass navigation & 3D hero:** Layered glass pill navigation, backdrop typography, animated stats card with SVG ring fill and count-up animation, and interactive mouse tilt.
- **Session authentication:** Register, login, logout, and current user retrieval via Flask signed HTTP-only cookies and Werkzeug password hashing.
- **Startup applications:** Application submission modal with client & server-side validation, status milestones history tracking, and an enforced 3-application limit per founder.
- **Founder dashboard:** `dashboard.html` showing applications, status chips, and audit history, with admin review controls.
- **Contact form:** Honeypot field (`website_confirm`) and Flask-Limiter rate limiting.
- **Dynamic pricing:** Orderable plans loaded directly from MongoDB with offline fallback.
- **Responsive & accessible:** Keyboard navigable, full `:focus-visible` styles, WCAG contrast compliant, and respects `prefers-reduced-motion`.

---

## Stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript (ES modules, no build tools)
- **Backend:** Python 3.11+, Flask (application factory pattern), MongoEngine
- **Database:** MongoDB Atlas
- **Testing:** pytest, mongomock (22 automated test suites)
- **Hosting / Deployment:** Render (`render.yaml`), Gunicorn

---

## Run it locally

```powershell
# 1. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Configure environment
cp .env.example .env

# 4. Seed database (safe to run multiple times)
python -m backend.seed

# 5. Start Flask development server
flask --app backend.app run --debug
```

Visit `http://127.0.0.1:5000` in your browser.

---

## Automated Tests

Run the complete test suite using pytest with in-memory `mongomock`:

```powershell
python -m pytest -v
```

---

## API Summary

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | None | Heartbeat health check |
| `GET` | `/api/stats` | None | Latest startup metrics snapshot |
| `GET` | `/api/plans` | None | Pricing plans in order |
| `POST` | `/api/auth/register` | None | Create account & authenticate |
| `POST` | `/api/auth/login` | None | Authenticate existing user |
| `POST` | `/api/auth/logout` | User | Terminate session |
| `GET` | `/api/auth/me` | None | Current authenticated user session |
| `POST` | `/api/applications` | User | Submit startup funding application |
| `GET` | `/api/applications/mine`| User | Retrieve user's submitted applications |
| `POST` | `/api/contact` | None | Submit contact inquiry (honeypot protected) |
| `GET` | `/api/admin/applications`| Admin | Retrieve all platform applications |
| `PATCH`| `/api/admin/applications/<id>`| Admin | Update application status and notes |
