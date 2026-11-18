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

/**
 * Kept small on purpose: two rings, the eight skills I rate highest that have a
 * brand mark (see `score` in lib/skills.ts). Bigger icons, calmer scene.
 */
export const PLANET_RINGS: PlanetRing[] = [
  { radius: 1.6, tilt: [0.45, 0.22], speed: 0.17, size: 0.62, skills: ["python", "git", "typescript", "linux"] },
  { radius: 2.05, tilt: [0.4, -0.3], speed: -0.11, size: 0.54, skills: ["fastapi", "web-security", "javascript", "html-css"] },
];
