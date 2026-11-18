"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * Entrance for blocks of content: they come into focus (blur → sharp) rather
 * than sliding in from far away. Runs once, never on scroll back.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduce = useReducedMotion();
  const Tag = motion[as];

  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      ref={ref as never}
      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
}

/**
 * Headline lines rise out of their own baseline, one after the other — the
 * one orchestrated moment each section gets.
 */
export function LineReveal({
  lines,
  className,
  lineClassName = "",
  delay = 0,
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  return (
    <span ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={`block ${lineClassName}`}
            initial={reduce ? false : { y: "105%" }}
            animate={inView || reduce ? { y: "0%" } : undefined}
            transition={{ duration: 0.9, delay: delay + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
