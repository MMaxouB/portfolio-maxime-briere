import type { TechSlug } from "./tech-marks";

export type SkillCategory =
  | "language"
  | "backend"
  | "frontend"
  | "ai"
  | "security"
  | "tools";

/** Lucide glyph names used when no brand mark exists for a skill. */
export type SkillGlyph =
  | "server"
  | "layers"
  | "sparkles"
  | "bot"
  | "brain"
  | "workflow"
  | "radar"
  | "key"
  | "globe";

export interface Skill {
  slug: string;
  name: string;
  category: SkillCategory;
  /** 0–100 — personal proficiency indicator, not a scientific score */
  score: number;
  levelLabel: "Advanced" | "Proficient" | "Developing";
  description?: string;
  /** Brand mark (Simple Icons) or a neutral glyph */
  mark: { brand: TechSlug } | { glyph: SkillGlyph };
  /** Slugs of projects in lib/projects.ts that prove this skill */
  projectSlugs: string[];
}

/**
 * Scores are Maxime's own reading of his level (spec §8.2) — they are meant to
 * move. Skills marked `// v2` were added with the redesign and carry a first
 * estimate from the project evidence: adjust them freely.
 */
export const SKILLS: Skill[] = [
  // Languages
  {
    slug: "python",
    name: "Python",
    category: "language",
    score: 88,
    levelLabel: "Advanced",
    description:
      "My main language: APIs, automation, scanners, bots, simulations and crypto experiments.",
    mark: { brand: "python" },
    projectSlugs: ["ai-video-editor", "futur", "studyai", "obsidian-discord", "crypto-python", "ctf-labs"],
  },
  {
    slug: "typescript",
    name: "TypeScript",
    category: "language",
    score: 82,
    levelLabel: "Advanced",
    description: "Strict mode everywhere. The video editor's whole client is TypeScript.",
    mark: { brand: "typescript" },
    projectSlugs: ["ai-video-editor"],
  },
  {
    slug: "javascript",
    name: "JavaScript",
    category: "language",
    score: 80,
    levelLabel: "Advanced",
    description: "Plain JS when I want zero dependencies — PRISME has none at all.",
    mark: { brand: "javascript" },
    projectSlugs: ["prisme", "onde", "agent-orchestrator", "templates-web"],
  },
  {
    slug: "html-css",
    name: "HTML / CSS",
    category: "language",
    score: 78,
    levelLabel: "Proficient",
    description: "Semantic markup, Grid, custom properties, and layouts that hold on a phone.",
    mark: { brand: "html5" },
    projectSlugs: ["templates-web", "onde", "prisme"],
  },
  {
    slug: "bash",
    name: "Bash",
    category: "language",
    score: 70, // v2
    levelLabel: "Proficient",
    description: "Glue scripts, recon one-liners and everything around a Kali shell.",
    mark: { brand: "gnubash" },
    projectSlugs: ["ctf-labs"],
  },

  // Backend
  {
    slug: "backend-engineering",
    name: "Backend engineering",
    category: "backend",
    score: 84,
    levelLabel: "Advanced",
    description: "API contracts, job queues, data models and the failure paths around them.",
    mark: { glyph: "server" },
    projectSlugs: ["ai-video-editor", "futur", "studyai", "obsidian-discord"],
  },
  {
    slug: "fastapi",
    name: "FastAPI",
    category: "backend",
    score: 80, // v2
    levelLabel: "Advanced",
    description: "Typed endpoints with an OpenAPI contract shared with the front end.",
    mark: { brand: "fastapi" },
    projectSlugs: ["ai-video-editor", "studyai", "platform-takeover"],
  },
  {
    slug: "software-architecture",
    name: "Software architecture",
    category: "backend",
    score: 76,
    levelLabel: "Proficient",
    description: "Clear boundaries, written before the code, and checked once the code exists.",
    mark: { glyph: "layers" },
    projectSlugs: ["ai-video-editor", "obsidian-discord", "templates-web", "platform-takeover"],
  },
  {
    slug: "postgresql",
    name: "PostgreSQL",
    category: "backend",
    score: 68, // v2
    levelLabel: "Proficient",
    description: "Schemas and Alembic migrations, tested against a real database, not a mock.",
    mark: { brand: "postgresql" },
    projectSlugs: ["ai-video-editor"],
  },
  {
    slug: "docker",
    name: "Docker",
    category: "backend",
    score: 70, // v2
    levelLabel: "Proficient",
    description: "Compose stacks for local dev and CI: Postgres, Redis, MinIO.",
    mark: { brand: "docker" },
    projectSlugs: ["ai-video-editor", "futur"],
  },
  {
    slug: "flask",
    name: "Flask",
    category: "backend",
    score: 72, // v2
    levelLabel: "Proficient",
    description: "Small servers that do one job: a scanner UI, a read-only music API.",
    mark: { brand: "flask" },
    projectSlugs: ["futur", "onde"],
  },

  // Frontend
  {
    slug: "nextjs",
    name: "Next.js / React",
    category: "frontend",
    score: 76, // v2
    levelLabel: "Proficient",
    description: "App Router front ends, including a full client-side video editor.",
    mark: { brand: "nextdotjs" },
    projectSlugs: ["ai-video-editor", "studyai"],
  },
  {
    slug: "webgl-webaudio",
    name: "WebGL & Web Audio",
    category: "frontend",
    score: 62, // v2
    levelLabel: "Developing",
    description: "A real-time video compositor and an audio analyser that finds the beat.",
    mark: { brand: "webgl" },
    projectSlugs: ["ai-video-editor", "onde"],
  },

  // AI
  {
    slug: "ai-integration",
    name: "AI integration",
    category: "ai",
    score: 80,
    levelLabel: "Proficient",
    description: "Putting models inside real products: credits, retries, idempotent jobs.",
    mark: { glyph: "sparkles" },
    projectSlugs: ["ai-video-editor", "studyai", "agent-orchestrator"],
  },
  {
    slug: "agent-systems",
    name: "Agent systems",
    category: "ai",
    score: 75,
    levelLabel: "Proficient",
    description: "Fan-out to several models, then compare and select.",
    mark: { glyph: "bot" },
    projectSlugs: ["agent-orchestrator"],
  },
  {
    slug: "llm-applications",
    name: "LLM applications",
    category: "ai",
    score: 74,
    levelLabel: "Proficient",
    description: "Extraction, scoring and generation with language models, in practice.",
    mark: { glyph: "brain" },
    projectSlugs: ["agent-orchestrator", "ai-video-editor"],
  },

  // Tools
  {
    slug: "git",
    name: "Git",
    category: "tools",
    score: 85,
    levelLabel: "Advanced",
    description: "Branches, pull requests and history worth reading.",
    mark: { brand: "git" },
    projectSlugs: ["ai-video-editor", "obsidian-discord", "templates-web"],
  },
  {
    slug: "automation",
    name: "Automation",
    category: "tools",
    score: 82,
    levelLabel: "Advanced",
    description: "Bots, pipelines and measuring tools that do the boring part for me.",
    mark: { glyph: "workflow" },
    projectSlugs: ["agent-orchestrator", "obsidian-discord", "templates-web"],
  },
  {
    slug: "playwright",
    name: "Playwright",
    category: "tools",
    score: 72, // v2
    levelLabel: "Proficient",
    description: "Driving real browsers — three AI chats at once.",
    mark: { glyph: "globe" },
    projectSlugs: ["agent-orchestrator"],
  },

  // Security
  {
    slug: "linux",
    name: "Linux",
    category: "security",
    score: 83,
    levelLabel: "Advanced",
    description: "Kali is my daily OS: shell, permissions, processes, services.",
    mark: { brand: "kalilinux" },
    projectSlugs: ["ctf-labs", "obsidian-discord"],
  },
  {
    slug: "web-security",
    name: "Web security",
    category: "security",
    score: 80,
    levelLabel: "Advanced",
    description: "OWASP Top 10, auth and session flaws — found in labs, fixed in real code.",
    mark: { brand: "burpsuite" },
    projectSlugs: ["ai-video-editor", "futur", "ctf-labs"],
  },
  {
    slug: "pentesting",
    name: "Penetration testing",
    category: "security",
    score: 74,
    levelLabel: "Proficient",
    description: "Boot2root machines: recon, foothold, privilege escalation.",
    mark: { brand: "hackthebox" },
    projectSlugs: ["ctf-labs", "futur"],
  },
  {
    slug: "cryptography",
    name: "Cryptography",
    category: "security",
    score: 66, // v2
    levelLabel: "Developing",
    description: "Ciphers rebuilt by hand, from Caesar to AES, to see where they break.",
    mark: { glyph: "key" },
    projectSlugs: ["crypto-python"],
  },
  {
    slug: "osint",
    name: "OSINT",
    category: "security",
    score: 65,
    levelLabel: "Developing",
    description: "Passive reconnaissance and footprinting from open sources.",
    mark: { glyph: "radar" },
    projectSlugs: ["ctf-labs"],
  },
];

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  language: "Languages",
  backend: "Backend",
  frontend: "Frontend",
  ai: "AI",
  security: "Security",
  tools: "Tools",
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  "language",
  "backend",
  "frontend",
  "ai",
  "tools",
  "security",
];

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return SKILLS.filter((s) => s.category === category);
}

export function getSkillBySlug(slug: string): Skill | undefined {
  return SKILLS.find((s) => s.slug === slug);
}

/**
 * Homepage shows 8 skills, not the whole list (§8.4). One per category first so
 * the preview reads as a range, then the next best, highest score first.
 */
export function getHeadlineSkills(limit = 8): Skill[] {
  const byScore = [...SKILLS].sort((a, b) => b.score - a.score);
  const picked: Skill[] = [];
  const seen = new Set<SkillCategory>();

  for (const skill of byScore) {
    if (seen.has(skill.category)) continue;
    seen.add(skill.category);
    picked.push(skill);
  }
  for (const skill of byScore) {
    if (picked.length >= limit) break;
    if (!picked.includes(skill)) picked.push(skill);
  }

  return picked.slice(0, limit).sort((a, b) => b.score - a.score);
}

/** Skills a project is evidence for — powers the §8.6 filter. */
export function getSkillsForProject(slug: string): Skill[] {
  return SKILLS.filter((skill) => skill.projectSlugs.includes(slug));
}
