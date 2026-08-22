import { cn } from "../../../lib/cn";

export interface ChartGhostProps {
  /** Same plot rect ChartFrame/each chart already computes for its real
   * marks — the ghost draws inside it so empty/loading reads as "this
   * chart, with no data" rather than a stray centered sentence. */
  plot: { x: number; y: number; width: number; height: number };
  /** "bars" for column/row charts, "dots" for scatter — same gridline
   * chrome, a mark shape that actually hints at the chart type. */
  variant?: "bars" | "dots";
  /** Pulses via the same `animate-pulse` Skeleton already uses — true for
   * a loading state, omitted/false for a static empty state. */
  animate?: boolean;
  className?: string;
}

const GRID_FRACTIONS = [0.25, 0.5, 0.75];
// Deterministic placeholder heights/positions — not real data, just enough
// variation that the ghost reads as "a chart" instead of a uniform block.
const BAR_FRACTIONS = [0.35, 0.65, 0.5, 0.85, 0.55, 0.7];
const DOT_POINTS: [number, number][] = [
  [0.12, 0.72],
  [0.24, 0.52],
  [0.34, 0.6],
  [0.46, 0.38],
  [0.56, 0.46],
  [0.66, 0.26],
  [0.78, 0.32],
  [0.9, 0.16],
];

/** Chart-shaped skeleton chrome for ChartFrame's `empty`/`loading` states
 * and for the charts that don't route through ChartFrame (ScatterPlot).
 * Purely decorative — `aria-hidden` — the real accessible content is the
 * EmptyState message or the chart's own `aria-label` once data loads. */
function ChartGhost({ plot, variant = "bars", animate, className }: ChartGhostProps) {
  return (
    <g className={cn(animate && "animate-pulse", className)} aria-hidden="true">
      {GRID_FRACTIONS.map((f) => {
        const y = plot.y + plot.height * f;
        return (
          <line
            key={f}
            x1={plot.x}
            x2={plot.x + plot.width}
            y1={y}
            y2={y}
            className="stroke-border"
            strokeWidth={1}
            opacity={0.5}
          />
        );
      })}
      <line
        x1={plot.x}
        x2={plot.x + plot.width}
        y1={plot.y + plot.height}
        y2={plot.y + plot.height}
        className="stroke-border"
        strokeWidth={1}
      />
      {variant === "bars"
        ? BAR_FRACTIONS.map((f, i) => {
            const bw = plot.width / BAR_FRACTIONS.length;
            const h = plot.height * f;
            return (
              <rect
                key={i}
                x={plot.x + i * bw + bw * 0.2}
                y={plot.y + plot.height - h}
                width={Math.max(bw * 0.6, 0)}
                height={Math.max(h, 0)}
                rx={3}
                className="fill-muted"
                opacity={0.18}
              />
            );
          })
        : DOT_POINTS.map(([fx, fy], i) => (
            <circle
              key={i}
              cx={plot.x + fx * plot.width}
              cy={plot.y + fy * plot.height}
              r={4}
              className="fill-muted"
              opacity={0.3}
            />
          ))}
    </g>
  );
}
ChartGhost.displayName = "ChartGhost";

export { ChartGhost };
