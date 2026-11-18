"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Planet } from "./Planet";
import { SITE } from "@/lib/site";

// three.js is loaded only when this component mounts on the client, and only
// if WebGL looks usable — it never touches the critical path of the page.
const PlanetScene = dynamic(() => import("./PlanetScene"), { ssr: false });

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

interface Planet3DProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The 3D planet with a graceful floor: the SVG planet is what the server sends
 * and what stays if WebGL is missing, blocked, or lost. When the 3D scene has
 * drawn its first frame, the SVG fades out underneath it.
 */
export function Planet3D({ className = "", style }: Planet3DProps) {
  const [wanted, setWanted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Save-data users and very low-memory devices keep the light SVG version
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    const lowEnd = nav.connection?.saveData === true || (nav.deviceMemory !== undefined && nav.deviceMemory <= 1);
    if (lowEnd || !webglAvailable()) return;
    // Wait for the page to settle before pulling three.js
    const idle = "requestIdleCallback" in window ? window.requestIdleCallback : (cb: () => void) => window.setTimeout(cb, 400);
    const id = idle(() => setWanted(true));
    return () => {
      if ("cancelIdleCallback" in window && typeof id === "number") window.cancelIdleCallback(id);
    };
  }, []);

  const show3D = wanted && !failed;

  return (
    <div className={className} style={style}>
      {/* Sized to match the 3D sphere (65% of the box) so the swap does not jump */}
      <Planet
        arcs
        className={`absolute inset-0 h-full w-full scale-[0.8125] transition-opacity duration-[1400ms] ease-out ${ready && show3D ? "opacity-0" : "opacity-90"}`}
      />
      {show3D && (
        <div className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`}>
          <PlanetScene onReady={() => setReady(true)} onFail={() => setFailed(true)} homeLabel={SITE.location} />
        </div>
      )}
    </div>
  );
}
