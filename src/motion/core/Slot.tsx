import { cloneElement, isValidElement } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";

export interface SlotProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

interface SlottableProps {
  style?: CSSProperties;
  className?: string;
}

/**
 * Minimal Radix-Slot-style style/className merge, hand-rolled: src/motion/**
 * may not import @radix-ui/* (AGENTS.md §9c rule 3 / eslint tier boundary),
 * so every primitive offering an `asChild` escape hatch (Reveal, Highlight,
 * Pulse, Shake, ...) shares this instead of re-deriving cloneElement merge
 * logic per primitive. Requires exactly one valid element child.
 */
export function Slot({ children, style, className }: SlotProps) {
  if (!isValidElement(children)) {
    throw new Error("asChild requires a single valid React element child.");
  }
  const child = children as ReactElement<SlottableProps>;
  const mergedClassName = [child.props.className, className].filter(Boolean).join(" ");
  return cloneElement(child, {
    style: { ...child.props.style, ...style },
    className: mergedClassName || undefined,
  });
}
