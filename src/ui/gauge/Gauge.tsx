import { cn } from "../../lib/cn";
import { formatTickNumber } from "../patterns/chart-frame";

export interface GaugeThresholdBand {
  /** Band upper bound, in the same domain as `value`/`max`. */
  upTo: number;
  /** Status token — reuses the existing status color roles (never a
   * categorical chart-* token: a threshold band means good/bad, not
   * series identity — dataviz skill's status/categorical collision rule). */
  status: "success" | "warning" | "danger";
}

export interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  /** Threshold bands, ascending by `upTo`. Defaults to a single "success"
   * band spanning the whole range (no threshold coloring). */
  bands?: GaugeThresholdBand[];
  label?: string;
  valueFormat?: (value: number) => string;
  size?: number;
  /** 0→1 draw-on progress. Omitted or 1 = fully drawn. The needle arc
   * sweeps from `min` toward the clamped `value` scaled by this fraction —
   * a pure function of progress. */
  progress?: number;
  className?: string;
}

const SIZE = 200;
const START_ANGLE = -120;
const END_ANGLE = 120;
const STROKE = 14;

const STATUS_STROKE: Record<GaugeThresholdBand["status"], string> = {
  success: "stroke-success",
  warning: "stroke-warning",
  danger: "stroke-danger",
};

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const large = endDeg - startDeg > 180 ? 1 : 0;
  const p0 = polar(cx, cy, r, startDeg);
  const p1 = polar(cx, cy, r, endDeg);
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

function Gauge({
  value,
  min = 0,
  max = 100,
  bands,
  label,
  valueFormat = formatTickNumber,
  size = SIZE,
  progress = 1,
  className,
}: GaugeProps) {
  const p = Math.max(0, Math.min(1, progress));
  const span = max - min || 1;
  const clamped = Math.max(min, Math.min(max, value));
  const fraction = (clamped - min) / span;
  const drawnAngle = START_ANGLE + (END_ANGLE - START_ANGLE) * fraction * p;

  const cx = size / 2;
  const cy = size / 2 + 8;
  const r = size / 2 - STROKE;

  const resolvedBands = bands && bands.length > 0 ? bands : [{ upTo: max, status: "success" as const }];
  const activeStatus = resolvedBands.find((b) => clamped <= b.upTo)?.status ?? resolvedBands[resolvedBands.length - 1].status;

  return (
    <div className={cn("flex flex-col items-center gap-tight", className)}>
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`} role="img" aria-label={label}>
        <path d={arcPath(cx, cy, r, START_ANGLE, END_ANGLE)} className="stroke-border" strokeWidth={STROKE} fill="none" strokeLinecap="round" />
        {resolvedBands.map((band, i) => {
          const prevUpTo = i === 0 ? min : resolvedBands[i - 1].upTo;
          const bandStartFrac = (Math.max(min, Math.min(max, prevUpTo)) - min) / span;
          const bandEndFrac = (Math.max(min, Math.min(max, band.upTo)) - min) / span;
          const bandStart = START_ANGLE + (END_ANGLE - START_ANGLE) * bandStartFrac;
          const bandEnd = START_ANGLE + (END_ANGLE - START_ANGLE) * bandEndFrac;
          return (
            <path
              key={band.upTo}
              d={arcPath(cx, cy, r, bandStart, bandEnd)}
              className={cn(STATUS_STROKE[band.status], "opacity-25")}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="butt"
            />
          );
        })}
        <path
          d={arcPath(cx, cy, r, START_ANGLE, drawnAngle)}
          className={STATUS_STROKE[activeStatus]}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
        />
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-fg text-2xl font-semibold">
          {valueFormat(clamped)}
        </text>
      </svg>
      {label && <span className="text-xs text-muted">{label}</span>}
    </div>
  );
}
Gauge.displayName = "Gauge";

export { Gauge };
