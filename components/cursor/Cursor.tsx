"use client";

import { useEffect, useRef } from "react";

/**
 * Custom pointer — a dot that tracks exactly and a ring that follows on a
 * spring, stretching along its direction of travel.
 *
 * The ring says what a click will do:
 *   link / button        → grows and fills softly
 *   [data-cursor="..."]  → becomes a disc carrying that label ("Open", "Drop ε")
 *   text field           → steps aside so the system I-beam shows
 *
 * The same pointer loop also feeds two cheap effects so there is only one
 * pointermove listener on the page:
 *   .lit elements        → --mx/--my for the border light (globals.css)
 *   [data-magnetic]      → pulled a few pixels towards the pointer
 *
 * Mouse only. Touch and pen keep their native behaviour, and nothing here runs
 * until a fine pointer is confirmed.
 */

type Mode = "default" | "link" | "label" | "text" | "hidden";

const INTERACTIVE = "a, button, [role='button'], summary, select, label[for]";
const TEXT_FIELD = "input:not([type='checkbox']):not([type='radio']):not([type='range']), textarea, [contenteditable='true']";

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    const glow = glowRef.current!;
    const root = document.documentElement;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...target };
    const glowPos = { ...target };
    let size = 34;
    let sizeTarget = 34;
    let visible = false;
    let pressed = false;
    let mode: Mode = "default";
    let frame = 0;
    let magnet: HTMLElement | null = null;
    let lit: HTMLElement | null = null;

    root.classList.add("has-cursor");

    function setMode(next: Mode, text = "") {
      if (next === mode && label.textContent === text) return;
      mode = next;
      ring.dataset.mode = next;
      dot.dataset.mode = next;
      label.textContent = text;
      sizeTarget =
        next === "label" ? 92 : next === "link" ? 54 : next === "text" ? 0 : 34;
    }

    function resolveMode(el: Element | null) {
      if (!el || !(el instanceof Element)) return setMode("default");
      const labelled = el.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        const text = labelled.dataset.cursor ?? "";
        return text === "none" ? setMode("hidden") : setMode("label", text);
      }
      if (el.closest(TEXT_FIELD)) return setMode("text");
      if (el.closest(INTERACTIVE)) return setMode("link");
      setMode("default");
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

      // Border light on glass cards
      const nextLit = el?.closest?.<HTMLElement>(".lit") ?? null;
      if (nextLit) {
        const rect = nextLit.getBoundingClientRect();
        nextLit.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        nextLit.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }
      lit = nextLit;

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

    function onOver(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      resolveMode(event.target as Element);
    }

    function onDown() {
      pressed = true;
    }
    function onUp() {
      pressed = false;
    }
    function onLeave() {
      visible = false;
      ring.style.opacity = dot.style.opacity = "0";
      releaseMagnet();
      if (lit) lit = null;
    }

    function tick() {
      // The dot is exact; the ring and the glow trail behind on springs.
      const dx = target.x - ringPos.x;
      const dy = target.y - ringPos.y;
      ringPos.x += dx * 0.2;
      ringPos.y += dy * 0.2;
      glowPos.x += (target.x - glowPos.x) * 0.08;
      glowPos.y += (target.y - glowPos.y) * 0.08;
      size += (sizeTarget * (pressed ? 0.82 : 1) - size) * 0.2;

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
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      releaseMagnet();
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
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
        <div
          ref={ringRef}
          data-mode="default"
          className="cursor-ring fixed left-0 top-0 flex items-center justify-center rounded-full opacity-0"
        >
          <span ref={labelRef} className="cursor-label" />
        </div>
        <div
          ref={dotRef}
          data-mode="default"
          className="cursor-dot fixed left-0 top-0 h-1.5 w-1.5 rounded-full opacity-0"
        />
      </div>
    </>
  );
}
