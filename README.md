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
| Hero | A real two-column grid (nothing absolutely positioned, so nothing clips). `$ whoami` types itself and the name decodes as its output. On the right, a live **Lorenz attractor** whose scale is fitted to its measured bounds at any screen size (σ=10, ρ=28, β=8/3, RK4). Click it to drop a "butterfly": a copy of a trail moved by 0.00001. The simulation fast-forwards and the readout shows the gap growing until the two trails take different paths — deterministic is not predictable. Under it turns a small **3D planet** ringed by your skills (see below) that sinks into the next section with no seam. |
| About | Who, facts, "what I work on", and four measured numbers (count up on first view). |
| Projects | Filterable grid. Each card draws a **live SVG sketch** of its project instead of a screenshot (timeline + playhead, radar, three agents racing, notes → Markdown…). Sketches run on hover, always on touch, and **morph** into the case study through React `ViewTransition`. |
| Toolbox | A real CSS-3D orbit of tools around a sphere; skill cards with self-rated levels that open onto the projects proving them. |
| Contact | Copy-to-clipboard email and a form that composes a `mailto:` — nothing is sent or stored by the site. |
| Footer | A seeded procedural skyline with windows switching on and off, reflected in water. |

### The skills planet

`components/scenery/PlanetScene.tsx` — three.js, intentionally simple: a dark
violet sphere with a lit rim and a halo, and your skills as icons turning around
it on two tilted rings — the eight skills I rate highest (they pass in front of and behind the sphere). Drag to
spin; hover an icon to read the skill's name, click to open it on `/expertise`.

- **Data-driven.** The rings are a list in `lib/planet.ts`: put a skill slug (from
  `lib/skills.ts`, with a brand mark) in a ring, or add a ring.
- **Lazy and optional.** `three` (~137 KB gzip) is a separate chunk, requested
  only once the page is idle and only if WebGL works. Without WebGL, with
  `saveData`, or if the context is lost, the SVG planet stays. Under reduced
  motion or when paused, it draws once and stays still.
- **Adaptive.** If frames stay slow it lowers its resolution, then freezes.
- Added dependency: `three` — the original brief (§16, §49) names it for a few
  precise visuals, lazy-loaded, with fallbacks.

### Getting to the detailed pages

A "Pages" menu in the top bar (and a described list in the mobile menu) opens
All projects, Skills in detail, Timeline, Cyber lab and About-longer, each with a
line on what is inside. The same list (`DEEP_PAGES` in `lib/navigation.ts`) feeds
the in-section links, so a page is described once.

### Cursor

A dot that tracks exactly and a spring ring that becomes what a click will do:
**orbit** (a small glass disc, the caption running around its edge, an arrow core — for
`data-cursor="Read the case study"`), **scope** (viewfinder brackets, the exact
dot kept, a tag below — for short labels and skill names: "Drop ε", "Copy", "Spin", "Python"), plain ring
for links, nothing over text fields. Mouse only. Calm by construction: the mode
is resolved on every move and on scroll, and leaving a labelled element is held
for 140 ms, so crossing the gap between two cards does not flicker.

### Page transitions

`app/template.tsx` wraps each page in React's `<ViewTransition>`: the old page
clears out fast (blur + lift), the new one arrives a beat later, blurred and
slightly low, then sharp. The header, the sky and the footer do not move.
Project cards keep their own shared-element morph into the case study. Between
sections of the home page a hairline draws itself out from a glowing node, and
each section's scenery fades toward its own edges — no hard seams.

Plus: a pointer light on glass borders, magnetic buttons, stars that brighten
near the pointer, a ⌘K/Ctrl+K command palette and a terminal easter egg
(`help`, `lorenz`, `open <slug>`…).

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
| `lib/planet.ts` | Which skills orbit the 3D planet, on which ring |

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
- Hero LCP ~0.2 s on a local production build: big text comes into focus from
  a faint blur instead of fading in from nothing.
- Layout checked for horizontal overflow on 9 routes × 14 widths (320 → 2560 px).
  The page container grows from 1240 px to 1560 px on very large screens
  (`--container-site`); the navigation turns into a menu below 1024 px.

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
