import type { ChartColorToken } from "./chart-tokens";

export interface ChartFrameLegendItem {
  label: string;
  token: ChartColorToken;
}

/** Everything a chart's render-prop needs to draw its marks without
 * re-deriving axis/scale math — see ChartFrame's doc comment. */
export interface ChartFrameRenderCtx {
  /** Full SVG pixel width (0 before the container has been measured). */
  width: number;
  /** Full SVG pixel height (fixed, includes the axis band). */
  height: number;
  /** The plot area in SVG user units, inset for the axis bands. */
  plot: { x: number; y: number; width: number; height: number };
  /** Center-x (px) of category band `index`, out of `xLabels.length` bands. */
  xScale: (index: number) => number;
  /** Pixel-y for a data value, linearly mapped over the y-domain. */
  yScale: (value: number) => number;
  /** Width (px) of one category band — `plot.width / xLabels.length`. */
  bandWidth: number;
  /** Chart marks call this on pointer enter/move/leave to drive
   * ChartFrame's shared tooltip layer. Pass `null` to hide. */
  onHover: (point: { x: number; y: number } | null) => void;
}
