import type { Metadata } from "next";
import { getSecurityProjects } from "@/lib/projects";
import { CTF_ENTRIES, METHOD, SECURITY_AREAS } from "@/lib/cyber";
import { SectionHeader, Em } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { MiniVisual } from "@/components/projects/visuals/MiniVisual";
import { BrandMark } from "@/components/ui/TechIcon";

export const metadata: Metadata = {
  title: "Cyber lab",
  description: "Security practice and projects: HackTheBox, TryHackMe, a scanner MVP, ciphers by hand — a specialisation next to the engineering.",
  alternates: { canonical: "/cyber" },
};

/**
 * No green, no skulls, no terminal-as-identity (spec §0.3): same night, same
 * ink. Security is a chapter of the engineering story, not another website.
 */
export default function CyberPage() {
  const projects = getSecurityProjects();

  return (
    <div className="relative isolate overflow-hidden pb-24 pt-32 sm:pt-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -right-[10%] top-0 h-[60%] w-[60%]"
          style={{ background: "radial-gradient(closest-side, rgba(124,92,255,0.18), transparent)" }}
        />
      </div>

      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <SectionHeader
            as="h1"
            path="~/lab"
            lines={["Security as a", <Em key="em">second language.</Em>]}
            description="I practise breaking things so the things I build break less. A specialisation — not the whole identity."
          />
          <div className="glass mv-live relative aspect-[16/10] overflow-hidden !rounded-[24px]">
            <MiniVisual kind="shell" uid="cyber-hero" />
          </div>
        </div>

        {/* Method: a real sequence, so it is numbered */}
        <section aria-labelledby="method-title" className="mt-24">
          <h2 id="method-title" className="font-display text-[1.9rem] font-bold tracking-[-0.03em] text-ink">
            How a box gets done
          </h2>
          <p className="mt-2 max-w-[38rem] text-[15px] text-ink-2">The method sheet I keep open while I work, phase by phase.</p>
          <ol className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-5">
            {METHOD.map((step, i) => (
              <Reveal as="li" key={step.phase} delay={i * 0.06} className="glass lit relative p-5">
                <span className="font-mono text-xs text-lilac">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display mt-2 text-[1.2rem] font-bold text-ink">{step.phase}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">{step.goal}</p>
                <p className="mt-3 font-mono text-[11.5px] text-ink-3">{step.tools.join("  ")}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <section aria-labelledby="areas-title" className="mt-24">
          <h2 id="areas-title" className="font-display text-[1.9rem] font-bold tracking-[-0.03em] text-ink">
            What I practise
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {SECURITY_AREAS.map((area, i) => (
              <Reveal as="li" key={area.title} delay={i * 0.05} className="glass lit p-6">
                <h3 className="text-[16.5px] font-semibold text-ink">{area.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{area.description}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {area.topics.map((topic) => (
                    <li key={topic} className="chip">
                      {topic}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
            {CTF_ENTRIES.map((entry, i) => (
              <Reveal as="li" key={entry.name} delay={0.1 + i * 0.05} className="glass lit flex flex-col p-6" >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-deep/80">
                    <BrandMark slug={entry.mark} size={20} />
                  </span>
                  <div>
                    <h3 className="text-[16.5px] font-semibold text-ink">{entry.name}</h3>
                    <p className="text-[12.5px] text-ink-3">
                      {entry.category}, {entry.year}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{entry.notes}</p>
              </Reveal>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sec-projects" className="mt-24">
          <h2 id="sec-projects" className="font-display text-[1.9rem] font-bold tracking-[-0.03em] text-ink">
            Security projects
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <li key={project.slug}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
