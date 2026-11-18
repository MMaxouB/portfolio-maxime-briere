"use client";

import { useApp } from "@/providers/AppProviders";

/** A nudge toward the terminal, the 404's natural exit. */
export function NotFoundTerminal() {
  const { openTerminal } = useApp();
  return (
    <button
      type="button"
      onClick={openTerminal}
      className="mx-auto mt-10 inline-flex items-center gap-2 rounded-xl border border-dashed border-line-strong px-4 py-2.5 font-mono text-[13px] text-ink-2 transition-colors hover:border-lilac hover:text-ink"
    >
      Lost? <span className="text-lilac">$ help</span>
    </button>
  );
}
