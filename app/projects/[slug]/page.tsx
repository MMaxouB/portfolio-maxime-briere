import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Lock, TriangleAlert } from "lucide-react";
import {
  PRIVACY_LABELS,
  STATUS_LABELS,
  getProjectBySlug,
  getProjects,
} from "@/lib/projects";
import { getSkillsForProject } from "@/lib/skills";
import { MiniVisual } from "@/components/projects/visuals/MiniVisual";
import { Reveal } from "@/components/ui/Reveal";
import { SkillIcon } from "@/components/ui/TechIcon";
import { GitHubIcon } from "@/components/ui/BrandIcons";

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

interface ProjectPageProps {
  // Next 16: params is a Promise and must be awaited before use.
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.shortDescription,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.shortDescription, type: "article" },
  };
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="scroll-mt-28">
      <h2 className="font-display flex items-center gap-4 text-[1.55rem] font-bold tracking-[-0.025em] text-ink">
        {title}
        <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" />
      </h2>
      <div className="mt-5">{children}</div>
    </Reveal>
  );
}

export default async function ProjectDetail({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const all = getProjects();
  const index = all.findIndex((p) => p.slug === project.slug);
  const prev = all[(index - 1 + all.length) % all.length];
  const next = all[(index + 1) % all.length];
  const skills = getSkillsForProject(project.slug);
  const confidential = project.type === "private" || project.type === "nda";

  const meta = [
    { label: "Role", value: project.role },
    { label: "Year", value: String(project.year) },
    { label: "Status", value: STATUS_LABELS[project.status] },
    { label: "Visibility", value: PRIVACY_LABELS[project.type] },
  ];

  return (
    <article className="relative isolate overflow-hidden pb-24 pt-28 sm:pt-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-0 h-[700px] w-[90%] -translate-x-1/2"
          style={{ background: "radial-gradient(closest-side, rgba(124,92,255,0.2), transparent)" }}
        />
      </div>

      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <Link href="/projects" className="pill px-3.5 py-1.5 text-sm">
          <ArrowLeft size={14} aria-hidden="true" /> All projects
        </Link>

        <header className="mt-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet/50 bg-violet/15 px-3 py-1 text-xs font-medium text-ink">
              {confidential && <Lock size={11} aria-hidden="true" />}
              {PRIVACY_LABELS[project.type]}
            </span>
            {project.category.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
            <span className="ml-auto font-mono text-sm text-ink-3">{project.year}</span>
          </div>
          <h1 className="font-display mt-6 text-[clamp(2.8rem,8vw,5.6rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-ink">
            {project.title}
          </h1>
          <p className="mt-6 max-w-[44rem] text-[1.2rem] leading-relaxed text-ink-2">{project.shortDescription}</p>
          {(project.githubUrl || project.liveUrl || (project.extraLinks && project.extraLinks.length > 0)) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <GitHubIcon size={17} /> View the code
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Open the live site <ArrowUpRight size={16} aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              {project.extraLinks?.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  {link.label} <ArrowUpRight size={15} aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
          )}
        </header>

        {/* The card's sketch on a light table — running */}
        <div className="glass mv-live relative mt-12 flex items-center justify-center overflow-hidden !rounded-[26px] px-5 py-10 sm:py-14">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000,transparent)]"
            style={{ backgroundImage: "radial-gradient(rgba(196,181,255,0.22) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
          />
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[70%] w-[60%] -translate-x-1/2 -translate-y-1/2"
            style={{ background: "radial-gradient(closest-side, rgba(124,92,255,0.35), transparent)" }}
          />
          <ViewTransition name={`visual-${project.slug}`}>
            <div className="relative aspect-[16/10] w-full max-w-[720px] overflow-hidden rounded-2xl border border-line-strong shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]">
              <MiniVisual kind={project.visual} uid={`${project.slug}-hero`} />
            </div>
          </ViewTransition>
        </div>

        <dl className="glass mt-5 grid grid-cols-2 overflow-hidden md:grid-cols-4">
          {meta.map((item, i) => (
            <div key={item.label} className={`p-5 ${i % 2 === 0 ? "border-r border-line" : ""} ${i < 2 ? "border-b border-line md:border-b-0" : ""} ${i === 1 ? "md:border-r" : ""}`}>
              <dt className="text-xs text-ink-3">{item.label}</dt>
              <dd className="mt-1.5 text-[15px] font-medium text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>

        {project.highlights && project.highlights.length > 0 && (
          <Reveal>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {project.highlights.map((h) => (
                <li key={h.label} className="glass lit p-5">
                  <p className="font-display text-[2.3rem] font-extrabold leading-none tracking-[-0.03em] text-ink">{h.value}</p>
                  <p className="mt-2 text-[13.5px] text-ink-2">{h.label}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <div className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-14">
            {project.context && (
              <Block title="Why it exists">
                <p className="text-[1.075rem] leading-relaxed text-ink-2">{project.context}</p>
              </Block>
            )}

            {project.evolution && project.evolution.length > 0 && (
              <Block title="How it evolved">
                <ol className="relative flex flex-col gap-6 border-l border-line-strong pl-7">
                  {project.evolution.map((stage, i, all) => (
                    <li key={stage.title} className="relative">
                      <span
                        aria-hidden="true"
                        className={`absolute -left-[35px] top-1.5 h-3 w-3 rounded-full border ${
                          i === all.length - 1 ? "border-lilac bg-violet shadow-[0_0_14px_rgba(139,108,255,0.9)]" : "border-line-strong bg-deep"
                        }`}
                      />
                      <p className="font-mono text-xs uppercase tracking-wider text-lilac">{stage.when}</p>
                      <h3 className="font-display mt-1 text-[1.25rem] font-bold tracking-[-0.02em] text-ink">{stage.title}</h3>
                      <p className="mt-2 text-[1.02rem] leading-relaxed text-ink-2">{stage.text}</p>
                    </li>
                  ))}
                </ol>
              </Block>
            )}

            {project.contribution && project.contribution.length > 0 && (
              <Block title="What I built">
                <ul className="flex flex-col gap-4">
                  {project.contribution.map((item) => (
                    <li key={item} className="flex gap-3.5 text-[1.02rem] leading-relaxed text-ink-2">
                      <CheckCircle2 size={18} className="mt-1 shrink-0 text-lilac" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {project.technicalChallenges && project.technicalChallenges.length > 0 && (
              <Block title="The hard parts">
                <ul className="flex flex-col gap-3">
                  {project.technicalChallenges.map((item) => (
                    <li key={item} className="glass flex gap-3.5 !rounded-2xl p-4 text-[15px] leading-relaxed text-ink-2">
                      <TriangleAlert size={17} className="mt-0.5 shrink-0 text-lilac" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {project.architectureSummary && (
              <Block title="How it fits together">
                <p className="text-[1.02rem] leading-relaxed text-ink-2">{project.architectureSummary}</p>
              </Block>
            )}

            {project.results && (
              <Block title="Where it stands">
                <p className="text-[1.02rem] leading-relaxed text-ink-2">{project.results}</p>
              </Block>
            )}
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
            <div className="glass p-5">
              <h2 className="text-sm font-semibold text-ink">Stack</h2>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <li key={tech} className="chip">
                    {tech}
                  </li>
                ))}
              </ul>
            </div>

            {skills.length > 0 && (
              <div className="glass p-5">
                <h2 className="text-sm font-semibold text-ink">Skills it proves</h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {skills.map((skill) => (
                    <li key={skill.slug}>
                      <Link
                        href={`/expertise#${skill.slug}`}
                        className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-[14px] text-ink-2 transition-colors hover:bg-deep-2/80 hover:text-ink"
                      >
                        <SkillIcon skill={skill} size={16} />
                        <span className="flex-1">{skill.name}</span>
                        <span className="font-mono text-xs text-ink-3">{skill.score}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.confidentialityNote && (
              <div className="rounded-[20px] border border-dashed border-violet/50 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Lock size={14} className="text-lilac" aria-hidden="true" />
                  {project.type === "nda" ? "Under NDA" : "Good to know"}
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">{project.confidentialityNote}</p>
              </div>
            )}
          </aside>
        </div>

        <nav aria-label="More projects" className="mt-24 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href={`/projects/${prev.slug}`} className="group glass lit flex items-center gap-4 p-5">
            <ArrowLeft size={18} className="text-ink-3 transition-transform group-hover:-translate-x-1 group-hover:text-lilac" aria-hidden="true" />
            <span>
              <span className="block text-xs text-ink-3">Previous</span>
              <span className="font-display text-[1.2rem] font-bold text-ink">{prev.title}</span>
            </span>
          </Link>
          <Link href={`/projects/${next.slug}`} className="group glass lit flex items-center justify-end gap-4 p-5 text-right">
            <span>
              <span className="block text-xs text-ink-3">Next</span>
              <span className="font-display text-[1.2rem] font-bold text-ink">{next.title}</span>
            </span>
            <ArrowRight size={18} className="text-ink-3 transition-transform group-hover:translate-x-1 group-hover:text-lilac" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </article>
  );
}
