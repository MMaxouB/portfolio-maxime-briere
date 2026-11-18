"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { DEEP_PAGES } from "@/lib/navigation";
import { PageIcon } from "./PageIcon";

/**
 * "Pages" in the top bar: the detailed pages one click away, each with a line
 * on what is inside — so they no longer hide at the bottom of the footer.
 * Opens on click (and closes on Escape, outside click or navigation).
 */
export function PagesMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const pathname = usePathname();
  const onDeepPage = DEEP_PAGES.some((page) => pathname.startsWith(page.href));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[15px] transition-colors ${
          open || onDeepPage ? "text-ink" : "text-ink-2 hover:text-ink"
        }`}
      >
        Pages
        <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-3 w-[22rem] origin-top-right rounded-[20px] border border-line-strong bg-deep/95 p-2 shadow-[0_30px_80px_-20px_rgba(91,76,200,0.7)] backdrop-blur-2xl"
          >
            <ul>
              {DEEP_PAGES.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname.startsWith(page.href) ? "page" : undefined}
                    className="group flex items-center gap-3.5 rounded-2xl px-3 py-2.5 transition-colors hover:bg-violet/15 focus-visible:bg-violet/15"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-night/60 text-lilac transition-transform duration-300 group-hover:scale-110">
                      <PageIcon name={page.icon} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14.5px] font-semibold text-ink">{page.label}</span>
                      <span className="block truncate text-[12.5px] text-ink-3">{page.blurb}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
