# Portfolio — v2 "Night"

Maxime's portfolio — Next.js 16 (App Router), React 19, TypeScript, Tailwind v4,
Motion. No images, no CMS, no backend: every visual on the site is drawn in SVG
or canvas from code.

The original brief lives in [`PORTFOLIO_SPEC.md`](./PORTFOLIO_SPEC.md) (French).
`AGENTS.md` has environment notes for coding agents.

## Run it locally

Needs **Node.js 20.9+** (https://nodejs.org). Works on Windows, macOS and Linux.

```bash
npm run local            # dev server, hot reload → http://localhost:3000
npm run local -- prod    # production build, then serve it
npm run local -- check   # lint + typecheck + tests + build
npm run local -- dev 4000  # any mode on another port
```

**Windows:** open PowerShell or cmd in the project folder and run the same
commands, or double-click `scripts\local.cmd`. No bash, Git Bash or WSL needed.
`scripts/local.sh` is only a thin wrapper for Linux/macOS habits.

The launcher installs dependencies on first run. Plain npm works too:

```bash
npm ci
npm run dev        # http://localhost:3000
npm run preview    # build + start
npm run check      # everything CI should run
```

## What is on the page

| Section | The idea |
|---|---|
| Hero | `$ whoami` types itself and the name decodes as its output. On the right, a live **Lorenz attractor** (σ=10, ρ=28, β=8/3, RK4). Click it to drop a "butterfly": a copy of a trail moved by 0.00001. The simulation fast-forwards and the readout shows the gap growing until the two trails take different paths — deterministic is not predictable. |
| About | Who, facts, "what I work on", and four measured numbers (count up on first view). |
| Projects | Filterable grid. Each card draws a **live SVG sketch** of its project instead of a screenshot (timeline + playhead, radar, three agents racing, notes → Markdown…). Sketches run on hover, always on touch, and **morph** into the case study through React `ViewTransition`. |
| Toolbox | A real CSS-3D orbit of tools around a sphere; skill cards with self-rated levels that open onto the projects proving them. |
| Contact | Copy-to-clipboard email and a form that composes a `mailto:` — nothing is sent or stored by the site. |
| Footer | A seeded procedural skyline with windows switching on and off, reflected in water. |

Plus: a custom cursor (dot + spring ring that says what a click will do:
"Open", "Drop ε", "Copy", "Proof"), a pointer light on glass borders, magnetic
buttons, stars that brighten near the pointer, a ⌘K/Ctrl+K command palette and
a terminal easter egg (`help`, `lorenz`, `open <slug>`…).

## Content

Everything editable lives in `lib/`, typed:

| File | What |
|---|---|
| `lib/site.ts` | Name, email, links, location/time zone, availability line |
| `lib/projects.ts` | Projects — measured numbers only; `visual` picks the card sketch |
| `lib/skills.ts` | Skills, self-rated scores, the projects proving each one |
| `lib/timeline.ts` | Milestones, oldest first |
| `lib/about.ts` | About copy, facts, focus list, quote |
| `lib/cyber.ts` | Lab page: method, areas, platforms |

Adding a project = one entry in `lib/projects.ts` (pick an existing `visual`, or
add a sketch in `components/projects/visuals/MiniVisual.tsx`). Tests check that
every skill and timeline event points at a project that exists.

## Design system

Tokens are in [`app/globals.css`](./app/globals.css):

| Token | Value | Use |
|---|---|---|
| `night` / `deep` | `#06040f` / `#0d0a1f` | Page / surfaces |
| `ink` / `ink-2` / `ink-3` | `#eeebff` / `#aaa4ca` / `#8a84ad` | Text — all ≥ 4.5:1 on every surface |
| `violet` → `indigo` | `#8b6cff` → `#5b6cff` | The one accent family (gradient words, buttons, light) |
| `signal` | `#5ee9b5` | Availability dot only |
| `lamp` | `#ffb86b` | Skyline windows only — illustration, never UI |

Type: **Bricolage Grotesque** (display), **Geist** / Geist Mono (text, shell
paths), **Kalam** (margin notes). Section eyebrows are shell paths (`~/about`)
that type themselves once.

Custom classes (`.glass`, `.lit`, `.pill`, `.btn-primary`…) **must** live in
`@layer components` — unlayered CSS in Tailwind v4 outranks utilities.

## Motion and accessibility

- One pause button (top bar / mobile menu) stops every ambient animation; the
  choice is remembered. `prefers-reduced-motion` is respected everywhere — with
  motion off, clicking the attractor jumps straight to the diverged result.
- Never branch rendered markup on reduced motion: the server cannot know it.
  `MotionConfig reducedMotion="user"` (in `providers/AppProviders.tsx`) drops
  transforms on the client instead.
- The custom cursor only exists for a mouse; touch and pen keep native input.
- axe-core (WCAG 2 A/AA + best practices): 0 violations on every route.
- Hero LCP ~0.25 s on a local production build: big text comes into focus from
  a faint blur instead of fading in from nothing.

## Project structure

```
app/          routes (App Router), globals.css, OG image
components/   hero/ home/ projects/ scenery/ cursor/ layout/ ui/
              terminal/ command-palette/ timeline/
lib/          typed content + helpers (projects, skills, timeline, site, …)
providers/    AppProviders — palette/terminal state, ⌘K, MotionConfig
assets/fonts/ static TTF for the OG renderer (OFL)
scripts/      local.mjs (launcher), local.cmd / local.sh (wrappers), test.mjs
tests/        node --test (search ranking, commands, terminal, data integrity)
```

Tech marks come from [Simple Icons](https://simpleicons.org) (CC0), inlined in
`lib/tech-marks.ts`.
