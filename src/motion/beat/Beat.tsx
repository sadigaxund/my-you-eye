import type { ReactNode } from "react";
import type { Beat as BeatUnit } from "../core";

export interface BeatProps {
  children: ReactNode;
  /** Purely descriptive — documents how long this hold lasts in a step sequence. Beat renders children unchanged; it doesn't compute or apply any animation itself. */
  hold?: BeatUnit;
  className?: string;
}

/**
 * A no-op hold (TODO.md C5). Its entire purpose is being an explicit,
 * self-documenting "nothing animates here on purpose" building block for a
 * step sequence — e.g. between two `Reveal`s in a `useSequence` step list —
 * so a deliberate pause reads as intentional in the scene data rather than
 * looking like a missing animation.
 */
export function Beat({ children, className }: BeatProps) {
  if (!className) return <>{children}</>;
  return <span className={className}>{children}</span>;
}
