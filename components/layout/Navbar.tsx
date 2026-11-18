"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { HOME_SECTIONS } from "@/lib/navigation";
import { SITE } from "@/lib/site";
import { LogoMark } from "./LogoMark";
import { MobileMenu } from "./MobileMenu";
import { PaletteButton } from "./PaletteButton";

/**
 * Top bar. On the home page the links are in-page anchors with a scroll-spy;
 * anywhere else they point back to the same anchors on "/". The bar is clear
 * over the hero and turns to glass once the page moves.
 */
export function Navbar() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [active, setActive] = useState("top");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!onHome) return;
    const sections = HOME_SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    // The section crossing a thin band just above mid-screen is the active one
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-42% 0px -56% 0px" }
    );
    sections.forEach((section) => io.observe(section));
    return () => io.disconnect();
  }, [onHome]);

  const current = onHome ? active : pathname.startsWith("/projects") ? "projects" : "";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled
          ? "border-b border-line bg-night/65 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg"
          aria-label={`${SITE.name} — home`}
        >
          <LogoMark size={30} className="transition-transform duration-700 ease-[var(--ease-out)] group-hover:rotate-[18deg]" />
          <span className="font-display text-[1.3rem] font-bold tracking-[-0.02em] text-ink">{SITE.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {HOME_SECTIONS.map(({ label, id }) => {
              const isActive = current === id;
              return (
                <li key={id}>
                  <Link
                    href={onHome ? `#${id}` : `/#${id}`}
                    aria-current={isActive ? "location" : undefined}
                    className={`relative block rounded-lg px-3.5 py-2 text-[15px] transition-colors ${
                      isActive ? "text-ink" : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    {label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-lilac to-violet shadow-[0_0_12px_rgba(139,108,255,0.9)]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2.5">
          <PaletteButton />
          <span data-magnetic="0.2" className="hidden transition-transform duration-300 ease-[var(--ease-out)] sm:inline-block">
            <Link
              href={onHome ? "#contact" : "/#contact"}
              className="inline-flex items-center gap-2 rounded-full border border-violet/60 bg-violet/15 px-4 py-2 text-sm font-semibold text-ink shadow-[0_0_24px_-6px_rgba(139,108,255,0.9),inset_0_0_0_1px_rgba(196,181,255,0.15)] transition-colors hover:bg-violet/30"
            >
              Let&apos;s talk <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </span>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
