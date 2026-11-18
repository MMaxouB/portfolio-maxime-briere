import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — builds software and learns how it breaks`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The hero's Lorenz attractor, integrated once at build time and drawn as a path. */
function lorenzPath(): string {
  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;
  let [x, y, z] = [0.1, 0, 0];
  const dt = 0.008;
  const points: string[] = [];
  const theta = -Math.PI / 4;
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  for (let i = 0; i < 5200; i++) {
    const dx = sigma * (y - x);
    const dy = x * (rho - z) - y;
    const dz = x * y - beta * z;
    x += dx * dt;
    y += dy * dt;
    z += dz * dt;
    if (i < 300 || i % 2) continue;
    const X = x * ct - y * st;
    const px = 880 + X * 10.5;
    const py = 330 - (z - 25) * 8.6;
    points.push(`${points.length ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return points.join(" ");
}

export default function OpengraphImage() {
  const d = lorenzPath();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#06040f",
          backgroundImage:
            "radial-gradient(circle at 75% 45%, rgba(124,92,255,0.32) 0%, transparent 52%), radial-gradient(circle at 10% 0%, rgba(40,26,110,0.6) 0%, transparent 50%)",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={d} fill="none" stroke="#8b6cff" strokeOpacity="0.55" strokeWidth="1.3" />
          <circle cx="880" cy="330" r="2" fill="#ffffff" />
        </svg>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", gap: 18 }}>
          <div style={{ display: "flex", color: "#c4b5ff", fontSize: 28, fontFamily: "monospace" }}>$ whoami</div>
          <div style={{ display: "flex", color: "#f1edff", fontSize: 150, fontWeight: 800, letterSpacing: -7, lineHeight: 0.95 }}>
            {SITE.name}
          </div>
          <div style={{ display: "flex", flexDirection: "column", color: "#eeebff", fontSize: 46, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.08 }}>
            <div style={{ display: "flex" }}>I build software</div>
            <div style={{ display: "flex" }}>
              and learn how it&nbsp;<span style={{ color: "#9d86ff" }}>breaks.</span>
            </div>
          </div>
          <div style={{ display: "flex", color: "#aaa4ca", fontSize: 24, marginTop: 14 }}>
            Backend · AI tools · Security — Python &amp; TypeScript
          </div>
        </div>
      </div>
    ),
    size
  );
}
