# UpFound: Fuel for Startups

A clean, dark landing page and web application for an early-stage startup support platform. Built with Python (Flask) and MongoDB on the backend, and plain HTML, CSS, and modern JavaScript on the frontend.

> **Note:** UpFound is a student demo project. It is not a real financial service. All numbers and stats shown on the site are sample data.

## What it does

- **Landing page:** Clean dark theme with a 3D visual card and a live stats widget.
- **User accounts:** Register, log in, and log out with secure session cookies.
- **Startup application form:** Founders can submit their startup details and funding ask to MongoDB.
- **Founder dashboard:** Founders can view their submitted applications and see review status updates.
- **Contact form:** Visitors can send a message, protected with a honeypot field to stop automated spam bots.
- **Pricing section:** Displays membership plans loaded directly from the database.
- **Responsive design:** Works smoothly on mobile screens (360px) up to desktop monitors.

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES modules, no build tools or frameworks needed).
- **Backend:** Python 3, Flask, MongoEngine (ODM).
- **Database:** MongoDB Atlas.
- **Testing:** pytest with mongomock (24 automated tests).
- **Deployment:** Render (Gunicorn).

## Running the Project Locally

### 1. Clone the repository
```bash
git clone https://github.com/raviraj-01/Edufyi-tech-sol.git
cd Edufyi-tech-sol
```

### 2. Set up Python virtual environment
On Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\activate
```

On macOS / Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r backend/requirements.txt
```

### 4. Configure environment variables
Copy the example file to `.env`:
```bash
cp .env.example .env
```
Fill in your MongoDB connection string in `.env` if you are using your own database.

### 5. Seed sample data
Populate the database with default pricing plans, stats, and an admin user:
```bash
python -m backend.seed
```

### 6. Start the server
```bash
python backend/app.py
```
Open `http://127.0.0.1:5000` in your web browser.

Default admin credentials for testing:
- **Email:** `admin@upfound.test`
- **Password:** `AdminUpfound2026!`

## Automated Tests

Run the full test suite using in-memory mock database tests:
```bash
pytest -v
```
All 24 unit and integration tests run without needing an active internet connection.

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server health check |
| `GET` | `/api/stats` | Public | Key stats (falls back to defaults if database is unreachable) |
| `GET` | `/api/plans` | Public | Pricing plans (falls back to defaults if database is unreachable) |
| `POST` | `/api/auth/register` | Public | Create a new user account |
| `POST` | `/api/auth/login` | Public | Log in with email and password |
| `POST` | `/api/auth/logout` | User | Log out and clear session cookie |
| `GET` | `/api/auth/me` | Public | Get currently logged-in user profile |
| `POST` | `/api/applications` | User | Submit a startup application (maximum 3 per user) |
| `GET` | `/api/applications` | User | View user's submitted applications |
| `POST` | `/api/contact` | Public | Send a contact message (with bot protection) |
| `GET` | `/api/admin/applications` | Admin | View all submitted applications across the platform |
| `PATCH` | `/api/admin/applications/<id>/status` | Admin | Update application review status and notes |

## Project Structure

```
backend/
  app.py            Application factory, routes registration, security headers
  config.py         Configuration settings and secret key checks
  models/           Database schemas (User, Application, Contact, Stats, Plan)
  routes/           API routes (auth, applications, contact, public, admin)
  utils/            Helper functions for validation and error handling
  seed.py           Populates initial sample database records
frontend/
  index.html        Main landing page
  dashboard.html    User and admin dashboard
  css/              Styling files (tokens, base, nav, hero, stats, forms, sections)
  js/               JavaScript modules (main, api, auth, nav, hero, stats, forms)
  assets/           Images and hero video clips
tests/
  test_public.py        Public routes and fallback tests
  test_validation.py    Form and input validation tests
  test_auth.py          Account registration, login, and logout tests
  test_applications.py  Application submissions and admin review tests
docs/
  PRD.md, TRD.md, db_schema.md, INTERVIEW_NOTES.md
```

## Key Decisions

- **No frontend frameworks (Vanilla JS):** Keeps the project fast, lightweight, and easy to explain. Native ES modules work directly in all modern browsers without needing Webpack, Vite, or npm packages.
- **Default data fallbacks:** If MongoDB is offline, public routes (like stats and plans) automatically return default data so the website does not look broken to visitors.
- **Embedded status history:** Application status changes (like `submitted` -> `in_review` -> `shortlisted`) are stored inside the application document itself, keeping review history simple and easy to fetch.
- **Video blending with CSS:** The 3D hero video was rendered on a black background and blended into the page using CSS `mix-blend-mode: screen`, keeping file sizes small while blending with the dark green theme.

## Future Improvements

- Send an email notification to the founder when their application status is updated.
- Add file upload support so founders can upload PDF pitch decks directly.
- Add more automated test coverage for admin reviewer workflows.
