# PRD: UpFound, "Fuel for Startups"

Status: draft v1
Owner: Ravi
Type: internship + training mini project

## 1. Summary

UpFound is a fictional platform that helps early-stage startups with guidance, funding support and growth help. This project is its public website: a dark, glassy landing page with a 3D hero, plus a small working backend so a visitor can register, apply, contact the team and track their application.

It is a demo. It is not a real financial service, and every number on it is sample data. The footer says so.

## 2. Goals and non-goals

### Goals
1. Match the reference hero closely: glass nav, huge backdrop word, 3D card, stats card, social rail.
2. Show full stack thinking, not just a pretty page: auth, forms saved to MongoDB, a stats API, a user dashboard.
3. Ship it live with a clean README, so a reviewer can click, scroll, try and read the code in 10 minutes.
4. Write code the author fully understands and can explain line by line.

### Non-goals
- Real payments, real funding, KYC, or anything that moves money
- Sending emails (stretch only)
- A CMS or admin analytics
- A native mobile app
- More than one language (stretch only)

## 3. Users

| User | Wants | Success looks like |
|---|---|---|
| Visitor (founder, curious) | Understand the offer in 5 seconds | Clicks Get Started |
| Founder (registered) | Submit an application and see its status | Sees status on dashboard |
| Admin (demo only) | Move applications through stages | Status change shows for the founder |
| Reviewer (the real audience) | Judge skill quickly | Opens the link, scrolls, tries a form, opens the repo |

## 4. Reference breakdown (hero only)

| Ref | Element | Notes |
|---|---|---|
| H1 | Floating glass nav pill | Home, About, Services (dropdown), Pricing, Solution, language pill |
| H2 | Logo, top left | Own simple mark, not a copy |
| H3 | Login / Register button, top right | Green gradient |
| H4 | Giant faded backdrop word | Partly hidden behind the card |
| H5 | 3D glass card on a pedestal with floating gems | The hero asset |
| H6 | Headline bottom left | "FUEL FOR STARTUPS" + short paragraph + 2 buttons |
| H7 | Stats card bottom right | Launching Startups, success and failure rate, ring at 86%, +4.52% |
| H8 | Social rail, right middle | Instagram, Facebook, X |
| H9 | Scroll hint, bottom center | Mouse icon + "Scroll to explore more" |

The reference only shows the hero. Everything below the hero is ours to design (section 5, F6).

## 5. Features

Priority: P0 must ship, P1 should ship, P2 only if time is left.

| ID | Feature | Pri | Acceptance criteria |
|---|---|---|---|
| F1 | Glass nav | P0 | Sticky, blurred background, active link highlights on scroll, Services dropdown works with keyboard, hamburger under 768px |
| F2 | Hero layout | P0 | Matches reference at 1440 and 1280 wide. No horizontal scroll at 360px |
| F3 | 3D hero video | P0 | Intro plays once, then idle loop. Poster shows instantly. Falls back to a still image if video fails or user prefers reduced motion |
| F4 | Stats card | P0 | Numbers load from `/api/stats`. Ring animates to the score. Count-up on first view. If API is slow or down, default numbers stay visible |
| F5 | Social rail | P1 | Three icon buttons, real focus styles, open in new tab with `rel="noopener"` |
| F6 | Page sections | P0 | About, Services (3 cards), Solution (4 steps), Pricing (3 plans), FAQ (5 items), Footer. Nav links scroll to them |
| F7 | Register / Login | P0 | Modal forms, inline error messages, session persists on refresh, logout works |
| F8 | Application form (Get Started) | P0 | Needs login. Validates on client and server. Saved in MongoDB. Success message shown |
| F9 | Contact form | P1 | Validates, saved in MongoDB, has a hidden honeypot field, rate limited |
| F10 | Dashboard | P1 | Lists my applications with status and history |
| F11 | Admin status change | P2 | Admin can set a status and a note, founder sees it |
| F12 | Scroll reveal | P1 | Sections fade up once. Off when reduced motion is on |
| F13 | Mouse tilt on hero card | P2 | Small move and rotate, desktop only |
| F14 | Language switch | P2 | EN plus one more. Text swapped from a small JSON file |
| F15 | SEO and share card | P1 | Title, description, Open Graph image, favicon |
| F16 | Responsive | P0 | Checked at 360, 768, 1280, 1440 |
| F17 | Accessibility | P0 | Keyboard reachable, visible focus, labels on every input, alt text, contrast checked, motion respects user setting |

## 6. Copy deck (starting point, edit freely)

- Hero headline: **FUEL FOR STARTUPS**
- Hero paragraph: Strategic guidance, funding support, and growth acceleration for early-stage ventures.
- Buttons: Get Started, Contact Us
- Backdrop word: **LAUNCH FUND** (see decision D1)
- Stats card title: Launching Startups
- Stats labels: Success Rate, Failure Rate, launch score ring, growth badge
- Scroll hint: Scroll to explore more
- Footer line: UpFound is a student demo project. It is not a real financial service. All figures are sample data.

## 7. Success metrics

- Lighthouse on mobile: Performance 80+, Accessibility 90+, Best Practices 90+, SEO 90+
- Hero video: intro 3 MB or less, loop 2 MB or less
- Zero console errors on the live site
- All P0 features work on the live URL in Chrome and Firefox, and on a real phone
- You can explain every file in under 2 minutes each

## 8. Decisions

- **D1 Backdrop word.** The reference shows "Legacy Bank" behind a brand called UpFound. That mismatches the message (startups, not banks). Use "LAUNCH FUND". Same length, same look.
- **D2 Plain JS frontend, Flask backend.** Fast to build, and it plays to the stack you know. If the internship requires React, the API stays the same and only `frontend/` changes.
- **D3 Fake data is labeled.** A "86% success rate" claim with no label looks like a real financial claim. Footer disclaimer stays.
- **D4 Hero asset has a fallback.** The asset must never block coding. Build with a placeholder first.
- **D5 Own assets.** Do not crop the reference image into your page. Generate or render your own card, and write your own logo mark.

## 9. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Hero video takes days to get right | High | One-day cap. Fallback is a still image with CSS float |
| Looks copied, no depth | Medium | Backend features, dashboard, and a README that explains choices |
| Render free tier cold start makes the page feel broken | Medium | Page renders fully without the API. Stats have default values in the HTML |
| Beginner React causes a mess | Medium | Plain JS by default (D2) |
| Cannot explain AI-assisted code in review | High | Code style rules and viva prep in `CODE_STYLE.md`. Check the program's AI policy |

## 10. Open questions (answer these before Day 1)

1. What is the exact deadline?
2. Does the internship require a specific stack?
3. Is a live URL required, or is a repo enough?
4. Must the hero match the reference exactly, or only be inspired by it?
5. Is using AI tools (code or Flow assets) allowed, and do they want it disclosed?
