"use client";

import { motion } from "motion/react";

/**
 * The seam between two sections: a hairline that draws itself outward from a
 * glowing node as it scrolls into view. Marks the handoff without a hard edge.
 */
export function SectionDivider() {
  return (
    <div aria-hidden="true" className="relative mx-auto flex h-px max-w-site items-center justify-center px-5 sm:px-8">
      <motion.span
        className="block h-px w-full origin-center bg-gradient-to-r from-transparent via-lilac/40 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -18% 0px" }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.span
        className="absolute h-[7px] w-[7px] rounded-full bg-lilac shadow-[0_0_16px_4px_rgba(139,108,255,0.85)]"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -18% 0px" }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </div>
  );
}
