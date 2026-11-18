"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/ambient-motion";

interface TypedTextProps {
  text: string;
  /** ms before typing starts, counted from when the element enters the viewport */
  delay?: number;
  /** ms per character */
  speed?: number;
  className?: string;
  /** Keep the block caret after typing ends */
  keepCaret?: boolean;
  onDone?: () => void;
}

/**
 * Types its text once, the first time it scrolls into view — like a command
 * being entered. The full text is always in the accessibility tree; only the
 * visual characters are revealed.
 */
export function TypedText({
  text,
  delay = 0,
  speed = 42,
  className,
  keepCaret = false,
  onDone,
}: TypedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    let interval = 0;

    function run() {
      if (prefersReducedMotion()) {
        setShown(text.length);
        doneRef.current?.();
        return;
      }
      timer = window.setTimeout(() => {
        setTyping(true);
        let count = 0;
        interval = window.setInterval(() => {
          count += 1;
          setShown(count);
          if (count >= text.length) {
            window.clearInterval(interval);
            setTyping(false);
            doneRef.current?.();
          }
        }, speed);
      }, delay);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          run();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [text, delay, speed]);

  const done = shown >= text.length;

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={typing || (keepCaret && done) ? "caret" : undefined}>
        {text.slice(0, shown)}
        {/* Reserve the line so nothing jumps while typing */}
        <span className="invisible">{text.slice(shown)}</span>
      </span>
    </span>
  );
}
