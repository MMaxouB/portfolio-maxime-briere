"use client";

import { Pause, Play } from "lucide-react";
import { setMotionPaused, usePausedByUser } from "@/lib/ambient-motion";

/**
 * Pause every ambient animation on the site (WCAG 2.2.2). The choice is
 * remembered. Hidden when the OS already asks for reduced motion, since
 * nothing ambient runs then.
 */
export function MotionToggle() {
  const paused = usePausedByUser();

  return (
    <button
      type="button"
      onClick={() => setMotionPaused(!paused)}
      aria-pressed={paused}
      aria-label={paused ? "Resume background animations" : "Pause background animations"}
      title={paused ? "Resume animations" : "Pause animations"}
      className="glass fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center !rounded-full text-ink-2 transition-colors hover:text-ink motion-reduce:hidden"
    >
      {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
    </button>
  );
}
