/**
 * About copy (home "about" section and /about). Kept as data so wording can
 * change without touching layout.
 *
 * ⚠️ Written for you from your Notion sheets and preferences — re-read it,
 *    it is your voice, not mine. The quote especially.
 */

export interface AboutBlock {
  label: string;
  title: string;
  body: string;
  points?: string[];
}

export const ABOUT_INTRO =
  "I'm Maxime, a developer and security student based in France. I build backend systems, automation pipelines and AI tools, mostly in Python and TypeScript. Security is my second language: it shapes how I write everything else.";

export const ABOUT_QUOTE = "Make it work. Then make it hard to break.";

export const ABOUT_FACTS = [
  { icon: "terminal", title: "Kali Linux, every day", caption: "My main machine" },
  { icon: "pin", title: "France", caption: "Based in, CET" },
  { icon: "flag", title: "HackTheBox & TryHackMe", caption: "Where I practise" },
] as const;

/** "What I work on" — the ref's "What I enjoy" list, made concrete. */
export const ABOUT_FOCUS = [
  { icon: "server", label: "Backend & APIs", note: "FastAPI, job queues, contracts" },
  { icon: "bot", label: "AI agents & automation", note: "fan-out, scoring, pipelines" },
  { icon: "shield", label: "Web security & CTFs", note: "HTB boot2root, OWASP" },
  { icon: "binary", label: "Reverse engineering", note: "CTF binaries, patience" },
  { icon: "orbit", label: "Chaos & simulations", note: "pendulums, attractors, Python" },
  { icon: "key", label: "Cryptography", note: "Caesar → AES, by hand" },
] as const;

export const ABOUT_BLOCKS: AboutBlock[] = [
  {
    label: "Current focus",
    title: "Backends for AI-heavy products",
    body: "Most of my work happens behind the interface: services that wrap AI models, run long background jobs and keep their promises under load. Right now that means a video editor's FastAPI backend, its job queue and its billing.",
  },
  {
    label: "What I build",
    title: "Systems that hold up outside the demo",
    body: "Agent pipelines, workflow bots, internal tools and the measuring tools around them. I care most about what only shows up in production: retries, failures, cost and monitoring.",
    points: [
      "Write the architecture down before the code",
      "Measure it instead of believing it",
      "Plan security from the start, then attack it yourself",
    ],
  },
  {
    label: "Security",
    title: "A specialisation, not the whole identity",
    body: "HackTheBox boot2root machines, web and reversing challenges, ciphers rebuilt by hand. On my own product I ran the security milestone: 29 findings, every one fixed with a test.",
  },
  {
    label: "What I am learning",
    title: "Depth over breadth",
    body: "Distributed systems fundamentals, running AI workloads for real — evaluation, cost, failure — and reading binaries faster.",
  },
];
