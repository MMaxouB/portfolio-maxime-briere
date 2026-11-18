"use client";

import { SquareTerminal } from "lucide-react";
import { useApp } from "@/providers/AppProviders";

/** The footer's door to the terminal easter egg (spec §13.2). */
export function TerminalHint() {
  const { openTerminal } = useApp();
  return (
    <button
      type="button"
      onClick={openTerminal}
      className="group inline-flex items-center gap-2.5 rounded-xl border border-dashed border-line-strong px-3.5 py-2.5 font-mono text-[12.5px] text-ink-2 transition-colors hover:border-lilac hover:text-ink"
    >
      <SquareTerminal size={15} className="text-lilac" aria-hidden="true" />
      <span>
        $ type <span className="text-lilac">help</span> to explore
      </span>
      <span aria-hidden="true" className="caret -ml-1 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}
