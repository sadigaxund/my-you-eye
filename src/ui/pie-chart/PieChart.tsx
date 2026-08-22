import { useState } from "react";
import { cn } from "../../lib/cn";
import { EmptyState } from "../empty-state";
import { Legend } from "../legend";
import { chartColorToken, chartFill, formatTickPercentage } from "../patterns/chart-frame";
import type { ChartColorToken } from "../patterns/chart-frame";

export interface PieChartSlice {
  label: string;
  value: number;
  token?: ChartColorToken;
}

export interface PieChartProps {
  slices: PieChartSlice[];
  /** Donut hole radius as a fraction of the outer radius (0 = pie, default 0). */
  innerRadius?: number;
  /** Text shown at the center — only meaningful with `innerRadius > 0`. */
  centerLabel?: string;
  centerValue?: string;
  title?: string;
  size?: number;
  /** 0→1 draw-on progress. Omitted or 1 = fully drawn. The arc sweeps from
   * 12 o'clock, each slice's angular span scaled by this value in order —
   * a pure function of progress, no internal timers. */
  progress?: number;
  className?: string;
}

const SIZE = 220;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, startDeg: number, endDeg: number) {
  const large = endDeg - startDeg > 180 ? 1 : 0;
  // A single arc command can't express a full 360° sweep — start and end
  // points coincide, so the arc is degenerate and browsers paint nothing
  // (the bug behind "single category renders as no visible shape at all").
  // Clamping just short of a full turn keeps the arc command valid while
  // leaving a seam under a hundredth of a degree — imperceptible at any
  // radius this component renders, so it still reads as a solid circle.
  const clampedEnd = Math.min(endDeg, startDeg + 359.99);
  const p0 = polar(cx, cy, rOuter, startDeg);
  const p1 = polar(cx, cy, rOuter, clampedEnd);
  if (rInner <= 0) {
    return `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${p1.x} ${p1.y} Z`;
  }
  const q0 = polar(cx, cy, rInner, clampedEnd);
  const q1 = polar(cx, cy, rInner, startDeg);
  return [
    `M ${p0.x} ${p0.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p1.x} ${p1.y}`,
    `L ${q0.x} ${q0.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${q1.x} ${q1.y}`,
    "Z",
  ].join(" ");
}

function PieChart({
  slices,
  innerRadius = 0,
  centerLabel,
  centerValue,
  title,
  size = SIZE,
  progress = 1,
  className,
}: PieChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const p = Math.max(0, Math.min(1, progress));
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const empty = slices.length === 0 || total <= 0;

  const legend = slices.map((s, i) => ({ label: s.label, token: s.token ?? chartColorToken(i) }));
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 4;
  const rInner = rOuter * Math.max(0, Math.min(0.9, innerRadius));

  let cursor = 0;
  const arcs = slices.map((s, i) => {
    const fraction = total > 0 ? s.value / total : 0;
    const fullSpan = fraction * 360;
    const start = cursor;
    const drawnSpan = fullSpan * p;
    cursor += fullSpan;
    return { slice: s, index: i, start, end: start + drawnSpan, fraction };
  });

  // A single 100%-share category needs its own defined edge: the usual
  // stroke-surface (matched to the page/card background, meant to separate
  // adjacent slices) reads as "no border at all" when there's only one
  // slice and nothing to separate it from — the complaint that it "just
  // looks like text on the screen". stroke-border is a real, visible
  // outline so the ring/disc reads as a shape even with one category.
  const visibleSlices = arcs.filter((a) => a.end - a.start > 0.001).length;
  const singleSlice = visibleSlices <= 1;

  return (
    <div className={cn("flex flex-col items-center gap-stack", className)}>
      {title && <h3 className="text-sm font-semibold text-fg">{title}</h3>}
      {empty ? (
        <div className="relative" style={{ width: size, height: size }}>
          {/* Ghost ring behind the message — an empty pie/donut should
              still read as a pie/donut, not a stray sentence. */}
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="absolute inset-0">
            <circle
              cx={cx}
              cy={cy}
              r={(rOuter + rInner) / 2}
              fill="none"
              className="stroke-muted"
              strokeWidth={innerRadius > 0 ? rOuter - rInner : rOuter}
              opacity={0.18}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <EmptyState title="No data" description="This chart has no slices to display." />
          </div>
        </div>
      ) : (
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={title}>
            {arcs.map(({ slice, index, start, end }) => {
              if (end - start <= 0.001) return null;
              const token = slice.token ?? chartColorToken(index);
              return (
                <path
                  key={slice.label}
                  d={arcPath(cx, cy, rOuter, rInner, start, end)}
                  className={cn(
                    chartFill(token),
                    singleSlice ? "stroke-border" : "stroke-surface",
                    "transition-opacity",
                    hoverIndex !== null && hoverIndex !== index && "opacity-60",
                  )}
                  strokeWidth={2}
                  onPointerEnter={() => setHoverIndex(index)}
                  onPointerLeave={() => setHoverIndex(null)}
                />
              );
            })}
          </svg>
          {innerRadius > 0 && (centerLabel || centerValue) && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              {centerValue && <span className="text-xl font-semibold text-fg">{centerValue}</span>}
              {centerLabel && <span className="text-xs text-muted">{centerLabel}</span>}
            </div>
          )}
          {hoverIndex !== null && (
            <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full rounded-ui-sm border border-border bg-surface-elevated px-2 py-1.5 text-xs shadow-elevated">
              <span className="font-medium">{slices[hoverIndex].label}</span>{" "}
              <span className="text-muted tabular-nums">{formatTickPercentage(arcs[hoverIndex].fraction)}</span>
            </div>
          )}
        </div>
      )}
      {!empty && slices.length > 1 && <Legend items={legend} />}
    </div>
  );
}
PieChart.displayName = "PieChart";

export { PieChart };
