"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CodeXml, Globe, LayoutGrid, Lock, Shield, Sparkles, Star } from "lucide-react";
import type { Project } from "@/lib/projects";
import { ProjectCard } from "./ProjectCard";

export type ProjectFilterId = "selected" | "all" | "ai" | "web" | "security" | "open" | "closed";

const FILTERS: Record<ProjectFilterId, { label: string; icon: typeof Globe; test: (p: Project) => boolean }> = {
  selected: { label: "Selected", icon: Star, test: (p) => p.featured },
  all: { label: "All", icon: LayoutGrid, test: () => true },
  ai: { label: "AI & automation", icon: Sparkles, test: (p) => p.category.includes("AI") || p.category.includes("Automation") },
  web: { label: "Web", icon: Globe, test: (p) => p.category.includes("Web") || p.category.includes("SaaS") },
  security: { label: "Security", icon: Shield, test: (p) => p.category.includes("Security") },
  open: { label: "Open source", icon: CodeXml, test: (p) => p.type === "open-source" },
  closed: { label: "Private & NDA", icon: Lock, test: (p) => p.type === "private" || p.type === "nda" },
};

interface ProjectExplorerProps {
  projects: Project[];
  filters: ProjectFilterId[];
  initial: ProjectFilterId;
  align?: "center" | "left";
  headingLevel?: "h2" | "h3";
}

/** Filter pills (with live counts) over a grid that re-flows with layout animation. */
export function ProjectExplorer({ projects, filters, initial, align = "center", headingLevel = "h3" }: ProjectExplorerProps) {
  const [filter, setFilter] = useState<ProjectFilterId>(initial);
  const reduce = useReducedMotion();
  const visible = useMemo(() => projects.filter(FILTERS[filter].test), [projects, filter]);

  return (
    <>
      <div
        role="group"
        aria-label="Filter projects"
        className={`flex flex-wrap gap-2.5 ${align === "center" ? "justify-center" : ""}`}
      >
        {filters.map((id) => {
          const { label, icon: Icon, test } = FILTERS[id];
          return (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
              className="pill px-4 py-2.5 text-sm"
            >
              <Icon size={15} aria-hidden="true" />
              {label}
              <span className="font-mono text-[11px] text-ink-3">{projects.filter(test).length}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} projects shown
      </p>

      <motion.ul layout={!reduce} className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project) => (
            <motion.li
              key={project.slug}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.96, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.96, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <ProjectCard project={project} headingLevel={headingLevel} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}
