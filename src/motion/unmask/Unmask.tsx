import type { ReactNode } from "react";
import { useProgress } from "../core/useProgress";
import type { Timing } from "../core";

export type UnmaskDirection = "left" | "right" | "up" | "down";

export type UnmaskProps = Timing & {
  children: ReactNode;
  /** Sweep direction. Default "left". */
  direction?: UnmaskDirection;
  /** Softness of the leading edge, as a 0-1 fraction of the sweep. Default 0.25. */
  softness?: number;
  className?: string;
};

const GRADIENT_ANGLE: Record<UnmaskDirection, string> = {
  left: "to right",
  right: "to left",
  up: "to top",
  down: "to bottom",
};

function maskImage(progress: number, direction: UnmaskDirection, softness: number): string {
  const hardStop = progress * 100;
  const softStop = Math.min(100, hardStop + softness * 100);
  // `white` -> `transparent` (never `black` -> `transparent`) so the mask
  // reads correctly whether the browser treats a CSS-gradient mask-image as
  // an alpha mask or a luminance mask: white is fully-visible under both
  // interpretations (alpha=1, luminance=1), and `transparent` is
  // fully-hidden under both (alpha=0 regardless of luminance).
  return `linear-gradient(${GRADIENT_ANGLE[direction]}, white 0%, white ${hardStop}%, transparent ${softStop}%)`;
}

/**
 * Soft-edged mask sweep, a pure function of `useProgress()` (TODO.md C1) —
 * for headings and pull-quotes where `Wipe`'s hard clip-path edge reads as
 * too mechanical.
 */
export function Unmask({ children, direction = "left", softness = 0.25, className, ...timing }: UnmaskProps) {
  const progress = useProgress(timing);
  const mask = maskImage(progress, direction, softness);

  return (
    <div className={className} style={{ WebkitMaskImage: mask, maskImage: mask }}>
      {children}
    </div>
  );
}
