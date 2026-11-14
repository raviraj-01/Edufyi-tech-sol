# Design system

Colors, sizes and layout below are eyeballed from the reference screenshot, so treat them as a starting point. Open the reference next to your page and adjust by eye.

## 1. Tokens

Put these in `frontend/css/tokens.css`.

```css
:root {
  /* backgrounds */
  --bg-0: #03140f;
  --bg-1: #062a21;
  --bg-2: #0c4a3a;
  --glow: #1f8f6e;

  /* text */
  --text: #f2fbf7;
  --text-muted: #9bb5ab;

  /* brand */
  --accent: #22c55e;
  --accent-deep: #0f8a4a;
  --lime: #b8f05a;          /* ring and growth badge */
  --danger: #f87171;

  /* glass */
  --glass: rgba(255, 255, 255, 0.06);
  --glass-strong: rgba(255, 255, 255, 0.10);
  --glass-border: rgba(255, 255, 255, 0.12);
  --blur: 14px;

  /* radius */
  --r-sm: 10px;
  --r-md: 14px;
  --r-lg: 22px;
  --r-pill: 999px;

  /* spacing, 4px base */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px;
  --s-5: 24px; --s-6: 32px; --s-7: 48px; --s-8: 72px; --s-9: 120px;

  /* type */
  --font-ui: "Inter", system-ui, sans-serif;
  --font-display: "Inter Tight", "Inter", system-ui, sans-serif;

  /* motion */
  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);
  --t-fast: 150ms;
  --t-base: 300ms;
  --t-slow: 700ms;
}
```

Check the contrast of `--text-muted` on `--bg-1` with a contrast checker. It needs 4.5:1 or better for small text.

## 2. Typography

Google Fonts: Inter (400, 500, 600) and Inter Tight (300, 500, 600).

| Use | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Backdrop word | Inter Tight | `clamp(5rem, 16.5vw, 15rem)` | 300 | Uppercase, opacity 0.25, gradient fill, line-height 0.9 |
| Hero headline | Inter Tight | `clamp(2rem, 3.2vw, 3.2rem)` | 500 | Uppercase, line-height 1.05 |
| Section title | Inter Tight | `clamp(1.75rem, 3vw, 2.75rem)` | 600 | |
| Body | Inter | 1rem | 400 | line-height 1.6 |
| Small / labels | Inter | 0.875rem | 500 | |
| Hero paragraph | Inter | 0.9rem | 400 | `--text-muted`, max-width 34ch |

## 3. Background

Layer these on the `body` or hero wrapper:

```css
background:
  radial-gradient(60% 50% at 50% 55%, rgba(31, 143, 110, 0.55), transparent 70%),
  radial-gradient(100% 80% at 50% 0%, var(--bg-2), transparent 60%),
  linear-gradient(180deg, var(--bg-1), var(--bg-0));
```

Optional film grain: a tiny repeating noise PNG at 4 to 6 percent opacity. It hides banding in the gradient and in the video.

## 4. Glass recipe

```css
.glass {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  border-radius: var(--r-lg);
}
```

Add a soft top highlight with `box-shadow: inset 0 1px 0 rgba(255,255,255,0.12)`.

## 5. Layout (hero at 1440 wide)

| Item | Position |
|---|---|
| Nav pill | top 28px, centered, about 380px wide, height 44px |
| Logo | top left, 32px from the edge |
| Login/Register button | top right, 32px from the edge |
| Backdrop word | centered, top about 18% of hero |
| Video / card | centered, about 24% of the width, spans about 55% of the height |
| Headline + paragraph + buttons | left 5%, bottom 12% |
| Stats card | right 5%, bottom 8%, about 22% wide |
| Social rail | right 3%, vertically centered, vertical pill |
| Scroll hint | bottom center, 16px from the bottom |

Hero height: `min-height: 100svh`. Content max width 1440px, side padding 32px.

## 6. Components

**Nav pill.** Glass, radius pill. Links 14px, 500. Active link gets a lighter filled pill (`--glass-strong`). Services opens a small glass dropdown with 3 items. Language pill is a separate bordered chip with a globe icon and a chevron.

**Primary button.** Gradient `linear-gradient(180deg, var(--accent), var(--accent-deep))`, white text, radius pill, padding 12px 24px, soft green outer glow (`0 6px 24px rgba(34,197,94,0.35)`). Hover: raise 1px and brighten. Focus: 2px outline in `--lime` with 3px offset.

**Secondary button.** `--glass-strong` background, `--glass-border` border, same size as primary.

**Stats card.** Glass, radius `--r-lg`, padding 20px. Top row: title and a small arrow icon. Left column: two rows (label above, value below). Right: SVG ring, lime stroke on a faint track, percentage in the center, a small green growth badge under it with an up arrow.

**Social rail.** Vertical glass pill, three 40px round icon buttons with 12px gap.

**Inputs.** Dark glass fill, 1px border, radius `--r-md`, 48px tall. Focus: border `--accent`, plus a 3px glow. Error: border `--danger`, message below in `--danger` at 13px.

**Modal.** Centered glass panel, max width 440px, dimmed and blurred backdrop, closes on Esc and backdrop click, focus moves into it and returns on close.

**Section cards (Services, Pricing).** Glass cards, radius `--r-lg`, 24px padding. Highlighted plan gets a lime top border and a subtle glow.

## 7. Motion

| What | Behavior |
|---|---|
| Page load | Nav and content fade up, 60ms stagger |
| Hero video | Intro plays once, then loop (see TRD 7.3) |
| Stats | Count-up 1200ms, ring fills with `stroke-dashoffset` transition 1200ms |
| Sections | Fade up 24px over 700ms, once |
| Buttons | 150ms transitions |
| Tilt | Max 12px and 4 degrees, smoothed |

Everything above is switched off under `@media (prefers-reduced-motion: reduce)`.

## 8. Breakpoints

| Name | Width | Changes |
|---|---|---|
| Mobile | under 640px | Nav becomes a hamburger. Backdrop word 28vw. Video centered, stats card moves below the headline, social rail becomes a horizontal row under the buttons |
| Tablet | 640 to 1023px | Nav pill stays, stats card under the headline, card video 40% wide |
| Desktop | 1024px and up | Full reference layout |

Build desktop first, since that is the reference, then adapt down.

## 9. Icons

Inline SVG, 1.5px stroke, rounded caps (Lucide style). Needed: globe, chevron-down, arrow-up-right, arrow-up, instagram, facebook, x, mouse, menu, close, check. Draw the logo as your own simple mark, for example three stacked chevrons pointing up. Do not trace the reference logo.

## 10. Accessibility rules

- Every interactive element has a visible `:focus-visible` style
- Text contrast 4.5:1 or better, large text 3:1
- Do not put important text inside the video
- Backdrop word is decorative, mark it `aria-hidden="true"` and keep the real `<h1>` as the headline
- Modal traps focus and closes with Esc
- Respect reduced motion
