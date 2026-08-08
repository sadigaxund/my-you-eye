import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { EmptyState } from "../../empty-state";
import { Skeleton } from "../../skeleton";
import { Legend } from "../../legend";
import type { ChartFrameLegendItem, ChartFrameRenderCtx } from "./types";

const DEFAULT_HEIGHT = 280;
const Y_AXIS_BAND = 44;
const X_AXIS_BAND = 28;
const TOP_PAD = 12;
const RIGHT_PAD = 12;

export interface ChartFrameProps {
  title?: string;
  subtitle?: string;
  /** Total SVG height in px, INCLUDING the x-axis band (dataviz rule: a
   * fixed height must include the axis band, never just the plot). */
  height?: number;
  /** Category labels for the x-axis. Omit for charts with no category axis
   * (pie, gauge, funnel — those position everything from `plot` directly). */
  xLabels?: string[];
  /** Clean, already-rounded tick values for the y-axis (0 / 1,000 / 2,000…).
   * Omit to hide the y-axis entirely (sparkline, pie, gauge). */
  yTicks?: number[];
  /** [min, max] the y-axis spans. Defaults to [min(yTicks), max(yTicks)]. */
  yDomain?: [number, number];
  formatYTick?: (value: number) => string;
  /** Explicit left-band width (px), reserved regardless of `yTicks`. For
   * charts with a labeled-but-non-numeric y-axis (Heatmap's row labels)
   * that still need `plot`/`xScale` inset to make room. Defaults to the
   * standard numeric-tick band when `yTicks` is set, else 0. */
  yAxisWidth?: number;
  legend?: ChartFrameLegendItem[];
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Render-prop for the plot marks — the only per-chart-type code. Receives
   * the measured plot rect and scale helpers so no chart re-derives axis
   * math (AGENTS.md instruction: "if you find yourself writing axis code
   * twice, stop and push it into ChartFrame"). */
  children: (ctx: ChartFrameRenderCtx) => ReactNode;
  /** Tooltip content for the current hover target; ChartFrame owns
   * positioning, the chart owns content and calls `onHover` from its marks. */
  tooltip?: ReactNode;
  className?: string;
}

function ChartFrame({
  title,
  subtitle,
  height = DEFAULT_HEIGHT,
  xLabels,
  yTicks,
  yDomain,
  formatYTick,
  yAxisWidth,
  legend,
  loading,
  empty,
  emptyTitle = "No data",
  emptyDescription,
  children,
  tooltip,
  className,
}: ChartFrameProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    // offsetWidth, never getBoundingClientRect(): the latter reports
    // post-transform viewport pixels and is wrong inside Canvas's or
    // Camera's scaled containers (AGENTS.md §7 / this batch's brief).
    const measure = () => setWidth((w) => (w === el.offsetWidth ? w : el.offsetWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const leftBand = yAxisWidth ?? (yTicks && yTicks.length ? Y_AXIS_BAND : 0);
  const bottomBand = xLabels && xLabels.length ? X_AXIS_BAND : 0;
  const plot = {
    x: leftBand,
    y: TOP_PAD,
    width: Math.max(0, width - leftBand - RIGHT_PAD),
    height: Math.max(0, height - TOP_PAD - bottomBand),
  };

  const [domainMin, domainMax] = yDomain ?? [
    yTicks && yTicks.length ? Math.min(...yTicks) : 0,
    yTicks && yTicks.length ? Math.max(...yTicks) : 1,
  ];
  const span = domainMax - domainMin || 1;
  const yScale = (value: number) => plot.y + plot.height - ((value - domainMin) / span) * plot.height;
  const count = xLabels?.length ?? 1;
  const bandWidth = count > 0 ? plot.width / count : plot.width;
  const xScale = (index: number) => plot.x + (index + 0.5) * bandWidth;

  const ctx: ChartFrameRenderCtx = { width, height, plot, xScale, yScale, bandWidth, onHover: setHover };
  const fmt = formatYTick ?? ((v: number) => String(v));

  return (
    <div className={cn("flex flex-col gap-tight", className)}>
      {(title || subtitle) && (
        <div className="flex flex-col gap-tight">
          {title && <h3 className="text-sm font-semibold text-fg">{title}</h3>}
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      )}
      <div ref={wrapRef} className="relative w-full" style={{ height }}>
        {loading ? (
          <Skeleton shape="rect" className="size-full" />
        ) : empty ? (
          <div className="flex size-full items-center justify-center">
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        ) : (
          width > 0 && (
            <>
              <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="overflow-visible"
                role="img"
                aria-label={title}
              >
                {yTicks?.map((tick) => {
                  const y = yScale(tick);
                  return (
                    <g key={tick}>
                      <line
                        x1={plot.x}
                        x2={plot.x + plot.width}
                        y1={y}
                        y2={y}
                        className="stroke-border"
                        strokeWidth={1}
                      />
                      <text x={plot.x - 8} y={y} textAnchor="end" dominantBaseline="middle" className="fill-muted text-xs tabular-nums">
                        {fmt(tick)}
                      </text>
                    </g>
                  );
                })}
                {xLabels?.map((label, i) => (
                  <text
                    key={`${label}-${i}`}
                    x={xScale(i)}
                    y={plot.y + plot.height + 18}
                    textAnchor="middle"
                    className="fill-muted text-xs"
                  >
                    {label}
                  </text>
                ))}
                {children(ctx)}
              </svg>
              {tooltip && hover && (
                <div
                  className="pointer-events-none absolute z-[var(--z-overlay)] rounded-ui-sm border border-border bg-surface-elevated px-2 py-1.5 text-xs shadow-elevated"
                  style={{
                    left: Math.min(Math.max(hover.x, 4), width - 4),
                    top: Math.max(hover.y - 8, 4),
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  {tooltip}
                </div>
              )}
            </>
          )
        )}
      </div>
      {legend && legend.length > 0 && <Legend items={legend} />}
    </div>
  );
}
ChartFrame.displayName = "ChartFrame";

export { ChartFrame };
