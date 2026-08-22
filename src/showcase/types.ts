import type { ReactNode } from "react";
import type { TexturedSurfaceProps } from "../ui/decorators/textured-surface";

export type ShowcaseGroup = "inputs" | "display" | "feedback" | "overlay" | "navigation" | "canvas" | "data" | "patterns" | "decorators" | "typography" | "motion" | "charts" | "scenes";

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
  demos: ShowcaseDemo[];
}

/** One demo within an entry. Named separately so a showcase whose demos no
 * longer fit the 250-line file guideline can move a coherent group of them
 * into a sibling file and spread it back into `demos`. */
export interface ShowcaseDemo {
  name: string;
  description?: string;
  render: () => ReactNode;
  layout?: "fill" | "center";
  overflow?: "visible" | "auto" | "hidden";
  /**
   * Demo cards carry `contain: paint` so an animating or hovering preview
   * never repaints through the page's textured/backdrop-filtered background.
   * Paint containment also makes the card the containing block for `position:
   * fixed` descendants and clips them to it — correct for every demo whose
   * content lives inside its own box, wrong for one that deliberately renders
   * to a viewport corner (`Toast`'s `Toaster` viewport is the only such demo
   * in the library). Set `contain: false` there. Default true.
   */
  contain?: boolean;
}
