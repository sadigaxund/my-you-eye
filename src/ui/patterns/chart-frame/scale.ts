// Pure "nice round numbers" tick generation — shared by every chart with a
// numeric axis, so no chart hand-rolls its own rounding. Classic
// Heckbert-style algorithm: pick a step from {1, 2, 5} x 10^n closest to the
// ideal step, then walk from 0 (or the rounded-down min) to a rounded-up max.

function niceStep(roughStep: number): number {
  const exponent = Math.floor(Math.log10(roughStep));
  const fraction = roughStep / 10 ** exponent;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * 10 ** exponent;
}

/** Clean, evenly-spaced tick values spanning at least [0, max] (or
 * [min, max] when `includeZero` is false), thousands-comma-friendly. Always
 * includes both ends of the returned domain. */
export function niceTicks(max: number, count = 5, min = 0): number[] {
  if (!Number.isFinite(max) || max <= min) return [min, min + 1];
  const step = niceStep((max - min) / Math.max(1, count - 1));
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks;
}
