/**
 * What orbits the 3D planet: the skills, as icons on tilted rings.
 *
 * Each entry is a skill slug from lib/skills.ts — only skills that have a brand
 * mark can be drawn. To put another skill around the planet, add its slug to a
 * ring (or add a ring); the scene reads this list and builds the rest.
 * Hovering an icon names the skill, clicking opens it on /expertise.
 */

export interface PlanetRing {
  /** Orbit radius in planet radii */
  radius: number;
  /** Tilt of the ring plane: [around x, around z], radians */
  tilt: [number, number];
  /** Radians per second; negative turns the other way */
  speed: number;
  /** Icon size in planet radii */
  size: number;
  skills: string[];
}

export const PLANET_RINGS: PlanetRing[] = [
  { radius: 1.55, tilt: [0.5, 0.25], speed: 0.16, size: 0.5, skills: ["python", "typescript", "fastapi", "nextjs", "docker"] },
  { radius: 1.95, tilt: [0.62, -0.45], speed: -0.11, size: 0.46, skills: ["git", "linux", "web-security", "postgresql", "javascript", "bash"] },
  { radius: 2.33, tilt: [0.38, 0.55], speed: 0.07, size: 0.42, skills: ["pentesting", "flask", "html-css", "webgl-webaudio"] },
];
