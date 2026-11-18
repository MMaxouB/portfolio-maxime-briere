/** Static cyber-specific content that has no home in the projects data model */

import type { TechSlug } from "./tech-marks";

export interface CtfEntry {
  name: string;
  mark: TechSlug;
  year: string;
  category: string;
  notes: string;
}

export interface SecurityArea {
  title: string;
  description: string;
  topics: string[];
}

export interface MethodStep {
  phase: string;
  goal: string;
  tools: string[];
}

/** CTF activity — real participation only, no fabricated flags/scores */
export const CTF_ENTRIES: CtfEntry[] = [
  {
    name: "HackTheBox",
    mark: "hackthebox",
    year: "2025 – now",
    category: "Boot2root over VPN",
    notes: "Full machines from recon to root, plus isolated web and reversing challenges.",
  },
  {
    name: "TryHackMe",
    mark: "tryhackme",
    year: "2024 – now",
    category: "Learning paths",
    notes: "Guided paths on web exploitation, Linux privilege escalation and network enumeration.",
  },
];

/** How a box gets done — the method sheet kept open while working. A real sequence. */
export const METHOD: MethodStep[] = [
  { phase: "Recon", goal: "Map what answers: ports, services, versions, web content.", tools: ["nmap", "ffuf", "whatweb"] },
  { phase: "Enumerate", goal: "Turn versions and behaviour into leads: users, shares, known CVEs.", tools: ["searchsploit", "Burp Suite"] },
  { phase: "Foothold", goal: "Use one flaw or misconfiguration to get a first shell.", tools: ["Burp Suite", "Python", "netcat"] },
  { phase: "Escalate", goal: "From user to root: sudo rules, SUID, cron, services, kernel.", tools: ["linpeas", "GTFOBins"] },
  { phase: "Write up", goal: "What worked, what did not, and how the box should have been fixed.", tools: ["Markdown"] },
];

/** Core security knowledge areas — evidence-grounded descriptions only */
export const SECURITY_AREAS: SecurityArea[] = [
  {
    title: "Web application security",
    description: "Finding and exploiting the OWASP Top 10 in labs — then closing the same classes of bug in my own product's security review.",
    topics: ["OWASP Top 10", "Burp Suite", "SQL injection", "XSS", "Auth flaws"],
  },
  {
    title: "Linux & privilege escalation",
    description: "Kali every day, plus the classic paths to root: SUID and sudo abuse, cron jobs, weak permissions.",
    topics: ["Privilege escalation", "Permissions", "Processes", "Bash"],
  },
  {
    title: "Network enumeration",
    description: "Port scanning, service fingerprinting and mapping what a machine exposes before touching it.",
    topics: ["Nmap", "Service enumeration", "Wireshark"],
  },
  {
    title: "Reverse engineering",
    description: "CTF binaries and obfuscated scripts: reading what a program really does, not what it claims.",
    topics: ["Static analysis", "Strings & patching", "Patience"],
  },
  {
    title: "Cryptography",
    description: "Classic and modern ciphers rebuilt by hand, to understand both how they work and how they fail.",
    topics: ["Caesar → Vigenère", "XOR", "AES"],
  },
];
