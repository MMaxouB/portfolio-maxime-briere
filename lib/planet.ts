/**
 * Everything that lives on the 3D planet, as data. To add to the world, add a
 * row here — the scene (components/scenery/PlanetScene.tsx) reads these lists
 * and builds the markers, arcs and moons itself.
 *
 * Positions are latitude / longitude in degrees. The planet is invented: the
 * cities only decide where the lights cluster and where the arcs run.
 */

export interface PlanetMarker {
  id: string;
  lat: number;
  lon: number;
  /** Relative size, 1 = normal */
  size?: number;
  /** The home marker pulses and carries the HTML label */
  home?: boolean;
}

export interface PlanetArc {
  from: string;
  to: string;
  /** Laps per second of the travelling light */
  speed?: number;
  /** Phase offset 0–1 so the lights do not all start together */
  offset?: number;
  color?: "lilac" | "cyan" | "pink";
}

export interface PlanetMoon {
  id: string;
  /** Orbit radius in planet radii */
  distance: number;
  /** Moon radius in planet radii */
  radius: number;
  /** Radians per second */
  speed: number;
  /** Orbit plane tilt, radians */
  tilt: number;
  phase?: number;
  color: string;
}

/** At most 8 markers (the shader carries 8 city uniforms). */
export const PLANET_MARKERS: PlanetMarker[] = [
  { id: "france", lat: 47.2, lon: 2.4, size: 1.6, home: true },
  { id: "new-york", lat: 40.7, lon: -74, size: 1.1 },
  { id: "sao-paulo", lat: -23.5, lon: -46.6, size: 1 },
  { id: "lagos", lat: 6.5, lon: 3.4, size: 0.9 },
  { id: "hyderabad", lat: 17.4, lon: 78.5, size: 1.1 },
  { id: "tokyo", lat: 35.7, lon: 139.7, size: 1.1 },
  { id: "sydney", lat: -33.9, lon: 151.2, size: 0.9 },
  { id: "reykjavik", lat: 64.1, lon: -21.9, size: 0.8 },
];

export const PLANET_ARCS: PlanetArc[] = [
  { from: "france", to: "new-york", speed: 0.11, offset: 0.0, color: "lilac" },
  { from: "france", to: "hyderabad", speed: 0.09, offset: 0.35, color: "pink" },
  { from: "france", to: "lagos", speed: 0.14, offset: 0.7, color: "cyan" },
  { from: "france", to: "tokyo", speed: 0.08, offset: 0.15, color: "lilac" },
  { from: "new-york", to: "sao-paulo", speed: 0.12, offset: 0.5, color: "cyan" },
  { from: "hyderabad", to: "sydney", speed: 0.1, offset: 0.85, color: "pink" },
  { from: "reykjavik", to: "france", speed: 0.13, offset: 0.25, color: "lilac" },
];

export const PLANET_MOONS: PlanetMoon[] = [
  { id: "moon", distance: 1.36, radius: 0.105, speed: 0.22, tilt: 0.5, phase: 1.2, color: "#b9b0e8" },
];
