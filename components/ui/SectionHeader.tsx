import { LineReveal, Reveal } from "./Reveal";
import { TypedText } from "./TypedText";

interface SectionHeaderProps {
  /** Shell path shown above the title — `~/about` */
  path: string;
  /** One entry per line. Put the emphasised phrase in <Em>. */
  lines: React.ReactNode[];
  description?: React.ReactNode;
  align?: "left" | "center";
  id?: string;
  className?: string;
  /** h1 on standalone pages, h2 inside the home page */
  as?: "h1" | "h2";
}

/** The single gradient phrase of a heading. */
export function Em({ children }: { children: React.ReactNode }) {
  return <span className="ink-gradient">{children}</span>;
}

/**
 * Section opener: a shell path that types itself, a two-line display title
 * that rises line by line, and an optional one-sentence description.
 */
export function SectionHeader({ path, lines, description, align = "left", id, className = "", as = "h2" }: SectionHeaderProps) {
  const centered = align === "center";
  const Heading = as;
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} ${className}`}>
      <p className="font-mono text-sm text-lilac">
        <TypedText text={path} speed={55} />
      </p>
      <Heading
        id={id}
        className={`font-display mt-4 font-extrabold leading-[0.98] tracking-[-0.04em] text-ink ${
          as === "h1" ? "text-[clamp(2.7rem,7vw,5.4rem)]" : "text-[clamp(2.4rem,5.6vw,4.4rem)]"
        }`}
      >
        <LineReveal lines={lines} />
      </Heading>
      {description && (
        <Reveal delay={0.25}>
          <p className={`mt-6 text-[1.075rem] leading-relaxed text-ink-2 ${centered ? "mx-auto max-w-[36rem]" : "max-w-[38rem]"}`}>
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
