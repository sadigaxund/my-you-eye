import { useState } from "react";
import { cn } from "../../lib/cn";
import { ChartFrame, chartFill, formatTickNumber, CHART_SEQUENTIAL_TOKENS } from "../patterns/chart-frame";

export interface HeatmapProps {
  /** Column labels (e.g. hours, days). */
  xLabels: string[];
  /** Row labels (e.g. days, services). */
  yLabels: string[];
  /** Row-major values: `values[row][col]`. */
  values: number[][];
  title?: string;
  subtitle?: string;
  valueFormat?: (value: number) => string;
  /** 0→1 draw-on progress. Omitted or 1 = fully drawn. Cells fade in by
   * rank (lowest value first) as `progress` sweeps 0→1 — a pure function
   * of this value. */
  progress?: number;
  className?: string;
}

const CELL_GAP = 2;

function Heatmap({ xLabels, yLabels, values, title, subtitle, valueFormat = formatTickNumber, progress = 1, className }: HeatmapProps) {
  const [hover, setHover] = useState<{ x: number; y: number; row: number; col: number } | null>(null);
  const p = Math.max(0, Math.min(1, progress));
  const empty = xLabels.length === 0 || yLabels.length === 0 || values.length === 0;

  const flat = values.flat().filter((v) => Number.isFinite(v));
  const max = Math.max(...flat, 1);
  const min = Math.min(...flat, 0);
  const span = max - min || 1;

  // Rank cells low-to-high so progress reveals the smallest values first
  // (an arbitrary but stable, data-driven reveal order).
  const cellOrder = flat.length
    ? [...Array(yLabels.length).keys()].flatMap((row) => [...Array(xLabels.length).keys()].map((col) => ({ row, col })))
      .sort((a, b) => (values[a.row]?.[a.col] ?? 0) - (values[b.row]?.[b.col] ?? 0))
    : [];
  const revealCount = Math.round(cellOrder.length * p);
  const revealed = new Set(cellOrder.slice(0, revealCount).map((c) => `${c.row}-${c.col}`));

  function tokenFor(value: number) {
    const t = (value - min) / span;
    // Sequential ramp step 1 = lightest/near-zero, step 5 = darkest/highest
    // (tokens.css "more is darker" convention) — idx rises with the value.
    const idx = Math.min(CHART_SEQUENTIAL_TOKENS.length - 1, Math.floor(t * CHART_SEQUENTIAL_TOKENS.length));
    return CHART_SEQUENTIAL_TOKENS[idx];
  }

  return (
    <ChartFrame
      title={title}
      subtitle={subtitle}
      empty={empty}
      emptyTitle="No data"
      emptyDescription="This heatmap has no cells to display."
      height={Math.max(160, yLabels.length * 32 + 40)}
      xLabels={xLabels}
      yAxisWidth={64}
      className={className}
      tooltip={
        hover ? (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium tabular-nums">{valueFormat(values[hover.row]?.[hover.col] ?? 0)}</span>
            <span className="text-muted">
              {yLabels[hover.row]} · {xLabels[hover.col]}
            </span>
          </div>
        ) : undefined
      }
    >
      {({ plot, xScale, bandWidth, onHover }) => {
        const rowHeight = yLabels.length > 0 ? plot.height / yLabels.length : plot.height;
        return (
          <g>
            {yLabels.map((yLabel, row) => (
              <g key={yLabel}>
                <text
                  x={plot.x - 8}
                  y={plot.y + row * rowHeight + rowHeight / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted text-xs"
                >
                  {yLabel}
                </text>
                {xLabels.map((_, col) => {
                  const value = values[row]?.[col] ?? 0;
                  const cx = xScale(col) - bandWidth / 2 + CELL_GAP / 2;
                  const cy = plot.y + row * rowHeight + CELL_GAP / 2;
                  const isRevealed = revealed.has(`${row}-${col}`);
                  return (
                    <rect
                      key={`${row}-${col}`}
                      x={cx}
                      y={cy}
                      width={Math.max(bandWidth - CELL_GAP, 0)}
                      height={Math.max(rowHeight - CELL_GAP, 0)}
                      rx={3}
                      className={cn(chartFill(tokenFor(value)), "transition-opacity duration-150")}
                      opacity={isRevealed ? 1 : 0}
                      onPointerEnter={(e) => {
                        setHover({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, row, col });
                        onHover({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
                      }}
                      onPointerLeave={() => {
                        setHover(null);
                        onHover(null);
                      }}
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );
      }}
    </ChartFrame>
  );
}
Heatmap.displayName = "Heatmap";

export { Heatmap };
