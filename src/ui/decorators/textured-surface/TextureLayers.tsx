import type { CSSProperties } from "react";

// The two texture layer shapes, extracted from TexturedSurface so the
// component body stays readable — the markup was previously inlined twice
// inside one already-long render.
//
// Deliberately NOT rasterised to a bitmap. A previous attempt cached each
// texture as a canvas-encoded PNG on the theory that the browser re-runs
// the `feTurbulence` filter per compositor tile. Measured in this repo,
// that premise is false: with `background-size` varied every frame (which
// forces a genuine re-raster), the SVG source ran ~17.5ms/frame against
// ~22.3ms for an equivalent cached PNG. If the filter were being
// re-evaluated per paint, 5-octave fractal noise could not possibly beat a
// plain bitmap resample — so the browser is already rasterising the filter
// once and caching the result, and adding our own bitmap cache only
// inserted a second, larger, worse-resampling copy. See AGENTS.md §7:
// the documented cost of these backgrounds is compositing the complex
// background layer every frame, not per-tile filter evaluation.

export interface TileLayerProps {
  uri: string;
  tileSize: number;
  opacity: number;
  blend: CSSProperties["mixBlendMode"];
}

/** A repeating tile layer (paper-grain / brushed-aluminium / the frosted dither).
 *
 * Never add `background-attachment: fixed` here. It pins the tile to the
 * viewport, which forces the texture to repaint as part of the document's own
 * paint — the exact pattern AGENTS.md §0.12 rule 12 bans, and the failure mode
 * `backdrop-filter` and `Canvas` panning both pay for. */
export function TextureTileLayer({ uri, tileSize, opacity, blend }: TileLayerProps) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none -z-10"
      style={{
        backgroundImage: `url("${uri}")`,
        backgroundSize: `${tileSize}px`,
        backgroundRepeat: "repeat",
        opacity,
        mixBlendMode: blend,
      }}
    />
  );
}

export interface CoverLayerProps {
  uri: string;
  opacity: number;
  blend: CSSProperties["mixBlendMode"];
}

/** A container-filling, non-tiled layer (frosted-glass). */
export function TextureCoverLayer({ uri, opacity, blend }: CoverLayerProps) {
  return (
    <div
      aria-hidden
      className="absolute pointer-events-none"
      style={{
        top: "50%",
        left: "50%",
        width: "calc(100cqw + 100cqh)",
        height: "calc(100cqw + 100cqh)",
        transform: "translate(-50%, -50%)",
        transformOrigin: "center",
        backgroundImage: `url("${uri}")`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        opacity,
        mixBlendMode: blend,
      }}
    />
  );
}
