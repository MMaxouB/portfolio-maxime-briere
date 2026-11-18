"use client";

import { useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/providers/AppProviders";

/** The platform never changes at runtime, so there is nothing to subscribe to. */
const noopSubscribe = () => () => {};
const isMacClient = () => /mac|iphone|ipad/i.test(navigator.userAgent);

export function PaletteButton() {
  const { openPalette } = useApp();
  // Server renders "Ctrl" and the client swaps it in after hydration — no mismatch.
  const isMac = useSyncExternalStore(noopSubscribe, isMacClient, () => false);
  const modifier = isMac ? "⌘" : "Ctrl";

  return (
    <button
      type="button"
      onClick={openPalette}
      aria-label={`Search the site (${modifier} K)`}
      className="hidden items-center gap-2 rounded-full border border-line-strong bg-deep/50 py-1.5 pl-3 pr-1.5 text-xs text-ink-3 transition-colors hover:border-lilac/50 hover:text-ink lg:flex"
    >
      <Search size={13} aria-hidden="true" />
      <span>Search</span>
      <kbd className="rounded-full border border-line-strong bg-night/60 px-2 py-0.5 font-mono text-[10px] leading-none text-ink-2">
        {modifier} K
      </kbd>
    </button>
  );
}
