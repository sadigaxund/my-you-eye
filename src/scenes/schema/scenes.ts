// The `Scene` discriminated union — the shape a consuming project actually
// writes. Split across three files purely for length (AGENTS.md §2's 250-line
// guideline): the content scenes live here, diagram/sequence in
// `scenes.diagram.ts`, chart/stat in `scenes.data.ts`.

import type { SceneBase, StepBase, LineRange, CodeAnnotation, PercentPoint, PercentRect } from "./steps";
import type { DiagramScene, SequenceScene } from "./scenes.diagram";
import type { ChartScene, StatScene } from "./scenes.data";

export type SceneKind =
  | "title"
  | "bullets"
  | "code"
  | "terminal"
  | "diagram"
  | "sequence"
  | "chart"
  | "stat"
  | "compare"
  | "walkthrough"
  | "outro";

/** Opening/chapter card. A single beat — its duration comes from how much
 * text it carries. */
export interface TitleScene extends SceneBase {
  kind: "title";
  title: string;
  subtitle?: string;
  /** Eyebrow above the title, e.g. "Part 3" or "01". */
  chapter?: string;
  align?: "center" | "left";
}

/** One bullet, revealed as its own step. Bullets *are* the steps here —
 * there is no separate `steps` array to keep in sync with the content. */
export interface BulletItem extends StepBase {
  text: string;
  /** Sub-points revealed together with their parent. */
  children?: string[];
  /** Marks the bullet that lands the point. Default "none". */
  emphasis?: "none" | "strong";
}

export interface BulletScene extends SceneBase {
  kind: "bullets";
  heading?: string;
  bullets: BulletItem[];
}

export interface CodeStep extends StepBase {
  /** Lines to focus. Everything else dims and the camera frames the range. */
  focus?: LineRange;
  /** Substrings inside the focused lines to highlight inline. Matched
   * literally, not as a regex. */
  highlight?: string[];
  /** Replaces the source for this step. Rendered as an animated diff from
   * whatever was on screen before it — that diff is the whole reason to
   * split a walkthrough into steps rather than showing the final file. */
  code?: string;
  /** Types the source in character by character instead of cutting to it.
   * Meaningful on the first step, or on any step that supplies `code`. */
  typed?: boolean;
  /** Leader-line callouts pinned to source lines. */
  annotate?: CodeAnnotation[];
}

export interface CodeScene extends SceneBase {
  kind: "code";
  /** Source shown before the first step runs. */
  code: string;
  /** Language id for the highlighter, e.g. "ts", "tsx", "python". */
  lang?: string;
  /** Filename shown in the header tab. */
  file?: string;
  /** Show the line-number gutter. Default true. */
  lineNumbers?: boolean;
  steps: CodeStep[];
}

/** One terminal entry, revealed as its own step: the command types in, then
 * its output appears. */
export interface TerminalStep extends StepBase {
  /** Command typed after the prompt. Omit for an output-only entry (a banner,
   * a log tail). */
  command?: string;
  /** Output body shown under the command. */
  output?: string;
  /** Language id for highlighting `output`. */
  language?: string;
  /** Process exit code — renders a badge (0 reads success, non-zero danger). */
  exitCode?: number;
  /** Shows a spinner with this label while the step runs, before `output`
   * lands. For a step that should read as "this takes a while". */
  spinner?: string;
  /**
   * Per-entry overrides of the prompt chrome — each independently
   * optional, and each PERSISTS to every following entry until overridden
   * again, mirroring `Terminal`'s own per-entry override semantics (a
   * real shell's `cd`/`ssh` changes the prompt for every command after
   * it, not just that one line). Falls back to the scene-level prop of
   * the same name when never set by any entry up to this point.
   */
  cwd?: string;
  user?: string;
  host?: string;
  promptGlyph?: "$" | ">" | "#" | "❯";
}

export interface TerminalScene extends SceneBase {
  kind: "terminal";
  entries: TerminalStep[];
  cwd?: string;
  user?: string;
  host?: string;
  /** Caption for the window title bar. Defaults to `cwd`. */
  title?: string;
  prompt?: "$" | ">" | "#" | "❯";
  /** Color decorator — forwarded to `Terminal`'s `scheme`. Default "default". */
  scheme?: "default" | "matrix" | "amber";
  /** Window-chrome decorator — forwarded to `Terminal`'s `chrome`. Default "dots". */
  chrome?: "dots" | "none";
  /**
   * Fixed visible height in lines — forwarded to `Terminal`'s `rows`
   * (owner feedback: "the size of terminal does not really change, but
   * the content just gets scrolled up as something gets added"). Omit
   * for the previous grows-with-content behavior.
   */
  rows?: number;
}

/** One side of a `compare` scene. A discriminated union rather than four
 * optional fields, so "which one did I fill in?" isn't a runtime question. */
export type ComparePane =
  | { content: "code"; label: string; code: string; lang?: string }
  | { content: "text"; label: string; text: string }
  | { content: "image"; label: string; src: string; alt?: string };

export interface CompareScene extends SceneBase {
  kind: "compare";
  /** "columns" sets them side by side; "wipe" overlays them under a divider
   * that sweeps across. Default "columns". */
  mode?: "columns" | "wipe";
  heading?: string;
  before: ComparePane;
  after: ComparePane;
  /** Narration for the reveal of `after`. */
  say?: string;
}

export interface WalkthroughStep extends StepBase {
  /** Where the cursor travels to, in percent of the frame. */
  to?: PercentPoint;
  /** What the cursor does on arrival. Default "none". */
  action?: "none" | "click" | "double-click" | "drag";
  /** Text typed after the action lands. */
  type?: string;
  /** Region to spotlight — everything outside it dims. */
  spotlight?: PercentRect;
  /** Callout pinned at the cursor. */
  annotate?: string;
}

/** A simulated UI walkthrough: a screenshot in a device frame, with a fake
 * cursor driven step by step. The alternative to a screen recording. */
export interface WalkthroughScene extends SceneBase {
  kind: "walkthrough";
  /** Chrome drawn around the screenshot. Default "browser". */
  frame?: "browser" | "window" | "phone";
  /** Image rendered inside the frame — a URL or a data URI. */
  image: string;
  /** Address shown in the browser chrome. */
  url?: string;
  /** Caption for window/phone chrome. */
  title?: string;
  steps: WalkthroughStep[];
}

export interface OutroLink {
  label: string;
  url: string;
}

export interface OutroScene extends SceneBase {
  kind: "outro";
  title?: string;
  subtitle?: string;
  links?: OutroLink[];
  /** Closing call to action, e.g. "Subscribe for part 4". */
  cta?: string;
}

export type Scene =
  | TitleScene
  | BulletScene
  | CodeScene
  | TerminalScene
  | DiagramScene
  | SequenceScene
  | ChartScene
  | StatScene
  | CompareScene
  | WalkthroughScene
  | OutroScene;
