import type { CSSProperties } from "react";
import { TECH_MARKS, type TechSlug } from "@/lib/tech-marks";
import { BrandMark } from "@/components/ui/TechIcon";

interface Ring {
  radius: number; // % of the stage
  duration: number; // seconds per turn
  reverse?: boolean;
  marks: TechSlug[];
}

const RINGS: Ring[] = [
  { radius: 30, duration: 44, marks: ["python", "typescript", "fastapi", "nextdotjs"] },
  { radius: 47, duration: 68, reverse: true, marks: ["docker", "git", "kalilinux", "burpsuite", "hackthebox", "postgresql"] },
];

/**
 * The toolbox as a small solar system: two tilted rings of tools turning
 * around a sphere that carries the rule they serve. Real 3D (CSS
 * preserve-3d): tiles pass in front of and behind the sphere. Hovering the
 * stage stops it so a tile can be read.
 */
export function Orbit() {
  return (
    <div
      aria-label={`Tools I use most, orbiting a sphere: ${RINGS.flatMap((r) => r.marks).map((m) => TECH_MARKS[m].title).join(", ")}`}
      className="orbit-stage relative mx-auto aspect-[5/4] w-full max-w-[540px] [container-type:inline-size]"
      role="img"
    >
      {/* Glow under the sphere */}
      <div
        aria-hidden="true"
        className="absolute inset-x-[18%] inset-y-[10%] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(124,92,255,0.35), transparent)" }}
      />

      <div aria-hidden="true" className="orbit-plane">
        {RINGS.map((ring) => (
          <div key={ring.radius} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            {/* Track */}
            <div
              className="absolute rounded-full border border-lilac/20"
              style={{ inset: `${50 - ring.radius}%`, boxShadow: "0 0 30px rgba(139,108,255,0.12) inset" }}
            />
            <div
              className="orbit-ring"
              style={{ "--orbit-duration": `${ring.duration}s`, animationDirection: ring.reverse ? "reverse" : "normal" } as CSSProperties}
            >
              {ring.marks.map((slug, i) => {
                const angle = (360 / ring.marks.length) * i;
                return (
                  <div
                    key={slug}
                    className="orbit-slot"
                    style={{ transform: `rotateZ(${angle}deg) translateX(${ring.radius}cqw) rotateZ(${-angle}deg)` }}
                  >
                    <div
                      className="orbit-counter"
                      style={{ "--orbit-duration": `${ring.duration}s`, animationDirection: ring.reverse ? "reverse" : "normal" } as CSSProperties}
                    >
                      <div className="orbit-face -translate-x-1/2 -translate-y-1/2">
                        <span
                          title={TECH_MARKS[slug].title}
                          className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-line-strong bg-deep/90 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] sm:h-12 sm:w-12"
                        >
                          <BrandMark slug={slug} size={22} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* The sphere stands upright inside the tilted plane */}
        <div className="absolute inset-[33%]" style={{ transformStyle: "preserve-3d" }}>
          <div className="orbit-face absolute inset-0">
            <div
              className="flex h-full w-full items-center justify-center rounded-full text-center"
              style={{
                background:
                  "radial-gradient(circle at 34% 28%, #6c5ad6 0%, #2b2170 32%, #130e38 64%, #0a0820 100%)",
                // Inset shadows only: an outer glow would be clipped by the 3D plane
                boxShadow: "0 0 0 1px rgba(196,181,255,0.25) inset, inset -18px -24px 50px rgba(0,0,0,0.5)",
              }}
            >
              <span className="font-hand px-4 text-[15px] leading-[1.25] text-ink/85 sm:text-[17px]">
                make it work,
                <br />
                make it right,
                <br />
                make it hard
                <br />
                to break
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
