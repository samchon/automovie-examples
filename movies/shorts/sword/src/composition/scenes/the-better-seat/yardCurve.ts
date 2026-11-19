import * as THREE from "three";

export type XYZ = readonly [number, number, number];
type Key = readonly [number, number];
const ease = (t: number) => {
  const u = Math.max(0, Math.min(1, t));
  return u * u * (3 - 2 * u);
};
function val(t: number, keys: readonly Key[]) {
  if (t <= keys[0]![0]) return keys[0]![1];
  for (let i = 1; i < keys.length; i++) {
    const [b, y] = keys[i]!,
      [a, x] = keys[i - 1]!;
    if (t < b) return x + (y - x) * ease((t - a) / (b - a));
  }
  return keys[keys.length - 1]![1];
}
const ramp = (t: number, a: number, b: number) => ease((t - a) / (b - a));
function vector(t: number, keys: readonly (readonly [number, XYZ])[]) {
  const at = (i: number) =>
    val(
      t,
      keys.map(([s, p]) => [s, p[i]!] as const),
    );
  return new THREE.Vector3(at(0), at(1), at(2));
}

/** Sample phase, scalar and three-dimensional stage curves on the film clock. */
export const yardCurve = { ramp, val, vector };
