// Chart-type dispatch, split out of ChartScene.tsx purely for length
// (AGENTS.md §2's 250-line guideline) — this file's only job is picking the
// right existing chart component for `ChartSpec.type` and wiring
// series/slice filtering + `progress` + `focus` through to it. No chart
// logic of its own.

import { BarChart } from "../../ui/bar-chart";
import { LineChart } from "../../ui/line-chart";
import { PieChart } from "../../ui/pie-chart";
import { Gauge } from "../../ui/gauge";
import { Heatmap } from "../../ui/heatmap";
import { ScatterPlot } from "../../ui/scatter-plot";
import { Funnel } from "../../ui/funnel";
import { resolveValueFormat } from "../format";
import type { ChartSpec } from "../schema";

export interface ChartRenderProps {
  chart: ChartSpec;
  title?: string;
  subtitle?: string;
  /** Series/slice labels currently revealed. `undefined` = every series
   * (the chart never stages a `series` reveal). Only meaningful for the
   * three chart types that have a series/slice concept — see
   * `seriesLabelsOf` in `validate.charts.ts`, which this mirrors. */
  revealedLabels: string[] | undefined;
  progress: number;
  /** Category label to spotlight. Only `bar`/`line` currently support
   * dimming (the two chart types `ChartStep.focus` validates against —
   * `validate.charts.ts`'s own `categorySet` is only built for those two). */
  focus?: string;
}

export function ChartRender({ chart, title, subtitle, revealedLabels, progress, focus }: ChartRenderProps) {
  const format = resolveValueFormat(chart.type === "pie" ? undefined : chart.format);

  switch (chart.type) {
    case "bar": {
      const series = revealedLabels ? chart.series.filter((s) => revealedLabels.includes(s.label)) : chart.series;
      return (
        <BarChart
          categories={chart.categories} series={series} orientation={chart.orientation} mode={chart.mode}
          valueFormat={format} progress={progress} focus={focus} title={title} subtitle={subtitle}
        />
      );
    }
    case "line": {
      const series = revealedLabels ? chart.series.filter((s) => revealedLabels.includes(s.label)) : chart.series;
      return (
        <LineChart
          categories={chart.categories} series={series} area={chart.area} showPoints={chart.points}
          valueFormat={format} progress={progress} focus={focus} title={title} subtitle={subtitle}
        />
      );
    }
    case "pie": {
      const slices = revealedLabels ? chart.slices.filter((s) => revealedLabels.includes(s.label)) : chart.slices;
      return (
        <PieChart
          slices={slices} innerRadius={chart.donut ? 0.6 : 0} centerLabel={chart.centerLabel}
          centerValue={chart.centerValue} progress={progress} title={title}
        />
      );
    }
    case "gauge":
      return (
        <Gauge
          value={chart.value} min={chart.min} max={chart.max} bands={chart.bands} label={chart.label ?? title}
          valueFormat={format} progress={progress}
        />
      );
    case "heatmap":
      return (
        <Heatmap
          xLabels={chart.columns} yLabels={chart.rows} values={chart.values}
          valueFormat={format} progress={progress} title={title} subtitle={subtitle}
        />
      );
    case "scatter": {
      const series = revealedLabels ? chart.series.filter((s) => revealedLabels.includes(s.label)) : chart.series;
      return (
        <ScatterPlot
          series={series} trendLine={chart.trend} xFormat={format} yFormat={format}
          progress={progress} title={title} subtitle={subtitle}
        />
      );
    }
    case "funnel":
      return <Funnel stages={chart.stages} valueFormat={format} progress={progress} title={title} subtitle={subtitle} />;
    default: {
      const exhaustive: never = chart;
      throw new Error(`ChartRender: unhandled chart type ${(exhaustive as ChartSpec).type}`);
    }
  }
}
