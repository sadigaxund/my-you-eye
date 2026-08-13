import type { ReactNode } from "react";
import { useProgress } from "../core/useProgress";
import type { Timing } from "../core";

export type HighlightMode = "fill" | "underline" | "box" | "glow" | "strike";
export type HighlightColor = "primary" | "success" | "warning" | "danger";

export type HighlightProps = Timing & {
  children: ReactNode;
  /** Default "fill". */
  mode?: HighlightMode;
  /** Token color only — no arbitrary values. Default "primary". */
  color?: HighlightColor;
  /** Host element. Default "span" (inline, so it drops into running text without breaking the line). */
  as?: "span" | "div";
  className?: string;
};

const COLOR_BG: Record<HighlightColor, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const COLOR_VAR: Record<HighlightColor, string> = {
  primary: "var(--color-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
};

/**
 * Highlights `children` with one of five treatments, all a pure function of
 * `useProgress()` (TODO.md B2). The overlay always gets an explicit
 * `rounded-ui-sm` — the bug this replaces used `borderRadius: "inherit"` on
 * an absolutely-positioned overlay inside a bare `<div>` that had no radius
 * of its own to inherit, so every highlight rendered with square corners
 * regardless of the content's shape.
 *
 * The three "boxy" modes (`fill`/`box`/`glow`) expand past the glyph bounds
 * by `-inset-highlight` instead of hugging them with `inset-0` — owner
 * feedback: the tight fit read as boxes clipping their own text. This has
 * to be a negative inset, not padding: padding on an absolutely-positioned
 * overlay just grows the box outward from the same origin, but the overlay
 * shares its parent's content box with the text, so padding would push the
 * *text* apart from its neighbours too. `underline`/`strike` stay edge-
 * anchored (`inset-x-0`) — they're not a box, so the same breathing room
 * would just misalign them from the text they're marking.
 */
export function Highlight({ children, mode = "fill", color = "primary", as: As = "span", className, ...timing }: HighlightProps) {
  const progress = useProgress(timing);

  return (
    <As className={className} style={{ position: "relative", display: "inline-block" }}>
      {mode === "fill" && (
        <span
          aria-hidden
          className={`absolute -inset-highlight rounded-ui-sm ${COLOR_BG[color]}`}
          style={{ opacity: progress * 0.35 }}
        />
      )}
      {mode === "box" && (
        <span
          aria-hidden
          className="absolute -inset-highlight rounded-ui-sm"
          style={{ boxShadow: `inset 0 0 0 calc(var(--border-width) * 2) ${COLOR_VAR[color]}`, opacity: progress }}
        />
      )}
      {mode === "glow" && (
        <span
          aria-hidden
          className="absolute -inset-highlight rounded-ui-sm"
          style={{ boxShadow: `0 0 calc(var(--grid-unit) * ${progress}) ${COLOR_VAR[color]}`, opacity: progress }}
        />
      )}
      {mode === "underline" && (
        <span
          aria-hidden
          className={`absolute inset-x-0 bottom-0 rounded-ui-sm ${COLOR_BG[color]}`}
          style={{ height: "var(--spacing-bar)", transform: `scaleX(${progress})`, transformOrigin: "left" }}
        />
      )}
      {mode === "strike" && (
        <span
          aria-hidden
          className={`absolute inset-x-0 top-1/2 rounded-ui-sm ${COLOR_BG[color]}`}
          style={{ height: "var(--spacing-bar)", transform: `translateY(-50%) scaleX(${progress})`, transformOrigin: "left" }}
        />
      )}
      <span style={{ position: "relative" }}>{children}</span>
    </As>
  );
}
