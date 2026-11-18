"use client";

import { useEffect, useRef } from "react";

/**
 * Custom pointer — a dot that tracks exactly and a ring that follows on a
 * spring, stretching along its direction of travel.
 *
 * What the ring becomes says what a click will do:
 *
 *   link / button          grows and fills softly
 *   data-cursor="Read…"    ORBIT: glass disc, the label runs around its edge
 *                          like a rotating caption, a violet core with an arrow
 *   data-cursor="Drop ε"   SCOPE: viewfinder brackets that slowly turn, the
 *                          exact pointer dot stays visible, a small tag below
 *   text field             steps aside so the system I-beam shows
 *
 * Long labels (> 9 characters) use ORBIT, short ones SCOPE; force one with
 * data-cursor-style="orbit" | "scope". An empty data-cursor means "no label",
 * data-cursor="none" hides the custom pointer entirely.
 *
 * The same pointer loop feeds two cheap effects so there is only one
 * pointermove listener on the page:
 *   .lit elements          --mx/--my for the border light (globals.css)
 *   [data-magnetic]        pulled a few pixels towards the pointer
 *
 * Calm by construction: the mode is resolved on every move (so it can never go
 * stale), and leaving a labelled element is delayed by a beat — crossing the
 * gap between two cards no longer flashes back to the small ring.
 *
 * Mouse only. Touch and pen keep their native behaviour, and nothing here runs
 * until a fine pointer is confirmed.
 */

type Mode = "default" | "link" | "text" | "hidden" | "orbit" | "scope";

const INTERACTIVE = "a, button, [role='button'], summary, select, label[for]";
const TEXT_FIELD =
  "input:not([type='checkbox']):not([type='radio']):not([type='range']), textarea, [contenteditable='true']";

const SIZE: Record<Mode, number> = {
  default: 34,
  link: 54,
  text: 0,
  hidden: 0,
  orbit: 80,
  scope: 70,
};
/** How quickly the ring catches up with the pointer — tighter when it carries a label */
const FOLLOW: Record<Mode, number> = {
  default: 0.2,
  link: 0.24,
  text: 0.3,
  hidden: 0.3,
  orbit: 0.42,
  scope: 0.5,
};
/** Hold the previous mode this long when leaving a labelled element (ms) */
const LEAVE_DELAY = 140;

const ORBIT_CIRCUMFERENCE = 2 * Math.PI * 47;

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const orbitTextRef = useRef<SVGTextPathElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const tag = tagRef.current!;
    const orbitText = orbitTextRef.current!;
    const glow = glowRef.current!;
    const root = document.documentElement;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...target };
    const glowPos = { ...target };
    let size: number = SIZE.default;
    let visible = false;
    let pressed = false;
    let mode: Mode = "default";
    let label = "";
    let frame = 0;
    let magnet: HTMLElement | null = null;
    let leaveTimer = 0;

    root.classList.add("has-cursor");

    function apply(next: Mode, text: string) {
      if (next === mode && text === label) return;
      const labelChanged = text !== label;
      mode = next;
      label = text;
      ring.dataset.mode = next;
      dot.dataset.mode = next;
      if (labelChanged) {
        tag.textContent = text;
        if (next === "orbit") {
          // Fill the circle with the caption, repeated, spread evenly
          const unit = `${text}  ·  `;
          const reps = Math.max(2, Math.round(40 / unit.length));
          orbitText.textContent = unit.repeat(reps);
          orbitText.setAttribute("textLength", String(ORBIT_CIRCUMFERENCE - 2));
        }
      }
    }

    /** Where would the pointer be, if nothing delayed the answer? */
    function resolve(el: Element | null): { mode: Mode; text: string } {
      if (!el) return { mode: "default", text: "" };
      const labelled = el.closest<HTMLElement>('[data-cursor]:not([data-cursor=""])');
      if (labelled) {
        const text = labelled.dataset.cursor ?? "";
        if (text === "none") return { mode: "hidden", text: "" };
        const style = labelled.dataset.cursorStyle;
        const chosen: Mode = style === "orbit" || style === "scope" ? style : text.length > 9 ? "orbit" : "scope";
        return { mode: chosen, text };
      }
      if (el.closest(TEXT_FIELD)) return { mode: "text", text: "" };
      if (el.closest(INTERACTIVE)) return { mode: "link", text: "" };
      return { mode: "default", text: "" };
    }

    function settle(el: Element | null) {
      const next = resolve(el);
      const leavingLabel = (mode === "orbit" || mode === "scope") && next.mode !== "orbit" && next.mode !== "scope";
      if (leavingLabel) {
        // Hold the label across a gap between two labelled things
        if (!leaveTimer) {
          leaveTimer = window.setTimeout(() => {
            leaveTimer = 0;
            const again = resolve(document.elementFromPoint(target.x, target.y));
            apply(again.mode, again.text);
          }, LEAVE_DELAY);
        }
        return;
      }
      if (leaveTimer) {
        window.clearTimeout(leaveTimer);
        leaveTimer = 0;
      }
      apply(next.mode, next.text);
    }

    function releaseMagnet() {
      if (!magnet) return;
      magnet.style.transform = "";
      magnet = null;
    }

    function onMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      target.x = event.clientX;
      target.y = event.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = glowPos.x = target.x;
        ringPos.y = glowPos.y = target.y;
        ring.style.opacity = dot.style.opacity = "1";
      }

      const el = event.target as Element | null;
      settle(el);

      // Border light on glass cards
      const lit = el?.closest?.<HTMLElement>(".lit") ?? null;
      if (lit) {
        const rect = lit.getBoundingClientRect();
        lit.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        lit.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }

      // Magnetic controls
      const nextMagnet = el?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
      if (nextMagnet !== magnet) releaseMagnet();
      magnet = nextMagnet;
      if (magnet) {
        const rect = magnet.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const pull = Number(magnet.dataset.magnetic) || 0.28;
        magnet.style.transform = `translate3d(${dx * pull}px, ${dy * pull}px, 0)`;
      }
    }

    // Scrolling moves things under a still pointer without any pointer event
    let scrollQueued = false;
    function onScroll() {
      if (scrollQueued || !visible) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        settle(document.elementFromPoint(target.x, target.y));
      });
    }

    function onDown() {
      pressed = true;
      // Ripple: restart the CSS animation
      ring.classList.remove("is-pulse");
      void ring.offsetWidth;
      ring.classList.add("is-pulse");
    }
    function onUp() {
      pressed = false;
    }
    function onLeave() {
      visible = false;
      ring.style.opacity = dot.style.opacity = "0";
      releaseMagnet();
    }

    function tick() {
      // The dot is exact; the ring and the glow trail behind on springs.
      const dx = target.x - ringPos.x;
      const dy = target.y - ringPos.y;
      const follow = FOLLOW[mode];
      ringPos.x += dx * follow;
      ringPos.y += dy * follow;
      glowPos.x += (target.x - glowPos.x) * 0.08;
      glowPos.y += (target.y - glowPos.y) * 0.08;
      size += (SIZE[mode] * (pressed ? 0.9 : 1) - size) * 0.22;

      const speed = Math.min(Math.hypot(dx, dy), 120);
      const stretch = mode === "default" ? Math.min(speed / 260, 0.32) : 0;
      const angle = Math.atan2(dy, dx);

      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%) scale(${pressed ? 0.6 : 1})`;
      ring.style.transform =
        `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) ` +
        `rotate(${angle}rad) scale(${1 + stretch}, ${1 - stretch * 0.7}) rotate(${-angle}rad)`;
      ring.style.width = ring.style.height = `${size}px`;
      glow.style.transform = `translate3d(${glowPos.x}px, ${glowPos.y}px, 0) translate(-50%, -50%)`;

      frame = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(leaveTimer);
      releaseMagnet();
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      {/* Soft light that trails the pointer across the sky, behind content */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[5] hidden overflow-hidden [@media(hover:hover)_and_(pointer:fine)]:block"
      >
        <div
          ref={glowRef}
          className="absolute left-0 top-0 h-[560px] w-[560px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(139,108,255,0.16) 0%, rgba(91,108,255,0.06) 38%, transparent 66%)",
          }}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[300] hidden [@media(hover:hover)_and_(pointer:fine)]:block"
      >
        <div ref={ringRef} data-mode="default" className="cursor-ring fixed left-0 top-0 rounded-full opacity-0">
          {/* ORBIT: the caption runs around the edge */}
          <svg className="cursor-orbit" viewBox="0 0 120 120" focusable="false">
            <defs>
              <path id="cursor-orbit-path" d="M60 60 m-47 0 a47 47 0 1 1 94 0 a47 47 0 1 1 -94 0" />
            </defs>
            <g className="cursor-orbit-spin">
              <text>
                <textPath ref={orbitTextRef} href="#cursor-orbit-path" lengthAdjust="spacing" />
              </text>
            </g>
          </svg>
          <span className="cursor-core">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </span>

          {/* SCOPE: viewfinder brackets that slowly turn, with a tag below */}
          <svg className="cursor-scope" viewBox="0 0 100 100" focusable="false">
            <g className="cursor-scope-spin" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M10 30V14a4 4 0 0 1 4-4h16" />
              <path d="M70 10h16a4 4 0 0 1 4 4v16" />
              <path d="M90 70v16a4 4 0 0 1-4 4H70" />
              <path d="M30 90H14a4 4 0 0 1-4-4V70" />
            </g>
            <circle className="cursor-scope-dash" cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" />
          </svg>
          <span ref={tagRef} className="cursor-tag" />
        </div>
        <div ref={dotRef} data-mode="default" className="cursor-dot fixed left-0 top-0 h-1.5 w-1.5 rounded-full opacity-0" />
      </div>
    </>
  );
}
