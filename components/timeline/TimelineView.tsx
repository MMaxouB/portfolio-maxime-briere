"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { AREA_LABELS, AREA_MARKS, type TimelineEvent } from "@/lib/timeline";
import { Reveal } from "@/components/ui/Reveal";

interface TimelineViewProps {
  events: TimelineEvent[];
  projectTitles: Record<string, string>;
}

/**
 * Years on the left, events on a rail on the right. The rail lights up as you
 * scroll — your position in the story, drawn.
 */
export function TimelineView({ events, projectTitles }: TimelineViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  const years = [...new Set(events.map((e) => e.year))];

  return (
    <div ref={ref} className="relative">
      {/* Rail */}
      <div aria-hidden="true" className="absolute bottom-0 left-[7px] top-0 w-px bg-line-strong md:left-[calc(10.5rem+7px)]" />
      <motion.div
        aria-hidden="true"
        style={{ scaleY: progress }}
        className="absolute bottom-0 left-[6px] top-0 w-[3px] origin-top rounded-full bg-gradient-to-b from-lilac via-violet to-indigo shadow-[0_0_16px_rgba(139,108,255,0.8)] md:left-[calc(10.5rem+6px)]"
      />

      <div className="flex flex-col gap-16">
        {years.map((year) => (
          <section key={year} aria-labelledby={`y-${year}`} className="relative grid grid-cols-1 gap-6 md:grid-cols-[9rem_minmax(0,1fr)]">
            <h2
              id={`y-${year}`}
              className="font-display pl-8 text-[2.6rem] font-extrabold leading-none tracking-[-0.04em] md:sticky md:top-28 md:self-start md:pl-0 md:pr-8 md:text-right"
            >
              <span className="ink-gradient">{year}</span>
            </h2>
            <ol className="flex flex-col gap-4">
              {events
                .filter((e) => e.year === year)
                .map((event) => (
                  <Reveal as="li" key={event.title} className="relative pl-8 md:pl-10">
                    <span
                      aria-hidden="true"
                      className={`absolute left-[2px] top-6 h-3 w-3 rounded-[3px] md:left-[2px] ${AREA_MARKS[event.area]} shadow-[0_0_0_4px_var(--night)]`}
                    />
                    <article className="glass lit p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
                        {event.month && <span className="font-mono text-lilac">{event.month}</span>}
                        <span>{AREA_LABELS[event.area]}</span>
                      </div>
                      <h3 className="font-display mt-2 text-[1.35rem] font-bold tracking-[-0.02em] text-ink">{event.title}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{event.description}</p>
                      {(event.technologies?.length || event.projectSlugs?.length) && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {event.projectSlugs?.map((slug) =>
                            projectTitles[slug] ? (
                              <Link
                                key={slug}
                                href={`/projects/${slug}`}
                                className="inline-flex items-center gap-1 rounded-full border border-violet/50 bg-violet/15 px-2.5 py-1 text-[12px] text-ink transition-colors hover:bg-violet/30"
                              >
                                {projectTitles[slug]} <ArrowUpRight size={11} aria-hidden="true" />
                              </Link>
                            ) : null
                          )}
                          {event.technologies?.map((tech) => (
                            <span key={tech} className="chip">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  </Reveal>
                ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
