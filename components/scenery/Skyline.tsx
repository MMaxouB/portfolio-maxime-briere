/**
 * A night skyline, generated from a fixed seed so server and client draw the
 * same city. Windows are lamp-amber and a few violet; some of them switch on
 * and off on long, unsynchronised timers. Below, the same city again, upside
 * down and faded: its reflection in the water.
 */

const WIDTH = 1600;
const HORIZON = 300;

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface Building {
  x: number;
  w: number;
  h: number;
  tone: string;
  antenna: boolean;
  windows: { x: number; y: number; lit: boolean; violet: boolean; flicker: number | null }[];
}

function buildCity(): Building[] {
  const rand = seeded(1789);
  const buildings: Building[] = [];
  let x = -10;
  while (x < WIDTH) {
    const w = 38 + Math.floor(rand() * 70);
    // Taller towers toward the middle, like a downtown
    const centre = 1 - Math.abs(x + w / 2 - WIDTH * 0.58) / (WIDTH * 0.6);
    const h = Math.round(46 + rand() * 90 + Math.max(0, centre) * 110 * rand());
    const tone = rand() < 0.5 ? "#0f0b2a" : "#130e33";
    const windows: Building["windows"] = [];
    const cols = Math.max(2, Math.floor((w - 10) / 9));
    const rows = Math.floor((h - 14) / 11);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const roll = rand();
        if (roll > 0.42) continue;
        windows.push({
          x: x + 6 + c * 9,
          y: HORIZON - h + 10 + r * 11,
          lit: roll < 0.3,
          violet: rand() < 0.16,
          flicker: rand() < 0.06 ? Math.round(rand() * 30) : null,
        });
      }
    }
    buildings.push({ x, w, h, tone, antenna: h > 170 && rand() < 0.6, windows });
    x += w + Math.floor(rand() * 4);
  }
  return buildings;
}

const CITY = buildCity();

function City() {
  return (
    <g>
      {CITY.map((b) => (
        <g key={b.x}>
          <rect x={b.x} y={HORIZON - b.h} width={b.w} height={b.h} fill={b.tone} />
          <rect x={b.x} y={HORIZON - b.h} width={b.w} height="1.5" fill="#6a58d8" opacity="0.55" />
          {b.antenna && (
            <>
              <rect x={b.x + b.w / 2 - 1} y={HORIZON - b.h - 26} width="2" height="26" fill="#1a1440" />
              <circle cx={b.x + b.w / 2} cy={HORIZON - b.h - 27} r="2.2" fill="#ff8fb3" className="mv-beacon" />
            </>
          )}
          {b.windows.map((w, i) =>
            w.lit || w.flicker !== null ? (
              <rect
                key={i}
                x={w.x}
                y={w.y}
                width="4"
                height="5.5"
                fill={w.violet ? "#a28bff" : "#ffb86b"}
                opacity={w.lit ? 0.85 : 0.08}
                style={
                  w.flicker !== null
                    ? { animation: `window-flicker ${14 + (w.flicker % 9)}s steps(1) ${-w.flicker}s infinite`, ["--on" as string]: "0.85" }
                    : undefined
                }
              />
            ) : null
          )}
        </g>
      ))}
    </g>
  );
}

export function Skyline({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${WIDTH} ${HORIZON * 2}`} preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sky-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b4cc8" stopOpacity="0" />
          <stop offset="0.6" stopColor="#5b4cc8" stopOpacity="0.22" />
          <stop offset="1" stopColor="#8b6cff" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0720" />
          <stop offset="1" stopColor="#06040f" />
        </linearGradient>
        <linearGradient id="reflect-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="reflect-mask">
          <rect x="0" y={HORIZON} width={WIDTH} height={HORIZON} fill="url(#reflect-fade)" />
        </mask>
      </defs>
      {/* City glow on the horizon */}
      <rect x="0" y={HORIZON - 230} width={WIDTH} height="230" fill="url(#sky-haze)" />
      <City />
      {/* Water */}
      <rect x="0" y={HORIZON} width={WIDTH} height={HORIZON} fill="url(#water)" />
      <g mask="url(#reflect-mask)">
        <g transform={`translate(0 ${HORIZON * 2}) scale(1 -1)`} opacity="0.7">
          <City />
        </g>
      </g>
      {Array.from({ length: 14 }, (_, i) => (
        <rect
          key={i}
          x={(i * 397) % WIDTH}
          y={HORIZON + 8 + i * 9}
          width={120 + ((i * 53) % 160)}
          height="1"
          fill="#c4b5ff"
          opacity={0.12 - i * 0.006}
        />
      ))}
      <rect x="0" y={HORIZON} width={WIDTH} height="1" fill="#8b6cff" opacity="0.35" />
    </svg>
  );
}
