"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/ambient-motion";

interface CountUpProps {
  to: number;
  /** Text after the number ("fps", "+") */
  suffix?: string;
  duration?: number;
  className?: string;
  /** Thousands separator */
  group?: boolean;
}

/**
 * Counts up to a real number the first time it is seen. Server render shows
 * the final value, so the figure is never missing without JavaScript.
 */
export function CountUp({ to, suffix = "", duration = 1400, className, group = true }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    // Only animate figures that start off-screen; a visible number never resets
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) return;
    setValue(0);

    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        setValue(Math.round(to * eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, duration]);

  const text = group ? value.toLocaleString("en-US") : String(value);
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {text}
      {suffix}
    </span>
  );
}
