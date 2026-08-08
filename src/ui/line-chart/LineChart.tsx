import { useId, useState } from "react";
import { cn } from "../../lib/cn";
import {
  ChartFrame,
  chartColorToken,
  chartFill,
  chartStroke,
  niceTicks,
  formatTickNumber,
} from "../patterns/chart-frame";
import type { ChartColorToken } from "../patterns/chart-frame";

export interface LineChartSeries {
  label: string;
  data: number[];
  token?: ChartColorToken;
}

export interface LineChartProps {
  categories: string[];
  series: LineChartSeries[];
  /** Fill the area under each line at a light wash. Default false. */
  area?: boolean;
  /** Show a marker dot at every data point. Default true. */
  showPoints?: boolean;
  title?: string;
  subtitle?: string;
  height?: number;
  valueFormat?: (value: number) => string;
  /** 0→1 draw-on progress. Omitted or 1 = fully drawn. The plot reveals
   * left-to-right (line + area together, via a clip rect whose width tracks
   * progress) — a pure function of this value. */
  progress?: number;
  className?: string;
}

function buildPath(points: { x: number; y: number }[]): string {
  return points.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ");
}

function LineChart({
  categories,
  series,
  area = false,
  showPoints = true,
  title,
  subtitle,
  height,
  valueFormat = formatTickNumber,
  progress = 1,
  className,
}: LineChartProps) {
  const clipId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const p = Math.max(0, Math.min(1, progress));
  const empty = categories.length === 0 || series.length === 0 || series.every((s) => s.data.length === 0);

  const dataMax = Math.max(...series.flatMap((s) => s.data), 0);
  const dataMin = Math.min(...series.flatMap((s) => s.data), 0);
  const ticks = niceTicks(dataMax, 5, Math.min(0, dataMin));
  const legend = series.map((s, i) => ({ label: s.label, token: s.token ?? chartColorToken(i) }));

  return (
    <ChartFrame
      title={title}
      subtitle={subtitle}
      height={height}
      empty={empty}
      emptyTitle="No data"
      emptyDescription="This chart has no series to display."
      xLabels={categories}
      yTicks={ticks}
      yDomain={[ticks[0], ticks[ticks.length - 1]]}
      formatYTick={valueFormat}
      legend={series.length > 1 ? legend : undefined}
      className={className}
      tooltip={
        hoverIndex !== null ? (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-fg">{categories[hoverIndex]}</span>
            {series.map((s, i) => (
              <div key={s.label} className="flex items-center gap-tight">
                <span aria-hidden className={cn("size-2 rounded-full", chartFill(s.token ?? chartColorToken(i)))} />
                <span className="tabular-nums font-medium">{valueFormat(s.data[hoverIndex] ?? 0)}</span>
                <span className="text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        ) : undefined
      }
    >
      {(ctx) => {
        const { plot, xScale, yScale, bandWidth, onHover } = ctx;
        const revealWidth = plot.width * p;

        // offsetX, not getBoundingClientRect(): SVG shape elements have no
        // CSS box of their own, so the browser resolves offsetX/Y relative
        // to the <svg> root's own viewport — correct regardless of any
        // ancestor CSS transform (Canvas/Camera), unlike a bounding-rect
        // subtraction which mixes transformed and untransformed spaces.
        function handleMove(offsetX: number) {
          const relX = offsetX - plot.x;
          const idx = Math.max(0, Math.min(categories.length - 1, Math.round(relX / bandWidth - 0.5)));
          setHoverIndex(idx);
          onHover({ x: xScale(idx), y: plot.y + 8 });
        }

        return (
          <g>
            <defs>
              <clipPath id={clipId}>
                <rect x={plot.x} y={plot.y - 4} width={Math.max(revealWidth, 0)} height={plot.height + 8} />
              </clipPath>
            </defs>
            {hoverIndex !== null && (
              <line
                x1={xScale(hoverIndex)}
                x2={xScale(hoverIndex)}
                y1={plot.y}
                y2={plot.y + plot.height}
                className="stroke-border"
                strokeWidth={1}
              />
            )}
            <g clipPath={`url(#${clipId})`}>
              {series.map((s, si) => {
                const token = s.token ?? chartColorToken(si);
                const points = s.data.map((v, i) => ({ x: xScale(i), y: yScale(v) }));
                const linePath = buildPath(points);
                const areaPath = area
                  ? `${linePath} L ${points[points.length - 1]?.x ?? plot.x} ${yScale(0)} L ${points[0]?.x ?? plot.x} ${yScale(0)} Z`
                  : "";
                return (
                  <g key={s.label}>
                    {area && <path d={areaPath} className={cn(chartFill(token), "opacity-10")} stroke="none" />}
                    <path d={linePath} className={cn("fill-none", chartStroke(token))} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                    {showPoints &&
                      points.map((pt, i) => (
                        <circle
                          key={i}
                          cx={pt.x}
                          cy={pt.y}
                          r={4}
                          className={cn(chartFill(token), "stroke-surface")}
                          strokeWidth={2}
                        />
                      ))}
                  </g>
                );
              })}
            </g>
            <rect
              x={plot.x}
              y={plot.y}
              width={plot.width}
              height={plot.height}
              fill="transparent"
              onPointerMove={(e) => handleMove(e.nativeEvent.offsetX)}
              onPointerLeave={() => {
                setHoverIndex(null);
                onHover(null);
              }}
            />
          </g>
        );
      }}
    </ChartFrame>
  );
}
LineChart.displayName = "LineChart";

export { LineChart };
