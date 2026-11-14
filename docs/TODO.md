# TODO

Tags: **[P0]** must ship, **[P1]** should ship, **[P2]** only if time is left.
Feature IDs (F1, F2...) point to `PRD.md`.

## Day 0: decisions and setup (today)

- [ ] [P0] Answer the open questions in PRD section 10 (deadline, required stack, live URL needed, AI policy)
- [ ] [P0] Pick the real deadline and choose a plan below: **14 days** or **5-day cut**
- [ ] [P0] Create a GitHub repo `upfound`, add `.gitignore` (venv, .env, __pycache__, node_modules), push the docs
- [ ] [P0] Create the Atlas M0 cluster and a database user, save the URI in `.env`
- [ ] [P0] Start the hero asset in Google Flow (see `ASSET_PROMPTS.md`). Time-box it. Do not wait for it
- [ ] [P1] Pick the 2 fonts and add them to a test page to see them render

## 14-day plan

### Day 1: frontend foundation
- [ ] [P0] Folder structure from TRD section 3
- [ ] [P0] `tokens.css` and `base.css` (reset, fonts, background gradient)
- [ ] [P0] Hero HTML with all elements from PRD section 4 using a CSS-gradient placeholder where the video goes
- [ ] [P0] Glass nav (F1) without dropdown logic yet
- [ ] Commit: "add tokens, base styles and static hero"

### Day 2: hero polish and stats card
- [ ] [P0] Backdrop word, headline, buttons, social rail, scroll hint positioned per DESIGN_SYSTEM section 5
- [ ] [P0] Stats card markup and SVG ring (F4), default numbers written in the HTML
- [ ] [P0] Ring fill and count-up in `stats.js`
- [ ] [P0] Compare with the reference at 1440 and 1280. Fix spacing by eye
- [ ] Commit: "stats card with ring animation"

### Day 3: backend skeleton
- [ ] [P0] Flask app factory, config, `/api/health`
- [ ] [P0] Models from `db_schema.md`, connect to Atlas
- [ ] [P0] `seed.py`, then `/api/stats` and `/api/plans`
- [ ] [P0] Wire `stats.js` to the real API, keep the HTML fallback
- [ ] Commit: "flask app, models, seed and stats endpoint"

### Day 4: auth
- [ ] [P0] Register, login, logout, me (F7)
- [ ] [P0] pytest for auth
- [ ] [P0] Login and register modal, nav button changes to the user's name after login
- [ ] [P1] Rate limit on auth routes
- [ ] Commit: "auth routes with tests and login modal"

### Day 5: applications and contact
- [ ] [P0] `POST /api/applications` and `GET /api/applications/mine` (F8)
- [ ] [P0] Get Started opens the application form, or the login modal if logged out
- [ ] [P1] `POST /api/contact` and Contact Us form (F9), honeypot, rate limit
- [ ] [P0] Show server errors under the right field
- [ ] Commit: "application and contact forms"

### Day 6: hero video
- [ ] [P0] Compress clips with ffmpeg, export poster (see ASSET_PROMPTS section 8)
- [ ] [P0] Intro to loop switch, fallback to still image (F3)
- [ ] [P0] Screen blend and layer order, check the backdrop word still reads
- [ ] [P2] Mouse tilt (F13)
- [ ] If no good clip by end of today: use the still image fallback and move on
- [ ] Commit: "hero video with fallback"

### Day 7: below the fold (part 1)
- [ ] [P0] About section
- [ ] [P0] Services section, 3 cards
- [ ] [P0] Solution section, 4 steps
- [ ] [P0] Nav scroll spy and smooth scroll, Services dropdown (F1)
- [ ] Commit: "about, services and solution sections"

### Day 8: below the fold (part 2)
- [ ] [P0] Pricing section filled from `/api/plans`
- [ ] [P0] FAQ with accessible accordion (`<details>` is fine)
- [ ] [P0] Footer with the demo disclaimer
- [ ] [P1] Scroll reveal (F12)
- [ ] Commit: "pricing, faq and footer"

### Day 9: dashboard
- [ ] [P1] `dashboard.html` showing my applications and status history (F10)
- [ ] [P2] Admin list and status change route, simple admin view (F11)
- [ ] [P1] Redirect to the home page if not logged in
- [ ] Commit: "founder dashboard"

### Day 10: responsive and accessibility
- [ ] [P0] Mobile layout at 360 and tablet at 768 (F16)
- [ ] [P0] Hamburger menu
- [ ] [P0] Keyboard pass: tab order, focus styles, modal focus trap and Esc (F17)
- [ ] [P0] Contrast check on muted text and buttons
- [ ] [P0] Reduced motion test

### Day 11: performance, SEO, tests
- [ ] [P0] Lighthouse mobile, fix the top 3 issues
- [ ] [P1] Meta tags, Open Graph image, favicon (F15)
- [ ] [P1] Security headers, check the TRD section 8 list
- [ ] [P0] Run all tests, fix failures
- [ ] [P2] Language switch (F14)

### Day 12: deploy
- [ ] [P0] Deploy to Render with Atlas, set env vars
- [ ] [P0] Run seed on production
- [ ] [P0] Manual checklist below on the live URL
- [ ] [P0] Test on your phone over mobile data

### Day 13: README and demo
- [ ] [P0] README from `README_TEMPLATE.md`, with screenshots
- [ ] [P1] 60-second screen recording of the flow: land, register, apply, dashboard
- [ ] [P0] Viva prep (see `CODE_STYLE.md` section 5). Read each file aloud once

### Day 14: buffer and submit
- [ ] [P0] Fix whatever broke
- [ ] [P0] Last live check, then submit repo link and live link

## 5-day cut (if the deadline is close)

Drop: auth, dashboard, admin, language switch, tilt, scroll reveal. Keep the backend small.

| Day | Do |
|---|---|
| 1 | Foundation, static hero, nav, stats card with ring (Days 1 and 2 above) |
| 2 | Sections: About, Services, Solution, Pricing (static JSON is fine), FAQ, footer |
| 3 | Flask + Atlas + `/api/stats` + application form saved to the database, contact form |
| 4 | Hero video or still fallback, mobile layout, accessibility pass, deploy |
| 5 | README, screenshots, viva prep, submit |

Be honest with yourself: if the deadline is under 5 days, ship a polished frontend and one working form. A half-working login is worse than no login.

## Manual checklist for the live site

- [ ] Home loads, hero visible with poster before the video
- [ ] Stats card animates and shows numbers
- [ ] Every nav link scrolls to the right section
- [ ] Register works, refresh keeps me logged in, logout works
- [ ] Application form: bad input shows errors, good input shows success
- [ ] Application appears in the dashboard and in Atlas
- [ ] Contact form works and the 6th message in an hour is blocked
- [ ] Kill the API (or wait for a cold start): hero still looks fine
- [ ] Phone: no sideways scroll, buttons are tappable
- [ ] Keyboard only: can open the modal, fill it, close it
- [ ] Console has no errors
- [ ] Lighthouse mobile scores recorded

## Definition of done

All P0 items checked, live URL works, README has screenshots and a "decisions" section, and you can explain every file without opening an AI chat.
