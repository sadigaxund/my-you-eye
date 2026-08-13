import type { ReactNode } from "react";
import { useProgress } from "../core/useProgress";
import { blurExpr } from "../core/tokens";
import type { Timing, BlurToken } from "../core";

export interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SpotlightProps = Timing & {
  children: ReactNode;
  /** Focused rect, in the wrapping container's own layout coordinates — Spotlight doesn't measure the DOM itself (same "caller supplies the rect" convention as Camera/Morph). */
  focus: SpotlightRect;
  /** Softness of the cut-out edge. Default "lg". */
  feather?: BlurToken;
  /** Maximum dim strength, 0-1. Default 0.6. */
  dim?: number;
  className?: string;
};

/**
 * Dims everything except a focused rect — a pure function of
 * `useProgress()` (TODO.md C2). Deliberately does NOT use
 * `backdrop-filter`: AGENTS.md §0.12 forbids it inside a `Canvas`
 * transforming subtree, and this primitive is exactly the kind of thing
 * that gets used there. Instead of a filtered/blurred overlay with a
 * `mask-image` cut-out, this uses the classic box-shadow spotlight trick —
 * an invisible box shaped like the focus rect with a huge (`9999px`)
 * `box-shadow` spread in a token color, feathered via the shadow's own
 * blur radius. `opacity` on the whole element controls the dim strength,
 * so no `filter`/`backdrop-filter` is ever touched.
 *
 * The scrim color is `--shadow-scrim`, a fixed near-black token — never
 * `--color-fg`. `--color-fg` is themed and flips to a LIGHT lightness in
 * every dark variant (owner feedback investigation: the original used fg,
 * which would have LIGHTENED the dimmed region in dark themes instead of
 * darkening it, the exact opposite of what a spotlight is for). `feather`
 * and `dim` also moved from "md"/0.7 to "lg"/0.6 by default — the tighter
 * feather and higher strength read as a harsh, hard-edged cutout rather
 * than a soft dim (owner feedback: "looks bad… the token values may simply
 * be too harsh").
 */
export function Spotlight({ children, focus, feather = "lg", dim = 0.6, className, ...timing }: SpotlightProps) {
  const progress = useProgress(timing);
  const opacity = dim * progress;

  return (
    <div className={className} style={{ position: "relative", overflow: "hidden" }}>
      {children}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: focus.x,
          top: focus.y,
          width: focus.width,
          height: focus.height,
          boxShadow: `0 0 ${blurExpr(feather)} 9999px var(--shadow-scrim)`,
          opacity,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
