import type { ReactNode } from "react";
import type { TexturedSurfaceProps } from "../ui/patterns/textured-surface";

export type ShowcaseGroup = "inputs" | "display" | "feedback" | "overlay" | "navigation" | "canvas" | "data" | "patterns" | "typography";

/**
 * The showcase's theme-selector state, threaded down through App → Sidebar /
 * ComponentPage → DemoSection → TexturedSurface. It genuinely varies (not
 * always "theme"): `handleThemeChange` in App.tsx sets it to
 * `"frosted-glass"` / `"brushed-aluminium"` for the Glass/Metallic themes
 * and `"theme"` otherwise, mirroring TexturedSurface's own `texture` union.
 */
export type ShowcaseTexture = NonNullable<TexturedSurfaceProps["texture"]>;

export interface ShowcaseEntry {
  title: string;
  group: ShowcaseGroup;
  /**
   * Optional sidebar section name. Entries that share the same `parent`
   * value are presented as one consolidated sidebar item (e.g. "Table")
   * whose page shows every member entry's demos, one after another —
   * while each entry keeps its own showcase file and stays independently
   * discoverable by `check-showcase.mjs`. Purely a presentation grouping;
   * does not change `group` or require any special-casing per component.
   */
  parent?: string;
  /** Short one/two-sentence blurb shown under the title in the docs main pane. Optional. */
  description?: string;
  demos: { name: string; description?: string; render: () => ReactNode; layout?: "fill" | "center"; overflow?: "visible" | "auto" | "hidden" }[];
}
