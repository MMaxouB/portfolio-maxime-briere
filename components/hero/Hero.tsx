"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Mail, MapPin, Repeat } from "lucide-react";
import { SITE } from "@/lib/site";
import { Attractor } from "./Attractor";
import { CrackedWord } from "./CrackedWord";
import { LiveClock } from "./LiveClock";
import { DecodeText } from "@/components/ui/DecodeText";
import { TypedText } from "@/components/ui/TypedText";
import { HandNote } from "@/components/ui/HandNote";
import { Planet3D } from "@/components/scenery/Planet3D";
import { GitHubIcon, DiscordIcon } from "@/components/ui/BrandIcons";
import { useAmbientMotion } from "@/lib/ambient-motion";

const LOOP = ["build", "break", "fix", "repeat"] as const;

const SOCIALS = [
  { href: `mailto:${SITE.email}`, label: "Email", Icon: Mail, external: false },
  { href: SITE.links.github, label: "GitHub", Icon: GitHubIcon, external: true },
  { href: SITE.links.discord, label: "Discord", Icon: DiscordIcon, external: true },
] as const;

/**
 * Hero — `$ whoami` types itself, the name decodes as its output, the Lorenz
 * attractor runs on the right and a 3D planet rises under it.
 *
 * Layout: a real two-column grid (no absolutely positioned blocks, which is
 * what used to clip things at unusual sizes). The planet is scenery behind it.
 */
export function Hero() {
  const ambient = useAmbientMotion();
  const [stage, setStage] = useState<"idle" | "dropped" | "split">("idle");
  const [loopIndex, setLoopIndex] = useState(0);

  const onButterfly = useCallback(() => setStage((s) => (s === "split" ? s : "dropped")), []);
  const onSplit = useCallback(() => setStage("split"), []);

  // build → break → fix → repeat, one word lit at a time
  useEffect(() => {
    if (!ambient) return;
    const id = window.setInterval(() => setLoopIndex((i) => (i + 1) % LOOP.length), 1600);
    return () => window.clearInterval(id);
  }, [ambient]);

  // Large text comes into focus instead of fading in from nothing: it is
  // painted (faint, blurred) on the first frame, so it never delays LCP.
  // (Never branch on reduced motion here: the server cannot know it, and the
  // markup must match. MotionConfig reducedMotion="user" drops the transforms.)
  const focus = (delay: number) => ({
    initial: { opacity: 0.18, filter: "blur(12px)", y: 8 },
    animate: { opacity: 1, filter: "blur(0px)", y: 0 },
    transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section
      id="top"
      aria-label="Introduction"
      className="relative isolate min-h-[100svh] overflow-x-clip pb-[18svh] pt-28 sm:pb-[20svh] lg:pt-32"
    >
      {/* Scenery. overflow-x is clipped (no sideways scroll) but the planet may
          spill downward into the next section, so there is no seam. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -right-[10%] top-[-10%] h-[70%] w-[70%]"
          style={{ background: "radial-gradient(closest-side, rgba(124,92,255,0.22), transparent)" }}
        />
        {/* Anchored to the page container, not the viewport. --s is the canvas
            side; the sphere is ~38% of it, centred, so its top sits 0.31·s below
            the canvas top. Place that point ~16svh above the bottom of the hero:
            the rings of skills turn around it and the base sinks into About. */}
        <div className="relative mx-auto h-full max-w-site">
          <Planet3D
            className="absolute [mask-image:linear-gradient(to_bottom,#000_62%,transparent_96%)]"
            style={
              {
                "--s": "clamp(360px, 52vw, 760px)",
                width: "var(--s)",
                height: "var(--s)",
                right: "calc(var(--s) * -0.08)",
                top: "calc(100% - 7svh - var(--s) * 0.31)",
              } as React.CSSProperties
            }
          />
        </div>
      </div>

      <div className="pointer-events-none mx-auto grid max-w-site grid-cols-1 gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)] lg:items-center lg:gap-6">
        {/* Copy */}
        <div className="pointer-events-auto relative z-10 flex flex-col pb-2 lg:py-8">
          <motion.p {...rise(0)} className="font-mono text-sm text-lilac">
            <TypedText text="$ whoami" delay={100} speed={55} />
          </motion.p>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.55 }}
            className="font-display mt-3 text-[clamp(4rem,11.5vw,9rem)] font-extrabold leading-[0.88] tracking-[-0.045em]"
          >
            <DecodeText text={SITE.name} delay={550} duration={750} letterClassName="name-gradient" />
          </motion.h1>

          <motion.p
            {...focus(0.85)}
            className="group font-display mt-6 text-[clamp(1.8rem,4.2vw,3.35rem)] font-bold leading-[1.04] tracking-[-0.03em] text-ink"
          >
            I build software
            <br />
            and learn how it <CrackedWord>breaks.</CrackedWord>
          </motion.p>

          <motion.p {...focus(1)} className="mt-6 max-w-[34rem] text-[1.0625rem] leading-relaxed text-ink-2">
            Backend systems, automation pipelines and AI tools in Python and TypeScript — tested as if
            someone is going to attack them. Usually, that someone is me.
          </motion.p>

          <motion.div {...rise(1.15)} className="mt-9 flex flex-wrap items-center gap-3.5">
            <span data-magnetic="0.22" className="inline-block transition-transform duration-300 ease-[var(--ease-out)]">
              <a href="#projects" className="btn-primary">
                View my work <ArrowRight size={17} aria-hidden="true" />
              </a>
            </span>
            <span data-magnetic="0.22" className="inline-block transition-transform duration-300 ease-[var(--ease-out)]">
              <a href="#contact" className="btn-ghost">
                Get in touch
              </a>
            </span>
          </motion.div>

          <motion.div {...rise(1.25)} className="mt-8 flex flex-wrap items-center gap-3">
            {SOCIALS.map(({ href, label, Icon, external }) => (
              <span key={label} data-magnetic="0.35" className="inline-block transition-transform duration-300 ease-[var(--ease-out)]">
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  aria-label={external ? `${label} (opens in a new tab)` : `Send an email to ${SITE.email}`}
                  title={external ? label : SITE.email}
                  className="glass flex h-12 w-12 items-center justify-center !rounded-2xl text-ink-2 transition-colors hover:text-ink"
                >
                  <Icon size={19} />
                </a>
              </span>
            ))}
            {SITE.availability && (
              <span className="ml-1 inline-flex items-center gap-2.5 text-sm text-ink-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inset-0 rounded-full bg-signal" style={{ animation: "pulse-ring 2.2s var(--ease-out) infinite" }} />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-signal shadow-[0_0_12px_rgba(94,233,181,0.8)]" />
                </span>
                {SITE.availability}
              </span>
            )}
          </motion.div>

          <motion.div {...rise(1.35)} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-ink-2">
            <span className="inline-flex items-center gap-2">
              <MapPin size={15} className="text-lilac" aria-hidden="true" />
              Currently in {SITE.location}
            </span>
            <LiveClock
              timeZone={SITE.timeZone}
              className="rounded-full border border-line-strong bg-deep/60 px-3 py-1 font-mono text-xs text-ink"
            />
          </motion.div>
        </div>

        {/* Visual: the attractor fits whatever box it is given (see Attractor) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto relative h-[380px] sm:h-[460px] lg:h-[min(70svh,max(720px,30vw))]"
        >
          <Attractor className="absolute inset-0" onButterfly={onButterfly} onSplit={onSplit} />

          <div className="pointer-events-none absolute right-[2%] top-0 hidden lg:block">
            <HandNote arrow="down-left" rotate={-5} className="text-[1.35rem]">
              {stage === "split" ? (
                <>
                  see? same start,
                  <br />
                  different universe.
                </>
              ) : stage === "dropped" ? (
                <>
                  two trails, one path…
                  <br />
                  for now. keep watching.
                </>
              ) : (
                <>
                  click anywhere here —
                  <br />
                  tiny change, whole new path
                </>
              )}
            </HandNote>
          </div>

          <div className="glass lit absolute bottom-3 right-3 hidden w-[258px] p-4 sm:block lg:hidden xl:bottom-4 xl:block">
            <p className="flex items-center gap-2 font-mono text-[11px] text-ink-3">
              <Repeat size={12} aria-hidden="true" /> ~/mindset
            </p>
            <p className="mt-2 text-[15px] text-ink-2">
              {LOOP.map((word, i) => (
                <span key={word}>
                  <span className={`transition-colors duration-500 ${i === loopIndex ? "text-ink" : ""}`}>{word}</span>
                  {i < LOOP.length - 1 && <span className="mx-1.5 text-ink-3">→</span>}
                </span>
              ))}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <a
        href="#about"
        className="absolute bottom-6 left-[max(2rem,calc(50%-var(--container-site)/2+2rem))] hidden flex-col items-center gap-2 text-xs text-ink-3 transition-colors hover:text-ink-2 lg:flex"
      >
        <span className="flex h-9 w-6 justify-center rounded-full border border-line-strong pt-2">
          <span className="h-1.5 w-1 rounded-full bg-lilac" style={{ animation: "scroll-dot 1.8s var(--ease-out) infinite" }} />
        </span>
        Scroll to explore
      </a>
    </section>
  );
}
