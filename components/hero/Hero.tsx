"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, MapPin, Repeat } from "lucide-react";
import { SITE } from "@/lib/site";
import { Attractor } from "./Attractor";
import { CrackedWord } from "./CrackedWord";
import { LiveClock } from "./LiveClock";
import { DecodeText } from "@/components/ui/DecodeText";
import { TypedText } from "@/components/ui/TypedText";
import { HandNote } from "@/components/ui/HandNote";
import { Planet } from "@/components/scenery/Planet";
import { GitHubIcon, DiscordIcon } from "@/components/ui/BrandIcons";
import { useAmbientMotion } from "@/lib/ambient-motion";

const LOOP = ["build", "break", "fix", "repeat"] as const;

/**
 * Hero — `$ whoami` types itself, the name decodes as its output, and the
 * Lorenz attractor runs on the right. One orchestrated entrance, then the page
 * stays still unless the visitor does something.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const ambient = useAmbientMotion();
  const [splitSeen, setSplitSeen] = useState(false);
  const [loopIndex, setLoopIndex] = useState(0);

  const onButterfly = useCallback(() => {
    window.setTimeout(() => setSplitSeen(true), 6000);
  }, []);

  // build → break → fix → repeat, one word lit at a time
  useEffect(() => {
    if (!ambient) return;
    const id = window.setInterval(() => setLoopIndex((i) => (i + 1) % LOOP.length), 1600);
    return () => window.clearInterval(id);
  }, [ambient]);

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section id="top" aria-label="Introduction" className="relative isolate min-h-[100svh] overflow-hidden pt-28 lg:pt-32">
      {/* Scenery */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -right-[10%] top-[-10%] h-[70%] w-[70%]"
          style={{ background: "radial-gradient(closest-side, rgba(124,92,255,0.22), transparent)" }}
        />
        <Planet arcs className="absolute -bottom-[46%] -right-[18%] w-[90vw] max-w-[1100px] opacity-90 sm:-bottom-[60%] lg:-bottom-[70%] lg:-right-[8%] lg:w-[62vw]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night" />
      </div>

      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-6 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)] lg:gap-0">
        {/* Copy */}
        <div className="relative z-10 flex flex-col pb-10 lg:pb-24 lg:pt-10">
          <motion.p {...rise(0)} className="font-mono text-sm text-lilac">
            <TypedText text="$ whoami" delay={150} speed={70} />
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: reduce ? 0 : 0.75 }}
            className="font-display mt-3 text-[clamp(4.2rem,12vw,9.5rem)] font-extrabold leading-[0.88] tracking-[-0.045em]"
          >
            <DecodeText text={SITE.name} delay={reduce ? 0 : 750} duration={850} letterClassName="name-gradient" />
          </motion.h1>

          <motion.p
            {...rise(1.25)}
            className="group font-display mt-6 text-[clamp(1.9rem,4.4vw,3.35rem)] font-bold leading-[1.04] tracking-[-0.03em] text-ink"
          >
            I build software
            <br />
            and learn how it <CrackedWord>breaks.</CrackedWord>
          </motion.p>

          <motion.p {...rise(1.4)} className="mt-6 max-w-[34rem] text-[1.0625rem] leading-relaxed text-ink-2">
            Backend systems, automation pipelines and AI tools in Python and TypeScript — tested as if
            someone is going to attack them. Usually, that someone is me.
          </motion.p>

          <motion.div {...rise(1.55)} className="mt-9 flex flex-wrap items-center gap-3.5">
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

          <motion.div {...rise(1.7)} className="mt-8 flex flex-wrap items-center gap-3">
            {[
              { href: SITE.links.github, label: "GitHub", Icon: GitHubIcon },
              { href: SITE.links.discord, label: "Discord", Icon: DiscordIcon },
            ].map(({ href, label, Icon }) => (
              <span key={label} data-magnetic="0.35" className="inline-block transition-transform duration-300 ease-[var(--ease-out)]">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} (opens in a new tab)`}
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

          <motion.div {...rise(1.85)} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-ink-2">
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

        {/* Visual */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, delay: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[380px] sm:h-[460px] lg:absolute lg:right-[max(0px,calc((100vw-1240px)/2))] lg:top-[88px] lg:h-[calc(100%-200px)] lg:w-[min(52vw,700px)]"
        >
          <Attractor className="absolute inset-0" onButterfly={onButterfly} />

          <div className="absolute right-[4%] top-[2%] hidden lg:block">
          <HandNote arrow="down-left" rotate={-5} className="text-[1.35rem]">
            {splitSeen ? (
              <>
                see? same start,
                <br />
                different universe.
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

          <div className="glass lit absolute bottom-4 right-3 hidden w-[258px] p-4 sm:block lg:-bottom-2 lg:right-4">
            <p className="flex items-center gap-2 font-mono text-[11px] text-ink-3">
              <Repeat size={12} aria-hidden="true" /> ~/mindset
            </p>
            <p className="mt-2 text-[15px] text-ink-2">
              {LOOP.map((word, i) => (
                <span key={word}>
                  <span className={`transition-colors duration-500 ${i === loopIndex ? "text-ink" : ""}`}>
                    {word}
                  </span>
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
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-ink-3 transition-colors hover:text-ink-2 lg:flex"
      >
        <span className="flex h-9 w-6 justify-center rounded-full border border-line-strong pt-2">
          <span className="h-1.5 w-1 rounded-full bg-lilac" style={{ animation: "scroll-dot 1.8s var(--ease-out) infinite" }} />
        </span>
        Scroll to explore
      </a>
    </section>
  );
}
