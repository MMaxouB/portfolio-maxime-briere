import Link from "next/link";
import {
  ArrowUpRight,
  Binary,
  Bot,
  Flag,
  FlaskConical,
  Gauge,
  KeyRound,
  MapPin,
  Orbit,
  Server,
  ShieldCheck,
  Shield,
  SquareTerminal,
  Sparkles,
  TestTubes,
} from "lucide-react";
import { DEEP_PAGES } from "@/lib/navigation";
import { ABOUT_FACTS, ABOUT_FOCUS, ABOUT_INTRO, ABOUT_QUOTE } from "@/lib/about";
import { getFeaturedProjects, getProjects } from "@/lib/projects";
import { SectionHeader, Em } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";

/** 2×2 on small screens, one row on large — borders drawn per cell. */
const STAT_BORDERS = [
  "border-b border-r lg:border-b-0",
  "border-b lg:border-b-0 lg:border-r",
  "border-r",
  "",
];

const FACT_ICONS = { terminal: SquareTerminal, pin: MapPin, flag: Flag } as const;
const FOCUS_ICONS = { server: Server, bot: Bot, shield: Shield, binary: Binary, orbit: Orbit, key: KeyRound } as const;

export function AboutSection() {
  const total = getProjects().length;
  const featured = getFeaturedProjects().length;

  const stats = [
    { icon: FlaskConical, value: total, suffix: "", label: `projects, ${featured} featured` },
    { icon: TestTubes, value: 892, suffix: "", label: "automated tests on one product" },
    { icon: ShieldCheck, value: 29, suffix: "", label: "security findings fixed with a test" },
    { icon: Gauge, value: 85, suffix: " fps", label: "1080p video, composited in a browser" },
  ];

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      // Empty areas must not catch the mouse: the hero planet sinks into this section
      // and is draggable through it. The content blocks below opt back in.
      className="pointer-events-none relative isolate overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-32"
    >
      {/* Scenery: a haze low on the left (the 3D planet arrives from the hero above) */}
      <div aria-hidden="true" className="scenery pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -left-[20%] top-[40%] h-[60%] w-[60%]"
          style={{ background: "radial-gradient(closest-side, rgba(91,108,255,0.12), transparent)" }}
        />
      </div>

      <div className="mx-auto max-w-site px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-16">
          <div className="pointer-events-auto">
            <SectionHeader
              path="~/about"
              id="about-title"
              lines={["Code that holds up", <Em key="em">outside the demo.</Em>]}
              description={ABOUT_INTRO}
            />

            <ul className="mt-10 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {ABOUT_FACTS.map((fact, i) => {
                const Icon = FACT_ICONS[fact.icon];
                return (
                  <Reveal as="li" key={fact.title} delay={0.1 + i * 0.08} className="glass lit flex items-center gap-4 p-4 sm:block">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-deep/70 text-lilac">
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold leading-snug text-ink sm:mt-4">{fact.title}</p>
                      <p className="mt-1 text-[13px] text-ink-3">{fact.caption}</p>
                    </div>
                  </Reveal>
                );
              })}
            </ul>

            <Reveal delay={0.3}>
              <figure className="mt-10">
                <blockquote className="font-hand text-[1.75rem] leading-snug text-ink/90 sm:text-[2rem]" style={{ transform: "rotate(-1.5deg)" }}>
                  “{ABOUT_QUOTE}”
                </blockquote>
                <figcaption className="mt-2 font-mono text-xs text-ink-3">— a rule I keep relearning</figcaption>
              </figure>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="pointer-events-auto lg:pt-24">
            <div className="glass lit p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[1.35rem] font-bold tracking-[-0.02em] text-ink">What I work on</h3>
                <Sparkles size={17} className="text-lilac" aria-hidden="true" />
              </div>
              <ul className="mt-5 flex flex-col gap-2.5">
                {ABOUT_FOCUS.map((item) => {
                  const Icon = FOCUS_ICONS[item.icon];
                  return (
                    <li
                      key={item.label}
                      className="group flex items-center gap-4 rounded-2xl border border-line bg-deep/40 px-4 py-3.5 transition-colors duration-300 hover:border-line-strong hover:bg-deep-2/70"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet/12 text-lilac transition-transform duration-500 ease-[var(--ease-spring)] group-hover:rotate-[-8deg] group-hover:scale-110">
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                        <span className="text-[15px] font-medium text-ink">{item.label}</span>
                        <span className="truncate text-[13px] text-ink-3">{item.note}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <ul className="mt-5 flex flex-wrap gap-2">
                {DEEP_PAGES.filter((p) => ["/about", "/timeline", "/cyber"].includes(p.href)).map((page) => (
                  <li key={page.href}>
                    <Link href={page.href} className="pill px-3.5 py-1.5 text-[13px]">
                      {page.label} <ArrowUpRight size={13} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Measured, not claimed */}
        <Reveal delay={0.1} className="pointer-events-auto">
          <ul aria-label="Numbers" className="glass mt-20 grid grid-cols-2 overflow-hidden lg:grid-cols-4">
            {stats.map(({ icon: Icon, value, suffix, label }, i) => (
              <li
                key={label}
                className={`flex items-center gap-4 border-line p-5 sm:p-6 ${STAT_BORDERS[i]}`}
              >
                <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line-strong bg-deep/70 text-lilac sm:flex">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <p className="min-w-0">
                  <span className="font-display block text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-ink sm:text-[2.3rem]">
                    <CountUp to={value} suffix={suffix} />
                  </span>
                  <span className="mt-1.5 block text-[13px] leading-snug text-ink-3">{label}</span>
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
