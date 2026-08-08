import { useMemo } from "react";
import type { CSSProperties } from "react";
import { useProgress } from "../core/useProgress";
import { useTimeline } from "../core/TimelineContext";
import { resolveBeatFrames } from "../core/beats";
import type { Timing, Beat } from "../core";

export type TypeTextMode = "char" | "word" | "line";

export type TypeTextProps = Timing & {
  text: string;
  /** Reveal unit. Default "char". */
  mode?: TypeTextMode;
  /** Show a caret while (and briefly after) typing. Default true. */
  cursor?: boolean;
  /** Caret blink half-period, once typing has finished (the caret is solid while actively typing). Default "quick". */
  blinkRate?: Beat;
  /** Reserve the fully-typed box size up front so surrounding content never reflows while typing — critical for video, where a reflowing neighbour is a visible pop. Default true. */
  preserveLayout?: boolean;
  className?: string;
};

function splitUnits(text: string, mode: TypeTextMode): string[] {
  if (mode === "line") return text.split("\n");
  if (mode === "word") return text.split(/(\s+)/).filter((s) => s.length > 0);
  return Array.from(text);
}

function joinUnits(units: string[], mode: TypeTextMode): string {
  return mode === "line" ? units.join("\n") : units.join("");
}

/**
 * Types out `text` as a pure function of `useProgress()` (TODO.md B2).
 * Inherits typography from its context instead of hardcoding a font — the
 * caller supplies a monospace look via `className` (e.g. `font-mono`) the
 * same way any other themeable text does; TypeText itself never picks a
 * font family. Caret color inherits `currentColor` for the same reason.
 */
export function TypeText({
  text,
  mode = "char",
  cursor = true,
  blinkRate = "quick",
  preserveLayout = true,
  className,
  ...timing
}: TypeTextProps) {
  const progress = useProgress(timing);
  const { frame, fps } = useTimeline();

  const units = useMemo(() => splitUnits(text, mode), [text, mode]);
  const shownCount = Math.floor(progress * units.length);
  const visibleText = joinUnits(units.slice(0, shownCount), mode);
  const typingDone = shownCount >= units.length;

  const blinkFrames = Math.max(1, resolveBeatFrames(blinkRate, fps));
  const blinkOn = Math.floor(frame / blinkFrames) % 2 === 0;
  // Solid caret while actively typing (a blink would just compete visually
  // with fast-changing text); it only starts blinking once typing is done.
  // Computed once and used once — the bug this replaces computed this same
  // condition twice (once for `showCursor`, once again inline in the JSX).
  const caretOpacity = !cursor ? 0 : typingDone ? (blinkOn ? 1 : 0) : 1;

  const multilineStyle: CSSProperties | undefined = mode === "line" ? { whiteSpace: "pre-wrap" } : undefined;

  const body = (
    <span className={className} style={multilineStyle}>
      {visibleText}
      {cursor && (
        <span aria-hidden style={{ opacity: caretOpacity }}>
          |
        </span>
      )}
    </span>
  );

  if (!preserveLayout) return body;

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span aria-hidden className={className} style={{ visibility: "hidden", ...multilineStyle }}>
        {text}
        {cursor && <span>|</span>}
      </span>
      <span style={{ position: "absolute", inset: 0 }}>{body}</span>
    </span>
  );
}
