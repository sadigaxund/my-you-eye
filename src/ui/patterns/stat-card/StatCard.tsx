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
}

export interface StatCardSparklineProps {
  data: number[];
  token?: ChartColorToken;
  area?: boolean;
}

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
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
    const r = formatSignedParts(delta.value);
    const text = r ? r.parts.map((p) => p.value).join("") : String(delta.value);
    const variant = r?.sign === "negative" ? "danger" : r?.sign === "zero" ? "neutral" : "success";
    const glyph = r?.sign === "negative" ? "↓" : r?.sign === "zero" ? "→" : "↑";
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
                  <Badge variant={resolved.variant} style="soft">
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
