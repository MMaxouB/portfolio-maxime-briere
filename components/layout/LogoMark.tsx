import { useId } from "react";

/**
 * Two loops of a Lorenz attractor — the "butterfly" — as a monogram. Same
 * object as the hero, reduced to a stroke.
 */
export function LogoMark({ size = 30, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9ceff" />
          <stop offset="0.5" stopColor="#8b6cff" />
          <stop offset="1" stopColor="#5b6cff" />
        </linearGradient>
      </defs>
      <path
        d="M16 16.5 C 12.5 9.5, 3.5 8.5, 3.6 15.6 C 3.7 22.4, 12 23.4, 16 16.5 C 20 9.6, 28.3 9.4, 28.4 16.2 C 28.5 23.4, 19.6 23.2, 16 16.5 Z"
        fill="none"
        stroke={`url(#${id}-g)`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="28.4" cy="16.2" r="2.2" fill="#fff" />
    </svg>
  );
}
