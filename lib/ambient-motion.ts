"use client";

import { useSyncExternalStore } from "react";

/**
 * Ambient motion = everything that moves without being asked: the sky, the
 * attractor, the card visuals. It stops when the visitor prefers reduced
 * motion OR presses the pause button (html[data-motion="paused"], persisted).
 *
 * Canvas loops call `ambientMotionOn()` each frame; React components use the
 * hook. Both read the same two sources, so they can never disagree.
 */

const STORAGE_KEY = "motion";
let reducedQuery: MediaQueryList | null = null;

function reduced(): MediaQueryList | null {
  if (typeof window === "undefined") return null;
  reducedQuery ??= window.matchMedia("(prefers-reduced-motion: reduce)");
  return reducedQuery;
}

export function prefersReducedMotion(): boolean {
  return reduced()?.matches ?? false;
}

export function ambientMotionOn(): boolean {
  if (typeof document === "undefined") return false;
  return (
    !prefersReducedMotion() &&
    document.documentElement.dataset.motion !== "paused"
  );
}

export function setMotionPaused(paused: boolean) {
  const root = document.documentElement;
  if (paused) root.dataset.motion = "paused";
  else delete root.dataset.motion;
  try {
    localStorage.setItem(STORAGE_KEY, paused ? "paused" : "on");
  } catch {
    /* private mode — the toggle still works for this visit */
  }
}

function subscribe(onChange: () => void) {
  const query = reduced();
  query?.addEventListener("change", onChange);
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-motion"],
  });
  return () => {
    query?.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

export function useAmbientMotion(): boolean {
  return useSyncExternalStore(subscribe, ambientMotionOn, () => false);
}

export function usePausedByUser(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.motion === "paused",
    () => false
  );
}

/** Inline, pre-paint: restore the visitor's pause choice before anything animates. */
export const MOTION_BOOT_SCRIPT = `try{if(localStorage.getItem("${STORAGE_KEY}")==="paused")document.documentElement.dataset.motion="paused"}catch(e){}`;
