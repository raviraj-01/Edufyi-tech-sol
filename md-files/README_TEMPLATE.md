# UpFound: Fuel for Startups

A dark, glassy landing site for a fictional startup support platform, with a working Flask + MongoDB backend: accounts, startup applications, a contact form, a live stats card and a founder dashboard.

**Live:** https://your-app.onrender.com (first load can take up to a minute, the free server sleeps)
**Repo:** https://github.com/your-username/upfound

> Demo project. UpFound is not a real financial service. All numbers are sample data.

![Hero screenshot](docs/screenshots/hero.png)

## What it does

- Glass navigation, a 3D hero, and an animated stats card (ring + count-up) fed by an API
- Register, log in, log out with a signed session cookie
- Startup application form saved to MongoDB, with server-side validation
- Founder dashboard showing application status and history
- Contact form with a honeypot and rate limiting
- Pricing plans loaded from the database
- Responsive from 360px up, keyboard friendly, respects reduced motion

## Stack

Frontend: HTML, CSS, vanilla JavaScript (ES modules)
Backend: Python, Flask, MongoEngine
Database: MongoDB Atlas
Tests: pytest, mongomock
Hosting: Render

## Run it locally

```
git clone https://github.com/your-username/upfound
cd upfound
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
cp .env.example .env
python -m backend.seed
flask --app backend.app run --debug
```

Open http://127.0.0.1:5000

Environment variables are listed in `.env.example`.

## API

| Method | Path | Auth |
|---|---|---|
| GET | /api/stats | none |
| GET | /api/plans | none |
| POST | /api/auth/register | none |
| POST | /api/auth/login | none |
| POST | /api/auth/logout | user |
| GET | /api/auth/me | none |
| POST | /api/applications | user |
| GET | /api/applications/mine | user |
| POST | /api/contact | none |

Full details in `docs/TRD.md`.

## Project structure

```
backend/    Flask app, models, routes
frontend/   static pages, CSS, JS, assets
tests/      pytest tests
docs/       PRD, TRD, schema, design system
```

## Decisions

- **Plain JS and Flask.** One service, same origin, no CORS, nothing to explain that I did not write.
- **Stats card has default values in the HTML.** The free server sleeps, so the hero must look right before the API answers.
- **Embedded status history.** It is always read with its application, so one document is simpler than two collections.
- **Rate limiting in memory.** Fine for a demo, it resets when the server restarts. A real deployment would use Redis.
- **Atlas open to all IPs.** Needed on Render's free tier. Not something I would do in production.

## What I would do next

- Email the founder when the status changes
- Count real applications for the stats card
- Move rate limiting to Redis
- Add more tests for the admin routes

## Credits

- Layout inspired by a design reference from the mini project brief. Code is my own.
- Hero 3D visuals generated with Google Flow, then compressed with ffmpeg. Everything else is hand-coded.
- Fonts: Inter and Inter Tight (Google Fonts)
- Icons: hand-drawn inline SVG

## Scores

Lighthouse (mobile): Performance __ / Accessibility __ / Best Practices __ / SEO __
