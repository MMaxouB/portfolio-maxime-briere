import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NotFoundTerminal } from "@/components/layout/NotFoundTerminal";

/**
 * 404 — the same idea as the hero: a tiny difference in the input (one wrong
 * character in a URL) and you end up somewhere else entirely.
 */
export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-[80svh] items-center overflow-hidden pb-16 pt-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-1/3 h-[60%] w-[70%] -translate-x-1/2"
          style={{ background: "radial-gradient(closest-side, rgba(124,92,255,0.2), transparent)" }}
        />
      </div>
      <div className="mx-auto w-full max-w-[880px] px-5 text-center sm:px-8">
        <p className="font-mono text-sm text-lilac">$ cd ./this-page</p>
        <h1 className="font-display mt-4 text-[clamp(5rem,20vw,11rem)] font-extrabold leading-none tracking-[-0.06em]">
          <span className="name-gradient">404</span>
        </h1>
        <p className="font-display mt-2 text-[clamp(1.6rem,4vw,2.4rem)] font-bold tracking-[-0.03em] text-ink">
          This path diverged.
        </p>
        <p className="mx-auto mt-4 max-w-[30rem] text-[1.05rem] leading-relaxed text-ink-2">
          One character off at the start, a different place at the end — chaos theory, applied to URLs.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            <ArrowLeft size={16} aria-hidden="true" /> Back to the start
          </Link>
          <Link href="/projects" className="btn-ghost">
            Browse projects
          </Link>
        </div>
        <NotFoundTerminal />
      </div>
    </div>
  );
}
