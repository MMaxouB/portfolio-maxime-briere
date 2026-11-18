import { useId } from "react";

interface PlanetProps {
  className?: string;
  /** Orbital arcs with light travelling along them */
  arcs?: boolean;
  /** Rings, like a small gas giant */
  ring?: boolean;
  /** Hue of the lit rim */
  tone?: "violet" | "indigo";
}

/**
 * A dark planet lit from the upper left, with a soft atmosphere. Pure SVG, no
 * images: it scales to any size and costs nothing to download. The only motion
 * is light travelling along the arcs (CSS, paused with the rest).
 */
export function Planet({ className, arcs = false, ring = false, tone = "violet" }: PlanetProps) {
  const id = useId().replace(/:/g, "");
  const rim = tone === "violet" ? "#a48bff" : "#7d8cff";

  return (
    <svg viewBox="0 0 1000 1000" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-body`} cx="34%" cy="28%" r="80%">
          <stop offset="0" stopColor="#2a2160" />
          <stop offset="0.35" stopColor="#140f36" />
          <stop offset="0.75" stopColor="#09071d" />
          <stop offset="1" stopColor="#050412" />
        </radialGradient>
        <radialGradient id={`${id}-atmo`} cx="50%" cy="50%" r="50%">
          <stop offset="0.80" stopColor={rim} stopOpacity="0" />
          <stop offset="0.86" stopColor={rim} stopOpacity="0.38" />
          <stop offset="0.9" stopColor={rim} stopOpacity="0.12" />
          <stop offset="1" stopColor={rim} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6dcff" stopOpacity="0.95" />
          <stop offset="0.3" stopColor={rim} stopOpacity="0.55" />
          <stop offset="0.6" stopColor={rim} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-arc`} x1="0" x2="1">
          <stop offset="0" stopColor="#7f8bff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#b7a6ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#6fd0ff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx="500" cy="500" r="400" />
        </clipPath>
      </defs>

      {/* Atmosphere halo */}
      <circle cx="500" cy="500" r="500" fill={`url(#${id}-atmo)`} />

      {ring && (
        <ellipse
          cx="500"
          cy="520"
          rx="560"
          ry="120"
          fill="none"
          stroke={rim}
          strokeOpacity="0.25"
          strokeWidth="14"
          transform="rotate(-14 500 500)"
        />
      )}

      <circle cx="500" cy="500" r="400" fill={`url(#${id}-body)`} />

      {/* Surface: faint latitude bands */}
      <g clipPath={`url(#${id}-clip)`} opacity="0.5">
        {[-240, -150, -60, 30, 120, 210, 300].map((y) => (
          <ellipse
            key={y}
            cx="500"
            cy={500 + y}
            rx="420"
            ry="60"
            fill="none"
            stroke="#8a78ff"
            strokeOpacity="0.07"
            strokeWidth="1.5"
            transform="rotate(-16 500 500)"
          />
        ))}
      </g>

      {/* Lit crescent */}
      <circle cx="500" cy="500" r="399" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="5" />

      {ring && (
        <path
          d="M -40 610 A 560 120 0 0 0 1040 430"
          fill="none"
          stroke={rim}
          strokeOpacity="0.4"
          strokeWidth="10"
          transform="rotate(-14 500 500)"
        />
      )}

      {arcs && (
        <g fill="none" strokeLinecap="round">
          {[
            "M 180 360 Q 520 40 880 330",
            "M 120 560 Q 470 230 900 470",
            "M 260 250 Q 640 120 820 640",
            "M 150 450 Q 380 140 700 170",
          ].map((d, i) => (
            <g key={d}>
              <path d={d} stroke="#8b6cff" strokeOpacity="0.16" strokeWidth="1.4" />
              <path
                d={d}
                stroke={`url(#${id}-arc)`}
                strokeWidth="2.2"
                strokeDasharray="70 330"
                style={{ animation: `dash-flow ${7 + i * 2.3}s linear infinite`, animationDelay: `${-i * 1.7}s` }}
              />
            </g>
          ))}
          {[
            [180, 360],
            [880, 330],
            [900, 470],
            [820, 640],
            [700, 170],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="#d9ceff" opacity="0.8" />
          ))}
        </g>
      )}
    </svg>
  );
}
