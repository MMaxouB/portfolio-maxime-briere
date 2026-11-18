"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { ambientMotionOn } from "@/lib/ambient-motion";

/**
 * A live Lorenz attractor — σ = 10, ρ = 28, β = 8/3 — the textbook chaotic
 * system. Three trails race along its wings. Click (or press "+ε") to drop a
 * "butterfly": a copy of the nearest trail moved by 0.00001. For a few seconds
 * the two are indistinguishable; then they split and never meet again. The
 * readout shows the gap growing in real time.
 *
 * Why it is here: deterministic is not the same as predictable. A tiny input
 * can send a system somewhere else entirely — which is also the shortest
 * description of security work I know.
 */

const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;
const DT = 0.0055;
const EPSILON = 1e-5;
const MAX_BUTTERFLIES = 5;

type Vec3 = [number, number, number];

interface Trail {
  state: Vec3;
  /** Ring buffer of past positions, xyz interleaved */
  buffer: Float32Array;
  head: number;
  count: number;
  rgb: string;
  /** For butterflies: index of the trail it was copied from */
  parent?: number;
  born: number;
}

interface Spark {
  x: number;
  y: number;
  t: number;
}

function deriv([x, y, z]: Vec3): Vec3 {
  return [SIGMA * (y - x), x * (RHO - z) - y, x * y - BETA * z];
}

function rk4(s: Vec3, h: number): Vec3 {
  const k1 = deriv(s);
  const k2 = deriv([s[0] + (h / 2) * k1[0], s[1] + (h / 2) * k1[1], s[2] + (h / 2) * k1[2]]);
  const k3 = deriv([s[0] + (h / 2) * k2[0], s[1] + (h / 2) * k2[1], s[2] + (h / 2) * k2[2]]);
  const k4 = deriv([s[0] + h * k3[0], s[1] + h * k3[1], s[2] + h * k3[2]]);
  return [
    s[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    s[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    s[2] + (h / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
  ];
}

function makeTrail(state: Vec3, rgb: string, length: number, parent?: number): Trail {
  return {
    state: [...state] as Vec3,
    buffer: new Float32Array(length * 3),
    head: 0,
    count: 0,
    rgb,
    parent,
    born: performance.now(),
  };
}

function push(trail: Trail) {
  const len = trail.buffer.length / 3;
  trail.buffer[trail.head * 3] = trail.state[0];
  trail.buffer[trail.head * 3 + 1] = trail.state[1];
  trail.buffer[trail.head * 3 + 2] = trail.state[2];
  trail.head = (trail.head + 1) % len;
  trail.count = Math.min(trail.count + 1, len);
}

const BASE_COLORS = ["196,181,255", "139,108,255", "106,123,255"];
const BUTTERFLY_COLORS = ["240,150,255", "150,200,255", "255,170,220"];

function formatGap(value: number) {
  if (value < 0.001) return value.toExponential(1).replace("e-", "e−");
  if (value < 10) return value.toFixed(3);
  return value.toFixed(1);
}

interface AttractorProps {
  className?: string;
  onButterfly?: () => void;
}

export function Attractor({ className, onButterfly }: AttractorProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gapRef = useRef<HTMLSpanElement>(null);
  const spawnRef = useRef<(sx?: number, sy?: number) => void>(() => {});
  const [hasButterfly, setHasButterfly] = useState(false);
  const onButterflyRef = useRef(onButterfly);

  useEffect(() => {
    onButterflyRef.current = onButterfly;
  }, [onButterfly]);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const small = window.matchMedia("(max-width: 768px)").matches;
    const trailLength = small ? 420 : 640;
    const handFont =
      getComputedStyle(document.documentElement).getPropertyValue("--font-kalam").trim() || "cursive";

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let visible = true;
    let last = performance.now();

    // Camera: a slow sway around the view where the two wings read as a
    // butterfly. The wings sit on the x = y diagonal (fixed points at
    // ±(8.5, 8.5, 27)), so that view is θ = −π/4. `clock` drives the sway.
    const FRONT = -Math.PI / 4;
    let clock = 0;
    let theta = FRONT;
    let phi = 0.3;
    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };

    // A long settled orbit, drawn faintly: the shape the trails live on
    const ghost: Vec3[] = [];
    {
      let s: Vec3 = [0.1, 0, 0];
      for (let i = 0; i < 1500; i++) s = rk4(s, 0.01);
      for (let i = 0; i < (small ? 4200 : 7000); i++) {
        s = rk4(s, 0.01);
        ghost.push(s);
      }
    }

    const trails: Trail[] = [
      makeTrail([1, 1, 1], BASE_COLORS[0], trailLength),
      makeTrail([-6, -8, 24], BASE_COLORS[1], trailLength),
      makeTrail([9, 4, 29], BASE_COLORS[2], trailLength),
    ];
    // Pre-run so the page opens on full trails, not three dots
    for (const trail of trails) {
      for (let i = 0; i < 900; i++) trail.state = rk4(trail.state, DT);
      for (let i = 0; i < trailLength; i++) {
        trail.state = rk4(trail.state, DT);
        push(trail);
      }
    }
    const sparks: Spark[] = [];
    let butterflyCount = 0;

    function resize() {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!ambientMotionOn()) render(0);
    }

    function project(p: Vec3 | Float32Array, offset = 0): [number, number, number] {
      const x = p[offset];
      const y = p[offset + 1];
      const z = p[offset + 2] - 25;
      const ct = Math.cos(theta);
      const st = Math.sin(theta);
      const cp = Math.cos(phi);
      const sp = Math.sin(phi);
      const X = x * ct - y * st;
      const D = x * st + y * ct;
      const Y = z * cp - D * sp;
      const depth = z * sp + D * cp;
      const persp = 110 / (110 + depth);
      const scale = Math.min(width / 52, height / 58);
      // Centre sits a little right of the box so the left wing never reaches the copy
      return [width * 0.56 + X * scale * persp, height / 2 - Y * scale * persp, depth];
    }

    function step(frames: number) {
      const steps = Math.max(1, Math.min(8, Math.round(frames * 3)));
      for (const trail of trails) {
        for (let i = 0; i < steps; i++) {
          trail.state = rk4(trail.state, DT);
          push(trail);
        }
      }
    }

    function drawTrail(trail: Trail, weight: number) {
      const len = trail.buffer.length / 3;
      const n = trail.count;
      if (n < 2) return;
      const chunk = 32;
      const start = (trail.head - n + len) % len;
      let prev = project(trail.buffer, start * 3);
      for (let c = 0; c < n - 1; c += chunk) {
        const progress = (c + chunk) / n; // 0 = tail, 1 = head
        ctx.strokeStyle = `rgba(${trail.rgb},${Math.min(1, progress * progress * 0.95)})`;
        ctx.lineWidth = (0.5 + progress * 1.5) * weight;
        ctx.beginPath();
        ctx.moveTo(prev[0], prev[1]);
        const end = Math.min(n - 1, c + chunk);
        for (let i = c + 1; i <= end; i++) {
          const idx = ((start + i) % len) * 3;
          prev = project(trail.buffer, idx);
          ctx.lineTo(prev[0], prev[1]);
        }
        ctx.stroke();
      }

      // Bright head
      const [hx, hy] = project(trail.state);
      const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 14 * weight);
      glow.addColorStop(0, "rgba(255,255,255,0.95)");
      glow.addColorStop(0.25, `rgba(${trail.rgb},0.6)`);
      glow.addColorStop(1, `rgba(${trail.rgb},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(hx, hy, 14 * weight, 0, Math.PI * 2);
      ctx.fill();
    }

    function render(now: number) {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Ghost shape
      ctx.strokeStyle = "rgba(160,140,255,0.075)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let i = 0; i < ghost.length; i += 2) {
        const [x, y] = project(ghost[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      trails.forEach((trail, i) => drawTrail(trail, i < 3 ? 1 : 1.15));

      // "+ε" marks where a butterfly was dropped
      ctx.globalCompositeOperation = "source-over";
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        const age = (now - spark.t) / 2200;
        if (age >= 1) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(240,200,255,${1 - age})`;
        ctx.font = `22px ${handFont}`;
        ctx.fillText("+ε", spark.x + 10, spark.y - 10 - age * 24);
        ctx.strokeStyle = `rgba(240,170,255,${0.8 * (1 - age)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 6 + age * 26, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function updateGap() {
      const gapEl = gapRef.current;
      if (!gapEl) return;
      const latest = [...trails].reverse().find((t) => t.parent !== undefined);
      if (!latest || latest.parent === undefined) return;
      const parent = trails[latest.parent];
      const d = Math.hypot(
        latest.state[0] - parent.state[0],
        latest.state[1] - parent.state[1],
        latest.state[2] - parent.state[2]
      );
      gapEl.textContent = formatGap(d);
    }

    let gapTick = 0;
    function loop(now: number) {
      const frames = (now - last) / (1000 / 60);
      last = now;
      if (ambientMotionOn()) {
        clock += 0.016 * frames;
        eased.x += (pointer.x - eased.x) * 0.04;
        eased.y += (pointer.y - eased.y) * 0.04;
        theta = FRONT + Math.sin(clock * 0.3) * 0.5 + eased.x * 0.35;
        phi = 0.3 + eased.y * 0.2;
        step(frames);
        render(now);
        if (now - gapTick > 120) {
          updateGap();
          gapTick = now;
        }
      }
      frame = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(frame);
      last = performance.now();
      if (!visible || document.hidden) return;
      if (ambientMotionOn()) frame = requestAnimationFrame(loop);
      else render(performance.now());
    }

    spawnRef.current = (sx?: number, sy?: number) => {
      if (!ambientMotionOn()) return;
      // Copy the trail whose head is closest to where the click landed
      const px = sx ?? width / 2;
      const py = sy ?? height / 2;
      let best = 0;
      let bestDist = Infinity;
      trails.forEach((trail, i) => {
        if (trail.parent !== undefined) return;
        const [hx, hy] = project(trail.state);
        const d = Math.hypot(hx - px, hy - py);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      const source = trails[best];
      const color = BUTTERFLY_COLORS[butterflyCount % BUTTERFLY_COLORS.length];
      butterflyCount += 1;
      const twin = makeTrail(
        [source.state[0] + EPSILON, source.state[1], source.state[2]],
        color,
        trailLength,
        best
      );
      trails.push(twin);
      // Oldest butterfly goes first; parents are always base trails 0–2
      if (trails.length > 3 + MAX_BUTTERFLIES) trails.splice(3, 1);
      const [hx, hy] = project(source.state);
      sparks.push({ x: hx, y: hy, t: performance.now() });
      setHasButterfly(true);
      onButterflyRef.current?.();
    };

    function onPointerMove(event: PointerEvent) {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    }

    function onPointerDown(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      spawnRef.current(event.clientX - rect.left, event.clientY - rect.top);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(wrap);
    const motionObserver = new MutationObserver(start);
    motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("visibilitychange", start);

    resize();
    start();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      io.disconnect();
      motionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return (
    <div ref={wrapRef} className={className}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A Lorenz attractor drawn live: glowing trails loop around two wings. Clicking drops a copy shifted by 0.00001, which soon takes a completely different path."
        data-cursor="Drop ε"
        className="absolute inset-0 touch-manipulation"
      />
      <div className="glass absolute bottom-3 left-3 flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs sm:bottom-6 sm:left-6">
        <div className="font-mono leading-relaxed text-ink-2">
          <div className="text-ink">lorenz.py</div>
          {hasButterfly ? (
            <div>
              gap <span className="text-ink-3">0.00001 →</span>{" "}
              <span ref={gapRef} className="text-lilac">
                0.00001
              </span>
            </div>
          ) : (
            <div>σ=10 ρ=28 β=8/3</div>
          )}
        </div>
        <button
          type="button"
          onClick={() => spawnRef.current()}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line-strong text-lilac transition-colors hover:border-lilac hover:bg-violet/20"
          aria-label="Drop a butterfly: copy a trail shifted by 0.00001"
          title="Drop a butterfly (+ε)"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
