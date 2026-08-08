import type { CSSProperties, ReactNode } from "react";
import { useProgress } from "../core/useProgress";
import { distanceExpr, blurExpr } from "../core/tokens";
import { Slot } from "../core/Slot";
import type { Timing, DistanceToken } from "../core";

export type RevealFrom = "fade" | "up" | "down" | "left" | "right" | "scale" | "blur";

export type RevealProps = Timing & {
  children: ReactNode;
  /** What the entrance animates from. Default "up". */
  from?: RevealFrom;
  /** Travel distance for the directional variants, as a grid-unit multiple. Default "md". */
  distance?: DistanceToken;
  /**
   * Render the animated style onto the single child element instead of
   * wrapping it in a `<div>` — so Reveal never injects a layout box that
   * could break a flex/grid parent. Requires exactly one element child.
   */
  asChild?: boolean;
  /** Host element when not using `asChild`. Default "div". */
  as?: "div" | "span";
  className?: string;
};

const AXIS_OFFSET: Record<RevealFrom, { axis: "X" | "Y"; sign: 1 | -1 } | null> = {
  fade: null,
  up: { axis: "Y", sign: 1 },
  down: { axis: "Y", sign: -1 },
  left: { axis: "X", sign: 1 },
  right: { axis: "X", sign: -1 },
  scale: null,
  blur: null,
};

const SCALE_START = 0.92;

function revealStyle(progress: number, from: RevealFrom, distance: DistanceToken): CSSProperties {
  const style: CSSProperties = { opacity: progress };
  const transforms: string[] = [];

  const offset = AXIS_OFFSET[from];
  if (offset) {
    const magnitude = `calc(${distanceExpr(distance)} * ${1 - progress})`;
    transforms.push(`translate${offset.axis}(${offset.sign === 1 ? magnitude : `calc(-1 * ${magnitude})`})`);
  }
  if (from === "scale") {
    const scale = SCALE_START + (1 - SCALE_START) * progress;
    transforms.push(`scale(${scale})`);
  }
  if (from === "blur") {
    style.filter = `blur(calc(${blurExpr("md")} * ${1 - progress}))`;
  }
  if (transforms.length > 0) style.transform = transforms.join(" ");
  return style;
}

/**
 * Generic entrance animation — a pure function of `useProgress()`, driver
 * agnostic (TODO.md B2). Wraps `React.ReactNode` without knowing what it
 * receives (AGENTS.md §9c rule 3): no scale/blur assumptions baked into
 * children, no color choices, nothing but opacity/transform/filter, all of
 * which are GPU-composited (AGENTS.md §7 canvas performance contract).
 */
export function Reveal({
  children,
  from = "up",
  distance = "md",
  asChild,
  as: As = "div",
  className,
  ...timing
}: RevealProps) {
  const progress = useProgress(timing);
  const style = revealStyle(progress, from, distance);

  if (asChild) {
    return (
      <Slot style={style} className={className}>
        {children}
      </Slot>
    );
  }

  return (
    <As style={style} className={className}>
      {children}
    </As>
  );
}
