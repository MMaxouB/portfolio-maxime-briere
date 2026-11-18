"use client";

import { useEffect, useRef } from "react";
import { ambientMotionOn } from "@/lib/ambient-motion";

/**
 * The night sky behind every page: three layers of stars that drift at
 * different speeds as you scroll (parallax = depth), a slow twinkle, and — now
 * and then — one shooting star. Everything else (planets, skyline, nebulae) is
 * drawn by the section that owns it.
 *
 * Stops animating when ambient motion is off; still follows the scroll, since
 * that movement is the visitor's own.
 */

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  phase: number;
  speed: number;
  layer: 0 | 1 | 2;
  tint: string;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const PARALLAX = [0.02, 0.06, 0.12] as const;
const TINTS = ["238,235,255", "238,235,255", "238,235,255", "196,181,255", "170,190,255", "255,226,200"];

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function SkyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let meteor: Meteor | null = null;
    let nextMeteorAt = performance.now() + 7000;
    let frame = 0;
    let lastDraw = 0;
    // The pointer is a faint lantern: stars near it brighten a little
    const lantern = { x: -9999, y: -9999, strength: 0 };
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rand = seeded(20260818);
      const count = Math.round(Math.min(340, (width * height) / 5200));
      stars = Array.from({ length: count }, () => {
        const roll = rand();
        const layer: Star["layer"] = roll < 0.62 ? 0 : roll < 0.9 ? 1 : 2;
        return {
          x: rand() * width,
          // Spread over a tall band so parallax never runs out of sky
          y: rand() * height * 2,
          r: layer === 0 ? 0.35 + rand() * 0.5 : layer === 1 ? 0.7 + rand() * 0.6 : 1.1 + rand() * 0.8,
          a: layer === 0 ? 0.25 + rand() * 0.35 : layer === 1 ? 0.45 + rand() * 0.35 : 0.65 + rand() * 0.35,
          phase: rand() * Math.PI * 2,
          speed: 0.4 + rand() * 1.4,
          layer,
          tint: TINTS[Math.floor(rand() * TINTS.length)],
        };
      });
    }

    function draw(now: number) {
      const t = now / 1000;
      const scroll = window.scrollY;
      const moving = ambientMotionOn();
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        const band = height * 2;
        let y = (star.y - scroll * PARALLAX[star.layer]) % band;
        if (y < 0) y += band;
        if (y > height + 4) continue;

        const twinkle = moving ? 0.72 + 0.28 * Math.sin(t * star.speed + star.phase) : 1;
        let glow = 0;
        if (lantern.strength > 0.01) {
          const d = Math.hypot(star.x - lantern.x, y - lantern.y);
          if (d < 170) glow = (1 - d / 170) ** 2 * lantern.strength;
        }
        const alpha = Math.min(1, star.a * twinkle + glow * 0.75);
        ctx.fillStyle = `rgba(${star.tint},${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, y, star.r * (1 + glow * 0.9), 0, Math.PI * 2);
        ctx.fill();

        // The brightest near stars get a faint cross glint
        if (star.layer === 2 && star.r > 1.6) {
          ctx.strokeStyle = `rgba(${star.tint},${alpha * 0.35})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(star.x - star.r * 4, y);
          ctx.lineTo(star.x + star.r * 4, y);
          ctx.moveTo(star.x, y - star.r * 4);
          ctx.lineTo(star.x, y + star.r * 4);
          ctx.stroke();
        }
      }

      if (moving) {
        if (!meteor && now > nextMeteorAt) {
          const fromLeft = Math.random() < 0.5;
          meteor = {
            x: fromLeft ? Math.random() * width * 0.5 : width * (0.5 + Math.random() * 0.5),
            y: Math.random() * height * 0.35,
            vx: (fromLeft ? 1 : -1) * (7 + Math.random() * 4),
            vy: 2.6 + Math.random() * 1.6,
            life: 1,
          };
          nextMeteorAt = now + 11000 + Math.random() * 12000;
        }
        if (meteor) {
          const m = meteor;
          const tail = 16;
          const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tail, m.y - m.vy * tail);
          grad.addColorStop(0, `rgba(255,255,255,${0.9 * m.life})`);
          grad.addColorStop(0.3, `rgba(196,181,255,${0.45 * m.life})`);
          grad.addColorStop(1, "rgba(139,108,255,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail);
          ctx.stroke();
          m.x += m.vx;
          m.y += m.vy;
          m.life -= 0.018;
          if (m.life <= 0 || m.x < -200 || m.x > width + 200) meteor = null;
        }
      }
    }

    function loop(now: number) {
      // ~30 fps is plenty for a twinkle and keeps the GPU cool
      lantern.strength *= 0.985;
      if (now - lastDraw > 32) {
        draw(now);
        lastDraw = now;
      }
      frame = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(frame);
      if (document.hidden) return;
      if (ambientMotionOn()) frame = requestAnimationFrame(loop);
      else draw(performance.now());
    }

    function onScroll() {
      if (!ambientMotionOn()) draw(performance.now());
    }

    function onPointerMove(event: PointerEvent) {
      if (!finePointer || event.pointerType !== "mouse") return;
      lantern.x = event.clientX;
      lantern.y = event.clientY;
      lantern.strength = 1;
    }

    function onResize() {
      build();
      start();
    }

    build();
    start();

    const observer = new MutationObserver(start);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.addEventListener("change", start);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", start);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frame);
      observer.disconnect();
      reduced.removeEventListener("change", start);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Deep gradient: night at the top, a touch of violet near the horizon */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 15% 0%, #140d33 0%, transparent 55%), radial-gradient(90% 70% at 100% 60%, #0f0d2e 0%, transparent 60%), linear-gradient(180deg, #07051a 0%, #06040f 60%, #05030c 100%)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="grain absolute inset-0" />
    </div>
  );
}
