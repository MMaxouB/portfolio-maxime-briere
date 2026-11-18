"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  ColorManagement,
  Group,
  Line,
  LineBasicMaterial,
  LinearSRGBColorSpace,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { PLANET_RINGS } from "@/lib/planet";
import { SKILLS } from "@/lib/skills";
import { TECH_MARKS } from "@/lib/tech-marks";
import { readableHex } from "@/lib/tech-color";
import { ambientMotionOn } from "@/lib/ambient-motion";

/**
 * A deliberately simple planet: a dark violet sphere with a lit rim and a halo,
 * and the skills as icons turning around it on tilted rings. Icons pass in
 * front of and behind the sphere (real depth). Drag to spin; hover an icon to
 * read its name, click to open it on /expertise.
 *
 * Colour management is off on purpose: shaders and textures use display colours
 * directly, so the hex values below are what appears on screen.
 */
ColorManagement.enabled = false;

const R = 1; // planet radius = 1 scene unit
const HALF_VIEW = 2.62; // visible half-height: the sphere is ~38% of the canvas
const CAM_Z = 7;
/** Sphere radius as a fraction of the canvas half-width (for hit-testing) */
const SPHERE_FRACTION = R / HALF_VIEW;

const PLANET_VERT = /* glsl */ `
varying vec3 vObj; varying vec3 vN; varying vec3 vView;
void main(){
  vObj = position;
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;
const PLANET_FRAG = /* glsl */ `
uniform vec3 uLight; uniform vec3 uDeep; uniform vec3 uMid; uniform vec3 uAtmo;
varying vec3 vObj; varying vec3 vN; varying vec3 vView;
void main(){
  vec3 N = normalize(vN); vec3 V = normalize(vView); vec3 L = normalize(uLight);
  vec3 p = normalize(vObj);
  float day = smoothstep(-0.2, 0.75, dot(N, L));
  vec3 col = mix(uDeep, uMid, day);
  // Soft latitude bands that turn with the planet
  float band = sin(p.y * 11.0 + sin(p.x * 3.0 + p.z * 2.0) * 0.7) * 0.5 + 0.5;
  col += uAtmo * band * 0.07 * (0.4 + day);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col += uAtmo * rim * (0.3 + 0.9 * day);
  gl_FragColor = vec4(col, 1.0);
}
`;
const GLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const GLOW_FRAG = /* glsl */ `
uniform vec3 uColor; uniform vec2 uLight2D; uniform float uHalf;
varying vec2 vUv;
void main(){
  vec2 p = (vUv - 0.5) * 2.0;
  float d = length(p) * uHalf;
  float g = pow(smoothstep(1.7, 1.02, d), 2.2);
  float side = 0.5 + 0.5 * dot(normalize(p + 1e-5), uLight2D);
  gl_FragColor = vec4(uColor * g * (0.3 + 0.9 * side), g);
}
`;

/** A skill's icon as a rounded tile: the brand mark drawn from its SVG path. */
function iconTexture(slug: keyof typeof TECH_MARKS): CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const pad = 6;
  const r = 30;
  ctx.beginPath();
  ctx.roundRect(pad, pad, size - pad * 2, size - pad * 2, r);
  ctx.fillStyle = "rgba(15, 11, 40, 0.94)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(196, 181, 255, 0.4)";
  ctx.stroke();
  const mark = TECH_MARKS[slug];
  const scale = 68 / 24;
  ctx.save();
  ctx.translate((size - 68) / 2, (size - 68) / 2);
  ctx.scale(scale, scale);
  ctx.fillStyle = readableHex(mark.hex);
  ctx.fill(new Path2D(mark.path));
  ctx.restore();
  const texture = new CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

interface PlanetSceneProps {
  /** Called once, after the first frame is on screen */
  onReady: () => void;
  /** Called if WebGL fails later (context lost) so the page can fall back */
  onFail: () => void;
  /** A skill icon was clicked */
  onSelect: (skillSlug: string) => void;
}

export default function PlanetScene({ onReady, onFail, onSelect }: PlanetSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacks = useRef({ onReady, onFail, onSelect });

  useEffect(() => {
    callbacks.current = { onReady, onFail, onSelect };
  }, [onReady, onFail, onSelect]);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      callbacks.current.onFail();
      return;
    }
    renderer.outputColorSpace = LinearSRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const small = window.matchMedia("(max-width: 768px)").matches;
    // Pixel-ratio ceiling, lowered automatically if the machine cannot keep up
    let dprCap = small ? 1.25 : 1.6;

    const scene = new Scene();
    const camera = new PerspectiveCamera((2 * Math.atan(HALF_VIEW / CAM_Z) * 180) / Math.PI, 1, 0.1, 50);
    camera.position.set(0, 0, CAM_Z);
    const lightView = new Vector3(-0.78, 0.5, 0.62).normalize();

    // ---- Planet ---------------------------------------------------------------
    const tilt = new Group(); // axial tilt + drag pitch
    const spin = new Group(); // rotation around the vertical axis (drag, rest spin)
    tilt.rotation.set(0.22, 0, 0.18);
    tilt.add(spin);
    scene.add(tilt);

    const planet = new Mesh(
      new SphereGeometry(R, small ? 48 : 72, small ? 48 : 72),
      new ShaderMaterial({
        vertexShader: PLANET_VERT,
        fragmentShader: PLANET_FRAG,
        uniforms: {
          uLight: { value: lightView.clone() },
          uDeep: { value: new Color("#0c0930") },
          uMid: { value: new Color("#3a2d95") },
          uAtmo: { value: new Color("#8b6cff") },
        },
      })
    );
    spin.add(planet);

    const glow = new Mesh(
      new PlaneGeometry(2 * HALF_VIEW * 0.62, 2 * HALF_VIEW * 0.62),
      new ShaderMaterial({
        vertexShader: GLOW_VERT,
        fragmentShader: GLOW_FRAG,
        uniforms: {
          uColor: { value: new Color("#7d5cff") },
          uLight2D: { value: new Vector2(lightView.x, lightView.y).normalize() },
          uHalf: { value: HALF_VIEW * 0.62 },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      })
    );
    glow.position.z = -0.6;
    glow.renderOrder = -1;
    scene.add(glow);

    // ---- Skills on rings --------------------------------------------------------
    const skillBySlug = new Map(SKILLS.map((s) => [s.slug, s]));
    const textures: CanvasTexture[] = [];
    const sprites: Sprite[] = [];
    const orbits: { group: Group; speed: number }[] = [];
    for (const ring of PLANET_RINGS) {
      const plane = new Group(); // sets the tilt of the ring
      plane.rotation.set(ring.tilt[0], 0, ring.tilt[1]);
      const orbit = new Group(); // turns inside it
      plane.add(orbit);
      spin.add(plane);
      orbits.push({ group: orbit, speed: ring.speed });

      // Faint guide line
      const pts: number[] = [];
      for (let i = 0; i <= 160; i++) {
        const t = (i / 160) * Math.PI * 2;
        pts.push(Math.cos(t) * ring.radius, 0, Math.sin(t) * ring.radius);
      }
      const lineGeo = new BufferGeometry();
      lineGeo.setAttribute("position", new BufferAttribute(new Float32Array(pts), 3));
      plane.add(
        new Line(
          lineGeo,
          new LineBasicMaterial({ color: 0xb9a6ff, transparent: true, opacity: 0.13, blending: AdditiveBlending, depthWrite: false })
        )
      );

      const usable = ring.skills
        .map((slug) => skillBySlug.get(slug))
        .filter((s): s is NonNullable<typeof s> => !!s && "brand" in s.mark);
      usable.forEach((skill, i) => {
        if (!("brand" in skill.mark)) return;
        const texture = iconTexture(skill.mark.brand);
        textures.push(texture);
        const sprite = new Sprite(new SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
        const angle = (i / usable.length) * Math.PI * 2;
        sprite.position.set(Math.cos(angle) * ring.radius, 0, Math.sin(angle) * ring.radius);
        sprite.scale.setScalar(ring.size);
        sprite.userData = { skill: skill.slug, name: skill.name };
        orbit.add(sprite);
        sprites.push(sprite);
      });
    }

    // ---- Sizing -----------------------------------------------------------------
    let size = 0;
    let dpr = 1;
    function resize() {
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 2) return;
      size = rect.width;
      dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      renderer.setPixelRatio(dpr);
      renderer.setSize(size, size, false);
      needsRender = true;
      schedule();
    }

    // ---- Interaction ------------------------------------------------------------
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    let hovered: Sprite | null = null;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    const REST_SPIN = 0.05;
    let spinVel = REST_SPIN;
    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };

    function pick(e: PointerEvent): Sprite | null {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      // Nearest icon wins; icons hidden behind the sphere are skipped
      const hits = raycaster.intersectObjects(sprites, false);
      const sphere = raycaster.intersectObject(planet, false)[0];
      const hit = hits.find((h) => !sphere || h.distance < sphere.distance);
      return (hit?.object as Sprite) ?? null;
    }
    function onSphere(e: PointerEvent) {
      const r = canvas.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      return Math.hypot(dx, dy) < (r.width / 2) * SPHERE_FRACTION * 1.03;
    }
    function onPointerMove(e: PointerEvent) {
      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        spin.rotation.y += dx * 0.0072;
        tilt.rotation.x = Math.max(-0.5, Math.min(0.9, tilt.rotation.x + dy * 0.0035));
        spinVel = dx * 0.0072 * 60;
        needsRender = true;
        schedule();
        return;
      }
      const sprite = pick(e);
      if (sprite !== hovered) {
        hovered = sprite;
        needsRender = true;
        schedule();
      }
      // The custom cursor reads this: the icon's name, "Spin" on the sphere, nothing elsewhere
      canvas.dataset.cursor = sprite ? String(sprite.userData.name) : onSphere(e) ? "Spin" : "";
      canvas.style.cursor = "";
    }
    function onPointerDown(e: PointerEvent) {
      if (!pick(e) && !onSphere(e)) return;
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      schedule();
    }
    function onPointerUp(e: PointerEvent) {
      if (dragging && moved < 5) {
        // A click, not a drag
        const sprite = pick(e);
        if (sprite) callbacks.current.onSelect(String(sprite.userData.skill));
      }
      dragging = false;
      schedule();
    }
    function onWindowPointer(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }

    // ---- Loop -------------------------------------------------------------------
    let frame = 0;
    let visible = true;
    let needsRender = true;
    let last = performance.now();
    let readyCalled = false;

    function draw(dt: number, animate: boolean) {
      if (animate) {
        if (!dragging) {
          spin.rotation.y += spinVel * dt;
          spinVel += (REST_SPIN - spinVel) * Math.min(1, dt * 1.4);
        }
        eased.x += (pointer.x - eased.x) * Math.min(1, dt * 2);
        eased.y += (pointer.y - eased.y) * Math.min(1, dt * 2);
        tilt.rotation.y = eased.x * 0.14;
        for (const o of orbits) o.group.rotation.y += o.speed * dt;
      }
      // Hovered icon grows a little
      for (const s of sprites) {
        const base = s === hovered ? 1.22 : 1;
        const cur = s.userData.k ?? 1;
        const next = cur + (base - cur) * (animate ? 0.18 : 1);
        s.userData.k = next;
        const ring = PLANET_RINGS.find((r) => r.skills.includes(s.userData.skill));
        s.scale.setScalar((ring?.size ?? 0.45) * next);
      }
      renderer.render(scene, camera);
      if (!readyCalled) {
        readyCalled = true;
        callbacks.current.onReady();
      }
    }

    // Adaptive quality: sustained slow frames first cost resolution, then the
    // animation itself (the planet stays, drawn on demand).
    let frozen = false;
    let slow = 0;
    let warmup = 24;
    function adapt(rawDt: number) {
      if (warmup > 0) {
        warmup -= 1;
        return;
      }
      if (rawDt > 0.5) return;
      slow = rawDt > 0.034 ? slow + 1 : Math.max(0, slow - 1);
      if (slow < 40) return;
      slow = 0;
      if (dprCap > 0.6) {
        dprCap *= 0.75;
        resize();
      } else {
        frozen = true;
      }
    }

    function tick(now: number) {
      frame = 0;
      const rawDt = (now - last) / 1000;
      // rAF timestamps can precede performance.now() on the first frame: never go negative
      const dt = Math.max(0, Math.min(0.05, rawDt));
      last = now;
      const animate = ambientMotionOn() && !frozen;
      if (animate && visible && !document.hidden) adapt(rawDt);
      if (visible && !document.hidden && (animate || dragging || needsRender)) {
        draw(dt, animate);
        needsRender = false;
      }
      if (visible && !document.hidden && (animate || dragging)) schedule();
    }

    function schedule() {
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        needsRender = true;
        if (visible) schedule();
      },
      { rootMargin: "120px" }
    );
    io.observe(wrap);
    const motionObserver = new MutationObserver(() => {
      needsRender = true;
      schedule();
    });
    motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    const onLost = (e: Event) => {
      e.preventDefault();
      callbacks.current.onFail();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("pointermove", onWindowPointer, { passive: true });
    document.addEventListener("visibilitychange", schedule);

    resize();
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      motionObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("pointermove", onWindowPointer);
      document.removeEventListener("visibilitychange", schedule);
      scene.traverse((obj) => {
        const m = obj as Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as ShaderMaterial | ShaderMaterial[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
      textures.forEach((t) => t.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        data-cursor-style="scope"
        className="pointer-events-auto absolute inset-0 h-full w-full touch-pan-y"
      />
    </div>
  );
}
