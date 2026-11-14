# claude.md - Project Tracking & Context

## Project Overview
- **Project Name:** UpFound (Fuel for Startups)
- **Role:** Internship project (3rd-year student style, clear, readable, no unnecessary libraries)
- **Stack:**
  - Backend: Python 3.11+, Flask (app factory), MongoEngine, Flask-Limiter, pytest + mongomock
  - Frontend: HTML5, CSS3, vanilla JS (ES modules, no build step, UI design via Gemini)
  - Auth: Flask signed session cookie + Werkzeug password hashing
  - Database: MongoDB Atlas (M0 free tier)
  - Server / Deploy: Gunicorn on Render (`render.yaml`)

## Working Guidelines
- Do one step at a time, verify thoroughly.
- Before code: 3-5 lines explaining the step.
- After code: highlight what could break.
- Short, plain names; comments only for non-obvious reasons; no unnecessary libraries.

---

## Completed Steps Log

### Step 1: Backend Skeleton
- **Status:** COMPLETED
- **Files:** `.gitignore`, `.env.example`, `backend/requirements.txt`, `backend/__init__.py`, `backend/config.py`, `backend/app.py`, `frontend/index.html`.
- **Features:** App factory `create_app()`, security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`), `GET /api/health`, and static `frontend/` serving.

### Step 2: Models and Seed
- **Status:** COMPLETED
- **Files:**
  - `backend/models/__init__.py`: Enums (`STAGES`, `INDUSTRIES`, `STATUSES`, `TOPICS`).
  - `backend/models/user.py`: `User` with unique email, hashed password, `to_public()`.
  - `backend/models/application.py`: `Application` with embedded `StatusChange` history and cascade delete on user reference.
  - `backend/models/contact.py`: `ContactMessage` with handled flag.
  - `backend/models/stats.py`: `StatsSnapshot` with percentage validation (`clean()`) and `to_public()`.
  - `backend/models/plan.py`: `Plan` model with position and slug.
  - `backend/seed.py`: Idempotent script inserting stats snapshot, 3 plans (Starter, Growth, Scale), and admin user from env.
  - `backend/routes/public.py`: Endpoints `GET /api/stats` and `GET /api/plans`.
- **Verification:** Tested with `mongomock`, verified idempotency across multiple runs.

### Step 3: Errors and Validation Helpers
- **Status:** COMPLETED
- **Files:**
  - `backend/utils/errors.py`: Custom exceptions (`AppError`, `ValidationError`), unified JSON error generator (`make_error`), and handlers for 404, 429, 500.
  - `backend/utils/validate.py`: Pure Python validators for email, password length, funding asks, startup names, pitches, topics.
  - `tests/conftest.py`: Centralized test fixtures for pytest with `mongomock`.
  - `tests/test_validation.py`: Unit tests for input validators and error formatting.

### Step 4: Auth Routes and Tests
- **Status:** COMPLETED
- **Files:**
  - `backend/limiter.py`: Flask-Limiter configuration (in-memory, 10/min rate limiting).
  - `backend/utils/auth.py`: Decorators `login_required`, `admin_required`, and helper `get_current_user()`.
  - `backend/routes/auth.py`: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
  - `tests/test_auth.py`: 7 automated tests covering duplicate emails, weak passwords, bad credentials, and session state.

### Step 5: Applications and Contact Routes
- **Status:** COMPLETED
- **Files:**
  - `backend/routes/applications.py`: `POST /api/applications` (max 3 applications rule, initial `submitted` history entry), `GET /api/applications/mine`.
  - `backend/routes/contact.py`: `POST /api/contact` with honeypot field (`website_confirm`) silently dropping bots.
  - `tests/test_applications.py`: Tests for auth guard, validation rules, 4th application rejection, and bot honeypot.

### Step 6: Frontend Foundation
- **Status:** COMPLETED
- **Files:**
  - `frontend/css/tokens.css`: Dark emerald variables, glass tokens, typography, and spacing.
  - `frontend/css/base.css`: CSS reset, multi-layer gradient background, `.glass` card styling, accessible focus styles, and reduced motion queries.
  - `frontend/index.html`: Base layout, meta tags, Google Fonts (`Inter` & `Inter Tight`).

### Step 7: Navigation
- **Status:** COMPLETED
- **Files:**
  - `frontend/css/nav.css`: Fixed glass pill navigation, logo mark, Services dropdown, language chip, and mobile drawer.
  - `frontend/js/nav.js`: Accessible dropdown (mouse & keyboard with Enter/Space/Esc), mobile hamburger toggle, and IntersectionObserver scroll spy.
  - `frontend/js/main.js`: Main entry script initializing modules.

### Step 8: Hero Layout (with CSS Placeholder)
- **Status:** COMPLETED
- **Files:**
  - `frontend/css/hero.css`: Z-index layers per TRD 7.2, backdrop text "LAUNCH FUND", hero headline, CTA buttons, social rail, and scroll hint.
  - `frontend/index.html`: Hero structure with rotated diamond placeholder card.

### Step 9: Stats Card
- **Status:** COMPLETED
- **Files:**
  - `frontend/css/stats.css`: Stats card with SVG ring gauge, metrics columns, and growth badge.
  - `frontend/js/stats.js`: Live fetch from `/api/stats`, default HTML fallbacks (83, 17, 86, 4.52), count-up animation, and SVG ring dashoffset transition.

### Step 10: Hero Video & 3D Tilt
- **Status:** COMPLETED
- **Files:**
  - `frontend/assets/video/`, `frontend/assets/img/`: Asset folders created.
  - `frontend/js/hero.js`: Intro video to loop crossfade, pause when offscreen, skip video on reduced motion or slow connection, and smooth mouse-tilt tracking.

### Step 11: Auth UI
- **Status:** COMPLETED
- **Files:**
  - `frontend/js/api.js`: Universal fetch wrapper with `ApiError`.
  - `frontend/css/forms.css`: Modal overlay, glass form cards, 48px inputs, error states, and user profile menu.
  - `frontend/js/auth.js`: Login/Register modal controller, tab switching, session checking against `/api/auth/me`, and dynamic user profile menu.

### Step 12: Forms
- **Status:** COMPLETED
- **Files:**
  - `frontend/js/forms.js`: Application modal and contact form submission, client-side validation, submit button disabling, error rendering under specific fields, and success feedback.

### Step 13: Sections Below the Fold
- **Status:** COMPLETED
- **Files:**
  - `frontend/css/sections.css`: Styles for About, Services (3 cards), Solution (4 steps), Pricing, FAQ (5 `<details>` items), and Footer disclaimer.
  - `frontend/js/pricing.js`: Dynamic loading of pricing tiers from `/api/plans`.
  - `frontend/js/reveal.js`: Fade-up animation on scroll for all sections.

### Step 14: Founder Dashboard & Admin
- **Status:** COMPLETED
- **Files:**
  - `backend/routes/admin.py`: `GET /api/admin/applications` and `PATCH /api/admin/applications/<id>`.
  - `frontend/dashboard.html`: Dashboard page for founders and administrators.
  - `frontend/css/dashboard.css`: Dashboard styling, application status chips, and milestone timeline.
  - `frontend/js/dashboard.js`: Auth protection, loading `/api/applications/mine`, status timeline rendering, empty states, and administrative review actions.

### Step 15: Responsive Pass
- **Status:** COMPLETED
- **Verification:** Verified at 360px, 768px, 1024px, 1280px, and 1440px. No horizontal scroll (`overflow-x: hidden`), tap targets >= 44px, and modals scrollable on short viewports.

### Step 16: Accessibility & Performance Audit
- **Status:** COMPLETED
- **Verification:** `:focus-visible` on all interactive elements, semantic labels on all inputs, `aria-invalid` on errors, `aria-hidden` on decorative media, and full `prefers-reduced-motion` compliance.

### Step 17: Deployment Preparation
- **Status:** COMPLETED
- **Files:**
  - `render.yaml`: Configuration for Render Web Service deployment with Gunicorn.
  - `README.md`: Complete documentation, quickstart, and API endpoints table.

### Full UI Design Polish & Production Overhaul
- **Status:** COMPLETED
- **Files Updated / Created:**
  - `frontend/css/tokens.css`: Refined palette, dark emerald layered tokens, glowing borders, typography scales.
  - `frontend/css/base.css`: Multi-point atmospheric radial gradients, strong glass presets, scroll smoothness, a11y focus rings.
  - `frontend/css/nav.css`: Centered glass pill navigation with dropdown carets, mobile drawer, interactive language chip.
  - `frontend/css/hero.css`: Subtle noise texture, backdrop glow, typography gradient, glowing primary CTA button, animated scroll indicator.
  - `frontend/css/stats.css`: Compact card, SVG circular score gauge, drop shadows, growth percentage badge.
  - `frontend/css/forms.css`: Custom inputs with dark glass backgrounds, error rings, tabbed auth modal, smooth backdrop blur.
  - `frontend/css/sections.css`: Complete styling for About, Services (hover lift), Solution steps (connector line), Pricing (featured plan with lime accent), FAQ accordion (plus/minus toggle), Contact form & details, Footer.
  - `frontend/css/dashboard.css`: Polished founder dashboard, status chips with glowing indicator dots, timeline milestones with gradient line, responsive admin table.
  - `frontend/index.html` & `frontend/dashboard.html`: Integrated OpenGraph tags, favicon links, interactive links, deep linking (`?apply=true`).
  - `frontend/assets/img/favicon.svg` & `frontend/assets/img/logo.svg`: SVG brand marks.
  - `frontend/assets/img/hero-poster.webp`: Placeholder poster image to prevent 404 network warnings.
- **Verification:** All 22 pytest tests passing. Form validation, modals, modals auto-triggering on deep links (`?apply=true`), responsive layout.

### Hero Video Asset Processing (Steps 1-8)
- **Status:** COMPLETED
- **Source Clips:** `intro-1.mp4` (intro reveal, 8s, 24fps), `intro-2.mp4` (idle loop, 6s, 24fps).
- **Edge Brightness:** Verified all borders < 20 (top/bottom/left/right range 3.8 - 17.3) ensuring clean `mix-blend-mode: screen`.
- **Generated Assets & Budget Verification:**
  - `hero-intro.mp4` (1023.89 KB / ~1.00 MB, budget ≤ 3 MB) - PASS
  - `hero-intro.webm` (647.61 KB / ~0.63 MB, budget ≤ 3 MB) - PASS
  - `hero-loop.mp4` (460.79 KB / ~0.45 MB, budget ≤ 2 MB) - PASS
  - `hero-loop.webm` (408.10 KB / ~0.40 MB, budget ≤ 2 MB) - PASS
  - `hero-poster.webp` (18.32 KB, budget ≤ 150 KB) - PASS
  - `hero-end.webp` (23.43 KB) - PASS
- **Seam Continuity:** Original `intro-2.mp4` verified with frame-by-frame SSIM stream-loop test (median baseline 0.9897, boundary join dips only by 0.0069 to 0.9828).

---

## Test Verification Summary
- **Total Automated Unit Tests:** 22 passed (0 failures)
- `tests/test_public.py`: 4 tests (health, stats fallback, stats seeded, plans)
- `tests/test_validation.py`: 5 tests (name, email, password, funding ask, 404 handler)
- `tests/test_auth.py`: 7 tests (register, duplicate email, short password, login, bad password, me logged out, logout)
- `tests/test_applications.py`: 6 tests (login required, validation error, creation & 3-app limit, contact submission, honeypot bot trap, admin review flow)
