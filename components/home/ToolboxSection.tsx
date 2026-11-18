"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Quote, X } from "lucide-react";
import {
  CATEGORY_LABELS,
  SKILL_CATEGORIES,
  SKILLS,
  getHeadlineSkills,
  type Skill,
  type SkillCategory,
} from "@/lib/skills";
import type { Project } from "@/lib/projects";
import { SITE } from "@/lib/site";
import { SectionHeader, Em } from "@/components/ui/SectionHeader";
import { SkillIcon } from "@/components/ui/TechIcon";
import { Reveal } from "@/components/ui/Reveal";
import { Orbit } from "./Orbit";

type Filter = "top" | "all" | SkillCategory;

function SkillCard({ skill, projects }: { skill: Skill; projects: Map<string, Project> }) {
  const [open, setOpen] = useState(false);
  const panelId = `skill-${skill.slug}`;
  const proof = skill.projectSlugs.map((slug) => projects.get(slug)).filter((p): p is Project => !!p);

  return (
    <div className="glass lit group relative h-full min-h-[156px] overflow-hidden p-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
        data-cursor="Proof"
        className="absolute inset-0 z-10 rounded-[inherit]"
      >
        <span className="sr-only">
          {skill.name}, {skill.score} out of 100. Show the projects that prove it.
        </span>
      </button>

      <div aria-hidden="true" className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-deep/80 transition-transform duration-500 ease-[var(--ease-spring)] group-hover:scale-110">
          <SkillIcon skill={skill} size={20} />
        </span>
        <span className="font-mono text-xs text-ink-2">{skill.score}%</span>
      </div>
      <p aria-hidden="true" className="mt-3.5 text-[15px] font-semibold text-ink">
        {skill.name}
      </p>
      <div aria-hidden="true" className="bar-track mt-3">
        <motion.div
          className="bar-fill"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: skill.score / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      </div>
      <p aria-hidden="true" className="mt-2.5 flex items-center justify-between text-[12px] text-ink-3">
        <span>{CATEGORY_LABELS[skill.category]}</span>
        <span>{skill.levelLabel}</span>
      </p>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`${skill.name}: where it was used`}
            initial={{ opacity: 0, y: "30%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "30%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-20 flex flex-col bg-deep/95 p-4 backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12px] font-medium text-ink">Proven in</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="-mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-3 hover:text-ink"
                aria-label={`Close ${skill.name} details`}
                autoFocus
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {proof.slice(0, 3).map((project) => (
                <li key={project.slug}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex max-w-full items-center gap-1 truncate rounded-full border border-violet/50 bg-violet/15 px-2.5 py-1 text-[11.5px] text-ink transition-colors hover:bg-violet/30"
                  >
                    {project.title}
                  </Link>
                </li>
              ))}
              {proof.length > 3 && <li className="px-1 py-1 text-[11.5px] text-ink-3">+{proof.length - 3}</li>}
            </ul>
            <Link
              href={`/expertise#${skill.slug}`}
              className="mt-auto inline-flex items-center gap-1 pt-2 text-[12px] text-lilac hover:text-ink"
            >
              Why {skill.score}? <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ToolboxSection({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("top");
  const projectMap = useMemo(() => new Map(projects.map((p) => [p.slug, p])), [projects]);
  const headline = useMemo(() => getHeadlineSkills(8), []);

  const visible =
    filter === "top" ? headline : filter === "all" ? SKILLS : SKILLS.filter((skill) => skill.category === filter);

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "top", label: "Top 8", count: 8 },
    ...SKILL_CATEGORIES.map((c) => ({ id: c as Filter, label: CATEGORY_LABELS[c], count: SKILLS.filter((s) => s.category === c).length })),
    { id: "all", label: "Everything", count: SKILLS.length },
  ];

  const perfect = SKILLS.filter((s) => s.score === 100).length;

  return (
    <section id="toolbox" aria-labelledby="toolbox-title" className="relative isolate overflow-hidden py-24 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -left-[10%] top-[10%] h-[70%] w-[55%]"
          style={{ background: "radial-gradient(closest-side, rgba(91,108,255,0.14), transparent)" }}
        />
      </div>

      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <div className="order-2 lg:order-1 lg:sticky lg:top-28 lg:pt-6">
            <Orbit />
            <Reveal delay={0.1}>
              <figure className="glass lit mt-4 p-6">
                <Quote size={22} className="text-violet" aria-hidden="true" />
                <blockquote className="mt-3 text-[1.05rem] leading-relaxed text-ink">
                  Tools are easy to list.
                  <br />
                  Knowing how they fail is the job.
                </blockquote>
                <span aria-hidden="true" className="mt-4 block h-[2px] w-8 rounded-full bg-violet" />
              </figure>
            </Reveal>
          </div>

          <div className="order-1 lg:order-2">
            <SectionHeader
              path="~/toolbox"
              id="toolbox-title"
              lines={["Tools I trust,", <Em key="em">and where they earned it.</Em>]}
              description="Levels are my own reading, not a test score. Click a card to see the projects that back it up."
            />

            <div role="group" aria-label="Filter skills" className="mt-8 flex flex-wrap gap-2">
              {filters.map(({ id, label, count }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                  className="pill px-3.5 py-1.5 text-[13px]"
                >
                  {label}
                  <span className="font-mono text-[10.5px] text-ink-3">{count}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-[13px] text-ink-3" aria-live="polite">
              Showing {visible.length} of {SKILLS.length}
              {filter === "top" ? " — the strongest in each area first." : "."}
            </p>

            <motion.ul layout className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map((skill) => (
                  <motion.li
                    key={skill.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <SkillCard skill={skill} projects={projectMap} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </div>
        </div>

        {/* Bottom strip */}
        <Reveal delay={0.05}>
          <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <dl className="glass grid grid-cols-3 overflow-hidden">
              {[
                { value: String(SKILLS.length), label: "skills tracked" },
                { value: String(projects.length), label: "projects as evidence" },
                { value: String(perfect), label: "rated 100% — on purpose" },
              ].map((stat, i) => (
                <div key={stat.label} className={`p-5 sm:p-6 ${i < 2 ? "border-r border-line" : ""}`}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-[1.9rem] font-extrabold leading-none tracking-[-0.03em] text-ink sm:text-[2.2rem]">
                    {stat.value}
                  </dd>
                  <dd aria-hidden="true" className="mt-1.5 text-[12.5px] leading-snug text-ink-3 sm:text-[13px]">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
            <a
              href={SITE.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass lit flex items-center justify-between gap-4 overflow-hidden p-6"
              style={{ background: "linear-gradient(120deg, rgba(91,76,200,0.35), rgba(19,15,42,0.6))" }}
            >
              <span className="font-hand text-[1.6rem] leading-[1.1] text-ink">
                more on
                <br />
                GitHub…
              </span>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink transition-transform duration-500 ease-[var(--ease-spring)] group-hover:rotate-45">
                <ArrowUpRight size={18} aria-hidden="true" />
              </span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
