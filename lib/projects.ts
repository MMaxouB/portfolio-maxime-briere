export type ProjectPrivacy = "open-source" | "public" | "private" | "nda";
export type ProjectStatus =
  | "completed"
  | "in-progress"
  | "paused"
  | "archived";

/**
 * Closed tag vocabulary (PORTFOLIO_SPEC §5.6): tags describe the *nature* of a
 * project, never its stack. Open Source / Private / NDA are not listed here —
 * they come from `type` and are rendered separately, so a tag never repeats it.
 */
export const PROJECT_TAGS = [
  "SaaS",
  "AI",
  "Web",
  "Automation",
  "Security",
  "Research",
] as const;

export type ProjectTag = (typeof PROJECT_TAGS)[number];

/** Which live mini-UI a card draws in place of a screenshot. */
export type ProjectVisual =
  | "timeline"
  | "radar"
  | "fanout"
  | "handwriting"
  | "query"
  | "audio"
  | "panel"
  | "grid"
  | "shell"
  | "cipher"
  | "dossier";

export interface ProjectHighlight {
  value: string;
  label: string;
}

export interface Project {
  slug: string;
  title: string;
  shortDescription: string;
  /** Why it exists — one or two sentences, shown at the top of the case study */
  context?: string;
  year: number;
  status: ProjectStatus;
  type: ProjectPrivacy;
  category: ProjectTag[];
  role: string;
  technologies: string[];
  featured: boolean;
  order: number;
  visual: ProjectVisual;

  // Optional links depending on privacy level
  githubUrl?: string;
  liveUrl?: string;

  /** Measured numbers only — never estimates */
  highlights?: ProjectHighlight[];

  // Deep dive (project page)
  contribution?: string[];
  technicalChallenges?: string[];
  architectureSummary?: string;
  results?: string;

  /** Shown on private / NDA projects */
  confidentialityNote?: string;
}

/**
 * Sources: the project sheets in Notion (Knowledges base / Projets), checked
 * 2026-11-18. Numbers are the ones written there, not rounded up.
 */
const projects: Project[] = [
  {
    slug: "ai-video-editor",
    title: "AI Video Editor",
    shortDescription:
      "A browser video editor with AI tools built into the toolbar: auto-subtitles, smart trim and colour grading.",
    context:
      "An editor in the style of CapCut, not a video generator. Two people, one product: I co-own it and build it full-stack.",
    year: 2026,
    status: "in-progress",
    type: "public",
    category: ["AI", "SaaS"],
    role: "Co-owner & full-stack developer",
    technologies: [
      "TypeScript",
      "Next.js",
      "Zustand",
      "WebGL2",
      "Web Audio",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Redis",
      "Celery",
      "FFmpeg",
      "AWS S3",
    ],
    featured: true,
    order: 1,
    visual: "timeline",
    githubUrl: "https://github.com/PARTH-CODE2012/zipzop-backend",
    highlights: [
      { value: "85 fps", label: "1080p compositing in the browser" },
      { value: "892", label: "automated tests (524 back, 368 front)" },
      { value: "29", label: "security findings fixed, each with a test" },
    ],
    contribution: [
      "Wrote the architecture before the code: product vision, phase-1 scope, API contract and 14 diagrams, approved by the lead.",
      "Built the WebGL2 compositor: clips chained with live colour grading, subtitles on top, cuts and crossfades with zero black frames.",
      "Built the timeline editor: tracks, editing, patch-based undo/redo, autosave and server-side versions.",
      "Shipped the three AI tools with credits reserved then settled, and idempotency keys so a replayed request returns the same job.",
      "Ran the security milestone: 29 findings, 2 of them critical, every one fixed with a regression test.",
    ],
    technicalChallenges: [
      "Proving the browser could composite 1080p video in real time before building anything on it — measured frame by frame: 85 fps on desktop, 29.5 fps on iPhone Safari, 0 frames dropped out of 89.",
      "A cross-origin proxy video loaded, played and reported ready — but drew black in WebGL. The media element was missing crossOrigin.",
      "Two concurrent jobs could spend the same credits. Closed with reservations and idempotency keys.",
    ],
    architectureSummary:
      "A Next.js client editor (Zustand + Immer for the timeline, TanStack Query for server state, WebGL2 and Web Audio for playback) talks to a FastAPI backend. PostgreSQL stores projects; Redis and Celery run ingestion, AI and export jobs; FFmpeg builds proxies and exports; media lives in S3 behind CloudFront.",
    results:
      "Phase 1 complete: milestones M0 to M7 closed, CI green on all eight jobs.",
  },
  {
    slug: "futur",
    title: "FUTUR",
    shortDescription:
      "A defensive, non-destructive web security scanner that ranks what it finds by risk and writes a report anyone can read.",
    context:
      "A startup idea called Continuous Automated Cyber Defense: replace the once-a-year pentest with continuous, automated testing, prioritised by business impact.",
    year: 2026,
    status: "paused",
    type: "private",
    category: ["Security", "SaaS"],
    role: "Creator",
    technologies: ["Python", "Flask", "SQLite", "Docker", "CI"],
    featured: true,
    order: 2,
    visual: "radar",
    contribution: [
      "Wrote the scope, the legal framework, an evidence contract and a network-posture contract before writing any code.",
      "Built the scanner MVP in Python and Flask: network detections validated in a lab, risk scoring and a job queue.",
      "Designed the output so a non-technical reader can see what matters first.",
      "Packaged it with Docker and a CI pipeline (phase 3, closed).",
    ],
    technicalChallenges: [
      "Every check had to stay non-destructive, so the scanner can run against a live asset safely.",
      "Ranking findings with a written risk model instead of raw severity scores.",
    ],
    results: "Phase 3 closed: Docker image and CI in place. The project is paused, not abandoned.",
    confidentialityNote:
      "The repository is private while the product idea is still taking shape.",
  },
  {
    slug: "agent-orchestrator",
    title: "Multi-AI Orchestrator",
    shortDescription:
      "Sends one question to ChatGPT, Claude and Gemini at the same time, then scores the answers and keeps the best one.",
    year: 2026,
    status: "paused",
    type: "open-source",
    category: ["AI", "Automation"],
    role: "Creator",
    technologies: ["Node.js", "JavaScript", "Playwright", "JSON Schema"],
    featured: true,
    order: 3,
    visual: "fanout",
    githubUrl: "https://github.com/MMaxouB/bot_power_ia",
    highlights: [
      { value: "3", label: "AI chats driven in parallel" },
      { value: "27", label: "work sessions in two weeks" },
    ],
    contribution: [
      "Built the pipeline end to end: input listener → dispatch → extraction → comparison → selection → storage.",
      "Drove three chat interfaces in parallel with Playwright, then cleaned and normalised their answers.",
      "Compared and scored the answers to keep the best one automatically.",
      "Documented every code module in its own file, plus a 156 KB changelog.",
    ],
    technicalChallenges: [
      "Each AI answers through its own web interface, so extraction and cleaning had to be written per agent before any comparison made sense.",
    ],
    architectureSummary:
      "One input fans out to three browser agents (one per AI). Each returns raw text; an extraction step cleans it, a comparison step scores it, and the selected answer is stored with its score.",
  },
  {
    slug: "studyai",
    title: "StudyAI",
    shortDescription:
      "Turns photos of handwritten class notes into clean Markdown — locally, with the images deleted right after.",
    context:
      "Photograph a page of notes, get text you can work with, without typing it again. StudyAI stops at the text on purpose: summaries and exercises are another tool's job.",
    year: 2026,
    status: "in-progress",
    type: "open-source",
    category: ["AI"],
    role: "Creator",
    technologies: ["Python", "FastAPI", "Next.js", "React", "pytest"],
    featured: true,
    order: 4,
    visual: "handwriting",
    githubUrl: "https://github.com/MMaxouB/STUDYAI",
    contribution: [
      "Built the FastAPI pipeline: image preparation (deskew, convert, resize) → vision engine → normalisation.",
      "Put all vision behind one VisionEngine interface: switching engines is one line in .env.",
      "Built the Next.js front end: upload, preview, result and TXT / Markdown export.",
      "Wrote a benchmark runner with evaluation metrics that works with any engine.",
    ],
    technicalChallenges: [
      "Building the whole app on a machine without the target GPU — solved with a mock engine behind the interface.",
      "Keeping structure (headings, bold, underline, tables) instead of flattening everything to plain text.",
    ],
    results:
      "Phase 0 complete: runs end to end on the simulated engine. Next: benchmark real vision models on an 8 GB GPU.",
    confidentialityNote:
      "Privacy by default: uploaded images are deleted after processing, even on error, and logs never contain the notes themselves.",
  },
  {
    slug: "prisme",
    title: "PRISME",
    shortDescription:
      "An offline data workbench with its own query language — lexer, parser, type checker and engine written by hand, zero dependencies.",
    context:
      "A test of how far plain JavaScript can go on an ambitious project without installing a single package.",
    year: 2026,
    status: "completed",
    type: "private",
    category: ["Web", "Research"],
    role: "Creator",
    technologies: ["JavaScript", "SVG", "Canvas"],
    featured: true,
    order: 5,
    visual: "query",
    contribution: [
      "Designed flux, a pipeline query language for tabular data.",
      "Wrote its lexer, parser, type checker, expression compiler and a columnar execution engine by hand.",
      "Built the workbench around it: syntax-highlighted editor, virtualised tables, SVG charts and statistical profiling.",
    ],
    confidentialityNote: "Kept local for now — no public repository yet.",
  },
  {
    slug: "onde",
    title: "ONDE",
    shortDescription:
      "A music streaming home page whose background takes the colours of the album cover and moves with the bass and the beat.",
    context:
      "A prototype built from a Figma mock-up for someone who asked for it. It opens by double-clicking index.html: no build, no framework.",
    year: 2026,
    status: "in-progress",
    type: "private",
    category: ["Web"],
    role: "Creator",
    technologies: ["JavaScript", "Web Audio", "HTML", "CSS", "Python", "Flask"],
    featured: true,
    order: 6,
    visual: "audio",
    contribution: [
      "Built the home page and the full player in plain HTML, CSS and JavaScript.",
      "Wrote a Web Audio analyser that detects bass and beats and drives the animated background.",
      "Pulled the palette from each cover so the scene matches the music.",
      "Added an optional read-only Flask API over a local music library.",
    ],
    technicalChallenges: [
      "Chrome blocks ES modules over file://, so the app loads twelve numbered scripts in order instead.",
    ],
    confidentialityNote: "Commissioned prototype — the repository stays private.",
  },
  {
    slug: "obsidian-discord",
    title: "Obsidian × Discord workspace",
    shortDescription:
      "Turns a private Discord server into a real interface for an Obsidian vault: panels, menus, forms and live counters.",
    year: 2026,
    status: "archived",
    type: "public",
    category: ["Automation"],
    role: "Creator",
    technologies: ["Python", "discord.py", "PyYAML", "pytest"],
    featured: false,
    order: 7,
    visual: "panel",
    githubUrl: "https://github.com/MMaxouB/web-app-workplace",
    highlights: [
      { value: "393", label: "tests" },
      { value: "9,400", label: "lines of code" },
    ],
    contribution: [
      "Layered the bot: Discord cogs → services → repository and writer → Markdown files.",
      "Made writes safe: line-by-line frontmatter edits, atomic writes, read-back and restore on anomaly.",
      "Built slash commands with autocomplete, project panels with buttons and forms, and a dashboard.",
      "Each project gets its own channel, created automatically with a pinned panel that survives restarts.",
    ],
    technicalChallenges: [
      "A YAML load/dump round-trip rewrote 7 lines out of 10 and broke dates — so frontmatter is edited line by line, never regenerated.",
      "It had to run on a 1 vCPU, 1 GB VM: no database, the vault is the source of truth.",
    ],
    architectureSummary:
      "Discord cogs handle interaction, services hold the business rules, a repository reads and a writer edits the vault's Markdown files. The vault itself is a git repo, so any change can be reverted.",
  },
  {
    slug: "templates-web",
    title: "Templates Web",
    shortDescription:
      "A catalogue of web page layouts designed not to look alike — with tools that measure whether they do.",
    year: 2026,
    status: "in-progress",
    type: "open-source",
    category: ["Web", "Research"],
    role: "Creator",
    technologies: ["HTML", "CSS", "JavaScript", "Node.js"],
    featured: false,
    order: 8,
    visual: "grid",
    githubUrl: "https://github.com/MMaxouB/templates_web",
    highlights: [
      { value: "43/43", label: "variants passing every check" },
      { value: "0", label: "design-DNA collisions" },
    ],
    contribution: [
      "Split every page into three independent layers: structure, art direction and palette.",
      "Defined a design DNA on nine axes, with consequences you can measure.",
      "Wrote the tooling: contrast checks on 16 colour pairs, a DNA coverage report, a constraint budget and a perceptual diff between renders.",
    ],
    technicalChallenges: [
      "Lot 1 was technically perfect and visually interchangeable. The checks measured correctness, never difference — so production stopped until there was a way to prove divergence.",
      "A symmetry metric averaged over empty cells and called every airy page centred. It was rebuilt and recalibrated on known cases.",
    ],
    results:
      "31 layouts written, 43/43 described variants compliant, anti-reflex budget at 1.1 for a ceiling of 6, centred compositions down to 14%.",
  },
  {
    slug: "ctf-labs",
    title: "CTF & pentest labs",
    shortDescription:
      "Regular practice on HackTheBox and TryHackMe: web exploitation, privilege escalation, reversing.",
    year: 2025,
    status: "in-progress",
    type: "public",
    category: ["Security"],
    role: "Player",
    technologies: ["Kali Linux", "Bash", "Nmap", "Burp Suite", "Metasploit", "Python"],
    featured: false,
    order: 9,
    visual: "shell",
    contribution: [
      "Boot2root machines over VPN on HackTheBox, plus isolated web and reversing challenges.",
      "TryHackMe learning paths on web security and Linux privilege escalation.",
      "Method sheets for each phase — recon, foothold, privesc — kept open while I work.",
    ],
    technicalChallenges: [
      "Chaining several small weaknesses into one path to root.",
      "Reading unfamiliar binaries carefully enough to find what they hide.",
    ],
  },
  {
    slug: "crypto-python",
    title: "Crypto-Python",
    shortDescription:
      "Ciphers re-implemented from scratch, from Caesar to AES, to understand how they work and how they fail.",
    year: 2025,
    status: "completed",
    type: "open-source",
    category: ["Security", "Research"],
    role: "Creator",
    technologies: ["Python"],
    featured: false,
    order: 10,
    visual: "cipher",
    githubUrl: "https://github.com/MMaxouB/Crypto-Python",
    contribution: [
      "Three levels: Caesar and substitution, then Vigenère and transposition, then XOR and AES.",
      "Each algorithm ships with its own input and output sets.",
    ],
  },
  {
    slug: "platform-takeover",
    title: "Internal platform takeover",
    shortDescription:
      "Picked up an internal web platform left half-finished by a departing developer, with no handover at all.",
    year: 2026,
    status: "in-progress",
    type: "nda",
    category: ["Web"],
    role: "Technical takeover",
    technologies: ["FastAPI", "JavaScript", "MariaDB"],
    featured: false,
    order: 11,
    visual: "dossier",
    contribution: [
      "Read the codebase cold and wrote a 43-page takeover dossier: architecture, applications, diagnosis, roadmap and decision sheets.",
      "Kept an untouched copy of the original before any change, and strict rules on which data is never opened.",
    ],
    confidentialityNote:
      "Client, code and findings are confidential. Only the shape of the work is shown here.",
  },
];

export function getProjects(): Project[] {
  // Copy first — sort() mutates, and this array is shared module state.
  return [...projects].sort((a, b) => a.order - b.order);
}

export function getFeaturedProjects(): Project[] {
  return getProjects().filter((p) => p.featured);
}

export function getSecurityProjects(): Project[] {
  return getProjects().filter((p) => p.category.includes("Security"));
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const PRIVACY_LABELS: Record<ProjectPrivacy, string> = {
  "open-source": "Open source",
  public: "Public",
  private: "Private",
  nda: "NDA",
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  paused: "Paused",
  archived: "Archived",
};
