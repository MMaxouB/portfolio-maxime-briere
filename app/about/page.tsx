import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ABOUT_BLOCKS, ABOUT_INTRO, ABOUT_QUOTE } from "@/lib/about";
import { TIMELINE } from "@/lib/timeline";
import { SectionHeader, Em } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About",
  description: "Who Maxime is as an engineer: what he builds, how security shapes it, and what he is learning now.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const recent = TIMELINE.slice(-4).reverse();

  return (
    <div className="relative isolate overflow-hidden pb-24 pt-32 sm:pt-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -left-[10%] top-0 h-[60%] w-[60%]"
          style={{ background: "radial-gradient(closest-side, rgba(124,92,255,0.16), transparent)" }}
        />
      </div>
      <div className="mx-auto max-w-[1000px] px-5 sm:px-8">
        <SectionHeader as="h1" path="~/about --long" lines={["Builder first,", <Em key="em">breaker second.</Em>]} description={ABOUT_INTRO} />

        <Reveal delay={0.2}>
          <p className="font-hand mt-10 text-[1.9rem] leading-snug text-ink/90" style={{ transform: "rotate(-1.2deg)" }}>
            “{ABOUT_QUOTE}”
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2">
          {ABOUT_BLOCKS.map((block, i) => (
            <Reveal key={block.title} delay={i * 0.06} className="glass lit p-6 sm:p-7">
              <p className="font-mono text-xs text-lilac">{block.label}</p>
              <h2 className="font-display mt-3 text-[1.5rem] font-bold leading-tight tracking-[-0.025em] text-ink">{block.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{block.body}</p>
              {block.points && (
                <ul className="mt-4 flex flex-col gap-2">
                  {block.points.map((point) => (
                    <li key={point} className="flex gap-2.5 text-[14.5px] text-ink-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-lilac" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}
        </div>

        <section aria-labelledby="recent-title" className="mt-20">
          <div className="flex items-end justify-between gap-4">
            <h2 id="recent-title" className="font-display text-[1.9rem] font-bold tracking-[-0.03em] text-ink">
              Lately
            </h2>
            <Link href="/timeline" className="inline-flex items-center gap-1.5 text-sm text-lilac hover:text-ink">
              Full timeline <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <ol className="mt-6 flex flex-col">
            {recent.map((event) => (
              <li key={event.title} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 border-t border-line py-5">
                <span className="font-mono text-sm text-ink-3">
                  {event.month ? `${event.month} ` : ""}
                  {event.year}
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold text-ink">{event.title}</h3>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-ink-2">{event.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="glass mt-16 flex flex-col items-start justify-between gap-5 p-7 sm:flex-row sm:items-center" style={{ background: "linear-gradient(120deg, rgba(91,76,200,0.32), rgba(19,15,42,0.6))" }}>
          <p className="font-display text-[1.6rem] font-bold leading-tight tracking-[-0.02em] text-ink">Something to build, or to break?</p>
          <Link href="/contact" className="btn-primary shrink-0">
            Get in touch <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
