// Pure math + DOM measurement helpers for Camera — kept separate from the
// component so the interpolation logic is unit-testable without rendering
// React (mirrors the useSequence.ts / buildSequence split in core).

export interface CameraRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CameraKeyframe {
  /** Frame this keyframe is reached at. */
  at: number;
  /** An explicit rect in the scene's own untransformed layout coordinates, or the `id` of a descendant element to measure. */
  focus: CameraRect | string;
  /** Explicit zoom. If omitted, computed from the focus rect via `fit` (see Camera's `fit` prop). */
  zoom?: number;
}

export interface ResolvedKeyframe {
  at: number;
  rect: CameraRect;
  zoom: number;
}

/**
 * Position of `el` relative to `root`, in untransformed layout space.
 *
 * Deliberately uses `offsetLeft`/`offsetTop`/`offsetWidth`/`offsetHeight`
 * (walking the `offsetParent` chain) instead of `getBoundingClientRect()`.
 * `getBoundingClientRect()` returns post-transform viewport pixels — once
 * Camera's own scene layer (or any ancestor, e.g. a `Canvas` pan/zoom
 * layer) has a `transform: scale(...)` applied, those pixels are already
 * scaled by whatever zoom is currently in effect, producing wrong,
 * compounding measurements. `offsetLeft`/`offsetTop`/`offsetWidth`/
 * `offsetHeight` are defined in the element's own untransformed box model
 * and are invariant to any ancestor's CSS transform, which is exactly the
 * coordinate space Camera needs to compute a *stable* pan/zoom target from.
 * (A previous batch shipped the `getBoundingClientRect()` version of this
 * bug — see TODO.md C3.)
 */
export function measureRelative(el: HTMLElement, root: HTMLElement): CameraRect {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  let guard = 0;
  while (node && node !== root && guard < 100) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
    guard++;
  }
  return { x, y, width: el.offsetWidth, height: el.offsetHeight };
}

/** Value-equality for two `CameraRect`s. Used to skip a `setState` call when
 * a fresh DOM measurement produces the exact same values as last time — the
 * measurement itself (`measureRelative`) always returns a brand-new object,
 * so without this an effect that re-measures on every render (because one
 * of its OWN dependencies, e.g. a scene's per-render-fresh `ranges` object,
 * has unstable identity even though its values didn't change) would call
 * `setState` with a new-but-equal object every time, forcing another
 * re-render, forcing another measure — an infinite loop that a live rAF
 * loop happens to mask (each tick naturally yields between renders) but a
 * synchronous frame-capture render (Remotion) does not, tripping React's
 * "Maximum update depth exceeded" (error #185). See `Camera.tsx` and
 * `src/scenes/code-scene/CodeScene.useCamera.ts`, both of which guard their
 * `setState` calls with this. */
export function rectsEqual(a: CameraRect, b: CameraRect): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

/** Value-equality for two `Record<string, CameraRect>` — same key set, same
 * rect per key. See `rectsEqual`'s docblock for why this exists. */
export function rectRecordsEqual(a: Record<string, CameraRect>, b: Record<string, CameraRect>): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) => b[k] != null && rectsEqual(a[k], b[k]));
}

function focusEqual(a: CameraRect | string, b: CameraRect | string): boolean {
  if (typeof a === "string" || typeof b === "string") return a === b;
  return rectsEqual(a, b);
}

/** Value-equality for two `CameraKeyframe[]` arrays. See `rectsEqual`'s docblock for why this exists. */
export function keyframesEqual(a: CameraKeyframe[], b: CameraKeyframe[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((kf, i) => kf.at === b[i].at && kf.zoom === b[i].zoom && focusEqual(kf.focus, b[i].focus));
}

function rectCenter(r: CameraRect): { cx: number; cy: number } {
  return { cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
}

/** Zoom that fits `rect` inside a `containerWidth` x `containerHeight` viewport, with a margin so focused content isn't flush against the edges. */
export function fitZoom(rect: CameraRect, containerWidth: number, containerHeight: number, margin = 0.85): number {
  if (rect.width <= 0 || rect.height <= 0 || containerWidth <= 0 || containerHeight <= 0) return 1;
  return Math.min(containerWidth / rect.width, containerHeight / rect.height) * margin;
}

/**
 * Eased interpolation across resolved keyframes at `frame`. Frames before
 * the first keyframe hold its value; frames after the last hold its value.
 * Pure function — no DOM, no React — so it's directly unit-testable.
 *
 * `ease` shapes each keyframe-to-keyframe leg (default: identity, i.e. the
 * previous raw-linear behavior) — Camera.tsx passes `core/legEase.ts`'s
 * `legEase(...)`, the same curve-selection `Cursor` uses between its own
 * events, so a pan/zoom move reads as motion rather than a robotic constant-
 * speed slide (owner feedback: "standardize the definitions of those
 * movements so they don't scatter all around codebase").
 */
export function interpolateCamera(
  keyframes: ResolvedKeyframe[],
  frame: number,
  ease: (t: number) => number = (t) => t,
): { rect: CameraRect; zoom: number } {
  if (keyframes.length === 0) return { rect: { x: 0, y: 0, width: 0, height: 0 }, zoom: 1 };
  const first = keyframes[0];
  if (frame <= first.at) return { rect: first.rect, zoom: first.zoom };
  const last = keyframes[keyframes.length - 1];
  if (frame >= last.at) return { rect: last.rect, zoom: last.zoom };

  let i = 0;
  while (i < keyframes.length - 1 && keyframes[i + 1].at < frame) i++;
  const a = keyframes[i];
  const b = keyframes[i + 1];
  const span = b.at - a.at;
  const t = span <= 0 ? 1 : ease((frame - a.at) / span);

  return {
    rect: {
      x: a.rect.x + (b.rect.x - a.rect.x) * t,
      y: a.rect.y + (b.rect.y - a.rect.y) * t,
      width: a.rect.width + (b.rect.width - a.rect.width) * t,
      height: a.rect.height + (b.rect.height - a.rect.height) * t,
    },
    zoom: a.zoom + (b.zoom - a.zoom) * t,
  };
}

/** Pan translate that centers `rect` at `zoom` inside the container — the scene layer's `transform-origin` must be `0 0` for this to be correct. */
export function cameraTransform(
  rect: CameraRect,
  zoom: number,
  containerWidth: number,
  containerHeight: number,
): { panX: number; panY: number } {
  const { cx, cy } = rectCenter(rect);
  return {
    panX: containerWidth / 2 - cx * zoom,
    panY: containerHeight / 2 - cy * zoom,
  };
}
