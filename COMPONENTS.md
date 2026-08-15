# Components

> Auto-generated from `*.showcase.tsx` and `src/scenes/schema/*.ts` by `scripts/gen-manifest.mjs`. Do not edit by hand.

Import from whichever subpath matches what you need:

```tsx
import { Button, Card } from "my-you-eye";
import { Reveal, Stagger } from "my-you-eye/motion";
import { CodeScene, DiagramScene, SceneRenderer } from "my-you-eye/scenes";
import { Presenter, SpeakerView, useSteps } from "my-you-eye/present";
import { PlayerEmbed } from "my-you-eye/present/player";
import { VideoRoot } from "my-you-eye/video";
import "my-you-eye/styles.css";
```

**114 components** across 12 groups and 4 tiers (`ui` / `motion` / `scenes` / `present`).

## Video schema

`my-you-eye/scenes` is the entire authoring surface for a video: one `Video` object, described field-by-field below. Nothing in this schema is a `className`, `style`, color, frame count, or pixel coordinate — appearance and pacing are the library's job, not the caller's (TODO.md D5). `<VideoRoot video={video} />` (`my-you-eye/video`) renders it to MP4; `<Presenter video={video} />` / `<PlayerEmbed video={video} />` (`my-you-eye/present`, `my-you-eye/present/player`) render the same object live, with identical pacing.

### `Video`

| Field | Type | Description |
|---|---|---|
| `meta?` | `VideoMeta` | — |
| `scenes` | `Scene[]` | — |

### `VideoMeta` (`Video.meta`)

| Field | Type | Description |
|---|---|---|
| `fps?` | `24 \| 30 \| 60` | Frames per second. Default 30. |
| `size?` | `VideoSize` | Output dimensions. Default "1080p". |
| `theme?` | `VideoTheme` | Theme profile. Default "default". |
| `appearance?` | `"light" \| "dark"` | Light or dark rendering of the chosen theme. Default "dark" — video content is watched on a bright screen in a dark room far more often than the reverse. |
| `font?` | `FontMode` | Typeface set, from the same list the showcase's font picker uses. Default "sans". |
| `title?` | `string` | Video title. Used for the Remotion composition id and the presenter's document title; never rendered into a frame (author a `title` scene for that). |
| `watermark?` | `string` | Persistent corner handle/watermark, e.g. "@yourchannel". |
| `progressBar?` | `boolean` | Thin progress bar along the bottom edge of every frame. Default true. |
| `chapters?` | `boolean` | Chapter markers derived from `title` scenes. Default true. |

### Fields every scene accepts (`SceneBase`)

| Field | Type | Description |
|---|---|---|
| `id?` | `string` | Stable id — used for chapter markers, presenter deep-links, and to name the scene in validation errors. Derived from the index when omitted. |
| `pace?` | `Pace` | Coarse pacing for every step in this scene. Default "normal". This is the only timing dial: everything else is derived from how much you wrote in `say`. |
| `transition?` | `SceneTransition` | Transition into this scene from the previous one. Default "fade". |
| `notes?` | `string` | Speaker-view note for the scene as a whole. Never rendered on screen. |

### Fields every step accepts (`StepBase`)

| Field | Type | Description |
|---|---|---|
| `id?` | `string` | Stable id. Auto-derived from the step's index when omitted; only worth setting for a step you want to deep-link to from the presenter. |
| `say?` | `string` | The narration line for this step. It does three jobs at once: speaker-view script, the content-length input that derives this step's duration (longer line → longer step), and the reserved anchor for narration/TTS timing later (TODO.md Phase G). Writing it is how you control pacing — there is no duration field. |
| `hold?` | `Beat` | Extra hold after the step's animation finishes, before the next step begins. For letting a reveal land. |
| `caption?` | `string` | Lower-third caption rendered on screen for this step's duration. Use for a key term, not for a transcript of `say`. |

### Scene kinds

Each `Video.scenes[]` entry is one of these eleven, discriminated by `kind`. Every scene's own fields are listed below IN ADDITION to `SceneBase` above; every step type's own fields are listed IN ADDITION to `StepBase` above.

#### `kind: "title"` — `TitleScene`

| Field | Type | Description |
|---|---|---|
| `kind` | `"title"` | — |
| `title` | `string` | — |
| `subtitle?` | `string` | — |
| `chapter?` | `string` | Eyebrow above the title, e.g. "Part 3" or "01". |
| `align?` | `"center" \| "left"` | — |

#### `kind: "bullets"` — `BulletScene`

| Field | Type | Description |
|---|---|---|
| `kind` | `"bullets"` | — |
| `heading?` | `string` | — |
| `bullets` | `BulletItem[]` | — |

Step (`BulletItem`):

| Field | Type | Description |
|---|---|---|
| `text` | `string` | — |
| `children?` | `string[]` | Sub-points revealed together with their parent. |
| `emphasis?` | `"none" \| "strong"` | Marks the bullet that lands the point. Default "none". |

#### `kind: "code"` — `CodeScene`

| Field | Type | Description |
|---|---|---|
| `kind` | `"code"` | — |
| `code` | `string` | Source shown before the first step runs. |
| `lang?` | `string` | Language id for the highlighter, e.g. "ts", "tsx", "python". |
| `file?` | `string` | Filename shown in the header tab. |
| `lineNumbers?` | `boolean` | Show the line-number gutter. Default true. |
| `steps` | `CodeStep[]` | — |

Step (`CodeStep`):

| Field | Type | Description |
|---|---|---|
| `focus?` | `LineRange` | Lines to focus. Everything else dims and the camera frames the range. |
| `highlight?` | `string[]` | Substrings inside the focused lines to highlight inline. Matched literally, not as a regex. |
| `code?` | `string` | Replaces the source for this step. Rendered as an animated diff from whatever was on screen before it — that diff is the whole reason to split a walkthrough into steps rather than showing the final file. |
| `typed?` | `boolean` | Types the source in character by character instead of cutting to it. Meaningful on the first step, or on any step that supplies `code`. |
| `annotate?` | `CodeAnnotation[]` | Leader-line callouts pinned to source lines. |

#### `kind: "terminal"` — `TerminalScene`

| Field | Type | Description |
|---|---|---|
| `kind` | `"terminal"` | — |
| `entries` | `TerminalStep[]` | — |
| `cwd?` | `string` | — |
| `user?` | `string` | — |
| `host?` | `string` | — |
| `title?` | `string` | Caption for the window title bar. Defaults to `cwd`. |
| `prompt?` | `"$" \| ">" \| "#" \| "❯"` | — |
| `scheme?` | `"default" \| "matrix" \| "amber"` | Color decorator — forwarded to `Terminal`'s `scheme`. Default "default". |
| `chrome?` | `"dots" \| "none"` | Window-chrome decorator — forwarded to `Terminal`'s `chrome`. Default "dots". |
| `rows?` | `number` | Fixed visible height in lines — forwarded to `Terminal`'s `rows`. Defaults to 12: a scene draws into a fixed video frame, so the terminal always holds a constant height and scrolls its content rather than growing as it types. This only tunes how tall it holds. |

Step (`TerminalStep`):

| Field | Type | Description |
|---|---|---|
| `command?` | `string` | Command typed after the prompt. Omit for an output-only entry (a banner, a log tail). |
| `output?` | `string` | Output body shown under the command. |
| `language?` | `string` | Language id for highlighting `output`. |
| `exitCode?` | `number` | Process exit code — renders a plain status line (0 reads success, non-zero danger). |
| `spinner?` | `string` | Shows a spinner with this label while the step runs, before `output` lands. For a step that should read as "this takes a while". |
| `cwd?` | `string` | Per-entry overrides of the prompt chrome — each independently optional, and each PERSISTS to every following entry until overridden again, mirroring `Terminal`'s own per-entry override semantics (a real shell's `cd`/`ssh` changes the prompt for every command after it, not just that one line). Falls back to the scene-level prop of the same name when never set by any entry up to this point. |
| `user?` | `string` | — |
| `host?` | `string` | — |
| `promptGlyph?` | `"$" \| ">" \| "#" \| "❯"` | — |

#### `kind: "diagram"` — `DiagramScene`

| Field | Type | Description |
|---|---|---|
| `kind` | `"diagram"` | — |
| `preset?` | `DiagramPreset` | Default "architecture". |
| `title?` | `string` | — |
| `nodes` | `DiagramNode[]` | — |
| `edges` | `DiagramEdge[]` | — |
| `groups?` | `DiagramGroup[]` | — |
| `layout?` | `DiagramLayout` | Overrides the preset's default placement strategy. |
| `steps` | `DiagramStep[]` | — |

Step (`DiagramStep`):

| Field | Type | Description |
|---|---|---|
| `reveal?` | `string[]` | Node and group ids that appear on this step. Anything never named in any step's `reveal` is present from the first frame. |
| `connect?` | `string[]` | Edge ids whose line draws on this step. |
| `flow?` | `string[]` | Edge ids that carry animated flow tokens for this step's duration — the "watch the request travel" beat. |
| `focus?` | `string[]` | Node ids to spotlight; everything else dims. |
| `annotate?` | `DiagramAnnotation[]` | Leader-line callouts pinned to nodes. |

#### `kind: "sequence"` — `SequenceScene`

| Field | Type | Description |
|---|---|---|
| `kind` | `"sequence"` | — |
| `title?` | `string` | — |
| `participants` | `SequenceParticipantSpec[]` | — |
| `messages` | `SequenceStep[]` | Ordered messages and notes. Order is both the vertical stacking order and the reveal order. Activation bars are derived from it. |

Step variant (`SequenceMessageStep`):

| Field | Type | Description |
|---|---|---|
| `type` | `"message"` | — |
| `from` | `string` | Participant id the message leaves from. |
| `to` | `string` | Participant id it arrives at. Equal to `from` draws a self-call loop. |
| `label?` | `string` | — |
| `kind?` | `"sync" \| "async" \| "data" \| "error"` | Default "sync". Use "data" for a return/reply and "error" for a failure path — that is what makes the diagram readable at a glance. |

Step variant (`SequenceNoteStep`):

| Field | Type | Description |
|---|---|---|
| `type` | `"note"` | — |
| `text` | `string` | — |
| `on` | `string[]` | Participant ids the note attaches to. One anchors it to that lane; two or more span from the leftmost to the rightmost. |

#### `kind: "chart"` — `ChartScene`

| Field | Type | Description |
|---|---|---|
| `kind` | `"chart"` | — |
| `title?` | `string` | — |
| `subtitle?` | `string` | — |
| `chart` | `ChartSpec` | — |
| `steps?` | `ChartStep[]` | Omit for a single-beat scene that just draws the chart on. |

Step (`ChartStep`):

| Field | Type | Description |
|---|---|---|
| `series?` | `string[]` | Series labels revealed on this step. Omitted on every step means the whole chart draws on over the scene's first step. |
| `callout?` | `{ value: number; label: string; format?: NumberFormat; }` | A number to pull out as a counted-up callout while this step runs. |
| `focus?` | `string` | Category label to spotlight — its bar/point/slice stays lit and the rest dim. |

#### `kind: "stat"` — `StatScene`

| Field | Type | Description |
|---|---|---|
| `kind` | `"stat"` | — |
| `heading?` | `string` | — |
| `stats` | `StatItem[]` | — |
| `columns?` | `2 \| 3 \| 4 \| 5 \| 6` | Tiles per row at the widest breakpoint. Default 4. |

Step (`StatItem`):

| Field | Type | Description |
|---|---|---|
| `label` | `string` | — |
| `value?` | `number` | Numeric target — counted up from zero. |
| `text?` | `string` | Non-numeric value ("Healthy", "us-east-1"). Use instead of `value`. |
| `format?` | `NumberFormat` | — |
| `delta?` | `number` | Change against the previous period, signed. |
| `positiveIsGood?` | `boolean` | Whether a positive `delta` should read as good. Default true — set false for metrics like latency or error rate. |
| `sparkline?` | `number[]` | Trend series drawn as an inline sparkline. |

#### `kind: "compare"` — `CompareScene`

| Field | Type | Description |
|---|---|---|
| `kind` | `"compare"` | — |
| `mode?` | `"columns" \| "wipe"` | "columns" sets them side by side; "wipe" overlays them under a divider that sweeps across. Default "columns". |
| `heading?` | `string` | — |
| `before` | `ComparePane` | — |
| `after` | `ComparePane` | — |
| `say?` | `string` | Narration for the reveal of `after`. |

`ComparePane`:

```ts
type ComparePane =
  | { content: "code"; label: string; code: string; lang?: string }
  | { content: "text"; label: string; text: string }
  | { content: "image"; label: string; src: string; alt?: string };
```

#### `kind: "walkthrough"` — `WalkthroughScene`

| Field | Type | Description |
|---|---|---|
| `kind` | `"walkthrough"` | — |
| `frame?` | `"browser" \| "window" \| "phone"` | Chrome drawn around the screenshot. Default "browser". |
| `image` | `string` | Image rendered inside the frame — a URL or a data URI. |
| `url?` | `string` | Address shown in the browser chrome. |
| `title?` | `string` | Caption for window/phone chrome. |
| `steps` | `WalkthroughStep[]` | — |

Step (`WalkthroughStep`):

| Field | Type | Description |
|---|---|---|
| `to?` | `PercentPoint` | Where the cursor travels to, in percent of the frame. |
| `action?` | `"none" \| "click" \| "double-click" \| "drag"` | What the cursor does on arrival. Default "none". |
| `type?` | `string` | Text typed after the action lands. |
| `spotlight?` | `PercentRect` | Region to spotlight — everything outside it dims. |
| `annotate?` | `string` | Callout pinned at the cursor. |

#### `kind: "outro"` — `OutroScene`

| Field | Type | Description |
|---|---|---|
| `kind` | `"outro"` | — |
| `title?` | `string` | — |
| `subtitle?` | `string` | — |
| `links?` | `OutroLink[]` | — |
| `cta?` | `string` | Closing call to action, e.g. "Subscribe for part 4". |

## canvas

| Component | Tier | Variants (**default**) | Demos |
|---|---|---|---|
| `Annotation` | `my-you-eye` | — | Marker variants, Auto-flip near the container edge, Vertical sides (top/bottom), Progress reveal |
| `Canvas` | `my-you-eye` | — | Empty grid, Populated graph, Edge states |
| `ConnectionLayer` | `my-you-eye` | — | Many edges, one svg, Parallel edges (automatic bundling), Edge states share the same visual language as ConnectionLine |
| `ConnectionLine` | `my-you-eye` | — | Path variants, Edge states, Decorations (arrowheads + labels), Label positions, Label on a genuinely curved path, ConnectionLayer (one svg, many edges), Shape anchoring (from/to as a rect, not a point), Arrowhead shapes, Orthogonal routing avoids obstacles, Waypoints, Edge kind (semantic styling), Draw-on progress |
| `Graph` | `my-you-eye` | — | Pipeline editor (drag nodes, connect ports, delete selected) |
| `GraphGroup` | `my-you-eye` | border: **dashed** / solid | Architecture boundaries, Label placement |
| `GraphNode` | `my-you-eye` | variant: **default** / muted / selected / simple<br>shape: **box** / pill | Variants, Simple variant, Legacy ports on a tall node, Free-form body, Header variations, Accent bar color, Footer variations, Shape (state-machine pill), All variations together |
| `Port` | `my-you-eye` | side: **in** / out<br>state: connected / **default** / highlighted | States (circle), Socket shape — mounted on a border, Socket mount — outward vs inward, Socket shape — all states, Circle vs socket, side by side |

### canvas — props

#### `Annotation`

Also accepts everything from `Omit<HTMLAttributes<HTMLDivElement>, "children">`.

| Prop | Type | Description |
|---|---|---|
| `target` | `Point` | Point being annotated, in the same coordinate space as the nearest `position: relative` ancestor (e.g. a `Canvas`'s canvas-space, or a screenshot `Image`'s own pixel space). |
| `label` | `ReactNode` | — |
| `side?` | `"left" \| "right" \| "top" \| "bottom"` | Preferred side the label sits on. "left"/"right" (default "right") are auto-flipped near a container edge when `containerWidth` is given; "top"/"bottom" anchor the label directly above/below `target` instead (no auto-flip — there's no `containerHeight` prop to flip against, so a vertical leader alw… |
| `distance?` | `number` | Distance (px) from `target` to the label's near edge, before flip. |
| `marker?` | `"none" \| "arrow" \| "pin" \| ArrowheadShape` | Pointer-end decoration at `target`. |
| `leaderVariant?` | `Extract<ConnectionVariant, "straight" \| "stepped">` | Leader-line shape — reuses `connection-line/geometry.ts`'s own variant names (a subset: a callout leader is either direct or right-angled, never a curve). |
| `containerWidth?` | `number` | Width (px) of the space Annotation overlays — used only to flip the label to the opposite side of `target` before it would run past this edge. |
| `progress?` | `number` | 0→1 reveal progress, default 1. |
| `accentColor?` | `"primary" \| "success" \| "warning" \| "danger" \| "muted"` | — |

#### `Canvas`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`.

| Prop | Type | Description |
|---|---|---|
| `gridSize?` | `number` | — |
| `initialZoom?` | `number` | — |
| `minZoom?` | `number` | — |
| `maxZoom?` | `number` | — |
| `zoomStep?` | `number` | — |
| `controls?` | `ReactNode` | — |
| `onBackgroundClick?` | `() => void` | — |
| `offset?` | `{ x: number; y: number }` | — |
| `zoom?` | `number` | — |
| `onOffsetChange?` | `(o: { x: number; y: number }) => void` | — |
| `onZoomChange?` | `(z: number) => void` | — |

#### `ConnectionLayer`

Also accepts everything from `Omit<SVGAttributes<SVGSVGElement>, "id">`.

| Prop | Type | Description |
|---|---|---|
| `edges` | `ConnectionLayerEdge[]` | Edges to render. |
| `bundleParallelEdges?` | `boolean` | Automatically nudges apart edges that share an endpoint pair (default true). |
| `autoLabelPlacement?` | `boolean` | Automatically searches for a label position clear of every other edge's path when an edge has a `label` but no explicit `labelPosition` (default true). |

#### `ConnectionLine`

Also accepts everything from `VariantProps<typeof connectionLineVariants>`.

| Prop | Type | Description |
|---|---|---|
| `from` | `EdgeEnd` | A bare `{x, y}` (the route starts exactly there), or an `AnchoredEnd` `{ rect, anchor?, inset? }` — a shape the edge attaches to. |
| `to` | `EdgeEnd` | — |
| `arrowhead?` | `ArrowheadProp` | `true` draws the default solid triangle; a shape name selects another terminator (`"open"`, `"circle"`, `"diamond"`, `"bar"`, `"crow"`, …). |
| `label?` | `string` | — |
| `labelPosition?` | `number` | Position along the actual rendered path (0–100), default 50 (midpoint). |
| `labelElevated?` | `boolean` | Toggles a subtle drop shadow on the label badge (default true). |
| `waypoints?` | `Point[]` | Points the route must pass through, in order, between `from` and `to`. |
| `obstacles?` | `ObstacleRect[]` | Rects an `orthogonal` route detours around. |
| `kind?` | `ConnectionKind` | Semantic edge type — see `KIND_STYLES`. |
| `offset?` | `number` | Perpendicular offset (px) applied to the whole route. |
| `progress?` | `number` | 0→1 draw-on progress (TODO.md D4's progress-in convention). |
| `className?` | `string` | — |

#### `Graph`

| Prop | Type | Description |
|---|---|---|
| `initialNodes` | `EditorNode[]` | — |
| `initialEdges?` | `EditorEdge[]` | — |
| `snapToGrid?` | `boolean` | — |
| `className?` | `string` | — |
| `controls?` | `ReactNode` | — |
| `onChange?` | `(state: { nodes: EditorNode[]; edges: EditorEdge[] }) => void` | — |

#### `GraphGroup`

Also accepts everything from `Omit<HTMLAttributes<HTMLDivElement>, "children">`, `VariantProps<typeof graphGroupVariants>`.

| Prop | Type | Description |
|---|---|---|
| `x` | `number` | Canvas-space position/size, same coordinate space as `GraphNode`'s `x`/`y`. |
| `y` | `number` | — |
| `width` | `number` | — |
| `height` | `number` | — |
| `label?` | `ReactNode` | — |
| `icon?` | `ReactNode` | Icon shown before the label text. |
| `labelPlacement?` | `"top-left" \| "top-center" \| "top-right" \| "outside-top"` | Where the label chip sits relative to the region. "top-left" (default) is the usual choice for architecture diagrams ("VPC", "Cluster", …). "outside-top" floats the chip entirely above the box instead of inset, for when the group's own top-left corner needs to stay clear (e.g. a node is positioned … |
| `accentColor?` | `"primary" \| "success" \| "warning" \| "danger" \| "muted"` | — |

#### `GraphNode`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`, `VariantProps<typeof graphNodeVariants>`.

| Prop | Type | Description |
|---|---|---|
| `x` | `number` | — |
| `y` | `number` | — |
| `header?` | `ReactNode` | — |
| `accent?` | `boolean` | — |
| `ports?` | `PortDef[]` | — |
| `footer?` | `ReactNode` | — |
| `rows?` | `GraphNodeRow[]` | — |
| `headerIcon?` | `ReactNode` | Icon shown at the start of the header, before the title — rendered in a small tinted tile in `accentColor`. |
| `headerStatus?` | `ReactNode` | Status/badge slot shown at the end of the header, after the title — e.g. a `StatusDot` or `Badge`. |
| `subtitle?` | `ReactNode` | Second, muted line under the header title. |
| `headerDots?` | `boolean` | Mac-style red/amber/green window buttons at the start of the header. **Off by default**, and deliberately so: they are the chrome of a macOS window, and on a service/queue/database node they say nothing — three decorations sitting in the one place a reader looks first (owner: "they kinda feel rando… |
| `accentColor?` | `"primary" \| "success" \| "warning" \| "danger" \| "muted"` | Accent bar color, only visible when `accent` is true. |
| `footerMetric?` | `ReactNode` | Metric/count shown at the end of the footer row (e.g. "42 items"). |
| `footerAction?` | `ReactNode` | Small action slot (e.g. a `Button`) at the end of the footer row, after `footerMetric` if both are given. |
| `footerProgress?` | `number` | 0–100 progress value rendered as a compact inline bar in the footer, alongside `footer`'s text. |

#### `Port`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`, `VariantProps<typeof portVariants>`.

| Prop | Type | Description |
|---|---|---|
| `label?` | `string` | — |
| `shape?` | `"circle" \| "socket"` | "circle" (default) renders a full disc — the original look, unchanged, for a freestanding port that isn't mounted on any edge (e.g. a legend swatch, or GraphNode's legacy `ports` prop which already floats beside the node with its own label). "socket" renders a true half-disc via SVG path geometry —… |
| `mount?` | `"outward" \| "inward"` | Which way a `socket`'s rounded half bulges, relative to the border it's mounted on. `"outward"` (default) bulges away from the node — correct for a freestanding mount where nothing clips it. `"inward"` bulges into the node. |

## charts

| Component | Tier | Variants (**default**) | Demos |
|---|---|---|---|
| `BarChart` | `my-you-eye` | — | Single series (vertical), Grouped, multi-series, Stacked, Horizontal, Horizontal, grouped, Long category label, Empty, Draw-on progress (50%), Focus a category |
| `ChartFrame` | `my-you-eye` | — | Axes, gridlines & a custom plot, Loading, Empty |
| `Funnel` | `my-you-eye` | — | Four stages, Two stages, Long stage labels, Empty, Draw-on progress (50%) |
| `Gauge` | `my-you-eye` | — | Basic, Threshold bands — healthy, Threshold bands — critical, Custom range, Long label, Draw-on progress (50%) |
| `Heatmap` | `my-you-eye` | — | Activity calendar, Single column, Long row label, Empty, Draw-on progress (50%) |
| `Legend` | `my-you-eye` | — | Rect swatches (bar / area fills), Line swatches, Dot swatches (scatter / points), Vertical orientation |
| `LineChart` | `my-you-eye` | — | Single series, Multi-series, Area fill, No point markers, Long category label, Empty, Draw-on progress (50%), Focus a category |
| `PieChart` | `my-you-eye` | — | Pie, Donut with center label, Single category (no legend), Long labels, Empty, Draw-on progress (50%) |
| `ScatterPlot` | `my-you-eye` | — | Single series, With trend line, Multi-series (3, all-pairs cap), Long point label (tooltip), Loading, Empty, Draw-on progress (50%) |
| `Sparkline` | `my-you-eye` | — | Basic, Area fill, Downward trend, danger token, Inside StatCard, Empty, Draw-on progress (50%) |

### charts — props

#### `BarChart`

| Prop | Type | Description |
|---|---|---|
| `categories` | `string[]` | One label per data point — the category axis. |
| `series` | `BarChartSeries[]` | — |
| `orientation?` | `"vertical" \| "horizontal"` | — |
| `mode?` | `"grouped" \| "stacked"` | Only meaningful with 2+ series. |
| `title?` | `string` | — |
| `subtitle?` | `string` | — |
| `height?` | `number` | — |
| `valueFormat?` | `(value: number) => string` | — |
| `progress?` | `number` | 0→1 draw-on progress. |
| `focus?` | `string` | Category label to spotlight — every other category's bars dim to `opacity-muted`. |
| `className?` | `string` | — |

#### `ChartFrame`

| Prop | Type | Description |
|---|---|---|
| `title?` | `string` | — |
| `subtitle?` | `string` | — |
| `height?` | `number` | Total SVG height in px, INCLUDING the x-axis band (dataviz rule: a fixed height must include the axis band, never just the plot). |
| `xLabels?` | `string[]` | Category labels for the x-axis. |
| `yTicks?` | `number[]` | Clean, already-rounded tick values for the y-axis (0 / 1,000 / 2,000…). |
| `yDomain?` | `[number, number]` | [min, max] the y-axis spans. |
| `formatYTick?` | `(value: number) => string` | — |
| `yAxisWidth?` | `number` | Explicit left-band width (px), reserved regardless of `yTicks`. |
| `legend?` | `ChartFrameLegendItem[]` | — |
| `loading?` | `boolean` | — |
| `empty?` | `boolean` | — |
| `emptyTitle?` | `string` | — |
| `emptyDescription?` | `string` | — |
| `children?` | `(ctx: ChartFrameRenderCtx) => ReactNode` | Optional because `loading` and `empty` short-circuit before the plot is ever rendered — a caller in either of those states has no marks to draw and was previously forced to pass a dummy render function to satisfy the type. |
| `tooltip?` | `ReactNode` | Tooltip content for the current hover target; ChartFrame owns positioning, the chart owns content and calls `onHover` from its marks. |
| `className?` | `string` | — |

#### `Funnel`

| Prop | Type | Description |
|---|---|---|
| `stages` | `FunnelStage[]` | Stages in order, first = the widest / entry stage. |
| `title?` | `string` | — |
| `subtitle?` | `string` | — |
| `valueFormat?` | `(value: number) => string` | — |
| `progress?` | `number` | 0→1 draw-on progress. |
| `className?` | `string` | — |

#### `Gauge`

| Prop | Type | Description |
|---|---|---|
| `value` | `number` | — |
| `min?` | `number` | — |
| `max?` | `number` | — |
| `bands?` | `GaugeThresholdBand[]` | Threshold bands, ascending by `upTo`. |
| `label?` | `string` | — |
| `valueFormat?` | `(value: number) => string` | — |
| `size?` | `number` | — |
| `progress?` | `number` | 0→1 draw-on progress. |
| `className?` | `string` | — |

#### `Heatmap`

| Prop | Type | Description |
|---|---|---|
| `xLabels` | `string[]` | Column labels (e.g. hours, days). |
| `yLabels` | `string[]` | Row labels (e.g. days, services). |
| `values` | `number[][]` | Row-major values: `values[row][col]`. |
| `title?` | `string` | — |
| `subtitle?` | `string` | — |
| `valueFormat?` | `(value: number) => string` | — |
| `progress?` | `number` | 0→1 draw-on progress. |
| `className?` | `string` | — |

#### `Legend`

Also accepts everything from `Omit<HTMLAttributes<HTMLUListElement>, "children">`.

| Prop | Type | Description |
|---|---|---|
| `items` | `LegendItem[]` | — |
| `swatch?` | `"rect" \| "line" \| "dot"` | Swatch shape — "rect" for bar/area fills, "line" for line series, "dot" for point/scatter series. |
| `orientation?` | `"horizontal" \| "vertical"` | — |

#### `LineChart`

| Prop | Type | Description |
|---|---|---|
| `categories` | `string[]` | — |
| `series` | `LineChartSeries[]` | — |
| `area?` | `boolean` | Fill the area under each line at a light wash. |
| `showPoints?` | `boolean` | Show a marker dot at every data point. |
| `title?` | `string` | — |
| `subtitle?` | `string` | — |
| `height?` | `number` | — |
| `valueFormat?` | `(value: number) => string` | — |
| `progress?` | `number` | 0→1 draw-on progress. |
| `focus?` | `string` | Category label to spotlight — every series' point marker at every other category dims to `opacity-muted` (the lines themselves, which span every category, stay at full opacity). |
| `className?` | `string` | — |

#### `PieChart`

| Prop | Type | Description |
|---|---|---|
| `slices` | `PieChartSlice[]` | — |
| `innerRadius?` | `number` | Donut hole radius as a fraction of the outer radius (0 = pie, default 0). |
| `centerLabel?` | `string` | Text shown at the center — only meaningful with `innerRadius > 0`. |
| `centerValue?` | `string` | — |
| `title?` | `string` | — |
| `size?` | `number` | — |
| `progress?` | `number` | 0→1 draw-on progress. |
| `className?` | `string` | — |

#### `ScatterPlot`

| Prop | Type | Description |
|---|---|---|
| `series` | `ScatterSeries[]` | — |
| `trendLine?` | `boolean` | Draw a linear least-squares trend line through every point (all series pooled). |
| `title?` | `string` | — |
| `subtitle?` | `string` | — |
| `height?` | `number` | — |
| `width?` | `number` | — |
| `xFormat?` | `(value: number) => string` | — |
| `yFormat?` | `(value: number) => string` | — |
| `loading?` | `boolean` | — |
| `progress?` | `number` | 0→1 draw-on progress. |
| `className?` | `string` | — |

#### `Sparkline`

| Prop | Type | Description |
|---|---|---|
| `data` | `number[]` | Plain numeric series — no axes, no categories (feeds StatCard's inline trend slot). |
| `token?` | `ChartColorToken` | — |
| `area?` | `boolean` | — |
| `width?` | `number` | SVG pixel width. |
| `height?` | `number` | SVG pixel height. |
| `progress?` | `number` | 0→1 draw-on progress. |
| `className?` | `string` | — |

## data

| Component | Tier | Variants (**default**) | Demos |
|---|---|---|---|
| `CellType` | `my-you-eye` | — | Data Types, New data types, Numeric types, Column alignment |
| `DataList` | `my-you-eye` | striped: **false** / true | Density (normal vs compact), Striped, Label width, Alignment, Scrolling |
| `DataTable` | `my-you-eye` | variant: **default** / striped<br>density: compact / **normal** | Default, Striped, Scrolling + sticky header, Alignment, Truncation |
| `Table` | `my-you-eye` | variant: **default** / striped | Composition, Variants, Density, Truncation & expand, Sticky header |
| `Timeline` | `my-you-eye` | — | Horizontal — single lane, Horizontal — lanes, Spans — events with a duration, Shared scale across lanes, Label placement, Density, Progress (playhead reveal), Vertical — single lane, Vertical — lanes |
| `TreeView` | `my-you-eye` | — | Density (normal vs compact), Tall values (elbow/chevron alignment), Depth-based expand, Controlled expand state, Leading icons (click a row, then use arrow keys), Messy nested payload (hover to trace depth guides) |

### data — props

#### `CellType`

| Prop | Type | Description |
|---|---|---|
| `type?` | `CellValueType` | — |
| `value?` | `unknown` | — |
| `badgeVariant?` | `BadgeProps["variant"]` | — |
| `badgeStyle?` | `BadgeProps["tone"]` | — |
| `statusVariant?` | `StatusDotProps["variant"]` | — |
| `statusPulse?` | `boolean` | — |
| `replacements?` | `UrlReplacement[]` | — |
| `dateFormat?` | `Intl.DateTimeFormatOptions` | — |
| `compact?` | `boolean` | — |
| `fractionDigits?` | `number` | Fraction digits (0-20). |
| `currency?` | `string` | ISO 4217 currency code for "currency" type (default "USD"). |
| `displayUnit?` | `string` | Force a byte unit (e.g. "GB"). |
| `codeLanguage?` | `string` | Highlight language for "code" type (e.g. "ts", "sql"). |
| `avatarSrc?` | `string` | Optional photo URL for "user" type — falls back to initials (Avatar's own fallback behavior) when omitted. |

#### `DataList`

Also accepts everything from `HTMLAttributes<HTMLDListElement>`, `VariantProps<typeof dataListVariants>`.

| Prop | Type | Description |
|---|---|---|
| `items` | `DataListItem[]` | — |
| `replacements?` | `UrlReplacement[]` | — |
| `variant?` | `"default" \| "compact"` | — |
| `density?` | `"normal" \| "compact"` | — |
| `labelWidth?` | `"sm" \| "md" \| "lg"` | Label ("dt") column width. |

#### `DataTable`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`, `VariantProps<typeof dataTableVariants>`.

| Prop | Type | Description |
|---|---|---|
| `columns` | `DataTableColumn[]` | — |
| `rows` | `Record<string, unknown>[]` | — |
| `stickyHeader?` | `boolean` | — |
| `replacements?` | `UrlReplacement[]` | — |
| `layout?` | `"fixed" \| "auto"` | "fixed" locks columns to width hints/equal share (default). "auto" sizes columns to content and enables horizontal scroll — use for rows with divergent content widths (e.g. a type smoke test) where fixed columns would clip legitimate content. |
| `rowKey?` | `(row: Record<string, unknown>, index: number) => string \| number` | Stable React key for a row. |

#### `Table`

Also accepts everything from `HTMLAttributes<HTMLTableElement>`, `VariantProps<typeof tableVariants>`.

#### `Timeline`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`.

| Prop | Type | Description |
|---|---|---|
| `events` | `TimelineEvent[]` | — |
| `orientation?` | `"horizontal" \| "vertical"` | "horizontal" (default): lanes stack as rows, events spaced proportionally to `at` along the row — for roadmaps and request traces. "vertical": lanes sit as columns, events stack sequentially top-to-bottom — for a git-history/changelog read. |
| `lanes?` | `string[]` | Explicit lane display order. |
| `density?` | `TimelineDensity` | Row height and text scale. `compact` also drops event descriptions in the vertical orientation — at that density they're what overflows. |
| `labelPlacement?` | `TimelineLabelPlacement` | Horizontal only. `"stagger"` (default) alternates labels above and below the rule so neighbouring events can't collide; `"below"` puts them all under it, which is tighter but only safe when events are well separated. |
| `axis?` | `(at: number) => string` | Horizontal only. |
| `progress?` | `number` | 0→1 reveal (TODO.md D4's progress-in convention). |

#### `TreeView`

| Prop | Type | Description |
|---|---|---|
| `data` | `TreeNode[]` | — |
| `indent?` | `IndentSize \| number` | "sm" \| "md" \| "lg", mapped to --grid-unit multiples (12 / 16 / 24px). |
| `variant?` | `"default" \| "condensed"` | — |
| `density?` | `"normal" \| "compact"` | — |
| `defaultExpandedDepth?` | `number` | — |
| `expandedKeys?` | `Set<string>` | — |
| `onToggle?` | `(id: string) => void` | — |
| `replacements?` | `UrlReplacement[]` | — |
| `className?` | `string` | Merged onto the root `<ul>`. |

## display

| Component | Tier | Variants (**default**) | Demos |
|---|---|---|---|
| `Avatar` | `my-you-eye` | size: lg / **md** / sm | Sizes, Fallback variants, With image, With ring, With status dot |
| `Badge` | `my-you-eye` | variant: danger / **neutral** / primary / success / warning<br>tone: soft / **solid** | Variants (solid), Variants (soft) |
| `Card` | `my-you-eye` | variant: **default** / elevated / outlined | Variants, With footer actions, Size |
| `CodeBlock` | `my-you-eye` | variant: **default** / elevated | Bare (no header, no language), Language-only (badge overlay, no header bar), With header + language, Elevated, Line numbers, No wrap (horizontal scroll), Syntax highlighting (TS), Line highlights, Line highlights (implicit gutter), Multi-color highlights, Substring highlights, Substring highlights on a long line (wrap forced off), Merged highlights, Focus range (dims everything outside it), Bare (embedded in another surface), Syntax highlighting (CSS / HTML / SQL / YAML / Python) |
| `DeviceFrame` | `my-you-eye` | variant: **browser** / phone / window | Browser, Window, Phone |
| `DiffBlock` | `my-you-eye` | variant: **default** / elevated | Unified, Unified — word diff, Unified — word diff, heavily rewritten lines, Split, Split — word diff, Elevated |
| `EmptyState` | `my-you-eye` | — | Default, With icon and action |
| `Image` | `my-you-eye` | fit: contain / **cover** / fill / none / scaleDown<br>radius: full / lg / **md** / none / sm<br>aspect: **auto** / square / tall / video / wide<br>bordered: true<br>shadowed: true | Fit modes, Border radius, Aspect ratio, Styles, With caption |
| `Kbd` | `my-you-eye` | — | Default, Combinations |
| `Markdown` | `my-you-eye` | — | Rendered markdown |
| `ScrollArea` | `my-you-eye` | orientation: **both** / horizontal / vertical | Vertical scroll, Horizontal scroll, Both axes, Rounded corners (radius on ScrollArea itself, not a wrapper), Edge fade |
| `Separator` | `my-you-eye` | orientation: **horizontal** / vertical | Horizontal, Vertical |
| `StatusDot` | `my-you-eye` | variant: danger / info / **neutral** / success / warning<br>size: **md** / sm | Variants, Sizes, Pulsing |
| `Terminal` | `my-you-eye` | variant: **default** / elevated<br>scheme: amber / **default** / matrix<br>chrome: **dots** / none | Prompt glyphs, Title bar, Exit status & spinner, Variant, Color schemes, Chrome decorator, Fixed height, scrolls as content grows, Prompt segments, changed mid-session |

### display — props

#### `Avatar`

Also accepts everything from `React.ComponentPropsWithoutRef<typeof Root>`, `VariantProps<typeof avatarVariants>`.

| Prop | Type | Description |
|---|---|---|
| `src?` | `string` | — |
| `alt?` | `string` | — |
| `fallback` | `string` | — |

#### `Badge`

Also accepts everything from `HTMLAttributes<HTMLSpanElement>`, `VariantProps<typeof badgeVariants>`.

#### `Card`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`, `VariantProps<typeof cardVariants>`.

#### `CodeBlock`

Also accepts everything from `HTMLAttributes<HTMLPreElement>`, `VariantProps<typeof codeBlockVariants>`.

| Prop | Type | Description |
|---|---|---|
| `code` | `string` | — |
| `language?` | `string` | — |
| `header?` | `string` | — |
| `wrap?` | `boolean` | — |
| `showLineNumbers?` | `boolean` | — |
| `highlight?` | `boolean` | Enable syntax highlighting for supported languages (js, ts, tsx, json, bash). |
| `highlightLines?` | `number[]` | 1-indexed line numbers to highlight. |
| `highlightColor?` | `CodeBlockHighlightGroup["color"]` | Color for highlightLines (default "primary"). |
| `highlightGroups?` | `CodeBlockHighlightGroup[]` | Multi-color highlight groups. |
| `highlightRanges?` | `HighlightRangeDef[]` | Substring-level highlight ranges (0-indexed char positions within each line). |
| `focusRange?` | `[number, number]` | 1-based line numbers outside this `[start, end]` range get a reduced opacity (the `opacity-focus-dim` token) instead of full contrast — the "focus on this range, dim the rest" treatment a code walkthrough needs. |
| `lineId?` | `(lineNumber: number) => string` | Assigns an `id` to each rendered line's row element, keyed by its 1-based line number. |
| `bare?` | `boolean` | Strips the persistent header bar (filename/language badge) and the block's own opaque background/border, leaving only a hover-revealed copy button in the corner. |

#### `DeviceFrame`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`, `VariantProps<typeof deviceFrameVariants>`.

| Prop | Type | Description |
|---|---|---|
| `url?` | `string` | Address shown in the browser variant's URL bar. |
| `title?` | `string` | Title shown in the window variant's centered title bar (and the browser tab, if given alongside `url`). |
| `children` | `ReactNode` | — |

#### `DiffBlock`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`, `VariantProps<typeof diffBlockVariants>`.

| Prop | Type | Description |
|---|---|---|
| `lines` | `DiffLine[]` | — |
| `language?` | `string` | — |
| `header?` | `string` | — |
| `mode?` | `"unified" \| "split"` | "unified" (default): single column with +/- markers. "split": two-column side-by-side. |
| `highlight?` | `boolean` | Syntax-highlight line content via CodeBlock's tokenizer (js/ts/json/bash/css/html/py/yaml/sql). |
| `wordDiff?` | `boolean` | Word-level intra-line diff for a removed line immediately followed by an added line (a 1:1 changed pair). |

#### `EmptyState`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`.

| Prop | Type | Description |
|---|---|---|
| `icon?` | `ReactNode` | — |
| `title` | `string` | — |
| `description?` | `string` | — |
| `action?` | `ReactNode` | — |

#### `Image`

Also accepts everything from `ImgHTMLAttributes<HTMLImageElement>`, `VariantProps<typeof imageVariants>`.

| Prop | Type | Description |
|---|---|---|
| `caption?` | `string` | — |

#### `Kbd`

Also accepts everything from `HTMLAttributes<HTMLElement>`.

#### `Markdown`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`.

| Prop | Type | Description |
|---|---|---|
| `content` | `string` | — |

#### `ScrollArea`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`, `VariantProps<typeof scrollAreaVariants>`.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | — |
| `fade?` | `boolean` | Adds a CSS-mask fade at the scrollable edge(s) so a scrollable region visibly reads as scrollable even before it's touched. |

#### `Separator`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`, `VariantProps<typeof separatorVariants>`.

#### `StatusDot`

Also accepts everything from `HTMLAttributes<HTMLSpanElement>`, `VariantProps<typeof statusDotVariants>`.

| Prop | Type | Description |
|---|---|---|
| `pulse?` | `boolean` | — |

#### `Terminal`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`, `VariantProps<typeof terminalVariants>`.

| Prop | Type | Description |
|---|---|---|
| `entries` | `TerminalEntry[]` | — |
| `prompt?` | `TerminalPromptGlyph` | Prompt glyph before each command. |
| `cwd?` | `string` | Working directory shown in the prompt chrome (and the title bar, if no `title` is given). |
| `user?` | `string` | Username shown before an "@host" segment in the prompt chrome. |
| `host?` | `string` | Hostname shown after "user@" in the prompt chrome. |
| `title?` | `string` | Caption for an optional window-style title bar above the entries. |
| `rows?` | `number` | Fixed visible height, expressed as a whole number of text lines (owner feedback: "I want to see a constant height terminal that does not change or move, and the content gets added within it ... like a scrolling action"). |

## feedback

| Component | Tier | Variants (**default**) | Demos |
|---|---|---|---|
| `Alert` | `my-you-eye` | variant: danger / **info** / note / success / tip / warning<br>size: lg / **md** / sm / xl | Variants, With title, With icon, Size, Note & tip, Presentation size (xl) |
| `Progress` | `my-you-eye` | variant: danger / **default** / success / warning | Variants, No label |
| `Skeleton` | `my-you-eye` | shape: circle / rect / **text** | Shapes |
| `Spinner` | `my-you-eye` | size: lg / **md** / sm | Sizes |
| `Toast` | `my-you-eye` | variant: danger / **default** / success | Trigger toasts |

### feedback — props

#### `Alert`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`, `VariantProps<typeof alertVariants>`.

| Prop | Type | Description |
|---|---|---|
| `title?` | `string` | — |
| `icon?` | `ReactNode` | — |

#### `Progress`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`, `VariantProps<typeof barVariants>`.

| Prop | Type | Description |
|---|---|---|
| `value` | `number` | — |
| `label?` | `string` | — |

#### `Skeleton`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`, `VariantProps<typeof skeletonVariants>`.

| Prop | Type | Description |
|---|---|---|
| `width?` | `string` | — |
| `height?` | `string` | — |

#### `Spinner`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`, `VariantProps<typeof spinnerVariants>`.

## inputs

| Component | Tier | Variants (**default**) | Demos |
|---|---|---|---|
| `Button` | `my-you-eye` | variant: danger / ghost / **primary** / secondary<br>size: icon-sm / lg / **md** / sm | Variants, Sizes, Icon-only (compact), Disabled & loading |
| `Checkbox` | `my-you-eye` | size: **md** / sm | Sizes, States |
| `Combobox` | `my-you-eye` | — | Basic, Uncontrolled, Disabled |
| `FileDrop` | `my-you-eye` | state: **default** / dragging / error / success<br>size: lg / **md** / sm | Default, Sizes, States, Disabled, Single image only |
| `Input` | `my-you-eye` | variant: **default** / filled<br>size: **md** / sm<br>invalid: true | Variants, Sizes, States |
| `Label` | `my-you-eye` | — | Default |
| `MultiSelect` | `my-you-eye` | — | Basic, Uncontrolled, Empty, Disabled |
| `RadioGroup` | `my-you-eye` | — | Default |
| `Select` | `my-you-eye` | size: **md** / sm<br>invalid: true | Sizes, States, No indicator |
| `Slider` | `my-you-eye` | size: **md** / sm | Basic slider, Sizes |
| `Switch` | `my-you-eye` | size: **md** / sm | Sizes, States |
| `Textarea` | `my-you-eye` | variant: **default** / filled<br>invalid: true | Variants, States |

### inputs — props

#### `Button`

Also accepts everything from `ButtonHTMLAttributes<HTMLButtonElement>`, `VariantProps<typeof buttonVariants>`.

| Prop | Type | Description |
|---|---|---|
| `loading?` | `boolean` | — |

#### `Checkbox`

Also accepts everything from `React.ComponentPropsWithoutRef<typeof Root>`, `VariantProps<typeof checkboxVariants>`.

#### `Combobox`

| Prop | Type | Description |
|---|---|---|
| `options` | `ComboboxOption[]` | — |
| `value?` | `string` | Controlled selection. |
| `defaultValue?` | `string` | Initial selection for uncontrolled use. |
| `onChange?` | `(value: string) => void` | — |
| `placeholder?` | `string` | — |
| `emptyText?` | `string` | — |
| `className?` | `string` | — |
| `disabled?` | `boolean` | — |

#### `FileDrop`

Also accepts everything from `Omit<HTMLAttributes<HTMLDivElement>, "onDrop">`.

| Prop | Type | Description |
|---|---|---|
| `onDrop?` | `(files: File[]) => void` | — |
| `accept?` | `string` | — |
| `multiple?` | `boolean` | — |
| `maxSize?` | `number` | — |
| `size?` | `"sm" \| "md" \| "lg"` | — |
| `disabled?` | `boolean` | — |

#### `Input`

Also accepts everything from `Omit<InputHTMLAttributes<HTMLInputElement>, "size">`, `VariantProps<typeof inputVariants>`.

#### `Label`

Also accepts everything from `ComponentPropsWithoutRef<typeof Root>`, `VariantProps<typeof labelVariants>`.

#### `MultiSelect`

| Prop | Type | Description |
|---|---|---|
| `options` | `MultiSelectOption[]` | — |
| `value?` | `string[]` | Controlled selection. |
| `defaultValue?` | `string[]` | Initial selection for uncontrolled use. |
| `onChange?` | `(value: string[]) => void` | — |
| `placeholder?` | `string` | — |
| `emptyText?` | `string` | — |
| `className?` | `string` | — |
| `disabled?` | `boolean` | — |

#### `RadioGroup`

Also accepts everything from `React.ComponentPropsWithoutRef<typeof Root>`.

#### `Slider`

Also accepts everything from `Omit<InputHTMLAttributes<HTMLInputElement>, "type" \| "size">`, `VariantProps<typeof sliderTrackVariants>`.

| Prop | Type | Description |
|---|---|---|
| `label?` | `string` | — |
| `showValue?` | `boolean` | — |

#### `Switch`

Also accepts everything from `React.ComponentPropsWithoutRef<typeof Root>`, `VariantProps<typeof switchVariants>`.

#### `Textarea`

Also accepts everything from `Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">`, `VariantProps<typeof textareaVariants>`.

| Prop | Type | Description |
|---|---|---|
| `autoResize?` | `boolean` | — |

## motion

| Component | Tier | Variants (**default**) | Demos |
|---|---|---|---|
| `Beat` | `my-you-eye/motion` | — | Hold between reveals |
| `Camera` | `my-you-eye/motion` | — | Pan and fit zoom, spring="bouncy" |
| `Caption` | `my-you-eye/motion` | — | Positions, Bottom center |
| `CountUp` | `my-you-eye/motion` | — | Formats, Signed & duration |
| `Cursor` | `my-you-eye/motion` | — | Move, click, type, Shapes, Custom cursor node, Click effect variants |
| `Draw` | `my-you-eye/motion` | — | Basic path, Colors & stroke widths |
| `Highlight` | `my-you-eye/motion` | — | Modes, Overlay radius |
| `Morph` | `my-you-eye/motion` | — | Between layout slots, Cross-fade two elements, Row expanding into a panel |
| `Motion Core` | `my-you-eye/motion` | — | useTimeline / useProgress, Beat values, Easing vs spring, Seek & scrub |
| `Pulse` | `my-you-eye/motion` | — | Infinite, Loop=3, then settles, Pulse a non-text sibling |
| `Reveal` | `my-you-eye/motion` | — | from variants, asChild (no layout box) |
| `Ripple` | `my-you-eye/motion` | — | Click — ring, Click — solid vs double |
| `Shake` | `my-you-eye/motion` | — | Axis variants |
| `Slide` | `my-you-eye/motion` | — | mode="in" — 4 directions, mode="out" |
| `Spotlight` | `my-you-eye/motion` | — | One line of code, One node in a diagram, One card in a dashboard |
| `Stagger` | `my-you-eye/motion` | — | Reveal vs Stagger, from="first", from="center" |
| `TextSwap` | `my-you-eye/motion` | — | Fade, Roll |
| `Trace` | `my-you-eye/motion` | — | Single token, looping, Multiple tokens, spaced |
| `TypeText` | `my-you-eye/motion` | — | Char mode, Word mode, Caret variants, preserveLayout (no reflow) |
| `Unmask` | `my-you-eye/motion` | — | Directions & softness |
| `Wipe` | `my-you-eye/motion` | — | Linear — 4 directions, Radial |

### motion — props

#### `Beat`

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | — |
| `hold?` | `BeatUnit` | Purely descriptive — documents how long this hold lasts in a step sequence. |
| `className?` | `string` | — |

#### `Camera`

Also accepts everything from `MovementTiming`.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | — |
| `keyframes` | `CameraKeyframe[]` | Camera moves, in frame order. `focus` is an explicit rect or the `id` of a descendant element to measure. |
| `fit?` | `boolean` | Compute zoom automatically to fit the focused rect when a keyframe doesn't specify one. |
| `className?` | `string` | — |

#### `Caption`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `text` | `string` | — |
| `subtitle?` | `string` | — |
| `position?` | `CaptionPosition` | Default "bottom-left". |
| `className?` | `string` | — |

#### `CountUp`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `from?` | `number` | Starting value. |
| `to` | `number` | Ending value. |
| `format?` | `CountUpFormat` | Default "number". |
| `formatOptions?` | `CountUpFormatOptions` | — |
| `className?` | `string` | — |

#### `Cursor`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `events` | `CursorEvent[]` | Timed positions/actions, in frame order. |
| `color?` | `MotionColor` | — |
| `shape?` | `CursorShape` | Pointer appearance. |
| `clickEffect?` | `RippleVariant` | Ripple treatment rendered on click/dblclick — forwarded straight to `Ripple`'s `variant`, never a second, hand-rolled click effect. |
| `children?` | `ReactNode` | Escape hatch: a custom cursor node (an icon, an avatar, anything) replacing the built-in `shape` glyph entirely — `shape`/`color` are then ignored for the glyph itself (though `color` still tints the click `Ripple`). |
| `className?` | `string` | — |

#### `Draw`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `d` | `string` | SVG path data to draw. |
| `viewBox?` | `string` | viewBox for the wrapping <svg>. |
| `color?` | `MotionColor` | — |
| `strokeWidth?` | `DrawStrokeWidth` | — |
| `className?` | `string` | — |

#### `Highlight`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | — |
| `mode?` | `HighlightMode` | Default "fill". |
| `color?` | `HighlightColor` | Token color only — no arbitrary values. |
| `as?` | `"span" \| "div"` | Host element. |
| `className?` | `string` | — |

#### `Morph`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | — |
| `from` | `MorphSnapshot` | — |
| `to` | `MorphSnapshot` | — |
| `toChildren?` | `ReactNode` | A second node cross-faded in as `children` cross-fades out, both sharing the same interpolated position/size (e.g. a list row's summary cross-fading into its own detail panel while the box resizes). |
| `className?` | `string` | — |

#### `Pulse`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | — |
| `loop?` | `number` | Finite number of breaths. |
| `asChild?` | `boolean` | — |
| `as?` | `"div" \| "span"` | — |
| `className?` | `string` | — |

#### `Reveal`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | — |
| `from?` | `RevealFrom` | What the entrance animates from. |
| `distance?` | `DistanceToken` | Travel distance for the directional variants, as a grid-unit multiple. |
| `asChild?` | `boolean` | Render the animated style onto the single child element instead of wrapping it in a `<div>` — so Reveal never injects a layout box that could break a flex/grid parent. |
| `as?` | `"div" \| "span"` | Host element when not using `asChild`. |
| `className?` | `string` | — |

#### `Ripple`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `x` | `number` | Position within a `position: relative` ancestor — Ripple renders `position: absolute; left: x; top: y`. |
| `y` | `number` | — |
| `color?` | `MotionColor` | — |
| `size?` | `DistanceToken` | Ring size at full expansion, as a grid-unit multiple. |
| `variant?` | `RippleVariant` | Visual treatment (TODO.md C2 / Cursor's click feedback, extended rather than duplicated — Cursor forwards its own `clickEffect` prop straight through to this). "ring" (default, unchanged) is a single expanding, fading outline. "solid" is a filled disc fading out — reads as a firmer tap than an outl… |
| `className?` | `string` | — |

#### `Shake`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | — |
| `axis?` | `ShakeAxis` | Default "x". |
| `cycles?` | `number` | Oscillations across the full `duration`. |
| `seed?` | `string \| number` | Deterministic jitter seed — same seed always produces the same shake. |
| `asChild?` | `boolean` | — |
| `as?` | `"div" \| "span"` | — |
| `className?` | `string` | — |

#### `Slide`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | — |
| `direction?` | `SlideDirection` | Default "left". |
| `mode?` | `SlideMode` | "in" slides content from offscreen to its resting place; "out" slides it from resting place offscreen. |
| `className?` | `string` | — |

#### `Spotlight`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | — |
| `focus` | `SpotlightRect` | Focused rect, in the wrapping container's own layout coordinates — Spotlight doesn't measure the DOM itself (same "caller supplies the rect" convention as Camera/Morph). |
| `feather?` | `BlurToken` | Softness of the cut-out edge. |
| `dim?` | `number` | Maximum dim strength, 0-1. |
| `className?` | `string` | — |

#### `Stagger`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | — |
| `each?` | `Beat` | Offset between successive children's reveals. |
| `from?` | `StaggerOrigin` | Which child reveals first: index 0, index N-1, or the middle child outward. |
| `revealFrom?` | `RevealFrom` | Forwarded to each child's Reveal. |
| `distance?` | `DistanceToken` | — |

#### `TextSwap`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `from` | `string` | — |
| `to` | `string` | — |
| `mode?` | `TextSwapMode` | "fade" cross-fades; "roll" translates old text out / new text in (an odometer look). |
| `className?` | `string` | — |

#### `Trace`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `d` | `string` | SVG path data the tokens travel along. |
| `viewBox?` | `string` | viewBox for the wrapping <svg>. |
| `count?` | `number` | How many tokens travel at once, evenly spaced. |
| `spacing?` | `number` | Spacing between tokens, as a 0-1 fraction of the path. |
| `loop?` | `boolean` | Loop continuously (each token cycles start-to-end every `duration`) instead of running once and stopping. |
| `shape?` | `TraceShape` | — |
| `color?` | `MotionColor` | — |
| `size?` | `number` | Token size, in the path's own SVG user-space units. |
| `className?` | `string` | — |

#### `TypeText`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `text` | `string` | — |
| `mode?` | `TypeTextMode` | Reveal unit. |
| `cursor?` | `boolean` | Show a caret while (and briefly after) typing. |
| `caret?` | `TypeTextCaret` | Caret shape. "bar" (default, unchanged) is the classic "\|". "block" is a filled character cell, "underline" a low bar, "none" renders nothing regardless of `cursor`. |
| `blinkRate?` | `Beat` | Caret blink half-period, once typing has finished (the caret is solid while actively typing). |
| `preserveLayout?` | `boolean` | Reserve the fully-typed box size up front so surrounding content never reflows while typing — critical for video, where a reflowing neighbour is a visible pop. |
| `className?` | `string` | — |

#### `Unmask`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | — |
| `direction?` | `UnmaskDirection` | Sweep direction. |
| `softness?` | `number` | Softness of the leading edge, as a 0-1 fraction of the sweep. |
| `className?` | `string` | — |

#### `Wipe`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | — |
| `direction?` | `WipeDirection` | Which edge the reveal grows from. |
| `variant?` | `WipeVariant` | "linear" is a hard-edged sweep; "radial" grows a circle from the direction's edge. |
| `className?` | `string` | — |

## navigation

| Component | Tier | Variants (**default**) | Demos |
|---|---|---|---|
| `Breadcrumbs` | `my-you-eye` | — | Default, Custom separator |
| `Link` | `my-you-eye` | variant: muted / **primary**<br>underline: false / **true** | Variants, underline={false}, In a sentence |
| `Pagination` | `my-you-eye` | — | Default (10 pages), Few pages |
| `Tabs` | `my-you-eye` | variant: filing / pills / **underline** | Underline, Pills, Filing |

### navigation — props

#### `Breadcrumbs`

Also accepts everything from `HTMLAttributes<HTMLElement>`.

| Prop | Type | Description |
|---|---|---|
| `items` | `BreadcrumbItem[]` | — |
| `separator?` | `ReactNode` | — |

#### `Link`

Also accepts everything from `AnchorHTMLAttributes<HTMLAnchorElement>`, `VariantProps<typeof linkVariants>`.

| Prop | Type | Description |
|---|---|---|
| `underline?` | `boolean` | Underline the label on hover. |

#### `Pagination`

Also accepts everything from `HTMLAttributes<HTMLElement>`.

| Prop | Type | Description |
|---|---|---|
| `currentPage` | `number` | — |
| `totalPages` | `number` | — |
| `onPageChange` | `(page: number) => void` | — |

#### `Tabs`

Also accepts everything from `React.ComponentPropsWithoutRef<typeof Root>`, `VariantProps<typeof tabsListVariants>`.

## overlay

| Component | Tier | Variants (**default**) | Demos |
|---|---|---|---|
| `CommandPalette` | `my-you-eye` | — | Basic, With groups |
| `Dialog` | `my-you-eye` | size: lg / **md** / sm | Sizes, Form example |
| `Drawer` | `my-you-eye` | side: left / **right**<br>size: lg / **md** / sm | Left & Right, Sizes |
| `DropdownMenu` | `my-you-eye` | — | Default |
| `Popover` | `my-you-eye` | — | Default, Positioning, With close button |
| `Tooltip` | `my-you-eye` | — | Directions |

### overlay — props

#### `CommandPalette`

| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | — |
| `onOpenChange` | `(open: boolean) => void` | — |
| `actions` | `CommandAction[]` | — |
| `onSelect` | `(action: CommandAction) => void` | — |
| `placeholder?` | `string` | — |
| `emptyText?` | `string` | — |
| `groups?` | `{ label: string; actionIds: string[] }[]` | — |

#### `Tooltip`

| Prop | Type | Description |
|---|---|---|
| `content` | `string` | — |
| `side?` | `"top" \| "right" \| "bottom" \| "left"` | — |
| `children` | `React.ReactNode` | — |

## patterns

| Component | Tier | Variants (**default**) | Demos |
|---|---|---|---|
| `Comparison` | `my-you-eye` | — | Side-by-side, Wipe (draggable), Wipe — progress-driven |
| `ConfirmDialog` | `my-you-eye` | — | Variants |
| `FileTree` | `my-you-eye` | — | Project tree with git status, Compact density |
| `FormField` | `my-you-eye` | — | Default, With hint, Required with error |
| `PageShell` | `my-you-eye` | — | Default, With actions |
| `SequenceDiagram` | `my-you-eye` | — | Request flow, Self-messages, spanning note, error path, Progress reveal |
| `StatCard` | `my-you-eye` | — | Default, Size, Numeric delta, Icon + sparkline |
| `StatGrid` | `my-you-eye` | — | 4-column KPI row, 3-column with sparklines, Size, positiveIsGood |
| `TexturedSurface` | `my-you-eye` | variant: elevated / **surface**<br>radius: **default** / lg / none / sm | Tuner, Paper grain, Frosted glass, Brushed aluminium, Paper grain — full matrix, Frosted glass — full matrix, Brushed aluminium — full matrix, Theme-driven, Composed |
| `Toolbar` | `my-you-eye` | — | All slots filled, With leading label, Result count + removable filter chips, Narrow / responsive collapse |

### patterns — props

#### `Comparison`

Also accepts everything from `Omit<HTMLAttributes<HTMLDivElement>, "onChange">`.

| Prop | Type | Description |
|---|---|---|
| `before` | `ReactNode` | — |
| `after` | `ReactNode` | — |
| `beforeLabel?` | `string` | — |
| `afterLabel?` | `string` | — |
| `mode?` | `"side-by-side" \| "wipe"` | "side-by-side" (default): two columns. "wipe": before/after stacked with a draggable reveal divider. |
| `value?` | `number` | Controlled divider position, 0-100 (wipe mode only). |
| `defaultValue?` | `number` | Uncontrolled initial divider position, 0-100. |
| `onValueChange?` | `(value: number) => void` | — |
| `progress?` | `number` | 0→1 animation-in progress (TODO.md D4's progress-in convention) — lets a video/live scene animate the reveal without ever importing src/motion/. |

#### `ConfirmDialog`

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | — |
| `description?` | `string` | — |
| `confirmLabel?` | `string` | — |
| `destructive?` | `boolean` | — |
| `onConfirm` | `() => void` | — |
| `trigger?` | `ReactNode` | — |
| `open?` | `boolean` | — |
| `onOpenChange?` | `(open: boolean) => void` | — |

#### `FileTree`

Also accepts everything from `Pick<TreeViewProps, "defaultExpandedDepth" \| "expandedKeys" \| "onToggle" \| "density" \| "indent">`.

| Prop | Type | Description |
|---|---|---|
| `data` | `FileTreeNode[]` | — |
| `className?` | `string` | — |

#### `FormField`

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | — |
| `error?` | `string` | — |
| `hint?` | `string` | — |
| `required?` | `boolean` | — |
| `className?` | `string` | — |
| `children` | `ReactNode` | — |

#### `PageShell`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`.

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | — |
| `description?` | `string` | — |
| `actions?` | `ReactNode` | — |

#### `SequenceDiagram`

Also accepts everything from `Omit<HTMLAttributes<HTMLDivElement>, "children">`.

| Prop | Type | Description |
|---|---|---|
| `participants` | `SequenceParticipant[]` | — |
| `items` | `SequenceItem[]` | Ordered messages and notes — order is both the vertical stacking order and the order `progress` reveals them in. |
| `activations?` | `SequenceActivation[]` | — |
| `laneWidth?` | `number` | Lane (participant column) width in px. |
| `progress?` | `number` | 0→1 reveal progress, default 1 (fully drawn). |

#### `StatCard`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`.

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | — |
| `value` | `ReactNode` | Widened from `string` to `ReactNode` so a caller can drop in a live numeric tween (e.g. `my-you-eye/motion`'s `CountUp`) instead of a static string — a plain string still works exactly as before (TODO.md D4's progress-in convention: StatCard itself stays a pure presentational component, no motion i… |
| `delta?` | `StatCardDelta` | — |
| `icon?` | `ReactNode` | — |
| `size?` | `"sm" \| "md" \| "lg"` | Padding density, forwarded to CardContent. |
| `sparkline?` | `StatCardSparklineProps` | Inline trend chart under the value/delta, composing Sparkline. |

#### `StatGrid`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`.

| Prop | Type | Description |
|---|---|---|
| `items` | `StatGridItem[]` | — |
| `columns?` | `2 \| 3 \| 4 \| 5 \| 6` | Column count at the widest breakpoint. |
| `size?` | `"sm" \| "md" \| "lg"` | Forwarded to every StatCard. |

#### `TexturedSurface`

Also accepts everything from `VariantProps<typeof texturedSurfaceVariants>`, `Omit<HTMLAttributes<HTMLDivElement>, "color">`.

| Prop | Type | Description |
|---|---|---|
| `color?` | `string` | — |
| `texture?` | `TextureName` | — |
| `strength?` | `"subtle" \| "medium" \| "strong"` | — |
| `layer?` | `TextureLayer` | — |

#### `Toolbar`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`.

| Prop | Type | Description |
|---|---|---|
| `leading?` | `ReactNode` | — |
| `search?` | `ReactNode` | — |
| `filters?` | `ReactNode` | — |
| `actions?` | `ReactNode` | — |
| `resultCount?` | `ReactNode` | — |
| `chips?` | `ToolbarFilterChip[]` | — |
| `onClearAll?` | `() => void` | — |

## scenes

| Component | Tier | Variants (**default**) | Demos |
|---|---|---|---|
| `Presenter` | `my-you-eye/present` | — | Click-through presenter |
| `SpeakerView` | `my-you-eye/present` | — | Now / next / notes / elapsed timer |
| `useSteps` | `my-you-eye/present` | — | Custom controls built from useSteps |
| `BulletScene` | `my-you-eye/scenes` | — | Playing, Pinned mid-sequence (frame 179/280), Pinned at rest (frame 280/280) |
| `ChartScene` | `my-you-eye/scenes` | — | Bar — playing, Gauge — no steps (single-beat draw-on) |
| `CodeDiff` | `my-you-eye/scenes` | — | Playing, Pinned mid-transition (frame 70/150), Pinned at rest (frame 150/150) |
| `CodeScene` | `my-you-eye/scenes` | — | Playing |
| `CompareScene` | `my-you-eye/scenes` | — | Columns (code panes) — playing, Wipe (image panes) — playing |
| `DiagramScene` | `my-you-eye/scenes` | — | Architecture — playing, State machine ("state" preset), Dataflow ("dataflow" preset) |
| `OutroScene` | `my-you-eye/scenes` | — | Playing, Pinned mid-stagger (frame 10/90), Pinned at rest (frame 90/90) |
| `SceneRenderer` | `my-you-eye/scenes` | — | Title, Bullets, Diagram, chart, stat |
| `SequenceScene` | `my-you-eye/scenes` | — | Playing |
| `StatScene` | `my-you-eye/scenes` | — | Playing |
| `TerminalScene` | `my-you-eye/scenes` | — | Playing, Pinned mid-typing, entry 1 (frame 12/160), Pinned on entry 2's spinner (frame 72/160), Spinner, animating, Pinned at rest (frame 160/160), Prompt change (rows + scheme) |
| `TitleScene` | `my-you-eye/scenes` | — | Centered, playing, Left-aligned, no chapter/subtitle, Pinned mid-stagger (frame 12/90), Pinned at rest (frame 90/90) |
| `Validation` | `my-you-eye/scenes` | — | Deliberately broken video, Valid, minimal video |
| `WalkthroughScene` | `my-you-eye/scenes` | — | Playing |

### scenes — props

#### `Presenter`

| Prop | Type | Description |
|---|---|---|
| `video` | `Video` | — |
| `className?` | `string` | — |
| `onStepChange?` | `(info: PresenterStepInfo) => void` | Called whenever the active step changes — for a consumer syncing their own chrome (e.g. a `SpeakerView` they've opened some other way) to Presenter's position. |

#### `SpeakerView`

| Prop | Type | Description |
|---|---|---|
| `video` | `Video` | — |
| `sceneIndex` | `number` | Currently-showing scene, as an index into `video.scenes` — the same position `Presenter` (or a consumer's own `useSteps`-driven UI) is at. |
| `stepIndex` | `number` | Currently-showing step, as an index into that scene's own step list. |
| `className?` | `string` | — |

#### `BulletScene`

| Prop | Type | Description |
|---|---|---|
| `scene` | `BulletSceneData` | — |

#### `ChartScene`

| Prop | Type | Description |
|---|---|---|
| `scene` | `ChartSceneData` | — |

#### `CodeDiff`

Also accepts everything from `Timing`.

| Prop | Type | Description |
|---|---|---|
| `from` | `string` | Source as it was before this diff. |
| `to` | `string` | Source after this diff. |
| `language?` | `string` | — |
| `header?` | `string` | Filename shown in the header tab, matching CodeBlock's header. |
| `className?` | `string` | — |

#### `CodeScene`

| Prop | Type | Description |
|---|---|---|
| `scene` | `CodeSceneData` | — |

#### `CompareScene`

| Prop | Type | Description |
|---|---|---|
| `scene` | `CompareSceneData` | — |

#### `DiagramScene`

| Prop | Type | Description |
|---|---|---|
| `scene` | `DiagramSceneData` | — |

#### `OutroScene`

| Prop | Type | Description |
|---|---|---|
| `scene` | `OutroSceneData` | — |

#### `SceneRenderer`

| Prop | Type | Description |
|---|---|---|
| `scene` | `Scene` | — |

#### `SequenceScene`

| Prop | Type | Description |
|---|---|---|
| `scene` | `SequenceSceneData` | — |

#### `StatScene`

| Prop | Type | Description |
|---|---|---|
| `scene` | `StatSceneData` | — |

#### `TerminalScene`

| Prop | Type | Description |
|---|---|---|
| `scene` | `TerminalSceneData` | — |

#### `TitleScene`

| Prop | Type | Description |
|---|---|---|
| `scene` | `TitleSceneData` | — |

#### `WalkthroughScene`

| Prop | Type | Description |
|---|---|---|
| `scene` | `WalkthroughSceneData` | — |

## typography

| Component | Tier | Variants (**default**) | Demos |
|---|---|---|---|
| `Typography & Tokens` | `my-you-eye` | — | Prose block, Font families, Text sizes, Colors, Radius & spacing |

### typography — props

#### `Typography & Tokens`

Also accepts everything from `HTMLAttributes<HTMLDivElement>`.

