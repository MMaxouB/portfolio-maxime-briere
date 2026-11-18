"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search } from "lucide-react";
import { COMMANDS, Command, CommandAction, CommandGroup } from "@/lib/commands";
import { searchCommands } from "@/lib/search";
import { isExternalHref } from "@/lib/navigation";
import { useApp } from "@/providers/AppProviders";
import { useDialog } from "@/lib/useDialog";

const GROUP_LABELS: Record<CommandGroup, string> = {
  navigation: "Navigation",
  projects: "Projects",
  social: "Connect",
  system: "System",
};

export function CommandPalette() {
  const { paletteOpen, closePalette, openTerminal } = useApp();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useDialog(paletteOpen, panelRef, closePalette);

  // Reset on open
  useEffect(() => {
    if (!paletteOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");
    setActiveIndex(0);
    // Defer focus so the animation doesn't fight it
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [paletteOpen]);

  const results = useMemo(() => searchCommands(COMMANDS, query), [query]);

  // Keep activeIndex in bounds when the list shrinks
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex((index) => Math.min(index, Math.max(results.length - 1, 0)));
  }, [results.length]);

  // Scroll active item into view
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const executeAction = useCallback(
    (action: CommandAction) => {
      closePalette();

      if (action.type === "navigate") {
        // https:, mailto:, tel: … router.push() cannot handle those
        if (isExternalHref(action.href)) {
          window.open(action.href, "_blank", "noopener,noreferrer");
        } else {
          router.push(action.href);
        }
        return;
      }

      // Small delay so the palette exit animation finishes first
      setTimeout(openTerminal, shouldReduceMotion ? 0 : 200);
    },
    [closePalette, openTerminal, router, shouldReduceMotion]
  );

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(Math.max(results.length - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      executeAction(results[activeIndex].action);
    }
  }

  /**
   * Group for rendering while keeping one flat index per row, so ↑/↓ walk the
   * whole list and `aria-activedescendant` stays in sync with the ranking.
   */
  const sections = useMemo(() => {
    const map = new Map<CommandGroup, { command: Command; index: number }[]>();
    results.forEach((command, index) => {
      const rows = map.get(command.group) ?? [];
      rows.push({ command, index });
      map.set(command.group, rows);
    });
    return Array.from(map.entries());
  }, [results]);

  const panelVariants = {
    hidden: { opacity: 0, scale: 0.97, y: shouldReduceMotion ? 0 : -8 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.97, y: shouldReduceMotion ? 0 : -8 },
  };

  return (
    <AnimatePresence>
      {paletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={closePalette}
            className="fixed inset-0 z-[100] bg-night/70 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="palette-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[16vh] z-[101] mx-auto max-w-xl overflow-hidden rounded-[22px] border border-line-strong bg-deep/90 shadow-[0_40px_120px_-30px_rgba(91,76,200,0.75)] backdrop-blur-2xl"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-line px-5">
              <Search size={17} className="shrink-0 text-lilac" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search pages, projects, technologies…"
                // text-base below the md breakpoint keeps iOS Safari from zooming on focus
                className="h-14 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-3 focus-visible:outline-none md:text-[15px]"
                autoComplete="off"
                spellCheck={false}
                role="combobox"
                aria-expanded="true"
                aria-label="Search commands"
                aria-autocomplete="list"
                aria-controls="palette-list"
                aria-activedescendant={
                  results.length > 0 ? `palette-item-${activeIndex}` : undefined
                }
              />
              <button
                onClick={closePalette}
                className="shrink-0 rounded-full border border-line-strong px-2 py-1 font-mono text-[10px] text-ink-3 transition-colors hover:text-ink"
                aria-label="Close command palette"
              >
                esc
              </button>
            </div>

            {/* Results */}
            <ul
              ref={listRef}
              id="palette-list"
              role="listbox"
              aria-label="Commands"
              className="max-h-[22rem] overflow-y-auto overscroll-contain py-2"
            >
              {results.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-ink-3">
                  No results for &ldquo;{query}&rdquo;
                </li>
              )}

              {sections.map(([group, rows]) => (
                <li key={group} role="presentation">
                  <p
                    id={`palette-group-${group}`}
                    className="px-5 pb-1.5 pt-3 font-mono text-[11px] text-ink-3"
                  >
                    {GROUP_LABELS[group]}
                  </p>
                  <ul role="group" aria-labelledby={`palette-group-${group}`}>
                    {rows.map(({ command, index }) => {
                      const isActive = index === activeIndex;
                      return (
                        <li
                          key={command.id}
                          id={`palette-item-${index}`}
                          role="option"
                          aria-selected={isActive}
                          data-index={index}
                          onClick={() => executeAction(command.action)}
                          onMouseMove={() => setActiveIndex(index)}
                          className={`mx-2 flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors ${
                            isActive
                              ? "bg-violet/20 text-ink shadow-[inset_0_0_0_1px_rgba(196,181,255,0.25)]"
                              : "text-ink-2 hover:text-ink"
                          }`}
                        >
                          <span className="truncate text-sm font-medium">
                            {command.label}
                          </span>
                          <div className="flex shrink-0 items-center gap-3">
                            {command.description && (
                              <span className="hidden text-xs text-ink-3 sm:block">
                                {command.description}
                              </span>
                            )}
                            {command.hint && (
                              <span className="rounded-full border border-line-strong px-2 py-0.5 font-mono text-[10px] text-ink-3">
                                {command.hint}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>

            {/* Footer hint */}
            <div className="flex items-center gap-4 border-t border-line px-5 py-2.5 font-mono text-[10.5px] text-ink-3">
              <span>
                <kbd>↑↓</kbd> navigate
              </span>
              <span>
                <kbd>↵</kbd> select
              </span>
              <span>
                <kbd>Esc</kbd> close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
