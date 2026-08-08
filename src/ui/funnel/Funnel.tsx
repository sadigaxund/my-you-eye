import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { EmptyState } from "../empty-state";
import { chartFill, formatTickNumber, formatTickPercentage } from "../patterns/chart-frame";

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

function Funnel({ stages, title, subtitle, valueFormat = formatTickNumber, progress = 1, className }: FunnelProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const p = Math.max(0, Math.min(1, progress));
  const empty = stages.length === 0;
  const maxValue = stages[0]?.value || 1;
  const svgHeight = stages.length * (ROW_HEIGHT + GAP);

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
      <div ref={wrapRef} className="w-full">
        {empty ? (
          <EmptyState title="No data" description="This funnel has no stages to display." />
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
                return (
                  <g key={stage.label}>
                    <rect x={x} y={y} width={Math.max(barWidth, 0)} height={ROW_HEIGHT} rx={4} className={chartFill(token)} />
                    <foreignObject x={0} y={y} width={width} height={ROW_HEIGHT}>
                      <div className="flex size-full flex-col items-center justify-center px-1 text-center leading-tight">
                        <span className="text-xs font-medium text-fg">{stage.label}</span>
                        <span className="text-xs text-muted tabular-nums">
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
