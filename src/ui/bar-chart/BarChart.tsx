import { useMemo, useState } from "react";
import { cn } from "../../lib/cn";
import {
  ChartFrame,
  chartColorToken,
  chartFill,
  niceTicks,
  formatTickNumber,
  measureTextWidth,
  truncateToWidth,
} from "../patterns/chart-frame";
import type { ChartColorToken } from "../patterns/chart-frame";

export interface BarChartSeries {
  label: string;
  data: number[];
  /** Explicit color slot. Omit to auto-assign in fixed order (index 0 -> chart-1, …). */
  token?: ChartColorToken;
}

export interface BarChartProps {
  /** One label per data point — the category axis. */
  categories: string[];
  series: BarChartSeries[];
  orientation?: "vertical" | "horizontal";
  /** Only meaningful with 2+ series. Default "grouped". */
  mode?: "grouped" | "stacked";
  title?: string;
  subtitle?: string;
  height?: number;
  valueFormat?: (value: number) => string;
  /** 0→1 draw-on progress. Omitted or 1 = fully drawn. Bars grow from the
   * baseline (0) toward their final length — a pure function of this value,
   * no internal timers or motion imports (AGENTS.md §9b / TODO.md D4). */
  progress?: number;
  /** Category label to spotlight — every other category's bars dim to
   * `opacity-muted`. Omitted (default) draws every bar at full opacity. */
  focus?: string;
  className?: string;
}

const MAX_BAR_THICKNESS = 24;
const GAP = 2;
// Horizontal orientation's category labels get their own reserved gutter
// (mirrors ChartFrame's Y_AXIS_BAND for numeric ticks) — previously they
// were drawn at a fixed x inside the plot, which put them directly under
// the bars (bars start at the same x) and got painted over since the bars
// render after the label in SVG document order. Reserving a gutter keeps
// the label outside every bar, at any bar length, permanently.
const LABEL_GUTTER_MIN = 60;
const LABEL_GUTTER_MAX = 160;
const LABEL_GUTTER_PAD = 16;

interface HoverInfo {
  label: string;
  value: string;
}

function BarChart({
  categories,
  series,
  orientation = "vertical",
  mode = "grouped",
  title,
  subtitle,
  height,
  valueFormat = formatTickNumber,
  progress = 1,
  focus,
  className,
}: BarChartProps) {
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const p = Math.max(0, Math.min(1, progress));
  const empty = categories.length === 0 || series.length === 0 || series.every((s) => s.data.length === 0);

  const stacked = mode === "stacked" && series.length > 1;
  const perCategoryTotal = categories.map((_, i) =>
    stacked ? series.reduce((sum, s) => sum + (s.data[i] ?? 0), 0) : Math.max(...series.map((s) => s.data[i] ?? 0), 0),
  );
  const dataMax = Math.max(...perCategoryTotal, 0);
  const ticks = niceTicks(dataMax || 1, 5);
  const legend = series.map((s, i) => ({ label: s.label, token: s.token ?? chartColorToken(i) }));

  // Size the category-label gutter off the actual label text, not a fixed
  // guess — a short label set ("NA", "EU") shouldn't waste plot width, and
  // a long one ("Enterprise plan renewals") still needs room before it's
  // truncated by ChartGhost's sibling, truncateToWidth, below.
  const labelGutter = useMemo(() => {
    if (orientation !== "horizontal" || categories.length === 0) return undefined;
    const widest = Math.max(...categories.map((c) => measureTextWidth(c)));
    return Math.min(LABEL_GUTTER_MAX, Math.max(LABEL_GUTTER_MIN, widest + LABEL_GUTTER_PAD));
  }, [orientation, categories]);

  function barKey(categoryIndex: number, seriesIndex: number): string {
    return String(categoryIndex) + "-" + String(seriesIndex);
  }

  return (
    <ChartFrame
      title={title}
      subtitle={subtitle}
      height={height}
      empty={empty}
      emptyTitle="No data"
      emptyDescription="This chart has no series to display."
      xLabels={orientation === "vertical" ? categories : undefined}
      yTicks={orientation === "vertical" ? ticks : undefined}
      yDomain={orientation === "vertical" ? [0, ticks[ticks.length - 1]] : undefined}
      yAxisWidth={labelGutter}
      formatYTick={valueFormat}
      legend={series.length > 1 ? legend : undefined}
      className={className}
      tooltip={
        hover ? (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium tabular-nums">{hover.value}</span>
            <span className="text-muted">{hover.label}</span>
          </div>
        ) : undefined
      }
    >
      {(ctx) => {
        const { plot, xScale, yScale, bandWidth, onHover } = ctx;
        const maxVal = ticks[ticks.length - 1] || 1;

        function showHover(seriesLabel: string, value: number, x: number, y: number) {
          setHover({ label: seriesLabel, value: valueFormat(value) });
          onHover({ x, y });
        }

        function hideHover() {
          setHover(null);
          onHover(null);
        }

        if (orientation === "horizontal") {
          const rowHeight = plot.height / categories.length;
          const zeroX = plot.x;
          const maxWidth = plot.width;
          return (
            <g>
              {categories.map((cat, ci) => {
                const rowY = plot.y + ci * rowHeight;
                const dimmed = focus != null && cat !== focus;
                let offset = 0;
                const thickness = stacked
                  ? Math.min(MAX_BAR_THICKNESS, rowHeight * 0.6)
                  : Math.min(MAX_BAR_THICKNESS, (rowHeight * 0.7 - GAP * (series.length - 1)) / series.length);
                // Right-aligned inside the reserved gutter (mirrors
                // ChartFrame's y-axis tick labels) — never inside the plot,
                // so it can never sit under a bar regardless of bar length.
                const labelMaxWidth = Math.max(plot.x - 12, 0);
                const labelText = truncateToWidth(cat, labelMaxWidth);
                return (
                  <g key={cat}>
                    <text x={plot.x - 8} y={rowY + rowHeight / 2} textAnchor="end" dominantBaseline="middle" className="fill-muted text-xs">
                      {labelText}
                      <title>{cat}</title>
                    </text>
                    {series.map((s, si) => {
                      const value = s.data[ci] ?? 0;
                      const fullW = (value / maxVal) * maxWidth;
                      const w = fullW * p;
                      const y = stacked
                        ? rowY + rowHeight / 2 - thickness / 2
                        : rowY + rowHeight / 2 - (thickness * series.length + GAP * (series.length - 1)) / 2 + si * (thickness + GAP);
                      const x = stacked ? zeroX + offset : zeroX;
                      if (stacked) offset += fullW;
                      return (
                        <rect
                          key={barKey(ci, si)}
                          x={x}
                          y={y}
                          width={Math.max(w, 0)}
                          height={thickness}
                          rx={4}
                          className={cn(chartFill(s.token ?? chartColorToken(si)), dimmed && "opacity-muted")}
                          onPointerEnter={(e) => showHover(s.label, value, e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
                          onPointerLeave={hideHover}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </g>
          );
        }

        return (
          <g>
            {categories.map((cat, ci) => {
              const cx = xScale(ci);
              const dimmed = focus != null && cat !== focus;
              let offset = 0;
              const thickness = stacked
                ? Math.min(MAX_BAR_THICKNESS, bandWidth * 0.6)
                : Math.min(MAX_BAR_THICKNESS, (bandWidth * 0.7 - GAP * (series.length - 1)) / series.length);
              return (
                <g key={cat}>
                  {series.map((s, si) => {
                    const value = s.data[ci] ?? 0;
                    const fullH = plot.y + plot.height - yScale(value);
                    const h = fullH * p;
                    const x = stacked
                      ? cx - thickness / 2
                      : cx - (thickness * series.length + GAP * (series.length - 1)) / 2 + si * (thickness + GAP);
                    const y = stacked ? yScale(0) - offset - h : yScale(0) - h;
                    if (stacked) offset += fullH;
                    return (
                      <rect
                        key={barKey(ci, si)}
                        x={x}
                        y={y}
                        width={thickness}
                        height={Math.max(h, 0)}
                        rx={4}
                        className={cn(chartFill(s.token ?? chartColorToken(si)), dimmed && "opacity-muted")}
                        onPointerEnter={(e) => showHover(s.label, value, e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
                        onPointerLeave={hideHover}
                      />
                    );
                  })}
                </g>
              );
            })}
          </g>
        );
      }}
    </ChartFrame>
  );
}
BarChart.displayName = "BarChart";

export { BarChart };
