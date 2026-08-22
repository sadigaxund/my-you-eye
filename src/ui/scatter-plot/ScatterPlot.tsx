import { useState } from "react";
import { cn } from "../../lib/cn";
import { EmptyState } from "../empty-state";
import { Legend } from "../legend";
import { ChartGhost, chartColorToken, chartFill, formatTickNumber, niceTicks } from "../patterns/chart-frame";
import type { ChartColorToken } from "../patterns/chart-frame";

export interface ScatterPoint {
  x: number;
  y: number;
  label?: string;
}

export interface ScatterSeries {
  label: string;
  data: ScatterPoint[];
  token?: ChartColorToken;
}

export interface ScatterPlotProps {
  series: ScatterSeries[];
  /** Draw a linear least-squares trend line through every point (all series pooled). */
  trendLine?: boolean;
  title?: string;
  subtitle?: string;
  height?: number;
  width?: number;
  xFormat?: (value: number) => string;
  yFormat?: (value: number) => string;
  loading?: boolean;
  /** 0→1 draw-on progress. Omitted or 1 = fully drawn. Points fade + scale
   * in by index order as `progress` sweeps 0→1 — a pure function of this
   * value. */
  progress?: number;
  className?: string;
}

const PAD = 16;
const AXIS_BAND = 32;

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length;
  if (n < 2) return null;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function ScatterPlot({
  series,
  trendLine = false,
  title,
  subtitle,
  height = 280,
  width = 480,
  xFormat = formatTickNumber,
  yFormat = formatTickNumber,
  loading,
  progress = 1,
  className,
}: ScatterPlotProps) {
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number; label: string; sx: number; sy: number } | null>(null);
  const p = Math.max(0, Math.min(1, progress));
  const allPoints = series.flatMap((s) => s.data);
  const empty = series.length === 0 || allPoints.length === 0;

  const xMax = Math.max(...allPoints.map((pt) => pt.x), 1);
  const xMin = Math.min(...allPoints.map((pt) => pt.x), 0);
  const yMax = Math.max(...allPoints.map((pt) => pt.y), 1);
  const yMin = Math.min(...allPoints.map((pt) => pt.y), 0);
  const xTicks = niceTicks(xMax, 5, Math.min(0, xMin));
  const yTicks = niceTicks(yMax, 5, Math.min(0, yMin));
  const [xLo, xHi] = [xTicks[0], xTicks[xTicks.length - 1]];
  const [yLo, yHi] = [yTicks[0], yTicks[yTicks.length - 1]];

  const plot = { x: PAD + AXIS_BAND, y: PAD, width: width - PAD * 2 - AXIS_BAND, height: height - PAD - AXIS_BAND };
  const sx = (v: number) => plot.x + ((v - xLo) / (xHi - xLo || 1)) * plot.width;
  const sy = (v: number) => plot.y + plot.height - ((v - yLo) / (yHi - yLo || 1)) * plot.height;

  const legend = series.map((s, i) => ({ label: s.label, token: s.token ?? chartColorToken(i) }));
  const trend = trendLine ? linearRegression(allPoints) : null;
  const revealIndex = Math.round(allPoints.length * p);
  let seenIndex = 0;

  return (
    <div className={cn("flex flex-col gap-tight", className)}>
      {(title || subtitle) && (
        <div className="flex flex-col gap-tight">
          {title && <h3 className="text-sm font-semibold text-fg">{title}</h3>}
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      )}
      {loading || empty ? (
        // Same ghost axes/gridlines/dots either way — animated (shimmering)
        // while loading, static behind the message once we know it's truly
        // empty. Previously `loading` fell back to a generic Skeleton rect
        // that gave no hint this was a scatter plot ("what is this example
        // supposed to showcase?"), and `empty` was bare centered text.
        <div className="relative" style={{ width, height }}>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
            <ChartGhost plot={plot} variant="dots" animate={loading} />
          </svg>
          {empty && (
            <div className="absolute inset-0 flex items-center justify-center">
              <EmptyState title="No data" description="This chart has no points to display." />
            </div>
          )}
        </div>
      ) : (
        <div className="relative" style={{ width, height }}>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
            {yTicks.map((t) => (
              <g key={t}>
                <line x1={plot.x} x2={plot.x + plot.width} y1={sy(t)} y2={sy(t)} className="stroke-border" strokeWidth={1} />
                <text x={plot.x - 8} y={sy(t)} textAnchor="end" dominantBaseline="middle" className="fill-muted text-xs tabular-nums">
                  {yFormat(t)}
                </text>
              </g>
            ))}
            {xTicks.map((t) => (
              <text key={t} x={sx(t)} y={plot.y + plot.height + 18} textAnchor="middle" className="fill-muted text-xs tabular-nums">
                {xFormat(t)}
              </text>
            ))}
            {trend && (
              <line
                x1={sx(xLo)}
                y1={sy(trend.slope * xLo + trend.intercept)}
                x2={sx(xHi)}
                y2={sy(trend.slope * xHi + trend.intercept)}
                className="stroke-muted"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            )}
            {series.map((s, si) => {
              const token = s.token ?? chartColorToken(si);
              return (
                <g key={s.label}>
                  {s.data.map((pt, pi) => {
                    const visible = seenIndex < revealIndex;
                    seenIndex += 1;
                    return (
                      <circle
                        key={pi}
                        cx={sx(pt.x)}
                        cy={sy(pt.y)}
                        r={5}
                        className={cn(chartFill(token), "stroke-surface transition-opacity")}
                        strokeWidth={2}
                        opacity={visible ? 1 : 0}
                      >
                        <title>{pt.label ?? `${xFormat(pt.x)}, ${yFormat(pt.y)}`}</title>
                      </circle>
                    );
                  })}
                  {s.data.map((pt, pi) => (
                    <circle
                      key={`hit-${pi}`}
                      cx={sx(pt.x)}
                      cy={sy(pt.y)}
                      r={12}
                      fill="transparent"
                      onPointerEnter={() =>
                        setHoverPoint({ x: pt.x, y: pt.y, label: pt.label ?? s.label, sx: sx(pt.x), sy: sy(pt.y) })
                      }
                      onPointerLeave={() => setHoverPoint(null)}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
          {hoverPoint && (
            <div
              className="pointer-events-none absolute z-[var(--z-overlay)] rounded-ui-sm border border-border bg-surface-elevated px-2 py-1.5 text-xs shadow-elevated"
              style={{ left: hoverPoint.sx, top: hoverPoint.sy - 8, transform: "translate(-50%, -100%)" }}
            >
              <div className="font-medium">{hoverPoint.label}</div>
              <div className="text-muted tabular-nums">
                {xFormat(hoverPoint.x)}, {yFormat(hoverPoint.y)}
              </div>
            </div>
          )}
        </div>
      )}
      {!empty && series.length > 1 && <Legend items={legend} swatch="dot" />}
    </div>
  );
}
ScatterPlot.displayName = "ScatterPlot";

export { ScatterPlot };
