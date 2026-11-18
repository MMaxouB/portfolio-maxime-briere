"use client";

import { Pause, Play } from "lucide-react";
import { setMotionPaused, usePausedByUser } from "@/lib/ambient-motion";

/**
 * Pause every ambient animation on the site (WCAG 2.2.2). The choice is
 * remembered. Hidden when the OS already asks for reduced motion, since
 * nothing ambient runs then. Lives in the top bar so it never covers content.
 */
/** `className` carries the display (default "flex") so callers can hide it per breakpoint. */
export function MotionToggle({ className = "flex" }: { className?: string }) {
  const paused = usePausedByUser();

  return (
    <button
      type="button"
      onClick={() => setMotionPaused(!paused)}
      aria-pressed={paused}
      aria-label={paused ? "Resume background animations" : "Pause background animations"}
      title={paused ? "Resume animations" : "Pause animations"}
      className={`h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-deep/50 text-ink-3 transition-colors hover:border-lilac/50 hover:text-ink motion-reduce:hidden ${className}`}
    >
      {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
    </button>
  );
}
