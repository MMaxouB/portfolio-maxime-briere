import Link from "next/link";
import { ArrowUpRight, Send } from "lucide-react";
import { HOME_SECTIONS } from "@/lib/navigation";
import { SITE } from "@/lib/site";
import { LogoMark } from "./LogoMark";
import { TerminalHint } from "./TerminalHint";
import { CurrentYear } from "./CurrentYear";
import { Skyline } from "@/components/scenery/Skyline";
import { GitHubIcon, DiscordIcon } from "@/components/ui/BrandIcons";

const BUILD_YEAR = new Date().getFullYear();

const EXPLORE = [
  { label: "All projects", href: "/projects" },
  { label: "Expertise", href: "/expertise" },
  { label: "Timeline", href: "/timeline" },
  { label: "Cyber lab", href: "/cyber" },
  { label: "About, longer", href: "/about" },
];

/**
 * End of the journey: a thank-you, the map of the site, and the city that was
 * on the horizon the whole time. The terminal invitation lives here (spec §13).
 */
export function Footer() {
  return (
    <footer className="relative isolate mt-auto overflow-hidden pt-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-[10%] h-[50%] w-[90%] -translate-x-1/2"
          style={{ background: "radial-gradient(closest-side, rgba(124,92,255,0.16), transparent)" }}
        />
      </div>

      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-line-strong bg-deep/60 px-4 py-1.5 font-mono text-xs text-ink-2 backdrop-blur">
            $ exit 0
          </span>
          <h2 className="font-display mt-6 text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-none tracking-[-0.04em] text-ink">
            Thanks for <span className="ink-gradient">visiting.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[34rem] text-[1.05rem] leading-relaxed text-ink-2">
            Stay curious, ship carefully — and see you around the internet.
          </p>
          <div aria-hidden="true" className="mx-auto mt-10 flex max-w-[640px] items-center gap-4">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-line-strong" />
            <LogoMark size={22} />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-line-strong" />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-0">
          <div className="col-span-2 md:col-span-1 md:pr-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <LogoMark size={32} />
              <span className="font-display text-[1.5rem] font-bold tracking-[-0.02em] text-ink">{SITE.name}</span>
            </Link>
            <p className="mt-4 max-w-[17rem] text-[14.5px] leading-relaxed text-ink-2">
              Backend, automation and AI tools — built carefully, then attacked on purpose.
            </p>
            <div className="mt-5 flex gap-2.5">
              <a href={SITE.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub (opens in a new tab)" className="glass flex h-10 w-10 items-center justify-center !rounded-xl text-ink-2 transition-colors hover:text-ink">
                <GitHubIcon size={17} />
              </a>
              <a href={SITE.links.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord (opens in a new tab)" className="glass flex h-10 w-10 items-center justify-center !rounded-xl text-ink-2 transition-colors hover:text-ink">
                <DiscordIcon size={17} />
              </a>
            </div>
          </div>

          <nav aria-label="Sections" className="md:border-l md:border-line md:px-8">
            <h3 className="text-[15px] font-semibold text-ink">On this page</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {HOME_SECTIONS.map(({ label, id }) => (
                <li key={id}>
                  <Link href={`/#${id}`} className="group flex items-center justify-between text-[14.5px] text-ink-2 transition-colors hover:text-ink">
                    {label}
                    <ArrowUpRight size={14} className="text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lilac" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="More pages" className="md:border-l md:border-line md:px-8">
            <h3 className="text-[15px] font-semibold text-ink">Go deeper</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {EXPLORE.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="group flex items-center justify-between text-[14.5px] text-ink-2 transition-colors hover:text-ink">
                    {label}
                    <ArrowUpRight size={14} className="text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lilac" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-1 md:border-l md:border-line md:pl-8">
            <h3 className="text-[15px] font-semibold text-ink">Let&apos;s talk</h3>
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink-2">
              Collaborations, backend work, a security question — all welcome.
            </p>
            <Link href="/#contact" className="btn-primary mt-5 !px-5 !py-3 text-sm">
              <Send size={15} aria-hidden="true" /> Send a message
            </Link>
            <div className="mt-6">
              <TerminalHint />
            </div>
          </div>
        </div>

      </div>

      {/* The city that was on the horizon all along, with the bottom bar on the water */}
      <div className="relative mt-6 h-[340px] sm:h-[440px]">
        <Skyline className="absolute inset-0 h-full w-full" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-night to-transparent" />
        <div className="absolute inset-x-0 bottom-5 mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="glass flex flex-col items-center justify-between gap-2 !rounded-2xl px-5 py-4 text-[13px] text-ink-2 sm:flex-row">
            <p>
              © <CurrentYear buildYear={BUILD_YEAR} /> {SITE.name}. Built with Next.js, drawn in SVG and canvas.
            </p>
            <p className="font-mono text-xs text-lilac">build × break × fix</p>
            <p>Made in {SITE.location}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
