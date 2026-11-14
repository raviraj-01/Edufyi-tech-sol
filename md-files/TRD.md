# TRD: UpFound technical design

Matches `PRD.md`. Schema is in `db_schema.md`. Visual tokens are in `DESIGN_SYSTEM.md`.

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | HTML, CSS, vanilla JS (ES modules), no build step | You know it. Fast. Easy to explain |
| Backend | Python 3.11+, Flask | Small, readable, you know Python |
| Database | MongoDB Atlas (free M0) with MongoEngine | Your existing stack |
| Auth | Flask signed session cookie + Werkzeug password hashing | Simple, no token handling in JS |
| Rate limiting | Flask-Limiter | A few lines, real protection |
| Tests | pytest + mongomock | No real DB needed for tests |
| Server | gunicorn | Standard for Render |
| Hosting | Render (web service) + Atlas | Free, and you have used Render before |
| Fonts | Inter and Inter Tight (Google Fonts) | See DESIGN_SYSTEM.md |

Flask serves both the API and the static frontend. One repo, one service, same origin. That means no CORS setup and cookies just work.

If the program requires React: keep the API as is, replace `frontend/` with a Vite + React app, and add `flask-cors` with credentials. Do not start with this unless required.

## 2. Architecture

```
Browser
  |  GET /, /dashboard.html, /css/*, /js/*, /assets/*   (static files)
  |  fetch /api/*                                       (JSON)
  v
Flask app (gunicorn)
  |-- routes/public.py        health, stats, plans
  |-- routes/auth.py          register, login, logout, me
  |-- routes/applications.py  create, list mine
  |-- routes/contact.py       contact form
  |-- routes/admin.py         list all, change status
  |-- utils/                  validation, auth guards, error format
  v
MongoEngine models  ->  MongoDB Atlas
```

## 3. Folder structure

```
upfound/
  backend/
    __init__.py
    app.py              create_app(), registers routes, security headers
    config.py           reads env vars
    models/
      __init__.py
      user.py
      application.py
      contact.py
      stats.py
      plan.py
    routes/
      __init__.py
      public.py
      auth.py
      applications.py
      contact.py
      admin.py
    utils/
      validate.py       small input checks
      auth.py           login_required, admin_required
      errors.py         one error format
    seed.py             plans, stats, admin user
    requirements.txt
  tests/
    test_auth.py
    test_applications.py
    test_public.py
  frontend/
    index.html
    dashboard.html
    css/
      tokens.css  base.css  nav.css  hero.css
      sections.css  forms.css  dashboard.css
    js/
      main.js  api.js  auth.js  nav.js  hero.js
      stats.js  forms.js  reveal.js  dashboard.js
    assets/
      video/  hero-intro.mp4 hero-intro.webm hero-loop.mp4 hero-loop.webm
      img/    hero-poster.webp hero-end.webp og.png
      logo.svg  favicon.svg
  docs/                 these docs
  .env.example
  .gitignore
  render.yaml
  README.md
```

## 4. API

All responses are JSON. Errors always look like this:

```json
{ "error": { "code": "validation_error", "message": "Email is not valid", "field": "email" } }
```

| Method | Path | Auth | Purpose | Success |
|---|---|---|---|---|
| GET | `/api/health` | none | Uptime check | 200 `{ "ok": true }` |
| GET | `/api/stats` | none | Latest stats snapshot | 200 |
| GET | `/api/plans` | none | Pricing plans in order | 200 |
| POST | `/api/auth/register` | none | Create account and log in | 201 |
| POST | `/api/auth/login` | none | Log in | 200 |
| POST | `/api/auth/logout` | user | Clear session | 204 |
| GET | `/api/auth/me` | none | Current user or `null` | 200 |
| POST | `/api/applications` | user | Submit application | 201 |
| GET | `/api/applications/mine` | user | My applications, newest first | 200 |
| POST | `/api/contact` | none | Send a message | 201 |
| GET | `/api/admin/applications` | admin | All applications, filter by `?status=` | 200 |
| PATCH | `/api/admin/applications/<id>` | admin | Set status and note | 200 |

Error codes: `validation_error` (422), `email_taken` (409), `invalid_credentials` (401), `not_logged_in` (401), `forbidden` (403), `not_found` (404), `rate_limited` (429), `limit_reached` (409), `server_error` (500).

### Key payloads

`GET /api/stats`
```json
{
  "launching_startups": {
    "success_rate": 83,
    "failure_rate": 17,
    "launch_score": 86,
    "growth_pct": 4.52,
    "updated_at": "2026-11-14T08:00:00Z"
  }
}
```

`POST /api/auth/register`
```json
{ "name": "Ravi Raj", "email": "ravi@example.com", "password": "at-least-8-chars" }
```
Response 201:
```json
{ "user": { "id": "665f...", "name": "Ravi Raj", "email": "ravi@example.com", "role": "founder" } }
```

`POST /api/applications`
```json
{
  "startup_name": "GreenLedger",
  "website_url": "https://greenledger.example",
  "industry": "fintech",
  "stage": "mvp",
  "funding_ask": 50000,
  "pitch": "We help small farms track carbon credits with a simple mobile app."
}
```
Response 201 returns the saved application with `status: "submitted"` and its `history`.

`PATCH /api/admin/applications/<id>`
```json
{ "status": "shortlisted", "note": "Strong pitch, schedule a call." }
```

## 5. Validation rules

Checked in `utils/validate.py` on the server. The client repeats the same rules for fast feedback, but the server is the one that counts.

| Field | Rule |
|---|---|
| name | 2 to 60 chars, trimmed |
| email | valid format, stored lowercase |
| password | 8 to 72 chars |
| startup_name | 2 to 80 chars |
| website_url | optional, must start with http:// or https:// |
| industry | one of `fintech, healthtech, edtech, saas, ecommerce, climate, other` |
| stage | one of `idea, prototype, mvp, revenue` |
| funding_ask | integer, 1000 to 5,000,000 (USD) |
| pitch | 30 to 1000 chars |
| contact.topic | one of `general, funding, partnership, support` |
| contact.message | 10 to 1000 chars |
| status (admin) | one of `submitted, in_review, shortlisted, funded, rejected` |

Business rule: a user can have at most 3 applications (`limit_reached`).

## 6. Auth

- Register hashes the password with `werkzeug.security.generate_password_hash`. Login uses `check_password_hash`.
- On success, store `user_id` in Flask's `session`. Cookie flags: `HttpOnly`, `SameSite=Lax`, `Secure` when `FLASK_ENV=production`. Lifetime 7 days.
- Wrong email and wrong password return the same error, so you do not leak which emails exist.
- `login_required` and `admin_required` are small decorators in `utils/auth.py`.
- Admin is created by `seed.py` from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. There is no admin signup route.

## 7. Frontend design

### 7.1 Modules
- `api.js`: one `request(path, options)` wrapper. Sends JSON, throws a readable error from the `error` object.
- `auth.js`: current user state, open/close login and register modal, update the nav button.
- `nav.js`: scroll spy with IntersectionObserver, dropdown, mobile menu.
- `hero.js`: video intro to loop switch, mouse tilt, reduced motion handling.
- `stats.js`: fetch stats, animate ring and count-up.
- `forms.js`: validate and submit application and contact forms.
- `reveal.js`: fade-up on scroll.
- `main.js`: imports the above and starts them.

No libraries. Total JS target under 40 KB unminified.

### 7.2 Hero layers

```
z-index 0   background: radial gradients + faint noise (CSS)
z-index 1   backdrop word "LAUNCH FUND" (opacity about 0.25, gradient text)
z-index 2   hero video (mix-blend-mode: screen)
z-index 3   headline, buttons, stats card, social rail, scroll hint
z-index 10  nav
```

Compositing details and the fallback are in `ASSET_PROMPTS.md` section 9.

### 7.3 Video behavior
1. HTML has a `<video>` for the intro with `muted playsinline preload="auto"` and a `poster`.
2. On `ended`, fade to the loop video (same first frame) and play it with `loop`.
3. Skip video and show the still image when any of these is true: `prefers-reduced-motion`, `navigator.connection.saveData`, or the video `error` event fires.
4. Pause the loop when the hero is off screen (IntersectionObserver).
5. Video is decorative: `aria-hidden="true"`, no controls.

### 7.4 Stats ring
SVG circle with radius `r`. Circumference `C = 2 * Math.PI * r`. Set `stroke-dasharray = C` and animate `stroke-dashoffset` from `C` to `C * (1 - score / 100)` with a CSS transition. Count-up uses `requestAnimationFrame`, 1200 ms, ease-out cubic. Starts when the card enters the viewport. The default numbers are already written in the HTML, so the card is correct even if the API never answers.

### 7.5 Mouse tilt
On `pointermove` over the hero, compute the offset from center, clamp it, and apply `transform: translate3d(...) rotate(...)` to the video wrapper inside a `requestAnimationFrame`. Max 12 px move and 4 degrees. Disabled for touch pointers and reduced motion.

### 7.6 Forms
- Labels on every input, `aria-invalid` and an error `<p>` linked with `aria-describedby`.
- Submit button disabled while the request is in flight.
- Errors from the server with a `field` are shown under that field.
- Use `textContent`, never `innerHTML`, for anything that came from a user or the API.

## 8. Security checklist

- [ ] Passwords hashed, never returned in any response
- [ ] Session cookie flags set
- [ ] No raw `request.json` passed into a query. Read each field by name
- [ ] Rate limits: auth 10/min per IP, contact 5/hour per IP, applications 10/hour per user
- [ ] Honeypot field on contact form
- [ ] `Content-Type: application/json` required on POST and PATCH
- [ ] Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, a basic CSP
- [ ] Secrets only in env vars. `.env` is in `.gitignore`
- [ ] Atlas user has only read/write on this database
- [ ] Error responses never include stack traces

Note on the limiter: with in-memory storage, limits reset on restart and are per instance. That is fine for a demo, say so in the README.

## 9. Performance budget

| Item | Budget |
|---|---|
| Intro video | 3 MB or less, 1080p, no audio |
| Loop video | 2 MB or less |
| Poster image | 150 KB or less, WebP |
| CSS total | 40 KB or less |
| JS total | 40 KB or less unminified |
| Fonts | 2 families, only weights used, `font-display: swap`, preconnect |
| Images below the fold | `loading="lazy"`, explicit width and height |

Largest Contentful Paint should be the poster image, not the video.

## 10. Environment variables

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/upfound
SECRET_KEY=long-random-string
FLASK_ENV=development
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-before-seeding
```

Commit `.env.example` with fake values. Never commit `.env`.

## 11. Run locally

```
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
cp .env.example .env            # then fill it in
python -m backend.seed
flask --app backend.app run --debug
```

`requirements.txt`: Flask, mongoengine, gunicorn, python-dotenv, Flask-Limiter, pytest, mongomock.

## 12. Deploy

1. Create an Atlas M0 cluster, a database user, and allow `0.0.0.0/0` (Render free has no fixed IP). Say this in the README as a demo tradeoff.
2. Push the repo to GitHub.
3. On Render create a Web Service from the repo.
   - Build: `pip install -r backend/requirements.txt`
   - Start: `gunicorn "backend.app:create_app()"`
   - Env vars: the ones in section 10, with `FLASK_ENV=production`.
4. Run the seed once from the Render shell or locally against the Atlas URI.
5. Open the live URL and run the manual checklist in `TODO.md`.

The free Render service sleeps after inactivity, so the first load can take about 30 to 60 seconds. Mention it in the README, and keep the page usable without the API.

## 13. Testing

Automated (pytest with mongomock):
- register: success, duplicate email, weak password
- login: success, wrong password
- applications: needs login, validation errors, 4th application rejected
- stats and plans: shape of the response

Manual:
- Chrome, Firefox, and one real phone
- Widths 360, 768, 1280, 1440
- Keyboard only: tab through nav, modal, forms
- Reduced motion on: no video, no tilt, no reveal
- Offline API: stop the server and confirm the hero still looks right
- Lighthouse mobile run, save the screenshot for the README
