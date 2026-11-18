export type ProjectPrivacy = "open-source" | "public" | "private" | "nda";
export type ProjectStatus =
  | "completed"
  | "in-progress"
  | "paused"
  | "archived"
  | "long-term";

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
  | "grid"
  | "shell"
  | "cipher"
  | "modules"
  | "toolkit"
  | "evolution";

export interface ProjectHighlight {
  value: string;
  label: string;
}

/** One step of a project that changed shape over time (shown as a timeline on the case study). */
export interface EvolutionStage {
  /** Short label for the step, e.g. "Today" */
  when: string;
  title: string;
  text: string;
}

export interface ProjectLink {
  label: string;
  href: string;
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
  /** More outbound links (public ones only) */
  extraLinks?: ProjectLink[];

  /** Measured numbers only — never estimates */
  highlights?: ProjectHighlight[];

  // Deep dive (project page)
  contribution?: string[];
  technicalChallenges?: string[];
  architectureSummary?: string;
  results?: string;
  /** For projects that grew in stages: oldest first, last = today */
  evolution?: EvolutionStage[];

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
      "The project I am building toward — the direction I want my work to take. The details stay with me for now.",
    context:
      "Not a side experiment — the direction I want my work to go. I will show more when it is ready to be shown.",
    year: 2026,
    status: "long-term",
    type: "private",
    category: ["Security", "SaaS"],
    role: "Creator",
    technologies: ["Python", "Docker"],
    featured: true,
    order: 2,
    visual: "radar",
    confidentialityNote:
      "Kept private on purpose while the idea is still taking shape.",
  },
  {
    slug: "studyai",
    title: "StudyAI",
    shortDescription:
      "A study toolkit: a revision-sheet website with mind maps, worked examples and quizzes — and a pipeline that turns photos of handwritten notes into Markdown.",
    context:
      "Two halves of one idea: make class material easy to review, and easy to get into the computer in the first place. The site is live; the notes pipeline is in development.",
    year: 2026,
    status: "in-progress",
    type: "open-source",
    category: ["AI", "Web"],
    role: "Creator",
    technologies: ["Python", "FastAPI", "Next.js", "React", "pytest", "HTML", "CSS", "JavaScript"],
    featured: true,
    order: 3,
    visual: "handwriting",
    githubUrl: "https://github.com/MMaxouB/STUDYAI",
    liveUrl: "https://mmaxoub.github.io/fiches-revision/",
    contribution: [
      "Revision site (live): mind maps, worked examples and quizzes whose questions change on every series, written to be read on a phone. Courses, quizzes and past papers each have their own section.",
      "Each revision sheet is produced with Claude from the day's class notes: a skill builds the mind map, timeline and examples, then adds the chapter to the site.",
      "Notes pipeline: FastAPI image preparation (deskew, convert, resize) → vision engine → normalisation, all behind one VisionEngine interface — switching engines is one line in .env.",
      "Next.js front end for it: upload, preview, result and TXT / Markdown export, plus a benchmark runner that works with any engine.",
    ],
    technicalChallenges: [
      "Building the whole notes app on a machine without the target GPU — solved with a mock engine behind the interface.",
      "Keeping structure (headings, bold, underline, tables) instead of flattening everything to plain text.",
      "Making a sheet readable on a 375 px screen without losing the map: one layout for the phone first, the desktop second.",
    ],
    results:
      "Revision site online. Notes pipeline: phase 0 complete and running end to end on the simulated engine; next is benchmarking real vision models on an 8 GB GPU.",
    confidentialityNote:
      "Privacy by default in the notes pipeline: uploaded images are deleted after processing, even on error, and logs never contain the notes themselves.",
  },
  {
    slug: "ctf-labs",
    title: "CTF & pentest labs",
    shortDescription:
      "CTF competitions (CNC 2025, CNC 2026) and regular practice on HackTheBox and TryHackMe: web exploitation, reversing, forensics, crypto, OSINT.",
    context:
      "I play to learn how things break. Every challenge ends in a written write-up and a note on the tool that cracked it — never just a flag.",
    year: 2025,
    status: "in-progress",
    type: "public",
    category: ["Security"],
    role: "Player",
    technologies: ["Kali Linux", "Bash", "Nmap", "Burp Suite", "Metasploit", "Python"],
    featured: true,
    order: 4,
    visual: "shell",
    highlights: [
      { value: "10", label: "CNC 2025 challenges solved and written up" },
      { value: "2", label: "CNC editions: 2025 and 2026" },
      { value: "9", label: "challenge categories, each with a tool sheet" },
    ],
    contribution: [
      "CNC 2025: web, reverse engineering, forensics, crypto and OSINT challenges, each documented from first idea to the working step.",
      "CNC 2026: the same method with the category checklists and tool sheets prepared in advance.",
      "Boot2root machines over VPN on HackTheBox, plus isolated web and reversing challenges; TryHackMe paths on web security and Linux privilege escalation.",
      "A method sheet per phase — recon, foothold, privesc — and one tool sheet per CTF category (OSINT, crypto, forensics, network, web, stego, reverse, misc, hardware), kept open while I work.",
    ],
    technicalChallenges: [
      "Reverse — Aircraft Control System: a key check that refused every input. Disassembled it with objdump, found the conditional jump (JE) that sends a wrong key to “ACCESS DENIED” and flipped one byte (0x74 → 0x75). One byte changed, no need to understand the algorithm.",
      "Web — admin portal: login blocked on POST, so I tried the other HTTP verbs. OPTIONS slipped through and returned data in a response header: a method misconfiguration plus information disclosure. Blocking GET and POST is not enough.",
      "Web — travellers’ documents: a directory-listing misconfiguration on an Nginx alias that left the server’s files browsable.",
      "Forensics — connected-bikes BLE dump: a huge log where a few debug lines were longer than the rest; decoding them from base64 gave the answer.",
      "Log analysis: spotting an outside IP hammering the API with 401s before suddenly reaching the admin area.",
      "Crypto — an affine cipher to invert in Python; OSINT — finding a place from the metadata of a photo.",
    ],
    results:
      "Flags and tokens stay out of this page on purpose: what I keep is the reasoning for each step.",
  },
  {
    slug: "capsa",
    title: "CAPSA",
    shortDescription:
      "An internal web platform under NDA: taken over with no handover and now in active development — we are finishing every planned solution.",
    context:
      "A client platform left half-finished. I started by reading it cold and documenting it; now the work is building out the remaining solutions, one module at a time. Client, code and names stay confidential — here is the shape of the work.",
    year: 2026,
    status: "in-progress",
    type: "nda",
    category: ["Web", "Security"],
    role: "Developer — takeover & delivery",
    technologies: ["FastAPI", "JavaScript", "MariaDB"],
    featured: true,
    order: 5,
    visual: "modules",
    highlights: [
      { value: "43 pp", label: "takeover dossier written before the first change" },
    ],
    contribution: [
      "Taking over: reading the codebase cold, then a 43-page dossier — architecture, applications, diagnosis, roadmap and one decision sheet per choice.",
      "Finishing the planned solutions: completing modules that were stubbed or half-built, with the roadmap as the order of work.",
      "Fixing what exists before adding on top: diagnosing broken flows, tracing errors back to their cause, closing the gaps found in review.",
      "Hardening: access rules, input handling and the way sensitive data is treated, reviewed module by module.",
      "Working safely on someone else’s system: an untouched copy of the original kept before any change, and strict rules on which data is never opened.",
    ],
    technicalChallenges: [
      "Understanding a system with no documentation and no one to ask — every claim in the dossier is tagged as observed, deduced or to be confirmed.",
      "Changing a system someone else designed without breaking what already works.",
    ],
    results:
      "In development: the takeover phase is done, the planned solutions are being delivered. This page will say more once the NDA allows it.",
    confidentialityNote:
      "Client, code, module names and findings are confidential. Only the shape of the work is shown here.",
  },
  {
    slug: "claude-optimisation",
    title: "Claude optimisation",
    shortDescription:
      "Everything I built to make my AI assistant sharper and safer: skills, a plugin, project memory, connectors and a council of agents.",
    context:
      "A good assistant is configured, not just prompted. I treated my own setup as a project: write down what I need, build the tool, test it, keep it in git.",
    year: 2026,
    status: "in-progress",
    type: "private",
    category: ["AI", "Automation"],
    role: "Creator & power user",
    technologies: ["Claude Code", "TypeScript", "Markdown", "MCP", "Git"],
    featured: true,
    order: 6,
    visual: "toolkit",
    highlights: [
      { value: "7", label: "modules in my own plugin" },
      { value: "17", label: "personal skills installed" },
      { value: "5", label: "advisors in the decision council" },
    ],
    contribution: [
      "A plugin of my own, “mes-mods”: seven modules — a secrets guard that hides keys and tokens from the model, a blocker that stops or confirms dangerous commands (forced push, rm -rf, chmod 777), a usage bar, a live “what is it doing now” panel, a git strip, and a pentest checklist panel.",
      "Skills for my own life: one that processes the day’s class photos end to end, one that builds a revision sheet and publishes it to my site, a CV review by seven simulated readers, a hand-over summary for new conversations.",
      "A council: a skill that puts a decision to five AI advisors who rate each other blind, then a chair rules.",
      "Third-party agents and skills put to work: a 14-skill development methodology (brainstorm → plan → worktrees → sub-agents → review), parallel sub-agents for code review and wide searches.",
      "Memory and context: a CLAUDE.md per project, a memory folder per project, and Notion as shared memory so any session starts informed.",
      "Connectors: Notion, Docs, scheduled tasks and browsers wired in, with one reference page listing what each piece does.",
      "Written methods for hard jobs, such as a reusable procedure for taking over an unknown project and documenting it.",
    ],
    technicalChallenges: [
      "Telling apart the five kinds of building block — slash command, skill, CLAUDE.md, MCP connector, plugin — and choosing the lightest one that does the job.",
    ],
    results:
      "This portfolio was itself built with that setup.",
    confidentialityNote: "The plugin lives in a private repository.",
  },
  {
    slug: "workspace",
    title: "Workspace",
    shortDescription:
      "My own working environment, rebuilt three times: from an Obsidian vault driven by a Discord bot to Notion, OneDrive and GitHub with an AI assistant on top.",
    context:
      "Where notes, courses, code and projects live, and how they find each other. It is a project because it keeps changing — and each version taught me what the next one needed.",
    year: 2026,
    status: "in-progress",
    type: "public",
    category: ["Automation"],
    role: "Creator",
    technologies: ["Notion", "OneDrive", "GitHub", "Claude Code", "Python", "discord.py", "Markdown"],
    featured: false,
    order: 7,
    visual: "evolution",
    githubUrl: "https://github.com/MMaxouB/web-app-workplace",
    highlights: [
      { value: "393", label: "tests on the first version" },
      { value: "9,400", label: "lines in the Discord bot" },
    ],
    contribution: [
      "Layered the first bot: Discord cogs → services → repository and writer → Markdown files, with slash commands, autocomplete, forms and one channel per project.",
      "Made writes safe: atomic writes, read-back after saving and restore on anomaly, the vault itself a git repo so any change can be reverted.",
      "Organised the Notion knowledge base: projects, write-ups, courses and a memory database that the assistant can read and update.",
      "Set the rules of the current setup: one source of truth per kind of content, archives instead of deletion, a CLAUDE.md in every project folder.",
    ],
    technicalChallenges: [
      "A YAML load/dump round-trip rewrote 7 lines out of 10 and broke dates — so the bot edited frontmatter line by line, never regenerated it.",
      "Choosing one source of truth per kind of thing: Notion for knowledge, OneDrive for working files, GitHub for code.",
    ],
    evolution: [
      {
        when: "Start",
        title: "Obsidian × Discord",
        text: "A Markdown vault kept as the source of truth, and a Discord bot on top: slash commands with autocomplete, one channel per project with a pinned panel that survives restarts, atomic writes with read-back, the vault versioned in git. Ran on a 1 vCPU, 1 GB VM with no database. 393 tests, about 9,400 lines.",
      },
      {
        when: "Then",
        title: "Notion",
        text: "The vault moved into Notion: projects, write-ups, courses and a memory database in one place, searchable and linkable, with pages the assistant can read.",
      },
      {
        when: "Today",
        title: "Notion + OneDrive + GitHub, with Claude",
        text: "Notion holds what I know, OneDrive holds what I work on (courses, cyber, code, with an archive folder where nothing is deleted), GitHub holds the code. Claude Code works across all three with connectors, per-project instructions and shared memory.",
      },
    ],
    architectureSummary:
      "Today: Notion = knowledge, OneDrive = working files and archives, GitHub = code. The assistant sits on top with a connector to each and a CLAUDE.md per project folder.",
  },
  {
    slug: "agent-orchestrator",
    title: "Multi-AI Orchestrator",
    shortDescription:
      "An early experiment in comparing assistants: one question in, several answers scored, the best one kept.",
    year: 2026,
    status: "archived",
    type: "private",
    category: ["AI", "Automation"],
    role: "Creator",
    technologies: ["Node.js", "JavaScript", "JSON Schema"],
    featured: false,
    order: 8,
    visual: "fanout",
    contribution: [
      "Built the pipeline end to end: input → dispatch → extraction → comparison → selection → storage.",
      "Cleaned and normalised answers from different sources into one format so they could be compared.",
      "Scored the answers to keep the best one automatically.",
      "Documented every module in its own file.",
    ],
    technicalChallenges: [
      "Each assistant answers in its own format, so extraction and cleaning had to be written per source before any comparison made sense.",
    ],
    architectureSummary:
      "One input fans out to several agents. Each returns raw text; an extraction step cleans it, a comparison step scores it, and the selected answer is stored with its score.",
    confidentialityNote: "Archived experiment — it taught me what a proper comparison harness needs. The code stays private.",
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
    order: 9,
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
    slug: "crypto-python",
    title: "Crypto-Python",
    shortDescription:
      "Ciphers re-implemented from scratch, from Caesar to AES, after a two-day cryptography training — to understand how they work and how they fail.",
    context:
      "I took two days of cryptography training, then wrote the algorithms myself instead of calling a library: you only really understand a cipher once you have had to invert it.",
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
    highlights: [
      { value: "2 days", label: "of cryptography training behind it" },
      { value: "6", label: "algorithms, each with encrypt and decrypt" },
      { value: "12", label: "round-trip tests in one suite" },
    ],
    contribution: [
      "Three levels: Caesar and Vigenère at level 1, monoalphabetic substitution and transposition at level 2, XOR and AES file encryption at level 3.",
      "Caesar: letter rotation with modular arithmetic, a separate mod-10 rotation for digits, case preserved.",
      "Vigenère: the key repeated only over letters, so spaces and punctuation do not shift it; decryption adds 26 before the modulo.",
      "Substitution: a key checked as a valid permutation of the alphabet before anything is encrypted, separate keys for upper and lower case.",
      "XOR and AES: byte-level work, hex round-trips and file encryption, with temporary files cleaned up by the tests.",
      "Each algorithm ships with its own input and output sets, plus a test_all suite that checks encrypt and decrypt for every module.",
    ],
    technicalChallenges: [
      "Getting the edge cases right: keeping case, skipping non-letters, and not letting the key drift out of step.",
      "Writing decryption as carefully as encryption — a cipher that cannot be inverted is not a cipher.",
    ],
    results:
      "Educational code, not for protecting real data: use audited libraries for that. It is a study of how the primitives work.",
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
    featured: false,
    order: 11,
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
    featured: false,
    order: 12,
    visual: "query",
    contribution: [
      "Designed flux, a pipeline query language for tabular data.",
      "Wrote its lexer, parser, type checker, expression compiler and a columnar execution engine by hand.",
      "Built the workbench around it: syntax-highlighted editor, virtualised tables, SVG charts and statistical profiling.",
    ],
    confidentialityNote: "Kept local for now — no public repository yet.",
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
  "long-term": "Long-term",
};
