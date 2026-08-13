import { useMemo } from "react";
import type { CSSProperties } from "react";
import { useProgress } from "../core/useProgress";
import { useTimeline } from "../core/TimelineContext";
import { resolveBeatFrames } from "../core/beats";
import type { Timing, Beat } from "../core";

export type TypeTextMode = "char" | "word" | "line";
export type TypeTextCaret = "bar" | "block" | "underline" | "none";

export type TypeTextProps = Timing & {
  text: string;
  /** Reveal unit. Default "char". */
  mode?: TypeTextMode;
  /** Show a caret while (and briefly after) typing. Default true. Set `caret="none"` instead if you want the shape union to be the single source of truth. */
  cursor?: boolean;
  /** Caret shape. "bar" (default, unchanged) is the classic "|". "block" is a filled character cell, "underline" a low bar, "none" renders nothing regardless of `cursor`. */
  caret?: TypeTextCaret;
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

/** Em-relative — a caret is sized against whatever font-size the caller's own className sets, never a raw px token (there's no "caret size" concept in tokens.css, the same category as Draw's SVG stroke-width constants). */
function Caret({ variant, opacity }: { variant: TypeTextCaret; opacity: number }) {
  if (variant === "none") return null;
  if (variant === "bar") {
    return (
      <span aria-hidden style={{ opacity }}>
        |
      </span>
    );
  }
  const style: CSSProperties = {
    display: "inline-block",
    verticalAlign: "text-bottom",
    background: "currentColor",
    width: "0.55em",
    height: variant === "block" ? "1em" : "0.15em",
    opacity,
  };
  return <span aria-hidden style={style} />;
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
  caret = "bar",
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
  const showCaret = cursor && caret !== "none";
  const caretOpacity = !showCaret ? 0 : typingDone ? (blinkOn ? 1 : 0) : 1;

  const multilineStyle: CSSProperties | undefined = mode === "line" ? { whiteSpace: "pre-wrap" } : undefined;

  const body = (
    <span className={className} style={multilineStyle}>
      {visibleText}
      {showCaret && <Caret variant={caret} opacity={caretOpacity} />}
    </span>
  );

  if (!preserveLayout) return body;

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span aria-hidden className={className} style={{ visibility: "hidden", ...multilineStyle }}>
        {text}
        {showCaret && <span>|</span>}
      </span>
      <span style={{ position: "absolute", inset: 0 }}>{body}</span>
    </span>
  );
}
