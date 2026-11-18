import type { CSSProperties } from "react";
import type { ProjectVisual } from "@/lib/projects";

/**
 * Each project gets a tiny live diagram of what it does instead of a
 * screenshot: a timeline with a playhead, a radar, three agents racing, notes
 * turning into Markdown… All SVG, all drawn here, no images. They sit still on
 * a composed frame and only run while the card is hovered (always on touch).
 */

const W = 400;
const H = 250;
const MONO: CSSProperties = { fontFamily: "var(--font-geist-mono), monospace" };
const SANS: CSSProperties = { fontFamily: "var(--font-geist), sans-serif" };
const HAND: CSSProperties = { fontFamily: "var(--font-kalam), cursive" };

/** Server and browser can disagree on the 16th digit of Math.sin — round it away. */
const r2 = (n: number) => Math.round(n * 100) / 100;

/** `.mv` animation with a negative delay, so the paused frame is a good one. */
function anim(name: string, duration: number, delay = 0, extra: CSSProperties = {}): CSSProperties {
  return {
    animation: `${name} ${duration}s ${extra.animationTimingFunction ?? "linear"} ${-delay}s infinite`,
    transformBox: "fill-box",
    ...extra,
  };
}

function Frame({ children, label, p }: { children: React.ReactNode; label: string; p: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${p}-mv-violet`} x1="0" x2="1">
          <stop offset="0" stopColor="#8b6cff" />
          <stop offset="1" stopColor="#5b6cff" />
        </linearGradient>
        <radialGradient id={`${p}-mv-glow`} cx="50%" cy="0%" r="90%">
          <stop offset="0" stopColor="#3b2d8f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0d0a1f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="#0b0920" />
      <rect width={W} height={H} fill={`url(#${p}-mv-glow)`} />
      {children}
    </svg>
  );
}

/* ---------------------------------------------------------------------- */

function TimelineVisual({ p }: { p: string }) {
  const ticks = Array.from({ length: 21 }, (_, i) => 30 + i * 17);
  return (
    <Frame p={p} label="A video editor: preview, AI tools and a timeline with a moving playhead">
      {/* Preview */}
      <defs>
        <linearGradient id={`${p}-tl-video`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a2a8a" />
          <stop offset="0.55" stopColor="#7c4dbf" />
          <stop offset="1" stopColor="#e08bb8" />
        </linearGradient>
      </defs>
      <rect x="24" y="18" width="236" height="128" rx="10" fill={`url(#${p}-tl-video)`} />
      <circle cx="205" cy="62" r="22" fill="#ffd6e8" opacity="0.5" />
      <path d="M24 120 L 90 86 L 140 112 L 200 76 L 260 108 L 260 146 L 24 146 Z" fill="#1b1240" opacity="0.75" />
      <rect x="82" y="118" width="120" height="18" rx="5" fill="#06040f" opacity="0.72" />
      <text x="142" y="131" textAnchor="middle" fontSize="9.5" fill="#fff" style={SANS}>
        auto-subtitles, in Hindi too
      </text>
      {/* AI tools */}
      {[
        ["Subtitles", true],
        ["Smart trim", false],
        ["Colour grade", false],
      ].map(([label, active], i) => (
        <g key={String(label)} transform={`translate(274 ${22 + i * 40})`}>
          <rect width="104" height="30" rx="9" fill={active ? "rgba(139,108,255,0.28)" : "rgba(255,255,255,0.04)"} stroke={active ? "#a28bff" : "rgba(185,166,255,0.18)"} />
          <circle cx="15" cy="15" r="4" fill={active ? "#c4b5ff" : "#5b5480"} />
          <text x="27" y="19" fontSize="10.5" fill={active ? "#fff" : "#aaa4ca"} style={SANS}>
            {label}
          </text>
        </g>
      ))}
      {/* Timeline */}
      <rect x="20" y="158" width="362" height="80" rx="10" fill="rgba(255,255,255,0.025)" stroke="rgba(185,166,255,0.1)" />
      {ticks.map((x, i) => (
        <line key={x} x1={x} x2={x} y1="164" y2={i % 4 === 0 ? 172 : 168} stroke="#4a4470" />
      ))}
      <rect x="30" y="178" width="118" height="16" rx="4" fill={`url(#${p}-mv-violet)`} />
      <rect x="152" y="178" width="96" height="16" rx="4" fill="#6a5be0" />
      <rect x="252" y="178" width="120" height="16" rx="4" fill={`url(#${p}-mv-violet)`} opacity="0.85" />
      <rect x="70" y="199" width="88" height="11" rx="3.5" fill="#c4b5ff" opacity="0.85" />
      <rect x="230" y="199" width="64" height="11" rx="3.5" fill="#c4b5ff" opacity="0.85" />
      {Array.from({ length: 58 }, (_, i) => {
        const h = r2(2 + Math.abs(Math.sin(i * 1.7) * 8 + Math.sin(i * 0.4) * 4));
        return <rect key={i} x={30 + i * 6} y={224 - h / 2} width="3" height={h} rx="1.5" fill="#5b6cff" opacity="0.7" />;
      })}
      {/* Playhead */}
      <g className="mv" style={anim("mv-playhead", 5, 1.6)}>
        <line x1="40" x2="40" y1="160" y2="238" stroke="#fff" strokeWidth="1.5" />
        <path d="M34 158 h12 v6 l-6 6 l-6 -6 Z" fill="#fff" />
      </g>
    </Frame>
  );
}

function RadarVisual({ p }: { p: string }) {
  const cx = 116;
  const cy = 125;
  const blips = [
    { x: 150, y: 82, r: 5, o: 1 },
    { x: 78, y: 150, r: 4, o: 0.75 },
    { x: 162, y: 168, r: 3, o: 0.5 },
    { x: 92, y: 96, r: 2.5, o: 0.4 },
  ];
  const rows = [
    { label: "risk 8.1", w: 120, o: 1 },
    { label: "risk 5.4", w: 82, o: 0.75 },
    { label: "risk 3.2", w: 52, o: 0.55 },
    { label: "risk 1.0", w: 22, o: 0.35 },
  ];
  return (
    <Frame p={p} label="A security scanner: a radar sweep finds signals, then lists them ranked by risk">
      <defs>
        <linearGradient id={`${p}-rd-sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8b6cff" stopOpacity="0" />
          <stop offset="1" stopColor="#a28bff" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {[90, 66, 42, 18].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(185,166,255,0.16)" />
      ))}
      <line x1={cx - 92} x2={cx + 92} y1={cy} y2={cy} stroke="rgba(185,166,255,0.1)" />
      <line x1={cx} x2={cx} y1={cy - 92} y2={cy + 92} stroke="rgba(185,166,255,0.1)" />
      <g className="mv" style={{ ...anim("mv-spin", 3.6, 0.9), transformOrigin: `${cx}px ${cy}px`, transformBox: "view-box" }}>
        <path d={`M${cx} ${cy} L ${cx + 90} ${cy} A 90 90 0 0 0 ${cx + 63.6} ${cy - 63.6} Z`} fill={`url(#${p}-rd-sweep)`} />
        <line x1={cx} y1={cy} x2={cx + 90} y2={cy} stroke="#c4b5ff" strokeWidth="1.5" />
      </g>
      {blips.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r={b.r * 2.6} fill="#8b6cff" opacity={0.15 * b.o} />
          <circle className="mv" cx={b.x} cy={b.y} r={b.r} fill="#e4dcff" opacity={b.o} style={anim("mv-pulse", 3.6, i * 0.7)} />
        </g>
      ))}
      <text x="236" y="40" fontSize="10" fill="#736d96" style={MONO}>
        findings, ranked
      </text>
      {rows.map((row, i) => (
        <g key={row.label} transform={`translate(236 ${56 + i * 40})`}>
          <rect width="142" height="30" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(185,166,255,0.12)" />
          <rect x="10" y="19" width="122" height="3" rx="1.5" fill="rgba(185,166,255,0.12)" />
          <rect x="10" y="19" width={row.w} height="3" rx="1.5" fill={`url(#${p}-mv-violet)`} opacity={row.o} />
          <text x="10" y="13" fontSize="9.5" fill="#d9d3ff" opacity={0.4 + row.o * 0.6} style={MONO}>
            {row.label}
          </text>
        </g>
      ))}
    </Frame>
  );
}

function FanoutVisual({ p }: { p: string }) {
  const agents = [
    { name: "ChatGPT", y: 44, score: "0.74" },
    { name: "Claude", y: 112, score: "0.91", best: true },
    { name: "Gemini", y: 180, score: "0.68" },
  ];
  return (
    <Frame p={p} label="One question fans out to ChatGPT, Claude and Gemini; the answers are scored and the best is kept">
      <rect x="22" y="100" width="98" height="50" rx="12" fill="rgba(139,108,255,0.2)" stroke="#a28bff" />
      <text x="71" y="122" textAnchor="middle" fontSize="11" fill="#fff" style={SANS}>
        one question
      </text>
      <text x="71" y="138" textAnchor="middle" fontSize="9" fill="#aaa4ca" style={MONO}>
        dispatch()
      </text>
      {agents.map((a, i) => {
        const d = `M120 125 C 170 125, 170 ${a.y + 17}, 224 ${a.y + 17}`;
        return (
          <g key={a.name}>
            <path d={d} fill="none" stroke="rgba(185,166,255,0.2)" strokeWidth="1.5" />
            <path
              className="mv"
              d={d}
              fill="none"
              stroke="#c4b5ff"
              strokeWidth="2"
              strokeDasharray="6 54"
              strokeLinecap="round"
              style={anim("mv-flow", 1.2 + i * 0.25, i * 0.3)}
            />
            <rect x="224" y={a.y} width="98" height="34" rx="10" fill={a.best ? "rgba(139,108,255,0.28)" : "rgba(255,255,255,0.04)"} stroke={a.best ? "#c4b5ff" : "rgba(185,166,255,0.2)"} />
            <text x="273" y={a.y + 21} textAnchor="middle" fontSize="11" fill={a.best ? "#fff" : "#d9d3ff"} style={SANS}>
              {a.name}
            </text>
            <text x="334" y={a.y + 21} fontSize="10.5" fill={a.best ? "#e9e2ff" : "#736d96"} style={MONO}>
              {a.score}
            </text>
          </g>
        );
      })}
      <g className="mv" style={{ ...anim("mv-winner", 3.2, 2.4, { animationTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }), transformOrigin: "376px 124px" }}>
        <circle cx="376" cy="124" r="10" fill={`url(#${p}-mv-violet)`} />
        <path d="M371 124 l3.5 3.5 l6.5 -7" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </Frame>
  );
}

function HandwritingVisual({ p }: { p: string }) {
  const md = [
    { text: "## Ch. 3 — Entropy", c: "#c4b5ff" },
    { text: "**H(X)** = −Σ p log p", c: "#eeebff" },
    { text: "- max if p uniform", c: "#aaa4ca" },
    { text: "| x | p(x) |", c: "#8b86ad" },
  ];
  return (
    <Frame p={p} label="A photo of handwritten notes becomes clean Markdown">
      <g transform="rotate(-4 100 125)">
        <rect x="26" y="34" width="150" height="182" rx="6" fill="#efeaf8" />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1="34" x2="168" y1={62 + i * 18} y2={62 + i * 18} stroke="#b9b0d8" strokeWidth="0.7" />
        ))}
        <line x1="48" x2="48" y1="34" y2="216" stroke="#e7a3b5" strokeWidth="0.8" />
        <text x="54" y="58" fontSize="15" fill="#2b2470" style={HAND}>
          Ch.3 — Entropy
        </text>
        <text x="54" y="94" fontSize="14" fill="#2b2470" style={HAND}>
          H(X) = −Σ p log p
        </text>
        <text x="54" y="130" fontSize="13" fill="#2b2470" style={HAND}>
          → max if uniform
        </text>
        <text x="54" y="166" fontSize="13" fill="#2b2470" style={HAND}>
          x | p(x)
        </text>
      </g>
      <path d="M186 125 h28" stroke={`url(#${p}-mv-violet)`} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M208 118 l8 7 l-8 7" fill="none" stroke="#8b6cff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="226" y="34" width="156" height="182" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(185,166,255,0.16)" />
      <text x="238" y="52" fontSize="9" fill="#736d96" style={MONO}>
        notes.md
      </text>
      {md.map((line, i) => (
        <text
          key={line.text}
          className="mv"
          x="236"
          y={80 + i * 30}
          fontSize="10"
          fill={line.c}
          style={{ ...MONO, ...anim("mv-type", 4.5, 3.4 - i * 0.35, { animationTimingFunction: "steps(14)" }) }}
        >
          {line.text}
        </text>
      ))}
    </Frame>
  );
}

function QueryVisual({ p }: { p: string }) {
  const code: [string, string][][] = [
    [["load ", "#c4b5ff"], ['"sales.csv"', "#8fb4ff"]],
    [["| ", "#5b5480"], ["where ", "#c4b5ff"], ["amount ", "#eeebff"], ["> ", "#aaa4ca"], ["100", "#f0a8d8"]],
    [["| ", "#5b5480"], ["group ", "#c4b5ff"], ["region", "#eeebff"]],
    [["| ", "#5b5480"], ["sum ", "#c4b5ff"], ["amount", "#eeebff"]],
  ];
  const bars = [0.55, 0.9, 0.4, 0.72, 0.3];
  return (
    <Frame p={p} label="A hand-written query language: a four-line pipeline and the bar chart it produces">
      <rect x="20" y="20" width="220" height="150" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(185,166,255,0.14)" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={34 + i * 11} cy="34" r="3.2" fill="#3a3460" />
      ))}
      <text x="226" y="37" textAnchor="end" fontSize="9" fill="#736d96" style={MONO}>
        query.flux
      </text>
      {code.map((tokens, line) => (
        <text key={line} x="32" y={68 + line * 26} fontSize="11.5" style={MONO}>
          <tspan fill="#4a4470">{line + 1}  </tspan>
          {tokens.map(([t, c], i) => (
            <tspan key={i} fill={c}>
              {t}
            </tspan>
          ))}
        </text>
      ))}
      <rect className="mv" x="150" y="148" width="7" height="13" fill="#c4b5ff" style={anim("mv-pulse", 1.1)} />
      {/* Chart */}
      <line x1="262" x2="382" y1="214" y2="214" stroke="rgba(185,166,255,0.25)" />
      {bars.map((h, i) => (
        <rect
          key={i}
          className="mv"
          x={268 + i * 23}
          y={r2(214 - h * 150)}
          width="15"
          height={r2(h * 150)}
          rx="3"
          fill={`url(#${p}-mv-violet)`}
          opacity={r2(0.55 + h * 0.45)}
          style={{ ...anim("mv-grow", 3.6, 2.6, { animationTimingFunction: "cubic-bezier(.16,1,.3,1)" }), transformOrigin: "bottom" }}
        />
      ))}
      <rect x="24" y="190" width="76" height="24" rx="12" fill="rgba(94,233,181,0.1)" stroke="rgba(94,233,181,0.45)" />
      <text x="62" y="206" textAnchor="middle" fontSize="10" fill="#5ee9b5" style={MONO}>
        0 deps
      </text>
    </Frame>
  );
}

function AudioVisual({ p }: { p: string }) {
  const bars = Array.from({ length: 22 }, (_, i) => r2(0.35 + Math.abs(Math.sin(i * 0.9)) * 0.65));
  return (
    <Frame p={p} label="A music player whose background takes the cover's colours and pulses with the beat">
      <defs>
        <radialGradient id={`${p}-au-blob`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ff7ab6" stopOpacity="0.7" />
          <stop offset="0.5" stopColor="#7c5cff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#0b0920" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${p}-au-cover`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8fbf" />
          <stop offset="0.5" stopColor="#8b6cff" />
          <stop offset="1" stopColor="#3b4bd8" />
        </linearGradient>
      </defs>
      <g className="mv" style={anim("mv-hue", 6, 0, { animationDirection: "alternate", animationTimingFunction: "ease-in-out" })}>
        <circle cx="300" cy="90" r="150" fill={`url(#${p}-au-blob)`} />
        <circle cx="90" cy="220" r="110" fill={`url(#${p}-au-blob)`} opacity="0.6" />
      </g>
      <rect x="28" y="40" width="112" height="112" rx="12" fill={`url(#${p}-au-cover)`} />
      <circle cx="84" cy="96" r="26" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="84" cy="96" r="5" fill="#fff" fillOpacity="0.7" />
      <text x="28" y="176" fontSize="12" fill="#fff" style={SANS}>
        Now playing
      </text>
      <text x="28" y="192" fontSize="10" fill="#aaa4ca" style={SANS}>
        30-second preview
      </text>
      {bars.map((h, i) => (
        <rect
          key={i}
          className="mv"
          x={162 + i * 10}
          y={r2(96 - h * 46)}
          width="5"
          height={r2(h * 92)}
          rx="2.5"
          fill="#fff"
          opacity={r2(0.5 + h * 0.5)}
          style={{ ...anim("mv-bounce", 0.7 + (i % 5) * 0.12, i * 0.13, { animationTimingFunction: "ease-in-out" }), transformOrigin: "center" }}
        />
      ))}
      <rect x="28" y="214" width="344" height="4" rx="2" fill="rgba(255,255,255,0.15)" />
      <rect x="28" y="214" width="132" height="4" rx="2" fill="#fff" />
      <circle cx="160" cy="216" r="6" fill="#fff" />
    </Frame>
  );
}

function PanelVisual({ p }: { p: string }) {
  return (
    <Frame p={p} label="A Discord panel for an Obsidian project: counters, buttons and a menu">
      <rect x="24" y="22" width="352" height="206" rx="10" fill="#15122e" />
      <rect x="24" y="22" width="4" height="206" rx="2" fill="#8b6cff" />
      <text x="44" y="50" fontSize="13" fill="#fff" style={SANS}>
        📁 portfolio
      </text>
      <text x="44" y="68" fontSize="10" fill="#aaa4ca" style={SANS}>
        status: active · priority: medium
      </text>
      {[
        ["tasks", "12"],
        ["open", "4"],
        ["notes", "37"],
      ].map(([k, v], i) => (
        <g key={k} transform={`translate(${44 + i * 108} 84)`}>
          <rect width="96" height="46" rx="8" fill="rgba(255,255,255,0.04)" />
          <text x="12" y="20" fontSize="9" fill="#736d96" style={MONO}>
            {k}
          </text>
          <text x="12" y="38" fontSize="16" fill="#fff" style={SANS}>
            {v}
          </text>
        </g>
      ))}
      <rect x="44" y="144" width="312" height="28" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(185,166,255,0.18)" />
      <text x="56" y="162" fontSize="10.5" fill="#aaa4ca" style={SANS}>
        Pick a task to edit…
      </text>
      <path d="M340 156 l4 4 l4 -4" fill="none" stroke="#aaa4ca" strokeWidth="1.5" />
      {["Done", "Archive", "New note"].map((b, i) => (
        <g key={b} transform={`translate(${44 + i * 92} 184)`}>
          <rect className={i === 0 ? "mv" : undefined} width="82" height="28" rx="6" fill={i === 0 ? "#5b6cff" : "rgba(255,255,255,0.07)"} style={i === 0 ? anim("mv-pulse", 2.4, 1.2, { animationTimingFunction: "ease-in-out" }) : undefined} />
          <text x="41" y="18" textAnchor="middle" fontSize="10.5" fill="#fff" style={SANS}>
            {b}
          </text>
        </g>
      ))}
    </Frame>
  );
}

function GridVisual({ p }: { p: string }) {
  const thumbs = [
    [[0, 0, 1, 0.3], [0, 0.38, 0.6, 0.62], [0.66, 0.38, 0.34, 0.62]],
    [[0, 0, 0.3, 1], [0.36, 0, 0.64, 0.45], [0.36, 0.52, 0.64, 0.48]],
    [[0, 0, 1, 0.55], [0, 0.62, 0.3, 0.38], [0.35, 0.62, 0.3, 0.38], [0.7, 0.62, 0.3, 0.38]],
    [[0.2, 0, 0.6, 0.2], [0, 0.28, 1, 0.3], [0, 0.66, 1, 0.34]],
    [[0, 0, 0.48, 0.48], [0.52, 0, 0.48, 1], [0, 0.52, 0.48, 0.48]],
    [[0, 0, 1, 0.16], [0, 0.24, 0.22, 0.76], [0.28, 0.24, 0.72, 0.76]],
  ];
  return (
    <Frame p={p} label="A catalogue of page layouts, each one built to differ from the others">
      {thumbs.map((blocks, t) => {
        const x = 26 + (t % 3) * 120;
        const y = 24 + Math.floor(t / 3) * 106;
        return (
          <g key={t} transform={`translate(${x} ${y})`}>
            <rect width="108" height="94" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(185,166,255,0.14)" />
            {blocks.map(([bx, by, bw, bh], i) => (
              <rect key={i} x={8 + bx * 92} y={8 + by * 78} width={bw * 92 - 3} height={bh * 78 - 3} rx="3" fill={i === 0 ? "#3a3172" : "#221d48"} />
            ))}
          </g>
        );
      })}
      <rect className="mv" x="24" y="22" width="112" height="98" rx="10" fill="none" stroke="#c4b5ff" strokeWidth="2" style={anim("mv-slide", 6, 0, { animationTimingFunction: "cubic-bezier(.16,1,.3,1)" })} />
    </Frame>
  );
}

function ShellVisual({ p }: { p: string }) {
  const lines: [string, string][] = [
    ["$ nmap -sV 10.10.11.42", "#c4b5ff"],
    ["22/tcp  open  ssh", "#aaa4ca"],
    ["80/tcp  open  http", "#aaa4ca"],
    ["$ whoami", "#c4b5ff"],
    ["www-data", "#aaa4ca"],
    ["# id", "#f0a8d8"],
    ["uid=0(root) gid=0(root)", "#5ee9b5"],
  ];
  return (
    <Frame p={p} label="A terminal session from recon to root on a practice machine">
      <rect x="20" y="18" width="360" height="214" rx="10" fill="#08061a" stroke="rgba(185,166,255,0.16)" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={36 + i * 12} cy="33" r="3.5" fill="#3a3460" />
      ))}
      <text x="364" y="37" textAnchor="end" fontSize="9" fill="#736d96" style={MONO}>
        kali — htb
      </text>
      {lines.map(([t, c], i) => (
        <text
          key={i}
          className="mv"
          x="34"
          y={66 + i * 23}
          fontSize="11.5"
          fill={c}
          style={{ ...MONO, ...anim("mv-type", 7, 5.6 - i * 0.55, { animationTimingFunction: "steps(18)" }) }}
        >
          {t}
        </text>
      ))}
    </Frame>
  );
}

function CipherVisual({ p }: { p: string }) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const ring = (r: number, size: number, fill: string) =>
    letters.map((l, i) => {
      const a = (i / 26) * Math.PI * 2 - Math.PI / 2;
      return (
        <text key={l} x={r2(200 + Math.cos(a) * r)} y={r2(128 + Math.sin(a) * r + size / 3)} textAnchor="middle" fontSize={size} fill={fill} style={MONO}>
          {l}
        </text>
      );
    });
  return (
    <Frame p={p} label="A Caesar cipher wheel: the inner alphabet turns by three letters">
      <circle cx="200" cy="128" r="104" fill="rgba(255,255,255,0.02)" stroke="rgba(185,166,255,0.2)" />
      <circle cx="200" cy="128" r="76" fill="rgba(139,108,255,0.08)" stroke="rgba(185,166,255,0.25)" />
      {ring(90, 11, "#d9d3ff")}
      <g className="mv" style={{ ...anim("mv-step-spin", 5, 0.4, { animationTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }), transformOrigin: "200px 128px", transformBox: "view-box" }}>
        {ring(62, 10, "#a28bff")}
      </g>
      <circle cx="200" cy="128" r="26" fill="#0b0920" stroke="#8b6cff" />
      <text x="200" y="133" textAnchor="middle" fontSize="13" fill="#fff" style={MONO}>
        +3
      </text>
      <path d="M200 16 v14" stroke="#c4b5ff" strokeWidth="2" strokeLinecap="round" />
    </Frame>
  );
}

function DossierVisual({ p }: { p: string }) {
  return (
    <Frame p={p} label="A takeover dossier with redacted lines — details are under NDA">
      {[2, 1, 0].map((i) => (
        <g key={i} transform={`translate(${110 + i * 16} ${26 + i * 10}) rotate(${-4 + i * 3})`}>
          <rect width="170" height="196" rx="6" fill={i === 0 ? "#1a1640" : "#141030"} stroke="rgba(185,166,255,0.18)" />
          {i === 0 &&
            Array.from({ length: 9 }, (_, l) => (
              <rect key={l} x="16" y={30 + l * 17} width={l % 3 === 1 ? 92 : 138} height="6" rx="3" fill={l % 4 === 2 ? "#06040f" : "#3a3466"} />
            ))}
        </g>
      ))}
      <g transform="translate(258 168) rotate(-12)">
        <rect x="-44" y="-17" width="88" height="34" rx="6" fill="none" stroke="#c4b5ff" strokeWidth="2" />
        <text textAnchor="middle" y="6" fontSize="16" fill="#c4b5ff" style={MONO}>
          NDA
        </text>
      </g>
      <text x="126" y="58" fontSize="11" fill="#d9d3ff" style={SANS}>
        Takeover dossier — 43 pp.
      </text>
    </Frame>
  );
}

const VISUALS: Record<ProjectVisual, (props: { p: string }) => React.ReactElement> = {
  timeline: TimelineVisual,
  radar: RadarVisual,
  fanout: FanoutVisual,
  handwriting: HandwritingVisual,
  query: QueryVisual,
  audio: AudioVisual,
  panel: PanelVisual,
  grid: GridVisual,
  shell: ShellVisual,
  cipher: CipherVisual,
  dossier: DossierVisual,
};

/** `uid` keeps gradient ids unique when several visuals share a page. */
export function MiniVisual({ kind, uid }: { kind: ProjectVisual; uid: string }) {
  const Visual = VISUALS[kind];
  return <Visual p={`mv-${uid}`} />;
}
