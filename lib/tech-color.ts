/**
 * Brand colours on a night sky: near-black marks become ink, mid-dark ones are
 * lifted toward white so they stay recognisable but readable.
 */
export function readableHex(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (luminance < 0.3) return "#e9e5ff";
  if (luminance >= 0.5) return hex;
  const lift = (c: number) => Math.round(c + (255 - c) * 0.38);
  return `rgb(${lift(r)}, ${lift(g)}, ${lift(b)})`;
}
