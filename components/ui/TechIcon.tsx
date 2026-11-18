import { Bot, Brain, Globe, KeyRound, Layers, Radar, Server, Sparkles, Workflow } from "lucide-react";
import { TECH_MARKS, type TechSlug } from "@/lib/tech-marks";
import type { Skill, SkillGlyph } from "@/lib/skills";

const GLYPHS: Record<SkillGlyph, typeof Server> = {
  server: Server,
  layers: Layers,
  sparkles: Sparkles,
  bot: Bot,
  brain: Brain,
  workflow: Workflow,
  radar: Radar,
  key: KeyRound,
  globe: Globe,
};

/**
 * Brand colours on a night sky: near-black marks become ink, mid-dark ones are
 * lifted toward white so they stay recognisable but readable.
 */
function readable(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (luminance < 0.3) return "#e9e5ff";
  if (luminance >= 0.5) return hex;
  const lift = (c: number) => Math.round(c + (255 - c) * 0.38);
  return `rgb(${lift(r)}, ${lift(g)}, ${lift(b)})`;
}

export function BrandMark({ slug, size = 20, className }: { slug: TechSlug; size?: number; className?: string }) {
  const mark = TECH_MARKS[slug];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={readable(mark.hex)}
      role="img"
      aria-label={mark.title}
    >
      <path d={mark.path} />
    </svg>
  );
}

/** Icon for a skill: its brand mark when one exists, otherwise a neutral glyph. */
export function SkillIcon({ skill, size = 20 }: { skill: Skill; size?: number }) {
  if ("brand" in skill.mark) return <BrandMark slug={skill.mark.brand} size={size} />;
  const Glyph = GLYPHS[skill.mark.glyph];
  return <Glyph size={size} className="text-lilac" aria-hidden="true" />;
}
