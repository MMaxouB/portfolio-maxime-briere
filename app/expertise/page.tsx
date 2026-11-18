import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getProjects } from "@/lib/projects";
import { CATEGORY_LABELS, SKILL_CATEGORIES, SKILLS, getSkillsByCategory } from "@/lib/skills";
import { SectionHeader, Em } from "@/components/ui/SectionHeader";
import { SkillIcon } from "@/components/ui/TechIcon";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Expertise",
  description: "Every skill with a self-rated level and the real projects that back it up.",
  alternates: { canonical: "/expertise" },
};

export default function ExpertisePage() {
  const projects = new Map(getProjects().map((p) => [p.slug, p]));

  return (
    <div className="relative isolate overflow-hidden pb-24 pt-32 sm:pt-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -left-[10%] top-0 h-[60%] w-[60%]"
          style={{ background: "radial-gradient(closest-side, rgba(91,108,255,0.16), transparent)" }}
        />
      </div>
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <SectionHeader
          as="h1"
          path="~/toolbox --verbose"
          lines={["Measured,", <Em key="em">not claimed.</Em>]}
          description={`${SKILLS.length} skills, each with my own reading of the level and the projects that prove it. The numbers are meant to move — none of them is 100.`}
        />

        <nav aria-label="Skill categories" className="mt-10 flex flex-wrap gap-2">
          {SKILL_CATEGORIES.map((category) => (
            <a key={category} href={`#cat-${category}`} className="pill px-3.5 py-1.5 text-[13px]">
              {CATEGORY_LABELS[category]}
              <span className="font-mono text-[10.5px] text-ink-3">{getSkillsByCategory(category).length}</span>
            </a>
          ))}
        </nav>

        <div className="mt-14 flex flex-col gap-16">
          {SKILL_CATEGORIES.map((category) => (
            <section key={category} id={`cat-${category}`} aria-labelledby={`cat-${category}-title`} className="scroll-mt-28">
              <h2 id={`cat-${category}-title`} className="font-display flex items-center gap-4 text-[1.8rem] font-bold tracking-[-0.03em] text-ink">
                {CATEGORY_LABELS[category]}
                <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" />
              </h2>
              <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                {getSkillsByCategory(category).map((skill) => (
                  <Reveal as="li" key={skill.slug}>
                    <article id={skill.slug} className="glass lit h-full scroll-mt-28 p-5">
                      <div className="flex items-center gap-3.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-deep/80">
                          <SkillIcon skill={skill} size={20} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[16px] font-semibold text-ink">{skill.name}</h3>
                          <p className="text-[12.5px] text-ink-3">{skill.levelLabel}</p>
                        </div>
                        <span className="font-display text-[1.6rem] font-extrabold tracking-[-0.03em] text-ink">
                          {skill.score}
                          <span className="ml-0.5 text-sm font-medium text-ink-3">/100</span>
                        </span>
                      </div>
                      <div className="bar-track mt-4" role="img" aria-label={`${skill.score} out of 100`}>
                        <div className="bar-fill" style={{ transform: `scaleX(${skill.score / 100})` }} />
                      </div>
                      {skill.description && <p className="mt-4 text-[14px] leading-relaxed text-ink-2">{skill.description}</p>}
                      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Proven in">
                        {skill.projectSlugs.map((slug) => {
                          const project = projects.get(slug);
                          if (!project) return null;
                          return (
                            <li key={slug}>
                              <Link
                                href={`/projects/${slug}`}
                                className="inline-flex items-center gap-1 rounded-full border border-line-strong px-2.5 py-1 text-[12px] text-ink-2 transition-colors hover:border-lilac hover:text-ink"
                              >
                                {project.title} <ArrowUpRight size={11} aria-hidden="true" />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </article>
                  </Reveal>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
