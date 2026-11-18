import type { Metadata } from "next";
import { TIMELINE, AREA_LABELS, AREA_MARKS } from "@/lib/timeline";
import { getProjects } from "@/lib/projects";
import { TimelineView } from "@/components/timeline/TimelineView";
import { SectionHeader, Em } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Timeline",
  description: "From first Python scripts to co-owning an AI product: real milestones, in order.",
  alternates: { canonical: "/timeline" },
};

export default function TimelinePage() {
  const projectTitles = Object.fromEntries(getProjects().map((p) => [p.slug, p.title]));
  const years = [...new Set(TIMELINE.map((event) => event.year))];

  return (
    <div className="relative isolate overflow-hidden pb-24 pt-32 sm:pt-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -right-[10%] top-0 h-[60%] w-[60%]"
          style={{ background: "radial-gradient(closest-side, rgba(124,92,255,0.16), transparent)" }}
        />
      </div>
      <div className="mx-auto max-w-[1000px] px-5 sm:px-8">
        <SectionHeader
          as="h1"
          path="~/git log --reverse"
          lines={["How it", <Em key="em">got here.</Em>]}
          description={`${years[0]} to ${years[years.length - 1]}: scripts, then systems, then products — and security all along. A record, not a polished résumé.`}
        />

        <ul aria-label="Legend" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-2">
          {(Object.entries(AREA_LABELS) as [keyof typeof AREA_LABELS, string][]).map(([area, label]) => (
            <li key={area} className="flex items-center gap-2">
              <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-[3px] ${AREA_MARKS[area]}`} />
              {label}
            </li>
          ))}
        </ul>

        <div className="mt-14">
          <TimelineView events={TIMELINE} projectTitles={projectTitles} />
        </div>
      </div>
    </div>
  );
}
