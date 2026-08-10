# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added

- **The scene schema — `Video` / `Scene` / `Step`** — published as `my-you-eye/scenes`. This is the entire API a consuming project writes against: one typed, JSON-serializable data object made of closed unions. What it deliberately does not accept is the point of it — no `className`, no `style`, no colors, no frame counts, no easing names, no pixel coordinates. Three of the choices carry most of the weight:
  - **Diagram geometry is mostly not authorable.** Node `x`/`y` are grid units (× 16px) and both optional — omit them and `layered()`/`grid()` place the node with crossing reduction already applied. A `GraphGroup` region has no coordinates at all; its box is computed from the bounds of its member nodes, so a boundary can neither land in the wrong place nor leave a node hanging outside it. Sequence activation bars are derived from the message order rather than declared.
  - **Walkthrough coordinates are percent-of-frame**, so a step keeps pointing at the right thing when `meta.size` changes.
  - **Pacing is derived from content.** A step's duration comes from the length of its `say` line — the same string that serves as the speaker-view script and the reserved anchor for narration timing. `pace: "slow" | "normal" | "fast"` per scene is the only dial.
- **Scenes-tier foundation** (`src/scenes/`) — `sceneSteps`/`sceneDuration`, the shared timing spine `VideoRoot` and the Presenter both call, so MP4 pacing and click-through pacing cannot drift; a runtime validator (`validateVideo` / `assertVideo`) that reports a JSON-path pointer per issue and checks reference integrity across diagram, sequence and chart ids — a mis-wired `flow: ["api->queue"]` fails at author time instead of rendering a blank frame; and `SceneRenderer`, the single `switch (scene.kind)` a consumer never touches, exhaustive over all eleven kinds.
- **`my-you-eye/present` — the live, reactive tier.** `useSteps` is the headless step-navigation hook (flattened from `sceneSteps`, so it agrees with the video timeline by construction); `<Presenter video={video} />` is the click-through presentation with keyboard nav, an `Esc` overview grid and fullscreen; `<SpeakerView />` shows the current and next step, the notes from `step.say`, and an elapsed timer, and opens in a second window.
- **Live-only diagram interactivity** — hovering a node highlights its edges, clicking focuses its neighbourhood, dragging explores the canvas. This is what the two-driver architecture (TODO.md D2) was for: inside a `<Player>` the frame belongs to playback, so a primitive cannot answer a hover. It arrives through a `LiveInteractionContext` that is **inert unless a provider is mounted** — and only `Presenter` ever mounts one, around the live stage. Reuses `ConnectionLine`'s existing `state="highlighted"` and `GraphNode`'s `variant="selected"` rather than adding styling, and `Canvas` already had the drag. No scene component gained a prop; they still take `{ scene }` and nothing else.
- **All eleven scene templates.** The six visual ones — `DiagramScene`, `SequenceScene`, `ChartScene`, `StatScene`, `CompareScene`, `WalkthroughScene` — join the five content ones below, and `SceneRenderer` now renders every `SceneKind` for real with no placeholder branch left. `DiagramScene` places nodes with `layered()`/`grid()` unless the data pins them, computes each `GraphGroup`'s rectangle from its members' bounds, draws edges on with the new `ConnectionLayer` `progress`, and runs `Trace` tokens for a step's `flow`. `SequenceScene` derives activation bars from message order.
- **Callouts that survive a transform.** `Annotation` mounts as a plain DOM sibling *inside* the transforming layer — `Canvas`'s pan/zoom children for `DiagramScene`, `Camera`'s scene div for `CodeScene` — in the same untransformed local coordinates every other element there uses, so the browser's own transform carries it on every frame and there is no sync code to drift. This is what let `CodeStep.annotate` finally render; it had been schema-valid and validated but silently inert.
- **Five content scenes** — `TitleScene`, `BulletScene`, `CodeScene`, `TerminalScene`, `OutroScene`. Each is a data-only wiring layer over existing primitives (`Reveal`, `Stagger`, `Highlight`, `Camera`, `CodeBlock`, `Terminal`), timed entirely off `useSequence(sceneSteps(scene), scene.pace)`. None of them accepts a `className`.
- **`CodeDiff`** (`src/scenes/code-diff`) — animates between two full sources: added rows grow in, removed rows collapse, changed rows cross-fade word by word. `linesDiff` runs the same LCS `wordDiff` already used, over lines instead of words, so there is one diff algorithm in the library rather than two; row grouping reuses `DiffBlock`'s `pairDiffLines` unchanged.
- **`Link`** (`src/ui/link`) — a styled `<a>`. Nothing in `src/ui/` exposed one standalone, and AGENTS.md §0 rule 1 forbids hand-rolling one outside it.
- **`src/lib/themes.ts`** — the theme-profile list, now shared by the showcase's theme picker and the scene schema's `VideoTheme` union instead of being declared in both.
- **Presentation components for screencasts and technical video.** Each composes existing primitives rather than restyling markup:
  - **`Terminal`** — shell session with prompt/command/output framing, composing `CodeBlock` for the output body.
  - **`DiffBlock`** — unified and split diff views with word-level intra-line highlighting.
  - **`DeviceFrame`** — browser / window / phone chrome to wrap a screenshot or a live demo.
  - **`Timeline`** — horizontal or vertical event sequences.
  - **`Comparison`** — before/after, either side-by-side or as a draggable wipe.
  - **`StatGrid`** — a grid of `StatCard`s with a shared column rhythm; `StatCard` itself gains a numeric delta and a sparkline slot.
  - **`Callout`** — `Alert`'s `note` / `tip` variants plus an `xl` presentation size, for on-screen asides large enough to read in a video.
  - **`SequenceDiagram`** — UML lanes, dashed lifelines, activation bars, notes, and self-messages. Message arrows are `ConnectionLayer` edges (no hand-drawn `<path>` anywhere in the component) with message kinds mapped onto the existing `sync`/`async`/`data`/`error` union; a self-message is the same edge mechanism with two waypoints. `progress` reveals items strictly in order and truncates the in-flight message to a true geometric prefix of its own route, corner included, rather than a beeline toward the reveal front.
  - **`Annotation`** — a leader-line callout for pointing at part of a diagram or screenshot. Path `d`, arc length, and arrowhead angle all come from `connection-line/geometry.ts`. The label auto-flips to the other side of the target before it would run past `containerWidth`, measured with `offsetWidth`. `progress` strokes the line on over the first 60% (via `stroke-dashoffset` computed from the prop — no CSS transition or keyframes) and fades the label in over the remaining 40%.
  - **`FileTree`** — a file/folder tree with git-status decoration and a trailing metadata column, built as a data-shaping layer over `TreeView` rather than a fork of it.
  - **`GraphGroup`** — a labelled boundary region (VPC, cluster, service boundary) drawn behind the nodes and edges it encloses. Stacking is DOM order, not `z-index`: render groups before nodes. Nests without compounding fills (flat 5% alpha per level) and tints by plain alpha compositing, never `backdrop-filter`, so it stays inside Canvas's drag performance contract (AGENTS.md §0.12).
- **`src/lib/layout.ts`** — `layered()` (longest-path DAG ranking with barycentre crossing reduction) and `grid()` placement, so a diagram's node positions can be computed instead of hand-placed. Shares `GRID`/`snap` with `graph-node/grid.ts` rather than redeclaring them. `scripts/prove-layout-crossings.mjs` measures the reduction on a fixture graph: **13 edge crossings → 1**.
- **`Port`**: `shape: "circle" | "socket"`. The half-disc "female port" look was previously accidental — a full circle straddling the node border with its outer half clipped by the node's `overflow-hidden`, which also meant row ports and legacy ports disagreed on shape. `socket` draws a true half-disc from SVG arc geometry, so the effect survives anyone touching an ancestor's `overflow`. The hit target stays a full circle.
- **`GraphNode`** header/footer variations: `headerIcon`, `headerStatus`, `subtitle`, `headerDots`, `accentColor`, `footerMetric`, `footerAction`, and `footerProgress` (reusing `Progress`). A `subtitle` takes the header to `HEADER + 1` cells — still a whole number of grid cells, so rows and ports stay grid-aligned per AGENTS.md §7.
- **`CellType`**: eight new value types — `sparkline`, `tags`, `code`, `color`, `hash`, `user`, `progress`, `secret` — each composing an existing component rather than restyling markup.
- **`TreeView`**: a per-node `trailing` slot (rendered after the `value` column) and a `className` prop. `TreeView` was the only component in the library without a `className`, so anything wanting to style a tree had to wrap it in a spare `<div>`.
- **`ConnectionLine`**: `variant="orthogonal"` with obstacle avoidance, explicit `waypoints`, and semantic `kind` (`sync` | `async` | `data` | `error`) as an axis independent of `state`.

### Changed

- **`CodeBlock`**: the frame's header bar and language badge extracted into `CodeBlock.chrome.tsx` (`CodeHeaderBar`, `LanguageBadge`) and `codeBlockVariants` exported. The same markup had accumulated three copies — two inside `CodeBlock` itself and a third in the scenes-tier `CodeDiff` — which matters because `CodeScene` cuts between a `CodeBlock` and a `CodeDiff` mid-scene, so any drift between them shows up as the header shifting on a step boundary. `CodeDiff`'s row padding was also aligned to `px-panel`/`py-panel` (it was `px-2`/`py-1.5`) so the code sits in the same place across that cut. No visual change to `CodeBlock`.
- Additive extensions carrying the visual scenes: **`ConnectionLine`/`ConnectionLayer`** gain `progress` (the stroke becomes a true geometric prefix of the route, reusing the arc-length walk the label-gap math already had, with the label and arrowhead held back until it completes); **`GraphNode`** gains `shape: "box" | "pill"`; **`Annotation`**'s `side` widens to include `"top"`/`"bottom"`; **`StatCard`**/**`StatGrid`** take a `ReactNode` value (so a live `CountUp` drops in), plus `positiveIsGood` and a sparkline `progress`; **`BarChart`**/**`LineChart`** gain `focus`.
- **`CodeBlock`** additionally gains `focusRange` (dims lines outside the range) and `lineId` (per-line ids for `offsetTop`-based measurement); **`Terminal`**'s `TerminalPromptGlyph` gains `"#"`; **`DiffBlock`** exposes the generic `lcsDiffFlags` its word diff already ran internally. All three are additive — omitted, every one renders exactly as before.
- **`CellType`**: the JSON popover now syntax-highlights, via `CodeBlock language="json" highlight` — `CodeBlock` already supported JSON, it simply wasn't switched on.
- **`ConnectionLine`** decomposed into `ConnectionPath` + `geometry.ts` / `layout.ts` / `gapped-path.ts`, so the routing math has one home shared with `ConnectionLayer`. Edge labels no longer sit on a translucent badge fighting the stroke; the path is interrupted beneath the label instead — the conventional diagramming fix, and readable on curved paths where the old semi-transparent badge was not.
- **`Slider`**: `step` now derives ~500 increments from the actual range instead of defaulting to `1`. The reported "low FPS" was two separate problems, neither of them dropped frames: `CellType`'s audio seek bar read its position from the `timeupdate` DOM event, which the HTML spec fires only ~4×/second (now driven by rAF while playing), and every other slider was *quantized* rather than jittering — `step=1` over a 0–100 range means the thumb can only land every ~4px on a 400px track. Confirmed there is no systemic cause: no `backdrop-filter` in the stylesheets, and `--backdrop-blur` is `0px` in every theme except neon and frosted.
- **`DataList`**: the "Label width" showcase demo rewritten to be self-explanatory (it previously showed three widths with nothing indicating what was varying).

### Fixed

- **Charts animated with a CSS transition over a `progress`-driven opacity.** `BarChart`'s bars and `Heatmap`'s cells carried `transition-opacity` while their opacity was a function of `progress`. Under frame capture that does nothing; in live mode it lags the timeline by the transition duration — so the same scene rendered to MP4 and rendered live disagreed, which is the exact failure the progress-in convention exists to prevent. Removed from both; the remaining transitions in `PieChart`/`ScatterPlot` are hover-only and stay. The new `focus` dimming also moved from a raw `opacity-30` to the token-mapped `opacity-muted`.
- **`TreeView` + `CellType type="image"`**: an image value rendered a 32px thumbnail inside a 24px tree row and overflowed it. New `--spacing-thumb-sm` token and a `compact` size on `ImageDisplay`, which `TreeItem` opts every image value into automatically. Image rendering outside a tree is unchanged.
- **`ConnectionLine`**: `orthogonal` obstacle avoidance only tested the route's vertical spine. For a flat edge that spine degenerates to a point, so a route could pass the check while both of its horizontal legs ran straight through the obstacle. Both legs are now tested (`rectBlocksHorizontalSpan` / `elbowBlockedByRect` in `geometry.ts`).
- ~~**`DataTable`**: sticky header restructured to render outside `ScrollArea`.~~ **Retracted** — this entry was never true. `git show` across every revision of `DataTable.tsx` confirms `<TableHeader sticky>` has always rendered inside `ScrollArea`. Nothing was changed and nothing has regressed; the entry is struck rather than deleted so the record of the false claim survives.

- **`src/motion/` — a frame-driven motion engine**, published as `my-you-eye/motion` (remotion-free) and `my-you-eye/motion/remotion` (the sole module importing remotion, so a plain-UI consumer never pulls a video renderer into their bundle). Ships as a subpath of this package rather than a separate `@lib/motion`, so one version bump moves the whole library — see TODO.md D1.
  - **Foundation:** `MotionRoot`, `DomDriver` (rAF clock: play/pause/seek/reverse/rate, honours `prefers-reduced-motion`), `RemotionDriver`, `useTimeline`, `useProgress`, `useSequence`, and the `Timing` / `Beat` / `EasingName` / `SpringName` contract. Primitives never call a clock API; both drivers write through one `TimelineProvider`, so the same primitive renders identically in a video and in a live presentation. This implements the driver abstraction AGENTS.md §9e defers — see TODO.md D2 for why `@remotion/player` alone is insufficient (inside a Player the frame is owned by playback, so nothing can react to a hover, drag, or live value change).
  - **Timing is semantic, not numeric.** `Beat` is `"instant" | "quick" | "normal" | "slow"` (raw frames remain an escape hatch), so a consuming project cannot pick a janky duration — taste stays in the library. `easing` and `spring` are mutually exclusive at the type level, not by documented precedence.
  - **25 primitives.** Rewritten: `Reveal`, `Stagger`, `TypeText`, `Highlight`, `Slide` (`SlideTransition` kept as a deprecated alias). New: `Wipe`, `Draw`, `Unmask`, `Spotlight`, `Pulse`, `Shake`, `Ripple`, `Trace`, `Camera`, `CountUp`, `TextSwap`, `Caption`, `Morph`, `Cursor`, `Beat`.
  - `CountUp` reuses `src/lib/format.ts`, so tweened numbers format identically to `CellType` without crossing the tier boundary. `Camera` measures via an `offsetLeft`/`offsetTop` walk, never `getBoundingClientRect()`, which returns post-transform pixels and would compound with the camera's own zoom. `Spotlight` dims via a box-shadow cut-out and never touches `filter`/`backdrop-filter` (AGENTS.md §0.12).
  - New **`motion` showcase group**, each demo wrapped in a live play/pause/replay/scrub preview.
- **`scripts/check-motion.mjs`**, wired into `npm run validate` — fails the build on any wall-clock API (`useCurrentFrame`, `Date.now`, `performance.now`, `setTimeout`, `setInterval`, `requestAnimationFrame`, unseeded `Math.random`) outside the driver layer, on any CSS `transition`/`@keyframes`/`animation:` in the tier, on either direction of a ui↔motion import, on remotion escaping its one allowed module, and on a primitive folder not reachable from `src/motion/index.ts`. Non-determinism corrupts MP4 output frame-by-frame rather than failing loudly, so it needs a build gate rather than review.

### Changed

- **`apps/video`** imports from `my-you-eye/motion` instead of the `packages/motion` `file:` dependency.

### Removed

- **`packages/motion/`** — migrated into `src/motion/`. The pnpm-monorepo plan (old Phase 5) is cancelled; see TODO.md D1.

- **`ConnectionLayer`** — renders many edges in a single `<svg>`, where `ConnectionLine` renders one full-size stacked `<svg>` per edge (30 edges meant 30 of them, with the attendant layout cost and z-order fights). Both share all path/arrowhead/label geometry through one internal `ConnectionPath`, so the arrowhead-angle and point-at-t math exists in exactly one place.
- **`src/lib/format.ts`** — the pure `Intl` number/percentage/bytes/duration/currency/signed/compact formatting extracted from `CellType`, so the forthcoming `CountUp` motion primitive can format identically without crossing the `src/ui` tier boundary (AGENTS.md §9b).
- **`Slider`**: `size: "sm" | "md"` variant. **`Button`**: `size: "icon-sm"` variant. Both added so `CellType` could compose real components instead of native elements.
- **`CellType.shared.tsx`** — one `useTruncated` hook + `EllipsisBadge`, replacing three duplicated `ResizeObserver` blocks.
- **`--spacing-control`, `--spacing-thumb`, `--width-audio-time`, `--min-width-audio-min`** tokens.

### Fixed

- **`CodeBlock`**: substring highlights (`highlightRanges`) were positioned from hardcoded font metrics (`CHAR_W = 7.2`, `LINE_H = 19.5`, `PAD = 16`), so every highlight silently drifted under any of the 9 themes or 7 font families. Now measured from real rendered geometry via a hidden ruler.
- **`CodeBlock`**: `highlightRanges` now forces `wrap={false}`. The overlay assumes one visual row per logical line, so a wrapped line desynced every rect below it — a correct-but-scrolling block beats a silently-misaligned wrapped one.
- **`CodeBlock`**: the line-number gutter scrolled out of view horizontally; it is now sticky with an opaque background. The floating copy button's `-mb-7` negative-margin hack is replaced with absolute positioning, and `navigator.clipboard` is guarded so the component can't throw in a non-secure context.
- **`ConnectionLine`**: `labelPosition` linearly interpolated between the endpoints while the component drew a cubic bezier, so labels floated off curved edges. Now evaluates the actual rendered path — closed-form cubic for `bezier`, length-walked polyline for `stepped`.
- **`ConnectionLine`**: the label badge used an inline `backdrop-filter` while rendering inside `Canvas`'s transforming layer — precisely the composite-repaint failure mode AGENTS.md §0.12 exists to prevent. Removed. Label width was guessed as `label.length * 3.5`, clipping non-ASCII and wide-glyph labels; now measured. `rounded-sm` → token-mapped `rounded-ui-sm`.
- **`GraphNode`**: legacy `ports` (used when `rows` is absent) distributed across header height plus one grid cell, ignoring the node body entirely, so on any node taller than 48px every port bunched near the top. Now spread across the node's real height, snapped to grid lines via `grid.ts`.
- **Zoom-invariant measurement**: `ConnectionLine` and `GraphNode` measured with `getBoundingClientRect()`, which reports post-transform viewport pixels, then fed the result back as untransformed layout/SVG units. Inside `Canvas`'s `scale(zoom)` layer that is wrong by exactly the zoom factor — labels drift sideways and ports spread across `zoom ×` the node's height. Both now use `offset*`, which is layout-space.

### Changed

- **`CellType`**: `AudioDisplay` composes `Slider` + `Button` instead of hand-rolling `<input type="range">` and `<button>`; `ImageDisplay` composes `Image` instead of hand-rolling `<img>` twice. Arbitrary spacing values mapped to tokens.
- **`Canvas`** deliberately left untouched — it uses no native scrolling, so routing it through `ScrollArea` would fight the drag performance contract (AGENTS.md §7) for no reuse win.

- **Scrollbar tokens** — `--scrollbar-width` / `--scrollbar-radius`. `globals.css` scrollbar rules are now token-driven instead of hardcoded `6px`/`3px`, making AGENTS.md §0.10's "all token-driven" claim true. Same 6px/3px visual result.
- **`--color-surface-opaque`** (tokens.css + all 9 theme files) — guaranteed-opaque companion to `--color-surface`, same mechanism and rationale as `--color-canvas-surface`. Automatically enforced across themes by `check-themes.mjs`'s `color-` prefix rule.
- **`--shadow-subtle`** token for hover-lift affordances (defined, not yet applied).
- **`--spacing-panel-sm` / `--spacing-panel-lg`** (12px/24px) alongside the existing 16px `--spacing-panel`, giving Card/Alert/StatCard a shared 3-step padding scale.
- **`--spacing-tree-row` / `--spacing-tree-row-compact`** — fixed grid-unit row-content heights for `TreeItem`.
- **`--width-data-list-label-sm/-md/-lg`** for `DataList`'s label column.
- **`--scrollarea-fade-size`** token + `.scroll-fade-x/-y/-xy` CSS-mask classes.
- **`ScrollArea`**: `orientation` (`"vertical" | "horizontal" | "both"`) and `fade` (CSS-mask edge fade) props. Base class now sets `scrollbar-gutter: stable`.
- **`Table`**: a real showcase (Composition / Variants / Density / Sticky header) replacing an empty `demos: []` placeholder that existed only to satisfy `check-showcase.mjs`.
- **`TreeView`**: `density` prop; `indent` now accepts `"sm" | "md" | "lg"`.
- **`DataList`**: `density`, `striped`, and `labelWidth` props.
- **`Card` / `Alert` / `StatCard`**: `size` prop (`"sm" | "md" | "lg"`).
- **Tier-boundary lint rules** for the upcoming `src/motion` / `src/scenes` / `src/present` layer (AGENTS.md §9b), plus `check-showcase.mjs` and `registry.ts` coverage for them. Inert until those directories exist.

### Changed

- **`TableHeader`** sticky background: `bg-bg` → `bg-surface-opaque`. It previously used the page background regardless of the surface the table sat on, so the sticky header was a different colour from its own table and rows showed through at the seam on translucent themes.
- **`TableHead`**: row height is now padding-driven and matches `TableCell` exactly, instead of a fixed `h-8`/`h-10` — closes a ~2–5px header/body height mismatch that misaligned columns between a sticky header and its body.
- **`Table` / `TableRow`**: removed the no-op `density` variant (both values mapped to `""` while `DataTable` passed the prop through, so callers believed it worked). Density is now owned by `TableHead`/`TableCell`; `DataTable`'s `density` prop is unaffected.
- **`Table`**: `variant="striped"` class string no longer carries a stray leading space.
- **`TreeItem`**: row-content height is now a fixed `--grid-unit` multiple rather than intrinsic/stretched, so the chevron and the elbow connector always agree on vertical centre — previously a taller-than-text value kinked the guide line. Consistent with AGENTS.md §7's "height is a function of row count, never content-driven".
- **`TreeItem`**: the value wrapper no longer truncates itself (width constraint only) — `CellType`'s own truncation detection and "…" popover now actually fire, where the outer clip used to win.
- **`TreeView`**: `variant="condensed"` deprecated in favour of `density="compact"`; raw-number `indent` deprecated in favour of `"sm" | "md" | "lg"`.
- **`DataList`**: `variant="compact"` deprecated in favour of `density="compact"`; label/value row restructured from flex to a two-column CSS grid, so long labels truncate instead of wrapping.
- **Density vocabulary unified** to `density: "compact" | "normal"` across `Table`, `DataTable`, `DataList`, `TreeView` — previously three names (`density`, `variant="compact"`, `variant="condensed"`) for one concept. Old props still work, marked `@deprecated`.
- **`patterns/graph/GraphNode.tsx`** renamed to `GraphNodeRenderer.tsx` to match its export. Node width now comes from `NODE_WIDTH` alone, instead of that plus an independently-drifting `max-w-40` class pinning every editor node to exactly 160px.
- **`Card`/`Alert`/`StatCard`** default padding is now a shared token-sourced `size="md"` (16px). Card's default is visibly tighter than before and now matches Alert/StatCard; the previous 24px is available as `size="lg"`.
- **`Card variant="elevated"`**: `shadow-lg` → the `shadow-elevated` token.
- **`--shadow-card` / `--shadow-elevated`**: softened to two-layer shadow recipes.
- **`Button`**: focus ring is now `ring-inset`; transition timing made explicit via `--duration-fast` / `--ease-standard`. Same for the `Combobox` / `MultiSelect` triggers.
- **`CommandPalette` / `Combobox` / `MultiSelect`**: internal `ScrollArea` uses `rounded-b-[inherit]` so the scrollbar clip matches the popover's corner radius.

### Fixed

- **Scrollbar gutters no longer cut across rounded corners** in `ScrollArea`, `DataTable`, `CommandPalette`, `Combobox`, and `MultiSelect` — fixed by applying the radius to the scrolling element itself plus `scrollbar-gutter: stable`.
- **`DataTable`**: the previous `[Unreleased]` claim that the "sticky header [was] restructured to render outside ScrollArea" was **never true** — `<TableHeader sticky>` has been inside `ScrollArea` in every revision of the file since it was created, so this was an unimplemented aspiration rather than a regression. The underlying complaint (scrollbar over the rounded corner) is now genuinely fixed as described above. Entry corrected below.
- **`TexturedSurface`**: inline texture path no longer wraps children in a `relative` div (fixes flex `justify-between` layout for header). Decorative elements use `-z-10` and `pointer-events-none` so non-positioned children stack above naturally.
- **`DateTimeTzDisplay`**: timezone badge no longer clipped — date+time merged into a `min-w-0 flex-1 truncate` group that absorbs space deficit before the `flex-shrink-0` badge is ever touched. Removed `flex-1` to keep badge left-aligned next to time. Zero-padded day (`2-digit`) and hour (`2-digit`) for aligned table cells.
- ~~**`DataTable`**: sticky header restructured to render outside ScrollArea — scrollbar no longer covers the top-right rounded corner.~~ **Retracted — never implemented.** See the corrected entry above.
- **`TreeDisplay` / `ArrayDisplay`**: "…" badge now conditional on actual overflow via `ResizeObserver` + `scrollWidth > clientWidth`. Removed `flex-1` from preview span so content stays left-aligned.

### Added

- **`--texture-type` CSS token** — themes declare their texture type (`paper-grain`, `frosted-glass`, `brushed-aluminium`), used by `TexturedSurface`'s `texture="theme"` path.
- **`--theme-font` CSS token** — themes declare their preferred font; showcase auto-syncs font picker.

### Changed

- **`comic` theme**: recolored from warm cream/red to pulp newsprint (`oklch 0.92 0.025 65`) with CMYK cyan-blue primary, golden yellow secondary, near-black ink borders.
- **`metallic` theme**: shifted from warm (hue 0) to cool gray-blue (hue 255) palette; dark mode uses `screen` blend for texture visibility.
- **Paper grain & frosted glass presets**: SVG noise params updated across all layers (higher frequency, more octaves, larger tiles).
- **Page ↔ surface presets swapped** for all three materials — page (background) now has coarser noise at `LAYER_OPACITY 0.55`, surface is finer at 0.30.
- **`DateTimeTzDisplay`**: zero-padded day (`2-digit`) and hour (`2-digit`) for aligned table cells.
- **`DataTable.showcase`**: `lastLogin` column widened to `"lg"` (26%) for datetime-tz breathing room.
- **Version bump**: 0.2.1 → 0.2.2

### Fixed

- **`TableCell`**: added `overflow-hidden`/`min-w-0` so cell content correctly truncates at the cell boundary under `table-layout: fixed` instead of visually spilling into adjacent cells.

### Added

- **`DataTable`**: `columns[].width` hint (`xs`–`xl`) for proportional column sizing under fixed layout, rendered via `<colgroup>`.
- **`DataTable`**: `layout` prop (`"fixed" | "auto"`) — `"auto"` sizes columns to content with horizontal scroll, for rows with divergent content widths.
- **`TruncatedCellValue`** — universal popover for truncated text. Uses `useLayoutEffect` + `useRef` to detect `scrollWidth > clientWidth` (fires after layout, so dimensions are accurate). Only shows the badge and Popover when actually truncated. Uses `overflow-hidden whitespace-nowrap` (no CSS `text-overflow: ellipsis`) in truncated state to avoid double "…". Applied to `text` (default) and `status` CellType variants.

### Changed

- **`DataTable.showcase`**: restructured to 4 focused demos — Default, Striped, Scrolling + sticky header, Truncation. 20 users → 10. "Compact & striped" replaced with "Striped" (same 6 columns as Default, just striped). Truncation split into sub-tables (Text & Links, Complex) with `<hr>` separators.
- **`Table.showcase`**: removed "Variants & density" demo (empty demos array — kept file for check-showcase).
- **`DataList.showcase`**: renamed from "DataList" to "List". Added "Striped" demo (via `[&>div:nth-child(odd)]`) and "Scrolling" demo (bounded container with 20 items). Removed "Long values".
- **`DataList`**: added `overflow-hidden` to root `<dl>` and `min-w-0` to each flex row, matching the TableCell width-containment fix.

- **CellValue numeric display visual hierarchy** — all numeric types refactored to use `Intl.NumberFormat.formatToParts()` with per-part styling via a `styledParts` helper:
  - `number` — integer at `font-medium`, decimal/fraction at `text-muted text-xs`, grouping commas dimmed.
  - `percentage` — uses `style: "percent"` (locale-aware `%` placement), value anchored, `%` sign at `text-muted text-xs`.
  - `bytes` — auto-selects unit (B/KB/MB/GB/TB) then renders value at `font-medium` with unit at `text-muted text-xs` via `style: "unit"`.
  - `duration` — coarsest unit at `font-medium`, finer units at `text-muted text-xs` with muted spacing between.
  - `currency` — new type using `style: "currency"` (default USD), amount anchored, currency symbol at `text-muted text-xs`. Fraction and grouping also dimmed.
  - `signed` — new type with up-arrow icon + `text-success` for positive, down-arrow + `text-danger` for negative, value anchored at `font-semibold`.
  - `compact` — new opt-in prop on `number`, `bytes`, and `currency` types: passes `notation: "compact"` to `Intl.NumberFormat` (e.g. `1.2M`). The compact suffix renders at `text-muted text-xs`.

- **CellValue date display visual hierarchy** — three date subcomponents redesigned for scanability:
  - `DateSystemDisplay` now uses `Intl.DateTimeFormat.formatToParts()` to style month+day at `font-medium` with the year/wkday at `text-muted text-xs` — the comma stays, but hierarchy comes from weight/color not separators. `tabular-nums` on all digits.
  - `DateTimeTzDisplay` splits into three visually distinct zones: compact muted date (same treatment as DateSystem), `font-semibold` time as the anchor, and the timezone offset in a small `bg-muted/10` pill badge.
  - `DateHumanDisplay` relative string now renders at `font-medium text-primary` so it has presence in the column.

### Fixed

- **Showcase header overlap** — removed `sticky top-0 z-50` from the header so it stays in normal flow instead of floating over sidebar/main content when scrolling. Mobile sidebar `top-[57px]` → `top-0` since the header is no longer fixed.

### Removed

- **`FilingTabs` standalone component** — deleted `src/ui/patterns/filing-tabs/`. Filing tab visual is now a variant of `Tabs` (`variant="filing"`), not a separate component tree.

### Changed

- **`Tabs` now threads `variant` via context** — `Tabs` (Root) accepts a `variant` prop that propagates to `TabsList`, `TabsTrigger`, and `TabsContent` via React context. Sub-components still accept an explicit `variant` prop that overrides the context value. Existing `"underline"` and `"pills"` variants are unchanged.
- **New `Tabs variant="filing"`** — file-folder-style tabs with seamless active-tab-to-panel merge via background-match + `-mt-px` overlap. Tab bar is `width: fit-content; max-width: 100%` (content-width, no full-width stretch) with `overflow-x: auto` for many-tab scrolling. Inactive triggers use `translate-y-[2px]` to sit behind the active tab. `scrollIntoView` on focus ensures keyboard-navigated tabs are visible. Replaces the former `FilingTabs` component.
- **`Tabs.showcase.tsx`** — adds single "Filing" demo (replaces three identical FilingTabs demos from the deleted component).

- **CellValue JSON and Tree previews** — both types rewritten for meaningful scanability:
  - `json` no longer shows a raw 50-char `JSON.stringify()` slice. Instead, renders first 3 key:value pairs (or array items) with syntax-colored tokens via a hand-rolled tokenizer: keys in `text-secondary`, string/number/boolean values in `text-primary font-medium` (anchor), nulls in `text-muted italic`, punctuation in `text-muted`, nested objects/arrays collapsed to `{N}`/`[N]` pills. A `Badge` pill shows `N keys` or `N items`. Empty objects/arrays show `empty` in muted italic. Circular references and BigInt handled safely via a `WeakSet`-tracking replacer.
  - `tree` no longer shows only `{N}`. For objects, renders the first 4 key names after a count badge (e.g. `3 keys id, name, score…`). For arrays, shows a `N items` label. Empty trees show `empty`.
  - Both keep the existing popover-on-click interaction (full `CodeBlock` / `TreeView`).

### Added

- **`feTurbulence seed` support** — `FrostedBlurState` now accepts optional `seed?: number`, threaded through `frostedBlurSvg` and `fullFrostedSvg`. Enables multiple independent noise fields for layered/wang-tiled compositing.
- **`PAGE_MEDIUM_FROSTED_LAYERS`** — new export in `svg-utils.ts`: comma-separated list of 3 frosted-glass SVG data URIs at different randomness seeds for layered page overlay. Replaces single-URI `PAGE_MEDIUM_FROSTED_URI`.
- **Layered offset compositing for glass theme** — `html::before` now stacks 3 copies of the frosted noise at coprime sizes (1×, 0.667×, 0.5×) with offset positions and per-layer blend modes (overlay/screen/normal). Combined with seed diversity, eliminates visible tile periodicity.
- **Glass theme frosted page texture** — mesh gradient moved from `::before` to `html[data-theme="glass"]` background; a new `::before` overlays frosted-glass noise using the `--texture-*` token system (same pattern as comic). Tokens: `--texture-opacity: 0.22`, `--texture-opacity-surface: 0.15`, `--texture-blend: hard-light`, `--texture-size: 3334px`.
- **Frosted glass presets retiled for ≥10 cycles** — all 9 layerFrosted presets updated: `tile = ceil(10 / freq)` to guarantee minimum cycle density. Page layer tiles now 2000–5000px (prev 350–500), surface 667–1250px (prev 250–350), foreground 250–500px (prev 140–200). Eliminates visible periodic repetition at any viewport size.
- **Option B for noise mode Tile size slider** — `FrostedGlassNoise` now keeps the user's requested `tile` for CSS `background-size` (slider always responsive), while `frostedSvgBody` internally generates SVG at ≥10-cycle `genTile`. SVG viewBox decoupled from display size: grain scales down proportionally with display tile, but the slider never "goes dead."
- **Seeded procedural blob placement for gradient mode** — `FrostedGradState.seed` drives a mulberry32 PRNG that places 10 blobs at random positions (instead of 4 hardcoded blobs). Same seed always produces the same arrangement (deterministic). Backward compatible: without `seed`, the original 4 hardcoded blobs are used.

- **`TexturedSurface.ParamTable`** — static subcomponent that renders a 3×3 layer×strength matrix for any texture. Each cell shows the combination as a small textured badge. Enables copyable one-liner showcase demos (`<TexturedSurface.ParamTable texture="paper-grain" />`) instead of loops in the code view.
- **`TexturedSurface` showcase redesigned** — single-instance demos per texture (paper-grain, frosted-glass, brushed-aluminium) with literal JSX for direct copy-paste. `render: () => <Tuner />` fix so the code extractor sees JSX, not a named function reference.

- **`FilingTabs` pattern** — `src/ui/patterns/filing-tabs/`. Browser-tab-style tabs where the active trigger merges seamlessly into the content panel via concave radial-gradient notches (`::before`/`::after` pseudo-elements). Z-index layering: active trigger at `z-20`, panel at default (`z-10` via `relative`), inactive triggers at `z-0`. Notch radius reads `var(--radius-ui-lg)` so it tracks theme changes. `min-w-[calc(var(--radius-ui-lg)*3)]` prevents notch overlap on narrow tabs. `overflow-visible` on `TabsList` avoids clipping the notches. Wraps Radix `Tabs` primitives with no DOM contract changes.

- **`TexturedSurface` qualitative per-layer noise presets** — three tiers now use materially different SVG noise parameters (frequency, octaves, contrast stretch, tile size) instead of just scaling opacity of the same grain. Page: coarse low-freq (0.035) high-contrast (3.2) noise. Surface: medium. Foreground: fine high-freq (0.11) low-contrast (1.6) noise. Applied to all three materials (paper, metallic, frosted). Theme mode still uses opacity scaling via CSS calc.
- **`TexturedSurface` unified render path** — merged separate tiled/full render branches into a single path using `tileSize` presence to split tile vs cover layers. Eliminates code duplication and enables both modes from the same conf structure.
- **`TexturedSurface` `alignToViewport` prop** — optional boolean (default `false`). When true, tiled texture layers use `background-attachment: fixed` for viewport-anchored phase alignment across nested surfaces. Degrades gracefully to independently-tiled layers when a `transform` ancestor breaks the fixed attachment (no error, just lost alignment).
- **`TexturedSurface` `layer` prop** — `"page" | "surface" | "foreground"` (default `"page"`). Three-tier texture hierarchy with distinct noise assets per tier. Lighter layers use finer higher-octave noise at reduced tile size for qualitatively lighter grain, not just lower opacity.
- **`TexturedSurface` theme-mode uses factory-generated SVGs** — theme mode now generates `--texture-paper` inline from `LAYER_SVGS["paper-grain"]` per layer instead of reading raw SVG data URIs from CSS tokens. Removed hardcoded SVG data URIs from comic.css (remnants predating `texture-factory.ts`). The page-level `html::before` overlay still reads the theme's `--texture-paper` token for full-page Comic feel.
- **`TexturedSurface` isolation hardening** — all render modes (tiled, full, theme) now use `isolate` on the root element, ensuring mix-blend-mode on texture layers never leaks outside the component's stacking context. Prevents double-texture artifacts when TexturedSurface contains elements with their own `::after` textures.
- **`--texture-opacity-surface` token** — new theme token split from `--texture-opacity`. `--texture-opacity` now controls page-level overlay (via `html::before`), `--texture-opacity-surface` controls surface-level texture (via `TexturedSurface::after`). Both default to `0` in `tokens.css`, required by all themes.
- **`tileableMetallicSvg` in svg-utils** — anisotropic noise with `stitchTiles='stitch'` for seamless tiling; no SVG-level rotation wrapper. Used by Tuner when metallic angle > 0.5°.

### Changed

- **Texture opacity split (page vs surface)** — `TexturedSurface::after` now reads `--texture-opacity-surface` instead of `--texture-opacity`. Comic theme: page overlay at `--texture-opacity: 0.7`, surface texture at `--texture-opacity-surface: 0.35` for contrast. Frosted/metallic moved their surface opacities to the new token (page overlay off). All other themes set both to `0`.
- **Tuner metallic preview (rotated path)** — now renders a centered square layer sized to `2 × max(w, h)` via ResizeObserver, applying CSS `transform: rotate(angle)`. Container `overflow: hidden` clips the excess. Non-rotated path keeps `absolute inset-0` tiled.
- **Presets "Heavy brush"** — uses `tileableMetallicSvg` with same oversized square + CSS `rotate(45deg)` approach.
- **TexturedSurface rendering strategy per material** — Frosted and rotated materials now use an element-sized (non-tiled) SVG layer sized by container-query formula (`calc(100cqw + 100cqh)`), provably covering the element at any rotation angle. Paper and 0° metallic keep tiling but add a second grain pass at a coprime tile size (97px for paper, 127px for metallic) at 15% opacity to break residual periodicity. Frosted receives a fine dither noise overlay at 3% opacity to suppress colour banding.

### Fixed

- **DemoSection width squeeze** — replaced `flex items-center justify-center` default layout with a plain block container. Added `layout?: "fill" | "center"` to demo entries (default `fill`) so wide components (Combobox, MultiSelect, Progress, CodeBlock, Textarea) fill available width, while small inline components can opt into centered layout.
- **CodeBlock empty header bar** — the header `<div>` is now conditional: only rendered when `header` or `language` is present. When absent, the copy button floats over the code area's top-right.
- **CodeBlock colors** — replaced `bg-secondary`/`text-fg`/`text-muted` with dedicated `--color-code-bg`/`--color-code-fg`/`--color-code-muted` tokens, defined in every theme. Background now sits slightly recessed from the page surface with comfortable contrast.
- **CodeBlock language badge placement** — badge rendered in the header bar when present; as a subtle top-right overlay (paired with copy button) when there is no header bar.
- **TreeView structural identity** — added `kind?: "object" | "array"` to `TreeNode`. Branches now show `{} N` or `[] N` sigils with child count. Object keys vs values are visually distinct via weight/color. Array indices render as dim monospace. Depth guide lines highlight on hover to trace the parent path. Empty collections show as `[]`/`{}` explicitly.
- **TreeView `objToTreeNodes`** (CellValue) — now passes `kind: "object"` or `kind: "array"` on branch nodes so JSON trees display correct sigils.
- **Toolbar actions overflow on narrow viewports** — actions div (`New` button) was not explicitly stretching to full width in the `<sm:` flex-column layout, causing it to overlap the search field. Added `w-full sm:w-auto` so it fills the column on narrow screens and reverts to content-width on desktop.
- **TexturedSurface explicit textures invisible on opaque backgrounds** — `::after` with `-z-10` rendered behind the opaque `bg-surface`, hiding the overlay on any non-translucent theme. Replaced with a three-layer positioned stack (solid bg → texture overlay at `opacity` + no blend mode → content) that works on any background.
- **TexturedSurface metallic SVG vertical banding** — `baseFrequency='0.02 0.5'` (extreme directional noise) created visible vertical seam-like transitions. Changed to isotropic `baseFrequency='0.4'` for clean grain without directional artifacts.
- **TexturedSurface explicit-texture rendering strategy** — SVGs now use `feColorMatrix` to output pure black with noise-controlled alpha (R=G=B=0, A=c×noise_R). The overlay renders at `mix-blend-mode: normal` (no CSS blend mode), compositing a dark grain directly on the background. This avoids the static-TV-snow look of full-color feTurbulence output and works universally on any background color (light or dark) without blend-mode-dependent visibility. Paper (alpha cap 0.4), frosted (0.6), metallic (0.5). Per-texture strength opacities: paper 0.35/0.60/0.90, frosted 0.20/0.35/0.50, metallic 0.15/0.30/0.50. Frosted uses `baseFrequency='0.005' numOctaves='4'` (sub-visible cloud-like haze for etched glass), metallic uses `baseFrequency='0.5 0.005'` (directional for brushed metal streaks).

### Added

- **Code surface color tokens** — `--color-code-bg`, `--color-code-fg`, `--color-code-muted` added to `@theme` in `tokens.css` and every theme file. Automatically enforced by `check-themes.mjs`.
- **TreeView `kind` field** — optional `kind?: "object" | "array"` on `TreeNode` enables structural sigils, child counts, and dimmed array indices. `hovered` tracking highlights depth guide lines along the path from root to the hovered row.

- **Canvas performance under Glass theme** — `background-attachment: fixed` on `html[data-theme="glass"]` replaced with a `position: fixed; pointer-events: none` `::before` pseudo-element (own composited layer, never repaints). `Canvas` now overrides `--backdrop-blur` and `--texture-opacity` to `0` as inline custom properties on its transforming layer, so no descendant (including anything a consumer renders inside a node) applies `backdrop-filter` or texture while panning/zooming — a structural fix, not a per-component patch. `will-change: transform` moved onto that single transforming layer only (removed the temptation to put it on individual nodes). `GraphNode` gained `contain-[layout_paint]` so one node's paint/layout never cascades to its siblings.
- **Theme color defects (contrast + hierarchy)** — base `--color-bg` softened from pure white (`oklch(1 0 0)`) to `oklch(0.985 0 0)`. Glass light `--color-border` was a white border on a light background (invisible); now a themed, sufficiently-opaque tone. Glass dark `--color-primary` was *darker* than glass light `--color-primary` (an inversion — dark-mode accents must gain luminance); now brighter, paired with a near-black `--color-primary-fg` (matches the pattern every other theme already uses for dark-mode primary). Semantic colors (`--color-danger`, `--color-success`, `--color-warning`) were carrying alpha in Glass; now fully opaque everywhere — transparency is reserved for `--color-surface-*`. `--color-bg` is opaque in every theme now (was `/0.8` in Glass).
- **Badge / Kbd vertical cramping** — new `--density-chip-min-h` / `--density-chip-py` tokens; both components now use a `min-height` instead of relying on `py-0.5` alone.

### Added

- **`scripts/check-contrast.mjs`** — wired into `npm run validate`. Asserts WCAG AA (≥4.5:1) for `fg`/`bg`, `muted`/`bg`, `primary-fg`/`primary`, `danger-fg`/`danger`, `success-fg`/`success`, `secondary-fg`/`secondary` across every theme, light and dark, by resolving the same cascade the browser uses (theme file overrides tokens.css/dark.css by source order; a theme's own `.dark` block overrides its own light block).
- **Canvas surface boundary tokens** — `--color-canvas-surface` (opaque, per-theme) and `--texture-opacity` / `--texture-blend` (per-theme, default off) added to `tokens.css` and every theme file; enforced by `scripts/check-themes.mjs`. `GraphNode` now renders with `bg-canvas-surface` instead of `bg-surface`.
- **Typography depth** — `--text-3xl`, `--text-4xl`; `--font-weight-normal/medium/semibold/bold`; `--leading-tight/snug/normal/relaxed`; `--tracking-tight/normal/wide`.
- **Motion tokens** — `--duration-fast/normal/slow`, `--ease-standard/in/out`. Replaced hardcoded `duration-300` (Progress) and `duration-200` (Drawer) with token-driven values.
- **Z-index scale** — `--z-base`, `--z-canvas-grid`, `--z-canvas-controls`, `--z-dropdown`, `--z-overlay`, `--z-toast`. Replaced hardcoded `z-50`/`z-10`/`z-[100]` in Canvas, Dialog, Drawer, Popover, Tooltip, DropdownMenu, Select, Toast.
- **Focus ring tokens** — `--focus-ring-width`, `--focus-ring-offset`. Replaced hardcoded `ring-2`/`ring-offset-2` across all focusable primitives.
- **`TexturedSurface` rebuilt as a real overlay** — the texture is now a `::after` pseudo-element (`pointer-events-none`, opacity/blend from theme tokens, sized from `--texture-size`) instead of being baked into the element's own `background-image`. It rasterizes once and is a no-op in every theme except `comic` (the only theme that sets `--texture-opacity` above 0), enforced by the boundary tokens above.

### Removed

- **`TexturedText`** — the earlier "paper texture" attempt on text (`bg-clip-text` + a fixed blend mode, regardless of theme) only changed colors and font sizes; it didn't model texture as an overlay, had no per-theme on/off, and duplicated `Typography`'s scope. Removed rather than patched — text-clip textures can't share the overlay model `TexturedSurface` now uses. `TexturedSurface` (below) is the supported way to apply texture.

### Changed

- **Toast shadow** — `shadow-lg` → `shadow-elevated` so toast shadows use the theme's `--shadow-elevated` token instead of a hardcoded Tailwind shadow. Fixes toasts ignoring theme shadows (visible in Glass theme's tinted shadows).
- **Glass dark mode `--color-primary-fg`** — changed from purple-tinted `oklch(0.15 0.05 290)` to neutral `oklch(0.1 0 0)` so foreground text works on success/danger colored backgrounds without hue clash.

### Added

- **Brutal theme** (`brutal.css`) — neo-brutalism with stark warm off-white bg, punchy orange primary, bright yellow secondary, thick 3px black borders, solid block offset shadows (4px/8px), sharp radii (4px/0px).
- **Stark theme** (`stark.css`) — strict monochrome with pure white/black backgrounds, zero saturation, micro-contrast surfaces, black/white primary buttons, ultra-thin borders.
- **`--color-success-fg` and `--color-danger-fg` tokens** — new token layer across all themes (tokens.css, dark.css, neon.css, contrast.css, comic.css, glass.css). Each theme defines appropriate foreground colors for success and danger semantic backgrounds, matching each theme's primary-fg pattern. Toast uses `text-success-fg` / `text-danger-fg` instead of `text-primary-fg`, giving every theme independent control over toast variant text colors.
- **GraphNode radius** — `rounded-ui` → `rounded-node` so node corner radius (`--radius-node: 6px`) is fixed and invariant across all themes. Only `--radius-ui*` tokens are themeable.
- **Glass theme contrast fix** — darkened bg (light `0.95→0.92`, dark `0.12→0.08`), secondary changed to dark low-opacity wash (light) / bright low-opacity wash (dark), surfaces bumped 5-10% opacity, dark mode primary darkened (`0.70→0.48`) for white primary-fg universally, all semantic fg tokens unified to white.
- **Glass theme redesign** — complete color token overhaul for true glassmorphism. Mesh gradient backgrounds (light: blue-violet-amber-cyan radial spots; dark: deep indigo-violet-cyan-teal glows). Surfaces at 50-85% opacity with 24px backdrop blur. Vibrant indigo primary (`oklch 0.55 0.22 290`). Expanded radii (16px/10px/24px). Tinted shadows. Improved contrast ratios on frosted surfaces.

### Added

- **Plus Jakarta Sans font option** — `--font-plus-jakarta` token in `tokens.css`, `@font-face` via Google Fonts, `[data-font="plus-jakarta"]` rule in `globals.css`, selectable from the showcase header dropdown.

## [0.2.0] — 2026-07-18

### Added

- **Glass theme** — `glass.css` profile with semi-transparent glass surfaces (15-65% opacity), 24px backdrop blur on surfaces, teal/neutral gradient background (light) / deep space with cyan-violet-magenta radial glows (dark), glass edge highlights via `inset box-shadow`. Multiple color-scheme iterations during development.
- **Comic theme** — `comic.css` profile with cream/paper-like background (SVG noise filter texture), warm saturated colors, thick borders (`2px`), rounded corners, playful 3D drop shadows, Comic Sans font family via `--font-comic` token.
- **Comic Sans font option** — `--font-comic` token in `tokens.css`, `[data-font="comic"]` rule in `globals.css`, selectable from the showcase header dropdown.
- **Surface token layer** — `--color-surface`, `--color-surface-hover`, `--color-surface-active`, `--color-surface-elevated` tokens in `tokens.css` and all theme files, decoupling component surfaces from page background.

### Changed

- **CellValue truncation** — all render paths (text, number, percentage, date, datetime, bytes, duration, status, tree fallback, default) now wrap text in `truncate` elements so content gets ellipsis when the column is too narrow.
- **CellValue AudioDisplay** — replaced hardcoded pixel values `min-w-[200px]`, `w-[100px]` with Tailwind rem equivalents (`min-w-48`, `w-24`) so they respect user zoom.
- **Toast variants** — default variant uses `bg-surface-elevated` instead of `bg-bg` (fixes invisible toast on transparent glass backgrounds); success/danger variants use `text-primary-fg` instead of `text-bg` for the same reason.
- **Glass theme opacity** — `--color-surface-elevated` bumped from 30% → 65% opacity (light) and 25% → 55% opacity (dark) for readable overlay content while preserving frosted glass feel.
- **Card** — background migrated from `bg-bg` to `bg-surface` (base surface token).
- **Dialog, Drawer, Popover** — backgrounds migrated from `bg-bg` to `bg-surface-elevated` (elevated surface token).
- **GraphNode** — background migrated from `bg-bg` to `bg-surface`.
- **Glass theme** — multiple color scheme iterations (warm → cool blue → teal+neutral) based on feedback.
- **Font selector priority** — `[data-font]` rules remain unlayered so font dropdown always overrides theme default fonts.
- **Theme data attributes** — `[data-font]` selectors placed after theme `@import` statements so font selector takes priority.
- **OrchestratorNode width** — wrapper gets `position: relative` and GraphNode receives `max-w-[160px]` so right-side port anchors always align with the actual node right edge.

### Added

- **CLI tool** — `bin/my-you-eye.mjs` with `init` (copies SKILL.md + components.json to `skills/`), `list` (component table), `sync` (overwrite re-copy). Zero external deps. Ships via `package.json` `bin` and `files`.
- **SKILL.md** — agent skill file shipped with the package for AI agents in consuming projects.
- **components.json** — machine-readable component catalog with group, name, and variant metadata for all 52 components.

### Changed
- **Toast backgrounds** — success/danger variants changed from translucent (`bg-success/10`) to solid (`bg-success text-bg`, `bg-danger text-bg`).
- **GraphNode footer text** — changed from `"table"` to `"source"` in all variant demos.
- **Table sticky header** — removed `overflow-x-auto` from Table wrapper so `<thead>` sticky positions relative to outer `ScrollArea`.
- **StatCard layout** — `grid grid-cols-3 gap-4` → `flex flex-col gap-4` to prevent text overflow in narrow masonry columns.
- **TreeView demo height** — `h-80` → `h-[440px]` so 13 expanded items show without scroll.
- **Header controls** — native `<select>` elements replaced with reusable `Select` component (Radix-based, `size="sm"`) for theme and font pickers.
- **Popover positioning** — `updatePositionStrategy="always"` so popovers recalculate position on scroll and stay attached to their trigger.
- **CellValue JSON popover** — removed redundant custom `CopyButton` (CodeBlock has built-in copy-on-hover). Removed "JSON" header label. Widened preview to `max-w-[250px]`.

### Fixed

- **Custom scrollbar consistency** — replaced native `overflow-auto` divs with `<ScrollArea>` in Combobox (options list), CommandPalette (results list), DrawerBody (content area). CodeBlock `<pre>` gets the same webkit + Firefox scrollbar styling.
- **Textarea auto-resize** — changed from `useEffect`-based to `onChange`-based resize so it works on every keystroke, not just the first.
- **Port drag not moving node** — added `onMouseDown` stopPropagation to port hit zones so drag starts don't propagate to node drag handler.
- **Avatar images** — replaced `i.pravatar.cc` with `http.cat` (placekitten returned 521).
- **CellValue line limit** — compressed to 188 lines (was 327), under the 250-line lint limit.
- **Textarea unused import** — removed stale `useEffect` import.
- **CellValue audio display wrapping** — widened time label to `w-[100px]` and added `whitespace-nowrap`.
- **Table showcase** — removed duplicate "Striped + compact" demo and duplicate "Column alignment (numbers right)" demo.
- **GraphNode showcase** — all 3 demos use consistent row-accent-footer design with meaningful metadata.
- **Port showcase** — "Sides" and "Row-aligned ports" demos now use node-border-like containers matching GraphNode's port dot layout.
- **Canvas showcase white screen** — extracted `DraggableCanvasDemo` into module-level component to avoid hooks-in-render-function bug.
- **Showcase layout** — removed md:grid-cols-2 grid and column-divider; CSS columns pack uneven heights without ragged whitespace.
- **Port overlap** — multiple ports on same side no longer stack at top-1/2; distributed vertically by index.
- **ScrollArea export** — fixed missing named export so ScrollArea is consumable from the public API.

## [0.1.0] — 2026-07-17

### Added

- **Drawer component** — slide-in panel from left/right via Radix Dialog. Sizes: `sm | md | lg`. Subcomponents: Header, Title, Description, Body, Footer.
- **Combobox component** — autocomplete with search input inside Popover. Keyboard navigation, filtered options list.
- **CommandPalette component** — ⌘K-style fuzzy search overlay with grouped actions, keyboard navigation, and keyboard shortcut hints.
- **DataTable pattern** — auto-rendering table from `columns: {key, header, type, align}` + rows array, each cell rendered via CellValue.
- **Canvas components** — Canvas (drag-to-pan, ctrl+scroll zoom), GraphNode (grid-locked height, row-anchored ports, header/body/footer slots with traffic-light dots), Port (in/out variants, connected/highlighted states).
- **CellValue numeric types** — `number` (monospace, right-align, Intl.NumberFormat), `date`/`datetime` (relative + absolute), `bytes`, `duration`, `array` (chips via Badge).
- **CellValue JSON copy button** — copy-to-clipboard button in the JSON popover header.
- **Table alignment** — `align` prop on TableCell and TableHead (left/center/right). Numbers render right-aligned.
- **Table sticky header** — `sticky` prop on TableHeader for scrollable tables.
- **TreeView keyboard navigation** — arrow keys, Home/End for focus movement.
- **TreeView guide lines** — vertical indent guides connecting parent to children.
- **TreeView controlled state** — `expandedKeys`/`onToggle` props for external expand control.
- **TreeView depth-based expand** — `defaultExpandedDepth` (default 1) replaces all-collapsed default.
- **Select `showIndicator` prop** — suppress the checkmark indicator on SelectItem.
- **Showcase masonry layout** — CSS columns (columns-1/2/3), column-rule divider. Short and tall components pack without ragged gaps.
- **Showcase profile switcher** — dropdown in header to toggle between light/dark/neon/contrast profiles.
- **Showcase font switcher** — dropdown to toggle between Sans, Serif, Mono across the entire showcase.
- **Showcase token reference** — color swatches, spacing bars, radius samples, text sizes under the `typography` tab.
- **Showcase `canvas` group** — new tab for Canvas, GraphNode, Port components.
- **Theme/profile system** — profiles defined in `src/styles/themes/*.css` as complete token-override blocks. `--border-width`, `--backdrop-blur` tokens wired to Card and Dialog.
- **Theme validation** — `scripts/check-themes.mjs` asserts every profile defines the full color token set; wired into `npm run validate`.
- **Sample profiles** — neon (frosted, cyan glow) and contrast (bold borders, no shadows) shipped.
- **Snapping helper** — `snap()`/`useSnap` in canvas folder for 16px grid snapping.
- **URL replacements** — `replacements` prop on CellValue for pattern-based label display on URLs.
- **Global scale CSS hook** — `html { font-size: calc(1rem * var(--scale, 1)) }` ready for a scale slider.
- **GitHub Actions publish workflow** — auto-publishes to npm when a `v*` tag is pushed.
- **AGENTS.md rules** — §4 showcase layout fixed infrastructure; §0.9 theme/profile token-override contract.

### Changed

- **Dark mode** — moved from inline in tokens.css to `src/styles/themes/dark.css`.
- **Magic values → tokens** — replaced hardcoded `p-4`, `gap-3`, `gap-2`, `gap-1`, `opacity-60`, `shadow-sm` etc. with semantic token-mapped Tailwind classes across all component files.
- **Badge soft variants** — rewritten with proper Tailwind v4 `/15` opacity syntax (was a silent no-op).
- **GraphNode ports** — repositioned outside node border using `right-full`/`left-full`, labels never overlap node content.
- **CellValue JSON display** — now renders as headerless CodeBlock inside the Popover. Preview text truncated to prevent overflow.
- **Showcase demo containers** — DataList and TreeView variants displayed side-by-side instead of separate wide containers.
- **GraphNode rows alignment** — keys left-aligned with truncation, values right-aligned.
- **GraphNode header dots** — changed from three gray circles to red/yellow/green traffic-light window control colors.
- **GraphNode row hover** — added `hover:bg-muted/10 transition-colors` to rows for subtle interactive feedback.
- **GraphNode footer** — removed diamond icon prefix; footer content renders cleanly without a prefix.
- **GraphNode height** — content-driven height replaced with grid-derived height when `rows` prop is used.
- **Package renamed** — from `@sadigaxund/ui` to `my-you-eye`.
- **Canvas showcase** — merged 3 separate demos (empty grid, static nodes, draggable nodes) into a single "Pipeline canvas" demo with 3 draggable ETL nodes using row-based GraphNode.

### Fixed

- **Canvas dot grid** — `0.5px` → `1.5px` dots, removed `color-mix` for cross-browser compatibility.
- **Badge soft variant** — `bg-opacity-15` was a silent no-op in Tailwind v4; soft variants now properly show tinted backgrounds.
- **GraphNode showcase** — Variant nodes all sat at `x=0, y=0` overlapping each other. Staggered to 0/200/400 positions.
- **GraphNode "With accent & ports"** — missing `position: relative` container caused node to float against viewport.
- **Alert icon demo** — missing `max-w-lg` wrapper made icon demo stretch full width while others didn't.
- **Port label spacing** — circle and label were almost touching; added `gap-2` between them.
- **StatCard padding** — `p-panel` override (16px) was tighter than CardContent default `p-6 pt-0` (24px). Removed override to let default spacing apply.
- **Showcase overlay demos** — added `overflow-visible` to demo containers so Dialog/Popover/Tooltip portals don't clip.
- **Showcase 2-column layout** — full-width separators broke grid auto-flow, pushing all content to left column. Replaced with `gap-y-8`.
- **TreeView JSON overflow** — JSON values longer than container width spilling over. Preview now truncates with ellipsis.
- **GraphNode demo overflow** — "With rows" node positioned at `x=10` crossed the center column separator. Moved to `x=80`.
- **Showcase URL demos** — replaced privacy masking with visual link labels (e.g. `example.com/path`, `API Docs →`).

## [0.0.0] — 2026-07-17

### Added

- **Scaffold** — Vite + React + TypeScript + Tailwind v4 project setup.
- **Design tokens** — base color palette (bg, fg, primary, secondary, success, warning, danger), border radius, font families, text sizes.
- **Showcase app** — auto-discovering component showcase with group tabs and dark mode toggle.
- **ESLint config** — flat config banning styled native elements outside `src/ui/`, hardcoded color values, restricted imports.
- **Validation pipeline** — `npm run validate` runs type checking, linting, showcase coverage check, and full build.
- **CI** — GitHub Actions workflow running validation on push and PR.

### Components

- **Phase 1** — Spinner, Button, Input, Label, Card, Badge, Alert.
- **Phase 2** — Checkbox, RadioGroup, Switch, Textarea, Select, FormField.
- **Phase 3** — Dialog, Tooltip, DropdownMenu, Popover, Toast, ConfirmDialog.
- **Phase 4** — Tabs, Breadcrumbs, Pagination, Avatar, Skeleton, EmptyState, Table.
- **Phase 5** — PageShell, Toolbar, StatCard.
- **Phase 6** — Separator, Progress, StatusDot, Kbd, CellValue.
- **Phase 7** — Canvas (initial), GraphNode, Port.
- **Phase 8** — ConnectionLine, ScrollArea, Image, FileDrop, Avatar, CellValue (image/audio), MultiSelect.
