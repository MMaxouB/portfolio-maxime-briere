"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ColorManagement,
  DoubleSide,
  Group,
  Line,
  LinearSRGBColorSpace,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  RingGeometry,
  MeshBasicMaterial,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { PLANET_ARCS, PLANET_MARKERS, PLANET_MOONS } from "@/lib/planet";
import { ambientMotionOn } from "@/lib/ambient-motion";

/**
 * A procedural 3D planet — no textures, everything is computed in shaders:
 * continents and clouds from noise, a soft terminator, ocean glint, city lights
 * on the night side, an atmosphere. On top: arcs with light travelling along
 * them, pulsing markers, a moon. Drag to spin it (with inertia).
 *
 * Colour management is off on purpose: shaders write display colours directly,
 * so the hex values below are exactly what appears on screen.
 */
ColorManagement.enabled = false;

const R = 1; // planet radius = 1 scene unit
const HALF_VIEW = 1.54; // visible half-height, so the sphere is ~65% of the canvas
const CAM_Z = 5.6;
const SPHERE_FRACTION = R / HALF_VIEW;

const NOISE = /* glsl */ `
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.02 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return v; }
float fbm3(vec3 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 3; i++){ v += a * noise(p); p = p * 2.02 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return v; }
`;

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
uniform float uTime;
uniform vec3 uLight;
uniform vec3 uCities[8];
uniform vec3 uOcean; uniform vec3 uLand; uniform vec3 uLandHi; uniform vec3 uAtmo; uniform vec3 uLamp;
varying vec3 vObj; varying vec3 vN; varying vec3 vView;
${NOISE}
void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(vView);
  vec3 L = normalize(uLight);
  vec3 p = normalize(vObj);

  // Terrain height, lifted around each city so every marker sits on land
  float h = fbm(p * 2.3 + 3.0);
  for (int i = 0; i < 8; i++) { h += smoothstep(0.42, 0.0, distance(p, uCities[i])) * 0.2; }
  float land = smoothstep(0.52, 0.55, h);

  vec3 sea = uOcean * (0.75 + 0.55 * fbm3(p * 7.0));
  vec3 ground = mix(uLand, uLandHi, smoothstep(0.55, 0.78, h)) * (0.8 + 0.4 * fbm3(p * 9.0));
  vec3 col = mix(sea, ground, land);

  // Ice caps
  float cap = smoothstep(0.80, 0.95, abs(p.y) + (h - 0.5) * 0.18);
  col = mix(col, vec3(0.80, 0.77, 1.0), cap * 0.85);

  // Slow clouds
  float c = fbm(p * 3.3 + vec3(uTime * 0.010, 0.0, uTime * 0.006));
  float clouds = smoothstep(0.54, 0.80, c);
  col = mix(col, vec3(0.86, 0.84, 1.0), clouds * 0.38);

  float ndl = dot(N, L);
  float day = smoothstep(-0.12, 0.38, ndl);
  vec3 lit = col * (0.04 + 0.92 * day);

  // Ocean glint
  vec3 H = normalize(L + V);
  lit += pow(max(dot(N, H), 0.0), 70.0) * (1.0 - land) * (1.0 - clouds) * 0.55 * day * vec3(0.8, 0.75, 1.0);

  // City lights, on land, on the night side, thinned by clouds
  float night = 1.0 - smoothstep(-0.06, 0.24, ndl);
  float density = smoothstep(0.54, 0.74, fbm3(p * 7.0 + 9.0));
  float dots = step(0.76, noise(p * 95.0));
  vec3 cityCol = mix(uLamp, vec3(0.78, 0.64, 1.0), step(0.84, noise(p * 31.0)));
  float lightsOn = land * night * (1.0 - clouds * 0.75);
  lit += cityCol * dots * density * lightsOn * 1.9;
  lit += uLamp * density * lightsOn * 0.05;

  // Atmosphere rim, stronger on the lit side
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  lit += uAtmo * fres * (0.16 + 0.7 * day);

  gl_FragColor = vec4(lit / (1.0 + lit * 0.18), 1.0);
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
  float d = length(p) * uHalf;                  // distance from centre in planet radii
  float g = pow(smoothstep(1.62, 1.02, d), 2.3);
  float side = 0.5 + 0.5 * dot(normalize(p + 1e-5), uLight2D);
  gl_FragColor = vec4(uColor * g * (0.25 + 0.95 * side), g);
}
`;

const ARC_VERT = /* glsl */ `
attribute float aT; varying float vT;
void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const ARC_FRAG = /* glsl */ `
uniform vec3 uColor; uniform float uHead;
varying float vT;
void main(){
  float behind = mod(uHead - vT, 1.0);          // how far behind the light this point is
  float pulse = exp(-behind * 11.0);
  float ends = smoothstep(0.0, 0.07, vT) * smoothstep(1.0, 0.93, vT);
  float a = (0.12 + pulse * 0.95) * ends;
  gl_FragColor = vec4(uColor, a);
}
`;

const DOT_VERT = /* glsl */ `
attribute float aSize; attribute vec3 aColor; varying vec3 vColor;
uniform float uPx;
void main(){
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uPx;
  gl_Position = projectionMatrix * mv;
}
`;
const DOT_FRAG = /* glsl */ `
varying vec3 vColor;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.0, d);
  gl_FragColor = vec4(vColor * (0.4 + a), a * a);
}
`;

const MOON_VERT = PLANET_VERT;
const MOON_FRAG = /* glsl */ `
uniform vec3 uLight; uniform vec3 uColor;
varying vec3 vObj; varying vec3 vN; varying vec3 vView;
${NOISE}
void main(){
  vec3 N = normalize(vN);
  float n = fbm3(normalize(vObj) * 5.0);
  float craters = smoothstep(0.45, 0.65, fbm3(normalize(vObj) * 11.0));
  vec3 col = uColor * (0.62 + 0.5 * n - 0.18 * craters);
  float d = smoothstep(-0.08, 0.35, dot(N, normalize(uLight)));
  vec3 lit = col * (0.05 + 1.15 * d);
  lit += vec3(0.55, 0.5, 0.95) * pow(1.0 - max(dot(N, normalize(vView)), 0.0), 3.0) * 0.25 * d;
  gl_FragColor = vec4(lit, 1.0);
}
`;

function latLon(lat: number, lon: number, radius: number): Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

const ARC_COLORS = {
  lilac: new Color("#b9a6ff"),
  cyan: new Color("#7fd6ff"),
  pink: new Color("#ff9ad6"),
} as const;

interface PlanetSceneProps {
  /** Called once, after the first frame is on screen */
  onReady: () => void;
  /** Called if WebGL fails later (context lost) so the page can fall back */
  onFail: () => void;
  /** Text of the label that follows the home marker */
  homeLabel: string;
}

export default function PlanetScene({ onReady, onFail, homeLabel }: PlanetSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onReady, onFail });

  useEffect(() => {
    callbacks.current = { onReady, onFail };
  }, [onReady, onFail]);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const label = labelRef.current!;

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
    // Pixel-ratio ceiling. It starts generous and is lowered automatically if
    // the machine cannot keep up (see `adapt`), so weak GPUs degrade gracefully.
    let dprCap = small ? 1.25 : 1.6;

    const scene = new Scene();
    const camera = new PerspectiveCamera((2 * Math.atan(HALF_VIEW / CAM_Z) * 180) / Math.PI, 1, 0.1, 50);
    camera.position.set(0, 0, CAM_Z);

    // View-space direction toward the sun: upper left, a little in front
    const lightView = new Vector3(-0.78, 0.5, 0.62).normalize();

    // ---- Planet ------------------------------------------------------------
    const tilt = new Group(); // axial tilt + drag pitch
    const spin = new Group(); // rotation around the planet's own axis
    tilt.rotation.set(0.3, 0, 0.36);
    tilt.add(spin);
    scene.add(tilt);

    const cityPositions = PLANET_MARKERS.map((m) => latLon(m.lat, m.lon, 1));
    while (cityPositions.length < 8) cityPositions.push(new Vector3(0, 0, 0).setScalar(99));

    const segments = small ? 64 : 96;
    const planetMat = new ShaderMaterial({
      vertexShader: PLANET_VERT,
      fragmentShader: PLANET_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uLight: { value: lightView.clone() },
        uCities: { value: cityPositions },
        uOcean: { value: new Color("#0d0a33") },
        uLand: { value: new Color("#2b2279") },
        uLandHi: { value: new Color("#7561e0") },
        uAtmo: { value: new Color("#8b6cff") },
        uLamp: { value: new Color("#ffb86b") },
      },
    });
    const planet = new Mesh(new SphereGeometry(R, segments, segments), planetMat);
    spin.add(planet);

    // ---- Atmosphere glow: a camera-facing disc behind the planet -------------
    const glowMat = new ShaderMaterial({
      vertexShader: GLOW_VERT,
      fragmentShader: GLOW_FRAG,
      uniforms: {
        uColor: { value: new Color("#7d5cff") },
        uLight2D: { value: new Vector3(lightView.x, lightView.y, 0).normalize() },
        uHalf: { value: 1.95 },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const glow = new Mesh(new PlaneGeometry(3.9, 3.9), glowMat);
    glow.position.z = -0.5;
    glow.renderOrder = -1;
    scene.add(glow);

    // ---- Markers ---------------------------------------------------------------
    const markerCount = PLANET_MARKERS.length;
    const markerPos = new Float32Array(markerCount * 3);
    const markerSize = new Float32Array(markerCount);
    const markerColor = new Float32Array(markerCount * 3);
    const lamp = new Color("#ffd9a8");
    const lilac = new Color("#cdbfff");
    PLANET_MARKERS.forEach((m, i) => {
      const v = latLon(m.lat, m.lon, 1.004);
      markerPos.set([v.x, v.y, v.z], i * 3);
      markerSize[i] = (m.size ?? 1) * 11;
      const c = m.home ? lilac : lamp;
      markerColor.set([c.r, c.g, c.b], i * 3);
    });
    const markerGeo = new BufferGeometry();
    markerGeo.setAttribute("position", new BufferAttribute(markerPos, 3));
    markerGeo.setAttribute("aSize", new BufferAttribute(markerSize, 1));
    markerGeo.setAttribute("aColor", new BufferAttribute(markerColor, 3));
    const dotUniforms = { uPx: { value: 1 } };
    const markerMat = new ShaderMaterial({
      vertexShader: DOT_VERT,
      fragmentShader: DOT_FRAG,
      uniforms: dotUniforms,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    spin.add(new Points(markerGeo, markerMat));

    // Pulsing rings on the home marker
    const home = PLANET_MARKERS.find((m) => m.home);
    const homeNormal = home ? latLon(home.lat, home.lon, 1).normalize() : null;
    const rings: { mesh: Mesh; mat: MeshBasicMaterial; phase: number }[] = [];
    if (home && homeNormal) {
      for (let i = 0; i < 2; i++) {
        const mat = new MeshBasicMaterial({
          color: 0xd9ceff,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: AdditiveBlending,
          side: DoubleSide,
        });
        const mesh = new Mesh(new RingGeometry(0.028, 0.033, 48), mat);
        mesh.position.copy(homeNormal).multiplyScalar(1.006);
        // RingGeometry lies in the XY plane facing +z: turn +z onto the surface normal
        mesh.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), homeNormal);
        spin.add(mesh);
        rings.push({ mesh, mat, phase: i / 2 });
      }
    }

    // ---- Arcs: great circles lifted off the surface, with a light running along each
    const byId = new Map(PLANET_MARKERS.map((m) => [m.id, m]));
    const SAMPLES = 80;
    const arcs = PLANET_ARCS.flatMap((arc) => {
      const a = byId.get(arc.from);
      const b = byId.get(arc.to);
      if (!a || !b) return [];
      const va = latLon(a.lat, a.lon, 1).normalize();
      const vb = latLon(b.lat, b.lon, 1).normalize();
      const angle = va.angleTo(vb);
      const lift = 0.1 + 0.3 * (angle / Math.PI);
      const pts = new Float32Array((SAMPLES + 1) * 3);
      const ts = new Float32Array(SAMPLES + 1);
      const sinA = Math.sin(angle) || 1;
      for (let i = 0; i <= SAMPLES; i++) {
        const t = i / SAMPLES;
        const p = va
          .clone()
          .multiplyScalar(Math.sin((1 - t) * angle) / sinA)
          .add(vb.clone().multiplyScalar(Math.sin(t * angle) / sinA))
          .normalize()
          .multiplyScalar(1.004 + lift * Math.sin(Math.PI * t) ** 0.85);
        pts.set([p.x, p.y, p.z], i * 3);
        ts[i] = t;
      }
      const geo = new BufferGeometry();
      geo.setAttribute("position", new BufferAttribute(pts, 3));
      geo.setAttribute("aT", new BufferAttribute(ts, 1));
      const color = ARC_COLORS[arc.color ?? "lilac"];
      const mat = new ShaderMaterial({
        vertexShader: ARC_VERT,
        fragmentShader: ARC_FRAG,
        uniforms: { uColor: { value: color }, uHead: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      });
      spin.add(new Line(geo, mat));
      return [{ arc, pts, mat, color }];
    });

    // Glowing heads that ride the arcs
    const headPos = new Float32Array(arcs.length * 3);
    const headSize = new Float32Array(arcs.length).fill(15);
    const headColor = new Float32Array(arcs.length * 3);
    arcs.forEach((a, i) => headColor.set([a.color.r, a.color.g, a.color.b], i * 3));
    const headGeo = new BufferGeometry();
    headGeo.setAttribute("position", new BufferAttribute(headPos, 3));
    headGeo.setAttribute("aSize", new BufferAttribute(headSize, 1));
    headGeo.setAttribute("aColor", new BufferAttribute(headColor, 3));
    spin.add(new Points(headGeo, markerMat));

    // ---- Moons -----------------------------------------------------------------
    const moons = PLANET_MOONS.map((m) => {
      const orbit = new Group();
      orbit.rotation.set(m.tilt, 0, 0.18);
      const mesh = new Mesh(
        new SphereGeometry(m.radius, 40, 40),
        new ShaderMaterial({
          vertexShader: MOON_VERT,
          fragmentShader: MOON_FRAG,
          uniforms: { uLight: { value: lightView.clone() }, uColor: { value: new Color(m.color) } },
        })
      );
      orbit.add(mesh);
      // Faint orbit line
      const ringPts: number[] = [];
      for (let i = 0; i <= 128; i++) {
        const t = (i / 128) * Math.PI * 2;
        ringPts.push(Math.cos(t) * m.distance, 0, Math.sin(t) * m.distance);
      }
      const ringGeo = new BufferGeometry();
      ringGeo.setAttribute("position", new BufferAttribute(new Float32Array(ringPts), 3));
      const ringT = new Float32Array(129);
      for (let i = 0; i <= 128; i++) ringT[i] = i / 128;
      ringGeo.setAttribute("aT", new BufferAttribute(ringT, 1));
      const ringMat = new ShaderMaterial({
        vertexShader: ARC_VERT,
        fragmentShader: /* glsl */ `varying float vT; void main(){ gl_FragColor = vec4(0.72, 0.65, 1.0, 0.1); }`,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      });
      const orbitLine = new Line(ringGeo, ringMat);
      orbit.add(orbitLine);
      scene.add(orbit);
      return { m, mesh, orbit, angle: m.phase ?? 0 };
    });

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
      dotUniforms.uPx.value = dpr;
      needsRender = true;
      schedule();
    }

    // ---- Interaction ------------------------------------------------------------
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let spinVel = 0.07; // rad/s, eased back to the resting speed after a drag
    const REST_SPIN = 0.07;
    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };

    /** Is the pointer on the sphere (not just inside the square canvas)? */
    function onSphere(e: PointerEvent) {
      const r = canvas.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      return Math.hypot(dx, dy) < (r.width / 2) * SPHERE_FRACTION * 1.03;
    }
    function onPointerMove(e: PointerEvent) {
      if (!dragging) {
        // The cursor reads this attribute: "Spin" only while over the sphere
        canvas.dataset.cursor = onSphere(e) ? "Spin" : "";
        return;
      }
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      spin.rotation.y += dx * 0.0072;
      tilt.rotation.x = Math.max(-0.55, Math.min(1.0, tilt.rotation.x + dy * 0.0035));
      spinVel = dx * 0.0072 * 60;
      needsRender = true;
      schedule();
    }
    function onPointerDown(e: PointerEvent) {
      if (!onSphere(e)) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
      schedule();
    }
    function onPointerUp() {
      dragging = false;
      canvas.style.cursor = "";
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
    let time = 0;
    let readyCalled = false;
    const tmp = new Vector3();
    const worldPos = new Vector3();
    const worldNormal = new Vector3();

    function placeHeads() {
      arcs.forEach((a, i) => {
        const head = (((time * (a.arc.speed ?? 0.1) + (a.arc.offset ?? 0)) % 1) + 1) % 1;
        a.mat.uniforms.uHead.value = head;
        const f = head * SAMPLES;
        const i0 = Math.min(SAMPLES - 1, Math.floor(f));
        const k = f - i0;
        for (let c = 0; c < 3; c++) {
          headPos[i * 3 + c] = a.pts[i0 * 3 + c] * (1 - k) + a.pts[(i0 + 1) * 3 + c] * k;
        }
      });
      headGeo.attributes.position.needsUpdate = true;
    }

    function placeLabel() {
      if (!homeNormal) return;
      worldNormal.copy(homeNormal).applyMatrix4(spin.matrixWorld).sub(tmp.setFromMatrixPosition(spin.matrixWorld)).normalize();
      worldPos.copy(homeNormal).multiplyScalar(1.0).applyMatrix4(spin.matrixWorld);
      const facing = worldNormal.z; // camera looks down −z, so >0 faces us
      worldPos.project(camera);
      const x = (worldPos.x * 0.5 + 0.5) * size;
      const y = (-worldPos.y * 0.5 + 0.5) * size;
      label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      label.style.opacity = String(Math.max(0, Math.min(1, (facing - 0.2) * 3)));
    }

    function draw(dt: number, animate: boolean) {
      if (animate) {
        time += dt;
        planetMat.uniforms.uTime.value = time;
        if (!dragging) {
          spin.rotation.y += spinVel * dt;
          spinVel += (REST_SPIN - spinVel) * Math.min(1, dt * 1.4);
        }
        eased.x += (pointer.x - eased.x) * Math.min(1, dt * 2);
        eased.y += (pointer.y - eased.y) * Math.min(1, dt * 2);
        tilt.rotation.y = eased.x * 0.16;
        moons.forEach((mo) => {
          mo.angle += mo.m.speed * dt;
          mo.mesh.position.set(Math.cos(mo.angle) * mo.m.distance, 0, Math.sin(mo.angle) * mo.m.distance);
          mo.mesh.rotation.y += dt * 0.2;
        });
        rings.forEach((r) => {
          const t = (time * 0.45 + r.phase) % 1;
          r.mesh.scale.setScalar(1 + t * 4.5);
          r.mat.opacity = (1 - t) * (1 - t) * 0.9;
        });
      }
      placeHeads();
      tilt.updateMatrixWorld(true);
      placeLabel();
      renderer.render(scene, camera);
      if (!readyCalled) {
        readyCalled = true;
        callbacks.current.onReady();
      }
    }

    // Adaptive quality: sustained slow frames first cost resolution, then, as a
    // last resort, the animation itself (the planet stays, drawn on demand).
    let frozen = false;
    let slow = 0;
    let warmup = 24; // shader compile + first uploads are slow: do not count them
    function adapt(rawDt: number) {
      if (warmup > 0) {
        warmup -= 1;
        return;
      }
      if (rawDt > 0.5) return; // tab was in the background
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
        // Frozen scene (paused / reduced motion): only re-draw when asked. A drag
        // still moves the planet (it rotates it directly) — that is the visitor's own motion.
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
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="pointer-events-auto absolute inset-0 h-full w-full touch-pan-y" />
      {/* Follows the home marker; hidden when it turns to the far side */}
      <div ref={labelRef} className="pointer-events-none absolute left-0 top-0 opacity-0" aria-hidden="true">
        <span className="font-hand ml-3 -mt-9 inline-flex whitespace-nowrap rounded-full border border-line-strong bg-night/70 px-3 py-1 text-[15px] text-ink backdrop-blur-md">
          {homeLabel}
        </span>
      </div>
    </div>
  );
}
