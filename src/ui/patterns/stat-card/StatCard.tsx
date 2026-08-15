import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Card, CardContent } from "../../card";
import { Badge } from "../../badge";
import { Sparkline } from "../../sparkline";
import type { ChartColorToken } from "../../patterns/chart-frame";
import { formatSignedParts } from "../../../lib/format";

export interface StatCardDelta {
  /**
   * Either a pre-formatted string (original behavior — pass `direction`
   * alongside it) or a raw number. When numeric, the trend arrow and
   * success/danger coloring are derived from the number's sign and the
   * magnitude is formatted via `src/lib/format.ts`'s `formatSignedParts` —
   * reused, not reimplemented, so this never drifts from CellType's
   * `signed` display.
   */
  value: string | number;
  /** Required when `value` is a string. Ignored (derived from sign) when `value` is a number. */
  direction?: "up" | "down";
  label?: string;
  /**
   * Whether a positive `value` should read as good (success) rather than
   * bad (danger) — set false for a metric like latency or error rate, where
   * an increase is bad news. Default true (original behavior, byte-identical
   * when omitted). Only affects color; the trend glyph (↑/↓) always follows
   * the raw sign, since the number still went up or down regardless of
   * whether that's good news. No effect when `value` is a string (there is
   * no sign to read — `direction` already says everything this would).
   */
  positiveIsGood?: boolean;
}

export interface StatCardSparklineProps {
  data: number[];
  token?: ChartColorToken;
  area?: boolean;
  /** 0→1 draw-on progress, forwarded to the underlying Sparkline. Omitted or
   * 1 = fully drawn. */
  progress?: number;
}

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  /**
   * Widened from `string` to `ReactNode` so a caller can drop in a live
   * numeric tween (e.g. `my-you-eye/motion`'s `CountUp`) instead of a static
   * string — a plain string still works exactly as before (TODO.md D4's
   * progress-in convention: StatCard itself stays a pure presentational
   * component, no motion import; the live number is the caller's problem).
   */
  value: ReactNode;
  delta?: StatCardDelta;
  icon?: ReactNode;
  /** Padding density, forwarded to CardContent. Default "md" matches Card/Alert. */
  size?: "sm" | "md" | "lg";
  /** Inline trend chart under the value/delta, composing Sparkline. */
  sparkline?: StatCardSparklineProps;
}

// CardContent is normally the second half of a Header+Content pair and
// zeroes its own top padding accordingly (the header already carries
// bottom spacing). StatCard has no header above its content, so it restores
// a symmetric top padding matching whichever `size` token drives the other
// three sides.
const PT_BY_SIZE = { sm: "pt-panel-sm", md: "pt-panel", lg: "pt-panel-lg" } as const;

interface ResolvedDelta { text: string; variant: "success" | "danger" | "neutral"; glyph: string }

// For the original string+direction shape this returns byte-identical
// output to the pre-extension component (same variant/glyph/text) — see
// AGENTS.md §3.2, "don't change the default variant's appearance".
function resolveDelta(delta: StatCardDelta): ResolvedDelta {
  if (typeof delta.value === "number") {
    const positiveIsGood = delta.positiveIsGood ?? true;
    const r = formatSignedParts(delta.value);
    const text = r ? r.parts.map((p) => p.value).join("") : String(delta.value);
    const glyph = r?.sign === "negative" ? "↓" : r?.sign === "zero" ? "→" : "↑";
    const good = r?.sign === "positive" ? positiveIsGood : r?.sign === "negative" ? !positiveIsGood : null;
    const variant = good == null ? "neutral" : good ? "success" : "danger";
    return { text, variant, glyph };
  }
  return {
    text: delta.value,
    variant: delta.direction === "up" ? "success" : "danger",
    glyph: delta.direction === "up" ? "↑" : "↓",
  };
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, delta, icon, size = "md", sparkline, className, ...props }, ref) => {
    const resolved = delta ? resolveDelta(delta) : null;
    return (
      <Card ref={ref} className={cn(className)} {...props}>
        <CardContent size={size} className={PT_BY_SIZE[size]}>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-tight">
              <p className="text-sm text-muted">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
              {resolved && (
                <p className="flex items-center gap-tight text-sm">
                  <Badge variant={resolved.variant} tone="soft">
                    {resolved.glyph} {resolved.text}
                  </Badge>
                  {delta?.label && <span className="text-muted">{delta.label}</span>}
                </p>
              )}
              {sparkline && (
                <Sparkline
                  data={sparkline.data}
                  token={sparkline.token}
                  area={sparkline.area}
                  progress={sparkline.progress}
                  className="mt-tight"
                />
              )}
            </div>
            {icon && <div className="text-muted">{icon}</div>}
          </div>
        </CardContent>
      </Card>
    );
  },
);
StatCard.displayName = "StatCard";

export { StatCard };
