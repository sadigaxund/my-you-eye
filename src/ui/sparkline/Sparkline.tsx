import { useId } from "react";
import { cn } from "../../lib/cn";
import { chartFill, chartStroke } from "../patterns/chart-frame";
import type { ChartColorToken } from "../patterns/chart-frame";

export interface SparklineProps {
  /** Plain numeric series — no axes, no categories (feeds StatCard's inline trend slot). */
  data: number[];
  token?: ChartColorToken;
  area?: boolean;
  /** SVG pixel width. Default 96. */
  width?: number;
  /** SVG pixel height. Default 24. */
  height?: number;
  /** 0→1 draw-on progress. Omitted or 1 = fully drawn — the line reveals
   * left-to-right via a clip rect, same mechanism as LineChart. */
  progress?: number;
  className?: string;
}

const PAD = 2;

function Sparkline({
  data,
  token = "chart-1",
  area = false,
  width = 96,
  height = 24,
  progress = 1,
  className,
}: SparklineProps) {
  const clipId = useId();
  const p = Math.max(0, Math.min(1, progress));
  if (data.length < 2) {
    return <svg width={width} height={height} className={className} aria-hidden />;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const plotW = width - PAD * 2;
  const plotH = height - PAD * 2;
  const points = data.map((v, i) => ({
    x: PAD + (i / (data.length - 1)) * plotW,
    y: PAD + plotH - ((v - min) / span) * plotH,
  }));
  const linePath = points.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ");
  const baseY = PAD + plotH;
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;
  const revealWidth = plotW * p;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn("overflow-visible", className)} role="img" aria-label="trend">
      <clipPath id={clipId}>
        <rect x={0} y={0} width={Math.max(revealWidth + PAD, 0)} height={height} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {area && <path d={areaPath} className={cn(chartFill(token), "opacity-10")} stroke="none" />}
        <path d={linePath} className={cn("fill-none", chartStroke(token))} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      </g>
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={2} className={chartFill(token)} opacity={p > 0.98 ? 1 : 0} />
    </svg>
  );
}
Sparkline.displayName = "Sparkline";

export { Sparkline };
