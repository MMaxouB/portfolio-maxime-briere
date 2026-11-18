interface CrackedWordProps {
  children: string;
  className?: string;
}

/**
 * A word split along a hairline fracture. At rest the halves are a couple of
 * pixels apart; hovering the parent `.group` pushes them further, then they
 * spring back. Static by default — the only motion is the visitor's.
 */
export function CrackedWord({ children, className = "" }: CrackedWordProps) {
  // One jagged fracture, shared by both halves and the glint line
  const crack: [number, number][] = [
    [0, 62], [16, 55], [27, 61], [41, 47], [55, 54], [69, 42], [84, 47], [100, 37],
  ];
  const path = crack.map(([x, y]) => `${x}% ${y}%`).join(", ");
  const top = `polygon(0 0, 100% 0, ${[...crack].reverse().map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
  const bottom = `polygon(${path}, 100% 100%, 0 100%)`;

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="sr-only">{children}</span>
      {/* Spacer keeps the line box; both halves are painted over it */}
      <span aria-hidden="true" className="invisible">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="ink-gradient absolute inset-0 transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-translate-x-[2px] group-hover:-translate-y-[2px]"
        style={{ clipPath: top }}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className="ink-gradient absolute inset-0 translate-x-[2px] translate-y-[3px] transition-transform duration-500 ease-[var(--ease-spring)] group-hover:translate-x-[9px] group-hover:translate-y-[6px] group-hover:rotate-[1.2deg]"
        style={{ clipPath: bottom }}
      >
        {children}
      </span>
      {/* The fracture line catches a little light */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={crack.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="url(#crack-glow)"
          strokeWidth="0.8"
          vectorEffect="non-scaling-stroke"
        />
        <defs>
          <linearGradient id="crack-glow" x1="0" x2="1">
            <stop offset="0" stopColor="#c4b5ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#c4b5ff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}
