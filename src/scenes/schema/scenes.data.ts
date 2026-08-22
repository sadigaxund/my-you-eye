// Chart + stat scene data.
//
// `ChartSpec` aliases the chart components' own series types rather than
// redeclaring them — they are already plain, JSON-serializable data, so
// there is exactly one definition of "a bar series" in the codebase. What
// the scene layer does NOT forward is every chart's `valueFormat?: (n) =>
// string` and `className`: a function isn't serializable and a className is
// the escape hatch this schema exists to close. Numbers are formatted by
// naming a `NumberFormat` instead, resolved against `src/lib/format.ts` —
// the same formatter `CellType` and `CountUp` already share.

import type { SceneBase, StepBase, NumberFormat } from "./steps";
import type { BarChartSeries } from "../../ui/bar-chart";
import type { LineChartSeries } from "../../ui/line-chart";
import type { PieChartSlice } from "../../ui/pie-chart";
import type { GaugeThresholdBand } from "../../ui/gauge";
import type { ScatterSeries } from "../../ui/scatter-plot";
import type { FunnelStage } from "../../ui/funnel";

export type ChartSpec =
  | {
      type: "bar";
      categories: string[];
      series: BarChartSeries[];
      orientation?: "vertical" | "horizontal";
      /** Only meaningful with 2+ series. Default "grouped". */
      mode?: "grouped" | "stacked";
      format?: NumberFormat;
    }
  | {
      type: "line";
      categories: string[];
      series: LineChartSeries[];
      /** Wash under each line. Default false. */
      area?: boolean;
      /** Marker dot at every point. Default true. */
      points?: boolean;
      format?: NumberFormat;
    }
  | {
      type: "pie";
      slices: PieChartSlice[];
      /** Cuts a donut hole. Default false. */
      donut?: boolean;
      centerLabel?: string;
      centerValue?: string;
    }
  | {
      type: "gauge";
      value: number;
      min?: number;
      max?: number;
      /** Threshold bands, ascending by `upTo`. */
      bands?: GaugeThresholdBand[];
      label?: string;
      format?: NumberFormat;
    }
  | {
      type: "heatmap";
      /** Column labels. */
      columns: string[];
      /** Row labels. */
      rows: string[];
      /** Row-major: `values[row][column]`. */
      values: number[][];
      format?: NumberFormat;
    }
  | {
      type: "scatter";
      series: ScatterSeries[];
      /** Least-squares trend line through all series pooled. */
      trend?: boolean;
      format?: NumberFormat;
    }
  | {
      type: "funnel";
      /** Stages in order, first = widest. */
      stages: FunnelStage[];
      format?: NumberFormat;
    };

export interface ChartStep extends StepBase {
  /** Series labels revealed on this step. Omitted on every step means the
   * whole chart draws on over the scene's first step. */
  series?: string[];
  /** A number to pull out as a counted-up callout while this step runs. */
  callout?: {
    value: number;
    label: string;
    format?: NumberFormat;
  };
  /** Category label to spotlight — its bar/point/slice stays lit and the
   * rest dim. */
  focus?: string;
}

export interface ChartScene extends SceneBase {
  kind: "chart";
  title?: string;
  subtitle?: string;
  chart: ChartSpec;
  /** Omit for a single-beat scene that just draws the chart on. */
  steps?: ChartStep[];
}

/** One KPI tile. Revealed as its own step, so a stat scene reads as a
 * sequence of claims rather than a wall of numbers. */
export interface StatItem extends StepBase {
  label: string;
  /** Numeric target — counted up from zero. */
  value?: number;
  /** Non-numeric value ("Healthy", "us-east-1"). Use instead of `value`. */
  text?: string;
  format?: NumberFormat;
  /** Change against the previous period, signed. */
  delta?: number;
  /** Whether a positive `delta` should read as good. Default true — set
   * false for metrics like latency or error rate. */
  positiveIsGood?: boolean;
  /** Trend series drawn as an inline sparkline. */
  sparkline?: number[];
}

export interface StatScene extends SceneBase {
  kind: "stat";
  heading?: string;
  stats: StatItem[];
  /** Tiles per row at the widest breakpoint. Default 4. */
  columns?: 2 | 3 | 4 | 5 | 6;
}
