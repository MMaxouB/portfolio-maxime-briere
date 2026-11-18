/**
 * Single source of truth for identity, URLs and contact details.
 * Tout le site (nav, footer, palette, terminal, metadata, sitemap, OG) lit ici.
 */

export const SITE = {
  name: "Maxime",
  role: "Software Engineer",
  tagline: "Software / Engineering / Security",
  description:
    "Maxime builds backend systems, automation pipelines and AI tools in Python and TypeScript, with a security mindset.",

  /** Canonical origin — required for metadataBase, sitemap and OG images. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-maxime-briere.vercel.app",

  email: "briere.maxime.28@gmail.com",

  /** Shown next to the live clock in the hero — keep it vague on purpose. */
  location: "France",
  timeZone: "Europe/Paris",

  /** The green-dot line in the hero. Set to null to hide it. */
  availability: "Open to backend & security projects" as string | null,

  links: {
    github: "https://github.com/MMaxouB",
    /** Discord profile (username: mmaxoub_87590) */
    discord: "https://discord.com/users/mmaxoub_87590",
  },
  handles: {
    github: "github.com/MMaxouB",
    discord: "mmaxoub_87590",
  },
} as const;

/** True while the placeholders above have not been replaced. */
export const SITE_PLACEHOLDERS_PENDING =
  SITE.url.includes("example.com") || SITE.email.includes("example.com");
