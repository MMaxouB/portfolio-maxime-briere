export interface TimelineEvent {
  year: string;
  /** Optional finer date, shown next to the year ("Aug") */
  month?: string;
  title: string;
  description: string;
  area: "software" | "security" | "ai" | "learning";
  projectSlugs?: string[];
  technologies?: string[];
}

/** Oldest first. Dates come from the project sheets in Notion. */
export const TIMELINE: TimelineEvent[] = [
  {
    year: "2024",
    title: "First Python projects",
    description:
      "First real scripts: file processors, API wrappers, small CLI tools. Python became the main language.",
    area: "learning",
    technologies: ["Python"],
  },
  {
    year: "2024",
    title: "Linux as a daily driver",
    description:
      "Moved to Linux full-time — today Kali. Permissions, processes and shell scripting, learned by living in them.",
    area: "learning",
    technologies: ["Linux", "Bash"],
  },
  {
    year: "2025",
    title: "CTFs and web security",
    description:
      "HackTheBox and TryHackMe: OWASP Top 10, authentication flaws, privilege escalation, then reversing.",
    area: "security",
    projectSlugs: ["ctf-labs"],
    technologies: ["Burp Suite", "Nmap", "Metasploit"],
  },
  {
    year: "2025",
    month: "Dec",
    title: "Ciphers by hand",
    description:
      "Re-implemented ciphers from Caesar to AES, and a prime-number generator with multiprocessing and a segmented sieve.",
    area: "security",
    projectSlugs: ["crypto-python"],
    technologies: ["Python"],
  },
  {
    year: "2026",
    month: "Feb",
    title: "FUTUR — a scanner MVP",
    description:
      "A defensive web security scanner with its legal framework and risk model written before the code.",
    area: "security",
    projectSlugs: ["futur"],
    technologies: ["Python", "Flask", "Docker"],
  },
  {
    year: "2026",
    month: "Jul",
    title: "One question, several AIs",
    description:
      "An experiment in Node.js: send one question to several AI assistants, score the answers and keep the best.",
    area: "ai",
    projectSlugs: ["agent-orchestrator"],
    technologies: ["Node.js", "JSON Schema"],
  },
  {
    year: "2026",
    month: "Aug",
    title: "Co-owner of an AI video editor",
    description:
      "Architecture first, then the build: a WebGL compositor, a timeline editor, three AI tools, billing and a security milestone.",
    area: "software",
    projectSlugs: ["ai-video-editor"],
    technologies: ["Next.js", "FastAPI", "PostgreSQL", "WebGL2"],
  },
  {
    year: "2026",
    month: "Aug",
    title: "A month of systems",
    description:
      "The first workspace (an Obsidian vault run from Discord, 393 tests), StudyAI, the PRISME workbench, a template catalogue and this portfolio's first version.",
    area: "software",
    projectSlugs: ["workspace", "studyai", "prisme", "templates-web"],
    technologies: ["Python", "TypeScript", "JavaScript"],
  },
  {
    year: "2026",
    month: "Oct",
    title: "Breaking my own product",
    description:
      "The video editor's security review: 29 findings, 2 critical, all fixed with a test. CI green on all eight jobs.",
    area: "security",
    projectSlugs: ["ai-video-editor"],
  },
  {
    year: "2026",
    month: "Nov",
    title: "Client work",
    description:
      "ONDE, a music streaming prototype, and an internal platform taken over under NDA — now in active development. Plus a plugin, skills and memory built around my own AI assistant.",
    area: "software",
    projectSlugs: ["onde", "confidential-platform", "claude-optimisation"],
  },
];

export const AREA_LABELS: Record<TimelineEvent["area"], string> = {
  software: "Software",
  security: "Security",
  ai: "AI / Systems",
  learning: "Learning",
};

/** One hue family (§1.2): areas differ by mark shape, not colour. */
export const AREA_MARKS: Record<TimelineEvent["area"], string> = {
  software: "bg-violet",
  security: "border border-violet bg-transparent",
  ai: "bg-lilac",
  learning: "border border-line-strong bg-transparent",
};

export const AREA_TEXT_COLORS: Record<TimelineEvent["area"], string> = {
  software: "text-lilac",
  security: "text-lilac",
  ai: "text-ink-2",
  learning: "text-ink-3",
};
