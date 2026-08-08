import { Reveal } from "../reveal/Reveal";
import type { Timing } from "../core";

export type CaptionPosition = "bottom-left" | "bottom-center" | "bottom-right";

export type CaptionProps = Timing & {
  text: string;
  subtitle?: string;
  /** Default "bottom-left". */
  position?: CaptionPosition;
  className?: string;
};

const POSITION_CLASS: Record<CaptionPosition, string> = {
  "bottom-left": "left-panel items-start text-left",
  "bottom-center": "left-1/2 -translate-x-1/2 items-center text-center",
  "bottom-right": "right-panel items-end text-right",
};

/**
 * Timed lower-third text, tied to a step's `Timing` range (TODO.md C4).
 * Composes `Reveal` internally — `Caption` is a sibling motion primitive
 * importing another sibling, not `src/ui/`, which stays allowed under
 * AGENTS.md §9c rule 3. Requires a `position: relative` ancestor (it
 * renders `position: absolute`, anchored to the bottom edge).
 */
export function Caption({ text, subtitle, position = "bottom-left", className, ...timing }: CaptionProps) {
  return (
    <div className={["absolute bottom-panel flex flex-col gap-tight", POSITION_CLASS[position], className].filter(Boolean).join(" ")}>
      <Reveal from="up" {...timing}>
        <div className="rounded-ui bg-surface-opaque px-panel py-compact-y shadow-elevated">
          <p className="text-base font-medium text-fg">{text}</p>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </Reveal>
    </div>
  );
}
