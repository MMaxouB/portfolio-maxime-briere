import { Bot, Brain, Globe, KeyRound, Layers, Radar, Server, Sparkles, Workflow } from "lucide-react";
import { TECH_MARKS, type TechSlug } from "@/lib/tech-marks";
import { readableHex as readable } from "@/lib/tech-color";
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
