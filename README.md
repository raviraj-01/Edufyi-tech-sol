# UpFound: Fuel for Startups

A dark, glassy landing site for a fictional startup support platform, with a working Flask + MongoDB backend: accounts, startup applications, a contact form, a sample stats card, and a founder dashboard.

> Demo project. UpFound is a student demo project. It is not a real financial service. All numbers are sample data from a seeded record.

![Hero screenshot](docs/screenshots/hero.png)

## What it does

- Navigation, a 3D hero card, and an animated stats card (ring + count-up) fed by an API with hardcoded defaults
- Register, log in, log out with a signed session cookie
- Startup application form saved to MongoDB, with server-side validation
- Founder dashboard showing application status and history
- Contact form with a honeypot and rate limiting
- Pricing plans loaded from the database
- Responsive from 360px up, keyboard friendly, respects reduced motion

![Dashboard screenshot](docs/screenshots/dashboard.png)

## Stack

- **Frontend:** HTML, CSS, vanilla JavaScript (ES modules, no build step)
- **Backend:** Python, Flask, MongoEngine
- **Database:** MongoDB Atlas (free M0 tier)
- **Tests:** pytest, mongomock (24 automated tests)
- **Hosting:** Render (Gunicorn)

## Run it locally

```powershell
# 1. Clone repository
git clone https://github.com/your-username/upfound
cd upfound

# 2. Create and activate virtual environment (Windows PowerShell)
python -m venv venv
.\venv\Scripts\activate

# 3. Install backend dependencies
pip install -r backend/requirements.txt

# 4. Copy environment template or use existing .env
cp .env.example .env

# 5. Run initial database seed
python -m backend.seed

# 6. Start development server
python backend/app.py
```

Open `http://127.0.0.1:5000` in your browser.

Environment variables are listed in `.env.example`. Default admin credentials for testing:
- **Email:** `admin@upfound.test`
- **Password:** `AdminUpfound2026!`

## Automated Tests

Run all 24 automated unit and integration tests (using in-memory `mongomock`):

```powershell
.\venv\Scripts\python -m pytest -v
```

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | none | Heartbeat check |
| `GET` | `/api/stats` | none | Stats snapshot (falls back to hardcoded defaults if DB is down) |
| `GET` | `/api/plans` | none | Pricing plans in order (falls back to hardcoded defaults if DB is down) |
| `POST` | `/api/auth/register` | none | Create account and log in |
| `POST` | `/api/auth/login` | none | Log in |
| `POST` | `/api/auth/logout` | user | Clear session |
| `GET` | `/api/auth/me` | none | Current user or `null` |
| `POST` | `/api/applications` | user | Submit application (max 3 per user) |
| `GET` | `/api/applications/mine` | user | Founder applications, newest first |
| `POST` | `/api/contact` | none | Send a message (honeypot protected) |
| `GET` | `/api/admin/applications` | admin | All applications (admin queue) |
| `PATCH` | `/api/admin/applications/<id>` | admin | Set status and note |

Full details in `docs/TRD.md`.

## Project structure

```
backend/
  app.py            create_app() factory, routes, headers, local entry point
  config.py         reads env vars, enforces production secrets
  limiter.py        Flask-Limiter configuration
  models/           User, Application, Contact, Stats, Plan
  routes/           public, auth, applications, contact, admin
  utils/            errors, validate, auth decorators
  seed.py           database initial seed
frontend/
  index.html        landing page
  dashboard.html    founder dashboard
  css/              tokens, base, nav, hero, stats, forms, sections, dashboard, scroll-fx
  js/               main, api, auth, nav, hero, stats, forms, pricing, reveal, dashboard, scroll-fx
  assets/
    video/          hero-intro.mp4/.webm, hero-loop.mp4/.webm (720p, 24fps)
    img/            hero-poster.webp, hero-end.webp, og.png, logo.svg, favicon.svg
tests/
  test_public.py        health, stats, plans, database down fallback
  test_validation.py    input validation and error handler
  test_auth.py          registration, duplicate check, login, logout
  test_applications.py  auth guard, 3-app limit, honeypot, admin review, 503 error
docs/
  PRD.md, TRD.md, db_schema.md, DESIGN_SYSTEM.md, TODO.md, CODE_STYLE.md, INTERVIEW_NOTES.md
  screenshots/      responsive screenshots at 360, 768, 1280, 1440
```

## Decisions

- **Plain JS and Flask.** Small scope, one service, no build step, and it's the stack I know best. I would use React if the project needed it.
- **Stats card has hardcoded defaults in the HTML.** The free server sleeps, so the hero must look right before the API answers.
- **Embedded status history.** It is always read with its application, so one document is simpler than two collections.
- **Rate limiting in memory.** Fine for a demo, it resets when the server restarts. A real deployment would use Redis.
- **Atlas open to all IPs.** Needed on Render's free tier. Not something I would do in production.
- **Hero video native 24 fps.** Preserved the exact Flow source framerate (24 fps) without artificial interpolation to 30 fps, keeping file size small while staying well below the performance budget (intro at 1.72 MB / <= 3 MB budget, loop at 0.83 MB / <= 2 MB budget).

## Known gaps

- Lighthouse scores not yet recorded
- Not tested on a real phone
- Not yet tested against a live Atlas cluster
- In-memory rate limits reset on restart

## What I would do next

- Email the founder when the status changes
- Move rate limiting to Redis
- Add more tests for the admin routes

## Credits

- Layout inspired by a design reference from the mini project brief. Code is my own.
- The 3D hero visuals were generated with Google Flow, then compressed with ffmpeg and composited with CSS. Everything else is hand-coded.
- Fonts: Inter and Inter Tight (Google Fonts)
- Icons: hand-drawn inline SVG
