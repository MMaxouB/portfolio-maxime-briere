"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/ambient-motion";

const GLYPHS = "!<>-_\\/[]{}=+*^?#01ABCDEFxz";

interface DecodeTextProps {
  text: string;
  /** Start decoding after this many ms (0 = on mount) */
  delay?: number;
  /** Total duration of one decode pass */
  duration?: number;
  /** Re-run the decode when the pointer enters */
  replayOnHover?: boolean;
  className?: string;
  /** Applied to each settled letter (e.g. a gradient that must clip per glyph) */
  letterClassName?: string;
}

/**
 * Letters arrive scrambled and settle left to right — a ciphertext resolving
 * into a name. Runs once on load and again on hover; never loops on its own.
 * Each glyph keeps its final width so the line never reflows.
 */
export function DecodeText({
  text,
  delay = 0,
  duration = 900,
  replayOnHover = true,
  className,
  letterClassName,
}: DecodeTextProps) {
  const [chars, setChars] = useState<string[]>(() => text.split(""));
  const [settled, setSettled] = useState<boolean[]>(() => text.split("").map(() => true));
  const frame = useRef(0);
  const running = useRef(false);

  const run = useCallback(() => {
    if (running.current || prefersReducedMotion()) return;
    running.current = true;
    const letters = text.split("");
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const resolved = Math.floor(progress * letters.length * 1.15);
      setChars(
        letters.map((letter, i) =>
          i < resolved || letter === " "
            ? letter
            : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        )
      );
      setSettled(letters.map((_, i) => i < resolved));
      if (progress < 1) frame.current = requestAnimationFrame(step);
      else {
        setChars(letters);
        setSettled(letters.map(() => true));
        running.current = false;
      }
    };
    frame.current = requestAnimationFrame(step);
  }, [text, duration]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timer = window.setTimeout(run, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame.current);
      running.current = false;
    };
  }, [run, delay]);

  return (
    <span className={className} onPointerEnter={replayOnHover ? run : undefined}>
      <span className="sr-only">{text}</span>
      {chars.map((char, i) => (
        <span key={i} aria-hidden="true" className="relative inline-block">
          {/* The real letter holds the width; the scrambled one sits on top */}
          <span className={settled[i] ? letterClassName : "invisible"}>{text[i]}</span>
          {!settled[i] && (
            <span className="absolute inset-0 text-center font-mono text-[0.62em] leading-[1.6] text-lilac/70">
              {char}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
