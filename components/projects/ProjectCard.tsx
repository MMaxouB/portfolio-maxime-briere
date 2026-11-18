import { ViewTransition } from "react";
import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import { PRIVACY_LABELS, STATUS_LABELS, type Project } from "@/lib/projects";
import { MiniVisual } from "./visuals/MiniVisual";

interface ProjectCardProps {
  project: Project;
  /** Headings level inside the card — h3 on the home page */
  headingLevel?: "h2" | "h3";
}

/**
 * One project: a live mini diagram on top, then what it is. The whole card is
 * the link; the cursor says "Open". On hover the card lifts, the border catches
 * the pointer's light and the diagram starts running.
 */
export function ProjectCard({ project, headingLevel = "h3" }: ProjectCardProps) {
  const Heading = headingLevel;
  const confidential = project.type === "private" || project.type === "nda";
  const chips = [...project.category, ...project.technologies.slice(0, 2)].slice(0, 3);

  return (
    // The link is the hit target and never moves. The lift is on the inner card:
    // if the target itself rose on hover, its bottom edge would slide away from a
    // pointer resting there, un-hover, drop back, re-hover… and the cursor would flicker.
    <Link href={`/projects/${project.slug}`} data-cursor="Read the case study" className="group block h-full rounded-[22px]">
      <div className="glass lit flex h-full flex-col overflow-hidden !rounded-[22px] transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1.5 group-hover:border-line-strong group-hover:shadow-[0_30px_80px_-30px_rgba(91,76,200,0.6)]">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-line">
          {/* Morphs into the case study's hero visual on navigation */}
          <ViewTransition name={`visual-${project.slug}`}>
            <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]">
              <MiniVisual kind={project.visual} uid={project.slug} />
            </div>
          </ViewTransition>
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-night/70 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur-md">
              {confidential && <Lock size={10} aria-hidden="true" />}
              {PRIVACY_LABELS[project.type]}
            </span>
            {project.status !== "completed" && (
              <span className="rounded-full border border-white/10 bg-night/60 px-2.5 py-1 text-[11px] text-ink-2 backdrop-blur-md">
                {STATUS_LABELS[project.status]}
              </span>
            )}
          </div>
          <span className="absolute right-3 top-3 rounded-full bg-night/60 px-2 py-1 font-mono text-[11px] text-ink-2 backdrop-blur-md">
            {project.year}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
            {chips.map((chip) => (
              <li key={chip} className="chip">
                {chip}
              </li>
            ))}
          </ul>
          <Heading className="font-display mt-4 text-[1.45rem] font-bold leading-tight tracking-[-0.025em] text-ink">
            {project.title}
          </Heading>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink-2">{project.shortDescription}</p>
          <div className="mt-auto flex items-center justify-between pt-6">
            <span className="text-[15px] font-medium text-lilac transition-colors group-hover:text-ink">
              Read the case study
            </span>
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink-2 transition-all duration-500 ease-[var(--ease-spring)] group-hover:rotate-45 group-hover:border-lilac group-hover:bg-violet/25 group-hover:text-ink"
            >
              <ArrowUpRight size={17} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
