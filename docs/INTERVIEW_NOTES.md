# Viva and Interview Notes

Plain answers based on what the code actually does.

---

### 1. Why Flask and plain JS instead of React? What would change if you had to use React?

**Answer:** The project has a small scope: one landing page and one simple dashboard. Plain JS with native ES modules requires zero build step, zero bundler configuration, and runs directly in any browser. Flask serves both the API and static assets from one service without CORS overhead. If React were required, I would need a build step (Vite), a router, build output management, and either a separate frontend development server or a build pipeline step before Flask serves the static bundle.
- **Reference:** `backend/app.py` (`create_app`), `frontend/js/main.js`

My own words:

---

### 2. How does login work? What is in the cookie, and what stops someone editing it?

**Answer:** The user submits their email and password via `POST /api/auth/login`. The server verifies the password hash, stores `user_id` and `user_role` in Flask's `session` object, and sets a signed session cookie (`session`). The cookie data is cryptographically signed using HMAC with the server's `SECRET_KEY`. If a user tampers with the cookie payload, the signature verification fails and Flask rejects the session. In production, cookies are flagged `HttpOnly`, `SameSite=Lax`, and `Secure`.
- **Reference:** `backend/routes/auth.py` (`login`), `backend/config.py` (`Config`)

My own words:

---

### 3. How are passwords stored? Why not plain text, and why not just a fast hash?

**Answer:** Passwords are never stored in plain text. They are hashed using Werkzeug's `generate_password_hash`, which defaults to salted scrypt or PBKDF2 with SHA-256. Fast hashes (like plain MD5 or SHA-256) are vulnerable to hardware brute-force attacks and rainbow tables. Werkzeug's password hashing uses an intentional work factor (stretching) and a unique per-password cryptographic salt, making dictionary and offline rainbow table attacks computationally impractical.
- **Reference:** `backend/models/user.py` (`set_password`, `check_password`), `backend/routes/auth.py` (`register`)

My own words:

---

### 4. What happens when someone sends `{"email": {"$ne": null}}` to your login? Why is that safe here?

**Answer:** It is safe because input validation strictly checks that the incoming email is a plain string before passing it anywhere near a database query. In `backend/utils/validate.py`, `check_email` verifies `isinstance(val, str)` and tests it against a strict email regex. If a dictionary is supplied, it immediately raises a `ValidationError` (422 status code) and the database query is never executed. Furthermore, MongoEngine field typing enforces string types on queries.
- **Reference:** `backend/utils/validate.py` (`check_email`), `backend/routes/auth.py` (`login`)

My own words:

---

### 5. Walk me through what happens from clicking "Get Started" to the document appearing in MongoDB.

**Answer:**
1. The user clicks `#btn-get-started`, triggering `openAppModal()` in `frontend/js/forms.js`.
2. The user fills out the form and submits. Client-side validation checks lengths and URL formats (`validateAppForm`).
3. The submit button is disabled to prevent duplicate submissions, and a `POST` request with a JSON payload is sent to `/api/applications` using `request()` in `frontend/js/api.js`.
4. The server receives the request, verifies the session cookie via `@login_required` in `backend/utils/auth.py`, and confirms the user has fewer than 3 active applications.
5. Server validation checks each field individually (`check_startup_name`, `check_funding_ask`, `check_pitch`, etc.).
6. An `Application` document is instantiated with the initial status `submitted` and an initial embedded `StatusChange` history record, then saved via `Application.save()`.
7. MongoDB inserts the document into the `applications` collection, and the server returns a 201 Created response containing the serialized application JSON.
- **Reference:** `frontend/js/forms.js` (`initForms`), `backend/routes/applications.py` (`create_application`)

My own words:

---

### 6. Why is the application status history embedded instead of its own collection?

**Answer:** The status history is only ever read when viewing its parent application, and never queried or displayed independently. In MongoDB, embedding related sub-documents inside an array (`EmbeddedDocumentListField(StatusChange)`) avoids multi-collection lookups and joins, guaranteeing atomic single-document updates and fast reads when loading the founder dashboard or admin table.
- **Reference:** `backend/models/application.py` (`StatusChange`, `Application`), `docs/db_schema.md`

My own words:

---

### 7. How does the ring animation work? What is `stroke-dashoffset`?

**Answer:** The SVG ring is a circle element with radius `r = 42`, giving a circumference `C = 2 * Math.PI * 42 = 263.89`. In CSS, `stroke-dasharray` is set to this circumference. `stroke-dashoffset` controls where along the stroke the visible dash begins. When `stroke-dashoffset` equals `C`, the ring appears completely empty; when it equals `0`, the ring is full. When the card enters the viewport, `initStats()` calculates `targetOffset = C * (1 - score / 100)` and updates the inline style, allowing a smooth CSS transition to animate the stroke fill.
- **Reference:** `frontend/js/stats.js` (`updateRing`), `frontend/css/stats.css` (`.ring-fill`)

My own words:

---

### 8. Why does the stats card still look right when the API is down?

**Answer:** The default numbers (83% success rate, 17% failure rate, 86 launch score, 4.52% growth) are hardcoded directly into the static HTML markup. In addition, the backend endpoint `GET /api/stats` has a fallback `try/except` block that returns those same hardcoded default values if MongoDB is unreachable. If JavaScript fails or network requests time out, the card displays the HTML fallback immediately without flashing blank or broken text.
- **Reference:** `frontend/index.html` (lines 140-165), `backend/routes/public.py` (`stats`, `DEFAULT_STATS`)

My own words:

---

### 9. How did you make the hero video load fast? What is the poster for?

**Answer:** The video clips were encoded at 720p 24fps with tuned CRF values using ffmpeg (CRF 19 for intro, CRF 21 for loop), and both H.264 (MP4) and VP9 (WebM) versions were generated with audio tracks stripped (`-an`). The resulting files are well under budget: loop is 830 KB and WebM is 597 KB. The `hero-poster.webp` image (38 KB) displays instantly before video bytes start buffering. If the user has `prefers-reduced-motion` or data-saver enabled, video playback is skipped completely and a lightweight still image (`hero-end.webp`) is shown instead.
- **Reference:** `frontend/js/hero.js` (`initHero`), `frontend/css/hero.css` (`.hero-video`)

My own words:

---

### 10. Why `mix-blend-mode: screen` on the video? What breaks if the video background is not near black?

**Answer:** The screen blend mode mathematically multiplies the inverted color values: pixels with RGB (0,0,0) (pure black) contribute nothing and become transparent, while bright pixels (the green 3D card and highlights) are added to the background. If the video background is not near black (for example, values above 20 out of 255), the background color is brightened noticeably, creating a visible rectangular box boundary around the video frame. To guarantee smooth blending, a radial gradient CSS mask was also added to feather the outer edges into full transparency.
- **Reference:** `frontend/css/hero.css` (`.hero-media-wrapper`, `.hero-video-box`, `.hero-video`)

My own words:

---

### 11. How do you stop the contact form being spammed? What are the limits of your approach?

**Answer:** The contact form uses a hidden honeypot input named `website_confirm`, hidden from real users. Legitimate users never see or fill this field. Automated spam bots scanning the DOM typically fill all inputs. When `POST /api/contact` receives a request where `website_confirm` has a value, the server drops the message silently and returns a 201 response so the bot does not adapt. The limit is that customized bots designed specifically for this form could skip the honeypot field, in which case a captcha (like Cloudflare Turnstile) would be the next step.
- **Reference:** `frontend/index.html` (honeypot field), `backend/routes/contact.py` (`submit_contact`)

My own words:

---

### 12. How did you test this? What is not tested?

**Answer:** The project has 24 automated unit and integration tests using pytest and mongomock, covering user registration, login, duplicate email rejection, session logout, application creation, 3-application cap enforcement, contact honeypots, admin review flows, input validators, 404 handlers, database-down fallbacks, and 503 error handling. What is not tested: real physical mobile touch gestures on varied devices, live MongoDB Atlas network latency under high concurrency, and automated browser end-to-end tests across multiple browsers.
- **Reference:** `tests/test_public.py`, `tests/test_auth.py`, `tests/test_applications.py`, `tests/test_validation.py`

My own words:

---

### 13. What did you use AI for, and what did you change or reject?

**Answer:** Code was written with AI help in my repository for scaffolding routes, writing test suites, and calculating layout measurements. The 3D hero video visuals were generated with Google Flow and then re-compressed using ffmpeg. I rejected artificial 30 fps video interpolation, choosing native 24 fps to preserve file size budget. I also adjusted the video compositing: removing 3D transform-style contexts that broke screen blend mode in Chrome, and adding radial gradient masks to eliminate edge rectangular artifacts.
- **Reference:** `claude.md`, `README.md` (`Credits`), `frontend/css/hero.css`

My own words:

---

### 14. If you had one more week, what would you build next, and why?

**Answer:**
1. Automated email notifications to notify founders whenever an administrator updates their application status.
2. Adding rate limiting using Redis if the site receives heavy traffic or public abuse.
3. Adding pitch deck file uploads directly to AWS S3 or Cloudflare R2 with pre-signed upload URLs.
- **Reference:** `README.md` (`What I would do next`)

My own words:

---

### 15. What is the weakest part of this project?

**Answer:** Administrative status updates currently use a basic prompt dialog in the dashboard rather than a full inline modal with rich comments. Also, the app currently uses client-side signed cookies for sessions; under high traffic with multiple server instances, moving session storage to Redis would be more robust.
- **Reference:** `frontend/js/dashboard.js` (`loadAdminApplications`)

My own words:
