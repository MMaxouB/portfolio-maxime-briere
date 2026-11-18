type ArrowDirection = "down-left" | "down-right" | "up-left" | "up-right" | "left" | "right" | "none";

interface HandNoteProps {
  children: React.ReactNode;
  className?: string;
  /** Degrees — margin notes are never quite straight */
  rotate?: number;
  arrow?: ArrowDirection;
  arrowClassName?: string;
}

/** Hand-drawn arrow strokes, each a single wobbly path plus its head. */
const ARROWS: Record<Exclude<ArrowDirection, "none">, { body: string; head: string; box: string }> = {
  "down-left": { body: "M70 6 C 66 30, 46 48, 14 54", head: "M24 44 L 12 54 L 26 62", box: "0 0 80 70" },
  "down-right": { body: "M10 6 C 14 30, 34 48, 66 54", head: "M56 44 L 68 54 L 54 62", box: "0 0 80 70" },
  "up-left": { body: "M70 62 C 64 38, 44 18, 14 14", head: "M26 6 L 12 14 L 24 24", box: "0 0 80 70" },
  "up-right": { body: "M10 62 C 16 38, 36 18, 66 14", head: "M54 6 L 68 14 L 56 24", box: "0 0 80 70" },
  left: { body: "M74 30 C 56 22, 34 38, 10 30", head: "M20 20 L 8 30 L 21 38", box: "0 0 80 50" },
  right: { body: "M6 30 C 24 22, 46 38, 70 30", head: "M60 20 L 72 30 L 59 38", box: "0 0 80 50" },
};

/**
 * A margin note in handwriting, optionally with a hand-drawn arrow. Purely
 * decorative annotation: anything essential must also exist as real text.
 */
export function HandNote({ children, className = "", rotate = -4, arrow = "none", arrowClassName = "" }: HandNoteProps) {
  const shape = arrow === "none" ? null : ARROWS[arrow];
  return (
    <span
      className={`font-hand pointer-events-none inline-flex select-none items-start gap-1 leading-[1.15] text-lilac/85 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {shape && (arrow.endsWith("left") || arrow === "left") && (
        <svg viewBox={shape.box} className={`h-10 w-14 shrink-0 ${arrowClassName}`} aria-hidden="true">
          <path d={shape.body} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d={shape.head} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <span>{children}</span>
      {shape && (arrow.endsWith("right") || arrow === "right") && (
        <svg viewBox={shape.box} className={`h-10 w-14 shrink-0 ${arrowClassName}`} aria-hidden="true">
          <path d={shape.body} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d={shape.head} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
