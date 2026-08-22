import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { EmptyState } from "../empty-state";
import {
  chartFill,
  formatTickNumber,
  formatTickPercentage,
  useReadableForeground,
} from "../patterns/chart-frame";

export interface FunnelStage {
  label: string;
  value: number;
}

export interface FunnelProps {
  /** Stages in order, first = the widest / entry stage. Ordered data takes
   * the ordinal ramp (dataviz skill: swapping the order would change the
   * meaning), never the categorical 8-hue palette. */
  stages: FunnelStage[];
  title?: string;
  subtitle?: string;
  valueFormat?: (value: number) => string;
  /** 0→1 draw-on progress. Omitted or 1 = fully drawn. Stages reveal
   * top-to-bottom, each width settling to its final proportion — a pure
   * function of this value. */
  progress?: number;
  className?: string;
}

// One hue, monotone lightness step per stage — the sequential ramp, not
// the 8-slot categorical palette (dataviz skill: "ordered categories take
// a one-hue ramp so the reader sees the order in the color").
const ORDINAL_STEPS = ["chart-seq-2", "chart-seq-3", "chart-seq-4", "chart-seq-5"] as const;

const ROW_HEIGHT = 40;
const GAP = 6;
// Empty-state ghost — a plausible 4-stage funnel shape, not real data.
const EMPTY_GHOST_FRACTIONS = [0.9, 0.68, 0.48, 0.3];
const EMPTY_GHOST_HEIGHT = EMPTY_GHOST_FRACTIONS.length * (ROW_HEIGHT + GAP);

function Funnel({ stages, title, subtitle, valueFormat = formatTickNumber, progress = 1, className }: FunnelProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const p = Math.max(0, Math.min(1, progress));
  const empty = stages.length === 0;
  const maxValue = stages[0]?.value || 1;
  const svgHeight = stages.length * (ROW_HEIGHT + GAP);
  // The stage fill gets darker down the funnel (ORDINAL_STEPS), but the
  // label text was fixed — on the darkest stages that's near-unreadable.
  // Resolve per-stage foreground from the stage's actual painted background
  // (see contrast-fg.ts) so every stage clears WCAG AA, not just the
  // lightest ones.
  const readableFg = useReadableForeground(ORDINAL_STEPS);

  // offsetWidth, never getBoundingClientRect() — see AGENTS.md §7 / this
  // batch's brief: the latter reports post-transform viewport pixels and is
  // wrong inside Canvas's or Camera's scaled containers.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setWidth((w) => (w === el.offsetWidth ? w : el.offsetWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={cn("flex flex-col gap-tight", className)}>
      {(title || subtitle) && (
        <div className="flex flex-col gap-tight">
          {title && <h3 className="text-sm font-semibold text-fg">{title}</h3>}
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      )}
      <div ref={wrapRef} className="relative w-full" style={{ height: empty ? EMPTY_GHOST_HEIGHT : undefined }}>
        {empty ? (
          width > 0 && (
            <>
              {/* Ghost stage bars (decreasing width, same shape a real
                  funnel settles into) behind the message — an empty funnel
                  should still read as a funnel, not a stray sentence. */}
              <svg width={width} height={EMPTY_GHOST_HEIGHT} viewBox={`0 0 ${width} ${EMPTY_GHOST_HEIGHT}`} aria-hidden="true">
                {EMPTY_GHOST_FRACTIONS.map((f, i) => {
                  const w = f * width;
                  return (
                    <rect
                      key={i}
                      x={(width - w) / 2}
                      y={i * (ROW_HEIGHT + GAP)}
                      width={w}
                      height={ROW_HEIGHT}
                      rx={4}
                      className="fill-muted"
                      opacity={0.18}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <EmptyState title="No data" description="This funnel has no stages to display." />
              </div>
            </>
          )
        ) : (
          width > 0 && (
            <svg width={width} height={svgHeight} viewBox={`0 0 ${width} ${svgHeight}`} role="img" aria-label={title}>
              {stages.map((stage, i) => {
                const fraction = maxValue > 0 ? stage.value / maxValue : 0;
                const fullWidth = fraction * width;
                const barWidth = fullWidth * p;
                const x = (width - barWidth) / 2;
                const y = i * (ROW_HEIGHT + GAP);
                const token = ORDINAL_STEPS[Math.min(i, ORDINAL_STEPS.length - 1)];
                const conversionFromPrev = i === 0 ? 1 : stages[i - 1].value > 0 ? stage.value / stages[i - 1].value : 0;
                const fg = readableFg[token] ?? "text-fg";
                return (
                  <g key={stage.label}>
                    <rect x={x} y={y} width={Math.max(barWidth, 0)} height={ROW_HEIGHT} rx={4} className={chartFill(token)}>
                      {/* Native SVG tooltip — reachable regardless of how
                          narrow the bar gets, unlike the foreignObject label
                          below which truncates/clips at small widths. */}
                      <title>
                        {stage.label} — {valueFormat(stage.value)}
                      </title>
                    </rect>
                    <foreignObject x={x} y={y} width={Math.max(barWidth, 0)} height={ROW_HEIGHT}>
                      {/* Sized to the bar's own width (not the full chart
                          width, as before) so long labels truncate inside
                          the shape instead of spilling into the background
                          — the full text stays reachable via the <title>
                          on the rect above. */}
                      <div
                        className="flex size-full flex-col items-center justify-center overflow-hidden px-1 text-center leading-tight"
                        title={stage.label}
                      >
                        <span className={cn("w-full truncate text-xs font-medium", fg)}>{stage.label}</span>
                        <span className={cn("w-full truncate text-xs tabular-nums", fg)}>
                          {valueFormat(stage.value)}
                          {i > 0 && ` · ${formatTickPercentage(conversionFromPrev)}`}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          )
        )}
      </div>
    </div>
  );
}
Funnel.displayName = "Funnel";

export { Funnel };
