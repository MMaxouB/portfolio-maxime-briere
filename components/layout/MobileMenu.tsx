"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowRight, Menu, Search, SquareTerminal, X } from "lucide-react";
import { HOME_SECTIONS, SOCIAL_NAV } from "@/lib/navigation";
import { useDialog } from "@/lib/useDialog";
import { useApp } from "@/providers/AppProviders";

const MORE = [
  { label: "All projects", href: "/projects" },
  { label: "Timeline", href: "/timeline" },
  { label: "Cyber lab", href: "/cyber" },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const { openPalette, openTerminal } = useApp();

  const close = useCallback(() => setIsOpen(false), []);
  // Same chrome as the palette and the terminal: scroll lock, focus trap, Escape.
  useDialog(isOpen, panelRef, close);

  const anchor = (id: string) => (pathname === "/" ? `#${id}` : `/#${id}`);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        className="glass flex h-10 w-10 items-center justify-center !rounded-full text-ink-2 transition-colors hover:text-ink"
        aria-label="Open menu"
      >
        <Menu size={18} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-50 bg-night/70 backdrop-blur-sm"
              aria-hidden="true"
            />

            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={reduce ? { opacity: 0 } : { x: "100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.45 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-line bg-deep/95 p-6 backdrop-blur-xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-mono text-sm text-lilac">~/menu</span>
                <button
                  type="button"
                  onClick={close}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink-2 transition-colors hover:text-ink"
                  aria-label="Close menu"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Mobile" className="flex flex-col">
                {HOME_SECTIONS.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={reduce ? false : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05, duration: 0.4 }}
                  >
                    <Link
                      href={anchor(item.id)}
                      onClick={close}
                      className="font-display flex items-center justify-between border-b border-line py-3.5 text-[1.7rem] font-bold tracking-[-0.02em] text-ink transition-colors hover:text-lilac"
                    >
                      {item.label}
                      <ArrowRight size={18} className="text-ink-3" aria-hidden="true" />
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-6 flex flex-wrap gap-2">
                  {MORE.map((item) => (
                    <Link key={item.href} href={item.href} onClick={close} className="pill px-3.5 py-1.5 text-sm">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="mt-auto flex flex-col gap-4 pt-8">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      openPalette();
                    }}
                    className="pill flex-1 justify-center px-3 py-2.5 text-sm"
                  >
                    <Search size={15} aria-hidden="true" /> Search
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      openTerminal();
                    }}
                    className="pill flex-1 justify-center px-3 py-2.5 text-sm"
                  >
                    <SquareTerminal size={15} aria-hidden="true" /> Terminal
                  </button>
                </div>
                <div className="flex gap-5 text-sm text-ink-3">
                  {SOCIAL_NAV.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-ink"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
