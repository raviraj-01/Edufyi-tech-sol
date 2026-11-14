# Build prompts

Use these with Claude Code, or in any chat where you can paste your docs. Run them in order, one at a time. After each step: run it, read it, change something, commit.

Two rules for yourself:
- Do not paste the next prompt until the current step works.
- Ask "why" about anything you cannot explain. That is what gets you through the review.

## 0. Master context (paste at the start of every session)

```
I'm building a mini project called UpFound (Fuel for Startups) for my internship. The repo has
docs/PRD.md, docs/TRD.md, docs/db_schema.md, docs/DESIGN_SYSTEM.md and docs/CODE_STYLE.md. Read all of
them before answering and follow them. If something I ask conflicts with the docs, tell me first.

About me: 3rd-year student, comfortable with HTML, CSS, JavaScript, Python and MongoEngine, beginner in React.

How to work with me:
- Do one small step at a time, then stop so I can run it.
- Before the code, explain the step in 3 to 5 lines. After the code, tell me what could break.
- Use short, plain names (see CODE_STYLE.md). No long descriptive function names.
- Comment only where the reason is not obvious. No JSDoc on small functions. No em dashes in comments.
- Do not add libraries that are not in the TRD. Ask first.
- Do not write the whole project at once.
- Be direct. If my approach is wrong or has a flaw, say so.
```

## 1. Backend skeleton

```
Step 1. Create the backend skeleton from TRD section 3 and 11: backend/__init__.py, app.py with a
create_app() factory, config.py reading env vars, requirements.txt, .env.example, .gitignore.
Add GET /api/health that returns {"ok": true}. Connect MongoEngine using MONGODB_URI.
Serve the frontend/ folder as static files, with index.html at "/".
Show me how to run it and how to check /api/health.
```

## 2. Models and seed

```
Step 2. Create the models from db_schema.md exactly (User, Application with embedded StatusChange,
ContactMessage, StatsSnapshot, Plan) and backend/seed.py that inserts the stats snapshot, the 3 plans,
and the admin user from env vars. Make seed safe to run twice. Then add GET /api/stats and GET /api/plans
in routes/public.py using the response shape in TRD section 4.
Explain in simple words what MongoEngine's meta indexes do here.
```

## 3. Errors and validation helpers

```
Step 3. Create utils/errors.py with one function that builds the error JSON from TRD section 4
(code, message, optional field) and register Flask error handlers for 404, 429 and 500.
Create utils/validate.py with small check functions for the rules in TRD section 5.
Keep them simple: plain functions that return the cleaned value or raise one custom error.
No validation library.
```

## 4. Auth routes and tests

```
Step 4. Build routes/auth.py: register, login, logout, me, using Flask session and Werkzeug hashing
as in TRD section 6. Add utils/auth.py with login_required and admin_required decorators.
Same error for wrong email and wrong password. Add Flask-Limiter on auth routes (10/min per IP).
Then write tests/test_auth.py with pytest and mongomock covering: register success, duplicate email,
short password, login success, wrong password, me when logged out.
After the code, explain what is stored in the session cookie and why it can't be edited by the user.
```

## 5. Applications and contact routes

```
Step 5. Build routes/applications.py (POST create, GET mine) and routes/contact.py as described in TRD
section 4. Enforce the max-3-applications rule with the limit_reached error. Create the first history
entry ("submitted") on creation. Contact has a honeypot field called "website_confirm": if it has a value,
return 201 but do not save. Add the rate limits from TRD section 8. Write tests for applications:
needs login, validation errors, 4th application rejected.
```

## 6. Frontend foundation

```
Step 6. Create frontend/css/tokens.css and base.css from DESIGN_SYSTEM.md sections 1 to 4 (tokens, fonts,
background, glass class). Create frontend/index.html with the head (fonts, meta, favicon placeholders),
and an empty <main> with a header. No JavaScript yet. Show me the file and what it should look like.
```

## 7. Nav

```
Step 7. Build the glass nav pill and the logo / Login-Register button in index.html with css/nav.css,
matching DESIGN_SYSTEM section 6. Links: Home, About, Services (with dropdown of 3 items), Pricing, Solution,
plus a language chip. Then js/nav.js: dropdown that works with mouse and keyboard (aria-expanded, Esc to close),
scroll spy using IntersectionObserver, and a hamburger menu under 768px.
Only the nav. Do not build the sections yet.
```

## 8. Hero layout (with placeholder)

```
Step 8. Build the hero in index.html and css/hero.css per DESIGN_SYSTEM section 5: backdrop word
"LAUNCH FUND" (aria-hidden), headline "FUEL FOR STARTUPS", paragraph, Get Started and Contact Us buttons,
social rail with inline SVG icons, scroll hint. Where the video will go, put a div with a CSS radial gradient
and a rotated rounded square as a placeholder. Use the z-index layers from TRD 7.2.
Desktop first at 1440 and 1280. I'll compare it to the reference myself.
```

## 9. Stats card

```
Step 9. Build the stats card markup and css, with default numbers written in the HTML
(83, 17, 86, 4.52). Then js/stats.js: fetch /api/stats, animate the SVG ring with stroke-dashoffset and
count up the numbers with requestAnimationFrame (TRD 7.4). Start the animation when the card is visible.
If the fetch fails, leave the defaults. Explain how the circumference math works.
```

## 10. Hero video

```
Step 10. My clips are in frontend/assets/video/ (hero-intro.mp4/.webm, hero-loop.mp4/.webm) and the poster
in frontend/assets/img/. Replace the placeholder with the two <video> elements and write js/hero.js:
play intro once, crossfade to the loop on ended, pause the loop when off screen, skip video and show
the still image for reduced motion, saveData, or a video error (TRD 7.3). Use mix-blend-mode: screen as in
ASSET_PROMPTS section 9. Then add the mouse tilt as a separate small function (TRD 7.5).
```

## 11. Auth UI

```
Step 11. Build js/api.js (one request() wrapper that throws a readable error) and js/auth.js, plus the
login and register modal with css/forms.css. Focus moves into the modal, Esc and backdrop click close it,
focus returns to the button. Show server errors under the right field. After login, the nav button shows
the user's name with a small menu (Dashboard, Logout). Check /api/auth/me on page load.
```

## 12. Forms

```
Step 12. Build the application form modal (opened by Get Started, or the login modal first if logged out)
and the contact form. js/forms.js validates with the same rules as the server and shows errors under fields
with aria-invalid and aria-describedby. Disable the submit button while sending. Show a success state.
Use textContent, never innerHTML, for anything from a user.
```

## 13. Sections

```
Step 13. Build the sections below the hero in sections.css: About, Services (3 glass cards),
Solution (4 numbered steps), Pricing (cards filled from /api/plans, highlighted plan has a lime top border),
FAQ (5 items using <details>), Footer with the demo disclaimer from the PRD.
Use the copy in the PRD where it exists, otherwise write short plain copy, no marketing buzzwords.
Add js/reveal.js for the fade-up on scroll, off for reduced motion.
```

## 14. Dashboard

```
Step 14. Build dashboard.html, css/dashboard.css and js/dashboard.js: list my applications from
/api/applications/mine with status chips and the history timeline. Redirect to / if not logged in.
Show an empty state with a Get Started button if there are none.
Optional after that: admin routes (GET all, PATCH status) and a very simple admin list.
```

## 15. Responsive pass

```
Step 15. Go through the page at 360, 768, 1280, 1440 using DESIGN_SYSTEM section 8. List every problem you
expect before changing anything, then fix them one by one. Specific checks: no horizontal scroll, backdrop
word size, stats card position, social rail layout, tap targets at least 44px, modal fits a short screen.
```

## 16. Accessibility and performance

```
Step 16. Audit the project against DESIGN_SYSTEM section 10 and TRD section 9. Give me a checklist of what
passes and what fails, with file and line. Then fix the failures one at a time. Do not add libraries.
```

## 17. Deploy

```
Step 17. Walk me through deploying to Render with MongoDB Atlas using TRD section 12. Give me render.yaml
if useful. Tell me every setting to check, the env vars to add, how to run the seed in production,
and the 5 most common reasons this fails (for example the Atlas IP allowlist or the gunicorn start command).
```

## Review prompts

### A. Make it read like mine

```
Review this file as a strict senior reviewer who has seen a lot of AI-written student code.
List everything that looks generated: names that are too long or formal, comments that repeat the code,
needless try/except, helper layers that are not needed, inconsistent style. Do not rewrite the file.
Give me a list with line numbers, and I will change them myself.
[paste file]
```

### B. Bug and security review

```
Review these files for bugs, edge cases and security problems against TRD section 8.
Rank findings by severity. For each one, explain the failing input and why it fails. Do not fix anything yet.
[paste files]
```

### C. Mock viva

```
Act as an internship reviewer. Ask me the questions from CODE_STYLE.md section 5 one at a time, and wait for
my answer. After each answer, tell me honestly if it was correct, what I missed, and one follow-up question
a real reviewer might ask. Do not go easy on me.
```

### D. Explain it to me

```
Explain this file as if I have to present it tomorrow. First a 3-sentence summary, then a walkthrough
in the order the code runs, then the 3 questions a reviewer would most likely ask about it.
[paste file]
```
