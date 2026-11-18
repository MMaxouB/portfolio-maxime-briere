"use client";

import { FormEvent, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check, Copy, Mail, Send } from "lucide-react";
import { SITE } from "@/lib/site";
import { SectionHeader, Em } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { GitHubIcon, DiscordIcon } from "@/components/ui/BrandIcons";
import { Planet } from "@/components/scenery/Planet";

const SUBJECTS = ["A project to build", "Backend or freelance work", "A security question", "Just saying hi"];

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

function validate(data: { name: string; email: string; message: string }): Errors {
  const errors: Errors = {};
  if (!data.name.trim()) errors.name = "Add your name so I know who is writing.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = "Enter an email I can reply to, like you@domain.com.";
  if (data.message.trim().length < 10) errors.message = "Write at least a sentence — 10 characters or more.";
  return errors;
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${SITE.email}`;
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      data-cursor={copied ? "Copied" : "Copy"}
      className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-line-strong text-ink-2 transition-colors hover:border-lilac hover:text-ink"
      aria-label={copied ? "Email address copied" : "Copy email address"}
    >
      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}

export function ContactSection({ standalone = false }: { standalone?: boolean }) {
  const formId = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      subject: String(form.get("subject") ?? SUBJECTS[0]),
      message: String(form.get("message") ?? ""),
    };
    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0];
      event.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    // No backend, no storage: the visitor's own mail app sends it.
    const body = `${data.message.trim()}\n\n— ${data.name.trim()} (${data.email.trim()})`;
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`[Portfolio] ${data.subject}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const tiles = [
    { label: "Email", value: SITE.email, href: `mailto:${SITE.email}`, icon: Mail, extra: <CopyEmail /> },
    { label: "GitHub", value: SITE.handles.github, href: SITE.links.github, icon: GitHubIcon, external: true },
    { label: "Discord", value: SITE.handles.discord, href: SITE.links.discord, icon: DiscordIcon, external: true },
  ];

  const field =
    "mt-2 w-full rounded-xl border border-line-strong bg-night/60 px-4 py-3 text-[15px] text-ink placeholder:text-ink-3 transition-colors focus:border-lilac focus:outline-none focus:ring-2 focus:ring-violet/40 aria-[invalid=true]:border-[#ff8fb3]";

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className={`relative isolate overflow-hidden ${standalone ? "pb-16 pt-32 sm:pt-40" : "py-24 sm:py-32"}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Planet tone="violet" className="absolute -left-[14%] top-[6%] w-[38vw] max-w-[520px] opacity-40" />
        <div
          className="absolute right-[-10%] top-[20%] h-[70%] w-[60%]"
          style={{ background: "radial-gradient(closest-side, rgba(124,92,255,0.16), transparent)" }}
        />
      </div>

      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
        <div>
          <SectionHeader
            as={standalone ? "h1" : "h2"}
            path="~/contact"
            id="contact-title"
            lines={["Let's build", <Em key="em">something that lasts.</Em>]}
            description="A backend to design, an AI workflow to automate, a web app to test before someone else does? Tell me about it."
          />

          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {tiles.map(({ label, value, href, icon: Icon, extra, external }, i) => (
              <Reveal as="li" key={label} delay={0.08 * i} className={i === 0 ? "sm:col-span-2" : undefined}>
                <div className="glass lit group relative flex items-center gap-4 p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-indigo text-white shadow-[0_8px_24px_-8px_rgba(124,92,255,0.8)]">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-ink">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="block truncate text-[13.5px] text-ink-2 after:absolute after:inset-0 after:rounded-[inherit] hover:text-ink"
                      >
                        {value}
                        {external && <span className="sr-only"> (opens in a new tab)</span>}
                      </a>
                    ) : (
                      <p className="truncate text-[13.5px] text-ink-2">{value}</p>
                    )}
                  </div>
                  {extra ?? (href && <ArrowUpRight size={15} className="shrink-0 text-ink-3 transition-colors group-hover:text-lilac" aria-hidden="true" />)}
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.2}>
            <figure className="mt-10">
              <blockquote className="font-hand text-[1.7rem] leading-snug text-ink/90" style={{ transform: "rotate(-1.5deg)" }}>
                “Good questions welcome. Weird ones too.”
              </blockquote>
              <figcaption className="mt-1 font-mono text-xs text-ink-3">— Maxime</figcaption>
            </figure>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:pt-10">
          <div className="glass relative overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(160deg, rgba(36,28,84,0.72), rgba(13,10,31,0.72))" }}>
            <p className="font-mono text-xs text-lilac">~/send-message</p>
            <h2 className="font-display mt-3 text-[2rem] font-extrabold leading-tight tracking-[-0.03em] text-ink">
              Tell me what you&apos;re <span className="ink-gradient">building.</span>
            </h2>
            <p className="mt-2 text-[14.5px] text-ink-2">
              This opens your email app with everything filled in. Nothing is sent or stored by this site.
            </p>

            <form noValidate onSubmit={onSubmit} className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2" aria-describedby={`${formId}-note`}>
              <div>
                <label htmlFor={`${formId}-name`} className="text-sm font-medium text-ink">
                  Your name
                </label>
                <input
                  id={`${formId}-name`}
                  name="name"
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? `${formId}-name-error` : undefined}
                  className={field}
                />
                {errors.name && (
                  <p id={`${formId}-name-error`} className="mt-1.5 text-[12.5px] text-[#ffb3cb]">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor={`${formId}-email`} className="text-sm font-medium text-ink">
                  Your email
                </label>
                <input
                  id={`${formId}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@domain.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? `${formId}-email-error` : undefined}
                  className={field}
                />
                {errors.email && (
                  <p id={`${formId}-email-error`} className="mt-1.5 text-[12.5px] text-[#ffb3cb]">
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${formId}-subject`} className="text-sm font-medium text-ink">
                  Subject
                </label>
                <select id={`${formId}-subject`} name="subject" className={`${field} appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%2212%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%23aaa4ca%22%20stroke-width=%222%22%3E%3Cpath%20d=%22m6%209%206%206%206-6%22/%3E%3C/svg%3E')] bg-[length:14px] bg-[right_1rem_center] bg-no-repeat`}>
                  {SUBJECTS.map((subject) => (
                    <option key={subject} className="bg-deep">
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${formId}-message`} className="text-sm font-medium text-ink">
                  Message
                </label>
                <textarea
                  id={`${formId}-message`}
                  name="message"
                  rows={5}
                  placeholder="What are you building, and where could I help?"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? `${formId}-message-error` : undefined}
                  className={`${field} resize-y`}
                />
                {errors.message && (
                  <p id={`${formId}-message-error`} className="mt-1.5 text-[12.5px] text-[#ffb3cb]">
                    {errors.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="btn-primary w-full justify-center">
                  <Send size={16} aria-hidden="true" /> Write the email
                </button>
                <p id={`${formId}-note`} className="mt-3 text-center text-[12.5px] text-ink-3">
                  Prefer copying the address? It&apos;s on the left.
                </p>
                <AnimatePresence>
                  {sent && (
                    <motion.p
                      role="status"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 rounded-xl border border-signal/40 bg-signal/10 px-4 py-3 text-center text-[13.5px] text-ink"
                    >
                      Your email app should be open with the message ready. Nothing opened? Write to {SITE.email}.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-[13px] text-ink-3">Other ways to reach me</span>
            <a href={SITE.links.github} target="_blank" rel="noopener noreferrer" className="pill px-4 py-2 text-sm">
              <GitHubIcon size={15} /> GitHub
            </a>
            <a href={SITE.links.discord} target="_blank" rel="noopener noreferrer" className="pill px-4 py-2 text-sm">
              <DiscordIcon size={15} /> Discord
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
