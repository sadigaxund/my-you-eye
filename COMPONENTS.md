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
| `exitCode?` | `number` | Process exit code — renders a badge (0 reads success, non-zero danger). |
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

| Component | Tier | Variants | Demos |
|---|---|---|---|
| `Annotation` | `my-you-eye` | variant: browser<br>side: bottom / left / right / top | Marker variants, Auto-flip near the container edge, Vertical sides (top/bottom), Progress reveal |
| `Canvas` | `my-you-eye` | — | Empty grid |
| `ConnectionLayer` | `my-you-eye` | — | Many edges, one svg, Parallel edges (automatic bundling), Edge states share the same visual language as ConnectionLine |
| `ConnectionLine` | `my-you-eye` | variant: bezier / orthogonal / stepped / straight<br>state: connected / highlighted / pending | Path variants, Edge states, Decorations (arrowheads + labels), Label positions, Label on a genuinely curved path, ConnectionLayer (one svg, many edges), Orthogonal routing avoids obstacles, Waypoints, Edge kind (semantic styling), Draw-on progress |
| `Graph` | `my-you-eye` | type: button | Pipeline editor (drag nodes, connect ports, delete selected) |
| `GraphGroup` | `my-you-eye` | variant: success<br>size: sm | Architecture boundaries, Label placement |
| `GraphNode` | `my-you-eye` | variant: ghost / muted / selected / simple / success<br>type: button<br>size: icon-sm<br>shape: pill<br>style: soft | Variants, Simple variant, Legacy ports on a tall node, Free-form body, Header variations, Accent bar color, Footer variations, Shape (state-machine pill), All variations together |
| `Port` | `my-you-eye` | state: connected / default / highlighted<br>shape: circle / socket<br>side: in / out | States (circle), Socket shape — mounted on a border, Socket mount — outward vs inward, Socket shape — all states, Circle vs socket, side by side |

## charts

| Component | Tier | Variants | Demos |
|---|---|---|---|
| `BarChart` | `my-you-eye` | orientation: horizontal | Single series (vertical), Grouped, multi-series, Stacked, Horizontal, Horizontal, grouped, Long category label, Empty, Draw-on progress (50%), Focus a category |
| `ChartFrame` | `my-you-eye` | — | Axes, gridlines & a custom plot, Loading, Empty |
| `Funnel` | `my-you-eye` | — | Four stages, Two stages, Long stage labels, Empty, Draw-on progress (50%) |
| `Gauge` | `my-you-eye` | — | Basic, Threshold bands — healthy, Threshold bands — critical, Custom range, Long label, Draw-on progress (50%) |
| `Heatmap` | `my-you-eye` | — | Activity calendar, Single column, Long row label, Empty, Draw-on progress (50%) |
| `Legend` | `my-you-eye` | orientation: vertical | Rect swatches (bar / area fills), Line swatches, Dot swatches (scatter / points), Vertical orientation |
| `LineChart` | `my-you-eye` | — | Single series, Multi-series, Area fill, No point markers, Long category label, Empty, Draw-on progress (50%), Focus a category |
| `PieChart` | `my-you-eye` | — | Pie, Donut with center label, Single category (no legend), Long labels, Empty, Draw-on progress (50%) |
| `ScatterPlot` | `my-you-eye` | — | Single series, With trend line, Multi-series (3, all-pairs cap), Long point label (tooltip), Loading, Empty, Draw-on progress (50%) |
| `Sparkline` | `my-you-eye` | — | Basic, Area fill, Downward trend, danger token, Inside StatCard, Empty, Draw-on progress (50%) |

## data

| Component | Tier | Variants | Demos |
|---|---|---|---|
| `CellType` | `my-you-eye` | type: array / audio / badge / boolean / bytes / code / color / currency / date-human / date-system / datetime-tz / duration / email / hash / html / image / json / markdown / null / number / percentage / progress / secret / signed / sparkline / status / tags / text / tree / url / user | Data Types, Project X, Project X, New data types, Numeric types, Column alignment |
| `DataList` | `my-you-eye` | density: compact | Density (normal vs compact), Striped, Label width, Alignment, Scrolling |
| `DataTable` | `my-you-eye` | variant: striped<br>density: compact | Default, Striped, Scrolling + sticky header, Alignment, Row A, Row B, Row C, Row D, Alpha, Beta, Alpha, Beta, Truncation |
| `Table` | `my-you-eye` | align: right<br>variant: striped<br>density: compact<br>type: text | Composition, Variants, Density, Truncation & expand, Sticky header |
| `Timeline` | `my-you-eye` | orientation: vertical | Horizontal — single lane, Horizontal — lanes, Spans — events with a duration, Shared scale across lanes, Label placement, Density, Progress (playhead reveal), Vertical — single lane, Vertical — lanes |
| `TreeView` | `my-you-eye` | type: button<br>density: compact<br>variant: condensed | Density (normal vs compact), Tall values (elbow/chevron alignment), Depth-based expand, Controlled expand state, Leading icons (click a row, then use arrow keys), Messy nested payload (hover to trace depth guides) |

## display

| Component | Tier | Variants | Demos |
|---|---|---|---|
| `Avatar` | `my-you-eye` | size: lg / md / sm | Sizes, Fallback variants, With image, With ring, With status dot |
| `Badge` | `my-you-eye` | variant: danger / neutral / primary / success / warning<br>style: soft | Variants (solid), Variants (soft) |
| `Card` | `my-you-eye` | variant: danger / default / elevated / ghost / outlined<br>size: lg / md / sm | Variants, With footer actions, Size |
| `CodeBlock` | `my-you-eye` | variant: elevated | Bare (no header, no language), Language-only (badge overlay, no header bar), With header + language, Elevated, Line numbers, No wrap (horizontal scroll), Syntax highlighting (TS), Line highlights, Line highlights (implicit gutter), Multi-color highlights, Substring highlights, Substring highlights on a long line (wrap forced off), Merged highlights, Focus range (dims everything outside it), Bare (embedded in another surface), Syntax highlighting (CSS / HTML / SQL / YAML / Python) |
| `DeviceFrame` | `my-you-eye` | variant: browser / phone / window | Browser, Window, Phone |
| `DiffBlock` | `my-you-eye` | — | Unified, Unified — word diff, Split, Split — word diff |
| `EmptyState` | `my-you-eye` | variant: secondary | Default, With icon and action |
| `Image` | `my-you-eye` | — | Fit modes, Border radius, Aspect ratio, Styles, With caption |
| `Kbd` | `my-you-eye` | — | Default, Combinations |
| `Markdown` | `my-you-eye` | — | Rendered markdown |
| `ScrollArea` | `my-you-eye` | orientation: horizontal / vertical | Vertical scroll, Horizontal scroll, Rounded corners (radius on ScrollArea itself, not a wrapper), Edge fade |
| `Separator` | `my-you-eye` | orientation: vertical | Horizontal, Vertical |
| `StatusDot` | `my-you-eye` | variant: danger / info / neutral / success / warning<br>size: md / sm | Variants, Sizes, Pulsing |
| `Terminal` | `my-you-eye` | variant: default / elevated | Prompt glyphs, Title bar, Variant, Color schemes, Chrome decorator, Fixed height, scrolls as content grows, Prompt segments, changed mid-session |

## feedback

| Component | Tier | Variants | Demos |
|---|---|---|---|
| `Alert` | `my-you-eye` | variant: danger / info / note / success / tip / warning<br>size: lg / md / sm / xl | Variants, With title, With icon, Size, Note & tip, Presentation size (xl) |
| `Progress` | `my-you-eye` | variant: danger / default / success / warning | Variants, No label |
| `Skeleton` | `my-you-eye` | shape: circle / rect / text | Shapes |
| `Spinner` | `my-you-eye` | size: lg / md / sm | Sizes |
| `Toast` | `my-you-eye` | variant: danger / secondary | Trigger toasts |

## inputs

| Component | Tier | Variants | Demos |
|---|---|---|---|
| `Button` | `my-you-eye` | variant: danger / ghost / primary / secondary<br>size: icon-sm / lg / md / sm | Variants, Sizes, Icon-only (compact), Disabled & loading |
| `Checkbox` | `my-you-eye` | size: md / sm | Sizes, States |
| `Combobox` | `my-you-eye` | — | Basic, Disabled |
| `FileDrop` | `my-you-eye` | — | Default, Single image only |
| `Input` | `my-you-eye` | variant: filled<br>size: md / sm | Variants, Sizes, States |
| `Label` | `my-you-eye` | — | Default |
| `MultiSelect` | `my-you-eye` | — | Basic, Empty, Disabled |
| `RadioGroup` | `my-you-eye` | — | Default |
| `Select` | `my-you-eye` | size: md / sm | Sizes, States, No indicator |
| `Slider` | `my-you-eye` | size: md / sm | Basic slider, Sizes |
| `Switch` | `my-you-eye` | size: md / sm | Sizes, States |
| `Textarea` | `my-you-eye` | variant: filled | Variants, States |

## motion

| Component | Tier | Variants | Demos |
|---|---|---|---|
| `Beat` | `my-you-eye/motion` | — | hold between reveals |
| `Camera` | `my-you-eye/motion` | — | pan between elements, fit zoom, spring=\ |
| `Caption` | `my-you-eye/motion` | — | positions, bottom-center |
| `CountUp` | `my-you-eye/motion` | — | formats, signed + duration |
| `Cursor` | `my-you-eye/motion` | shape: dot | move, click, type, shapes, custom cursor node, click effect variants |
| `Draw` | `my-you-eye/motion` | — | basic path, colors + stroke widths |
| `Highlight` | `my-you-eye/motion` | — | modes, overlay radius is its own, never the child |
| `Morph` | `my-you-eye/motion` | — | card moving + resizing between layout slots, cross-fade between two different elements, list item expanding into a detail panel |
| `Motion Core` | `my-you-eye/motion` | — | useTimeline / useProgress, Beat values, side by side, easing vs spring, seek & scrub (DomDriverHandle) |
| `Pulse` | `my-you-eye/motion` | — | infinite, loop=3, then settles, text stays crisp — pulse a non-text sibling instead |
| `Reveal` | `my-you-eye/motion` | — | from variants, asChild (no layout box) |
| `Ripple` | `my-you-eye/motion` | variant: double / solid | click — ring, click — solid vs double |
| `Shake` | `my-you-eye/motion` | — | axis variants |
| `Slide` | `my-you-eye/motion` | — | mode=\, mode=\ |
| `Spotlight` | `my-you-eye/motion` | — | one line of code, one node in a diagram, one card in a dashboard |
| `Stagger` | `my-you-eye/motion` | — | Reveal vs Stagger, from=\, from=\ |
| `TextSwap` | `my-you-eye/motion` | — | fade, roll |
| `Trace` | `my-you-eye/motion` | shape: square | single token, looping, multiple tokens, spaced |
| `TypeText` | `my-you-eye/motion` | — | char mode, word mode, caret variants, preserveLayout (no reflow) |
| `Unmask` | `my-you-eye/motion` | — | directions + softness |
| `Wipe` | `my-you-eye/motion` | variant: radial | linear — 4 directions, radial |

## navigation

| Component | Tier | Variants | Demos |
|---|---|---|---|
| `Breadcrumbs` | `my-you-eye` | — | Default, Custom separator |
| `Link` | `my-you-eye` | variant: muted | Variants, In a sentence |
| `Pagination` | `my-you-eye` | — | Default (10 pages), Few pages |
| `Tabs` | `my-you-eye` | variant: filing / pills / underline | Underline, Pills, Filing |

## overlay

| Component | Tier | Variants | Demos |
|---|---|---|---|
| `CommandPalette` | `my-you-eye` | variant: secondary | Basic, With groups |
| `Dialog` | `my-you-eye` | size: lg / md / sm<br>variant: ghost | Sizes, Form example |
| `Drawer` | `my-you-eye` | side: left / right<br>size: md / sm<br>variant: secondary | Left & Right |
| `DropdownMenu` | `my-you-eye` | variant: secondary | Default |
| `Popover` | `my-you-eye` | variant: secondary<br>size: sm | Default |
| `Tooltip` | `my-you-eye` | side: bottom / left / right / top<br>variant: secondary | Directions |

## patterns

| Component | Tier | Variants | Demos |
|---|---|---|---|
| `Comparison` | `my-you-eye` | tone: after / before | Side-by-side, Wipe (draggable), Wipe — progress-driven |
| `ConfirmDialog` | `my-you-eye` | variant: danger / secondary | Variants |
| `FileTree` | `my-you-eye` | density: compact | Project tree with git status, Compact density |
| `FormField` | `my-you-eye` | type: password | Default, With hint, Required with error |
| `PageShell` | `my-you-eye` | variant: secondary | Default, With actions |
| `SequenceDiagram` | `my-you-eye` | — | Request flow, Self-messages, spanning note, error path, Progress reveal |
| `StatCard` | `my-you-eye` | size: lg / md / sm | Default, Size, Numeric delta, Icon + sparkline |
| `StatGrid` | `my-you-eye` | size: sm | 4-column KPI row, 3-column with sparklines, Size, positiveIsGood |
| `TexturedSurface` | `my-you-eye` | variant: elevated / ghost / primary / surface<br>size: sm | Tuner, Paper grain, Frosted glass, Brushed aluminium, Paper grain — full matrix, Frosted glass — full matrix, Brushed aluminium — full matrix, Theme-driven, Composed |
| `Toolbar` | `my-you-eye` | size: sm<br>variant: primary / secondary<br>style: soft | All slots filled, With leading label, Result count + removable filter chips, Narrow / responsive collapse |

## scenes

| Component | Tier | Variants | Demos |
|---|---|---|---|
| `Presenter` | `my-you-eye/present` | — | Click-through presenter |
| `SpeakerView` | `my-you-eye/present` | size: sm<br>variant: primary / secondary | Now / next / notes / elapsed timer |
| `useSteps` | `my-you-eye/present` | variant: ghost / neutral / primary / secondary<br>size: sm | Custom controls built from useSteps |
| `BulletScene` | `my-you-eye/scenes` | — | Playing, Pinned mid-sequence (frame 179/280), Pinned at rest (frame 280/280) |
| `ChartScene` | `my-you-eye/scenes` | — | Bar — playing, Pinned with only , Pinned mid-reveal of , Pinned with focus + callout, step 2 (frame ${step2.endFrame - 1}/${barTotal}), Gauge — no steps (single-beat draw-on) |
| `CodeDiff` | `my-you-eye/scenes` | — | Playing, Pinned mid-transition (frame 70/150), Pinned at rest (frame 150/150) |
| `CodeScene` | `my-you-eye/scenes` | — | Playing, Pinned mid-typing, step 1 (frame ${step0.startFrame + 15}/${total}), Pinned on focus + highlight, step 2 (frame ${step1.startFrame + 5}/${total}), Pinned mid-diff, step 3 (frame ${step2.startFrame + 5}/${total}), Pinned at rest, end of step 3 (frame ${step2.endFrame - 1}/${total}), Pinned with an Annotation callout, step 4 (frame ${step3.endFrame - 1}/${total}) |
| `CompareScene` | `my-you-eye/scenes` | — | Columns (code panes) — playing, Pinned mid-reveal, columns (frame ${Math.round((codeRange.startFrame + codeRange.endFrame) / 2)}/${codeTotal}), Wipe (image panes) — playing, Pinned mid-wipe (frame ${Math.round(wipeTotal * 0.4)}/${wipeTotal}) |
| `DiagramScene` | `my-you-eye/scenes` | — | Architecture — playing, Pinned mid-connect, step 0 (frame ${step0.startFrame + 3}/${archTotal}), Pinned with the VPC group revealed, step 1 end (frame ${step1.endFrame - 1}/${archTotal}), Pinned with flow tokens in transit, step 2 (frame ${step2.startFrame + Math.round((step2.endFrame - step2.startFrame) / 2)}/${archTotal}), Pinned with a focus spotlight, step 3 (frame ${step3.endFrame - 1}/${archTotal}), Pinned with an Annotation callout, step 4 (frame ${step4.endFrame - 1}/${archTotal}), State machine (\, Dataflow (\ |
| `OutroScene` | `my-you-eye/scenes` | — | Playing, Pinned mid-stagger (frame 10/90), Pinned at rest (frame 90/90) |
| `SceneRenderer` | `my-you-eye/scenes` | — | title, bullets, diagram + chart + stat |
| `SequenceScene` | `my-you-eye/scenes` | — | Playing, Pinned mid-message, step 3 (frame ${step2.endFrame + 3}/${total}), Pinned at rest (frame ${total}/${total}) |
| `StatScene` | `my-you-eye/scenes` | — | Playing, Pinned mid-count, tile 1 (frame ${step0.startFrame + 3}/${total}), Pinned at rest, all four tiles (frame ${step3.endFrame - 1}/${total}) |
| `TerminalScene` | `my-you-eye/scenes` | — | Playing, Pinned mid-typing, entry 1 (frame 12/160), Pinned on entry 2, Pinned at rest (frame 160/160), Mid-session prompt change (rows + scheme) |
| `TitleScene` | `my-you-eye/scenes` | — | Centered, playing, Left-aligned, no chapter/subtitle, Pinned mid-stagger (frame 12/90), Pinned at rest (frame 90/90) |
| `Validation` | `my-you-eye/scenes` | style: soft | Deliberately broken video, A valid, minimal video |
| `WalkthroughScene` | `my-you-eye/scenes` | — | Playing, Pinned with a spotlight + Annotation, step 2 (frame ${step1.endFrame - 1}/${total}), Pinned mid-typing, step 3 (frame ${step2.startFrame + 5}/${total}), Pinned on the final click, step 4 (frame ${step3.startFrame + 2}/${total}) |

## typography

| Component | Tier | Variants | Demos |
|---|---|---|---|
| `Typography & Tokens` | `my-you-eye` | — | Font families, Text sizes, Colors, Radius & spacing |

