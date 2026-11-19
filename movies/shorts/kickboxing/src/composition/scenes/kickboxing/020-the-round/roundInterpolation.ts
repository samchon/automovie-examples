const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (v: number) => { const n = clamp(v); return n * n * (3 - 2 * n); };
const rise = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const mix = (a: number, b: number, u: number) => a + (b - a) * u;
function wave(t: number, start: number, top: number, release: number, end: number) {
  return rise(t,start,top) * (1 - rise(t,release,end));
}

/** Closed interval interpolation used by the round's pose and camera tracks. */
export const roundInterpolation = { clamp, smooth, rise, mix, wave } as const;
