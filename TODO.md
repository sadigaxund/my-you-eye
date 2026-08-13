# TODO — Finalizing the animation/video layer

> Governed by AGENTS.md. §9 (motion) is amended by §"Architecture decisions" below.
> Each phase has an acceptance check. Do not start a phase until the previous one passes.

---

## 0. Goal (why this repo exists now)

One library that serves three consumers from **one version number**:

| Consumer | Surface | Driver |
|---|---|---|
| Regular React apps | static components | none |
| **Live/reactive presentations** — click to advance, hover, drag | same components + motion | DOM (rAF) |
| **Recorded video** — MP4 for YouTube | same components + motion | Remotion (frame) |

The recording target is coding content: **code walkthroughs, graphs, software
architecture, systems interaction, data flows, statistics and metrics.** The library must
cover enough of that space that manual screen recording is the exception, not the norm.

**Stability over customizability.** The consuming project supplies *data* and picks from a
closed set of *variants*. It does not supply `className`, `style`, colors, timings, or
layout. All taste lives in this repo. Bump the version in the consuming project → the new
look ships automatically, with no call-site edits.

---

## 1. Architecture decisions (supersede parts of AGENTS.md §9)

### D1 — Motion lives in this package, not a monorepo. **Phase 5 of the old plan is cancelled.**

Old plan: `packages/motion`, `packages/scenes`, pnpm workspaces + Turborepo.
New plan: `src/motion/`, `src/scenes/`, `src/present/` inside the existing package,
published as **subpath exports**:

```ts
import { Button, CodeBlock } from "my-you-eye";
import { Reveal, Stagger }    from "my-you-eye/motion";
import { CodeScene, Diagram } from "my-you-eye/scenes";
import { Presenter }          from "my-you-eye/present";
import "my-you-eye/styles.css";
```

Rationale — this is the direct answer to the versioning requirement in §0:

- **One version number.** A monorepo with `@lib/ui` + `@lib/motion` + `@lib/scenes` means
  three versions to keep in lockstep in the consuming project. One package means
  `npm i my-you-eye@latest` and everything moves together.
- One `npm run validate`, one eslint config, one showcase app, one changelog.
- Tier separation (AGENTS.md §9b) is preserved — enforced by **eslint import boundaries**
  instead of package boundaries (see A0 below). The rule does not weaken: `src/ui/` still
  may not import remotion or motion.
- `apps/video/` stays, demoted to a **dev harness** (Remotion Studio + MP4 render). It is
  never published and never imported by the library.
- `packages/motion/` is deleted after its contents move to `src/motion/`.

### D2 — Two timeline drivers behind one hook. **This adopts the AGENTS.md §9e "fallback".**

AGENTS.md §9e says to build the driver abstraction only if `@remotion/player` proves
insufficient. It is insufficient for the *reactive* requirement: inside a `<Player>` the
frame is owned by playback, so a primitive cannot respond to a hover, a drag, or a live
value change. Click-to-advance works; genuine interactivity does not.

So: primitives never call `useCurrentFrame()` directly. They read from context.

```
<MotionRoot mode="video">   → RemotionDriver: calls useCurrentFrame() at its own top level
<MotionRoot mode="live">    → DomDriver: rAF clock, seekable, pausable, reversible
                              ↓ provides { frame, fps, durationInFrames }
useTimeline()  →  useProgress(timing)  →  progress: 0→1
                              ↓
        every primitive is a pure function of progress
```

No conditional hooks (each driver calls its own hook at its own top level). No duplicated
primitives. ~80 lines total. AGENTS.md §9c rule 1 ("frame-driven only") is **strengthened**,
not relaxed: primitives may not read wall-clock time at all — only `useTimeline()`.

### D3 — Charts derive their palette from theme tokens; themes need no per-chart work.

Charts need a categorical ramp. Defining 8+ new color tokens in all 10 theme files is a
maintenance trap. Instead, define them **once** in `tokens.css`, rotated in oklch off the
theme's own `--color-primary`:

```css
--color-chart-1: var(--color-primary);
--color-chart-2: oklch(from var(--color-primary) l c calc(h + 40));
/* … 8 total, plus a 5-step sequential ramp for heatmaps */
```

Every theme inherits a coherent, contrast-checked palette for free. `check-themes.mjs`
gets a new **derived** category: required in `tokens.css`, optional per theme.
This is the one place the plan touches AGENTS.md §0.9 — see the approval list.

### D4 — Animatable static components take `progress`, never import motion.

AGENTS.md §9b forbids `src/ui/` from importing motion. But charts, diffs, terminals and
sequence diagrams all need to animate. Resolution — the **progress-in convention**:

```tsx
// src/ui/bar-chart/BarChart.tsx  — pure, no motion import, no remotion
<BarChart series={…} progress={0.4} />   // 0→1; omitted = fully drawn

// src/scenes/ChartScene.tsx — the scenes tier does the wiring
<BarChart series={…} progress={useProgress({ duration: "normal" })} />
```

Any `src/ui/` component that can animate accepts an optional `progress?: number`, defaulting
to `1` (final state). It stays a pure function of that number — usable static, in a video,
or in live mode, with the tier boundary intact and nothing to duplicate.

Consequence: **`CodeDiff` is a scenes-tier component, not a motion primitive** — it knows
about `CodeBlock`, so it cannot live in `src/motion/`. `motion` provides only generic,
child-agnostic wrappers (§9c rule 3).

### D5 — The scene schema is the public API.

The consuming project writes one typed data object and nothing else:

```ts
export const video: Video = {
  meta: { fps: 30, width: 1920, height: 1080, theme: "dark", font: "sans" },
  scenes: [
    { kind: "title",   title: "How the scheduler works", subtitle: "Part 3" },
    { kind: "code",    lang: "ts", file: "scheduler.ts", code: src,
      steps: [ { say: "entry point", focus: [4, 9] }, { say: "the retry loop", focus: [22, 31] } ] },
    { kind: "diagram", preset: "architecture", nodes: [...], edges: [...],
      steps: [ { reveal: ["api"] }, { reveal: ["queue", "worker"], flow: ["api→queue"] } ] },
    { kind: "chart",   chart: { type: "bar", series: [...] }, steps: [...] },
  ],
};
```

`<VideoRoot video={video} />` renders it to MP4. `<Presenter video={video} />` renders the
same data as a live click-through. **No timings, no colors, no classNames in the data.**
Step pacing is derived from content by the library (with a coarse `pace: "slow"|"normal"|"fast"`
escape hatch per scene). Every field is a closed union or plain data — nothing a consumer
can pass that produces a broken frame.

---

## 2. Needs your approval before Phase A starts

| # | Ask | Why |
|---|---|---|
| **P1** | **New root dependencies:** `remotion`, `@remotion/player`, `@remotion/transitions`. `remotion`/`@remotion/player` as *optional peer* + devDependency (so plain-UI consumers install nothing extra). | AGENTS.md §0.7 — no deps without your say-so. |
| **P2** | **Two new showcase groups: `charts` and `motion`.** 8+ chart components and ~20 motion primitives fit no existing group. | AGENTS.md §4 — needs your approval. |
| **P3** | **D3 above** — chart color tokens defined only in `tokens.css`, derived via `oklch(from …)`, optional per theme. | Touches AGENTS.md §0.9 "every profile defines the complete set". |
| **P4** | **Deleting `packages/motion/`** and cancelling the monorepo migration (D1). | Reverses a previously-agreed phase. |
| **P5** | **Behaviour changes in Phase A** are not all purely additive — a few are bug fixes that change current output (sticky-header colour, tree elbow alignment, bezier label position, `ConnectionLine` label radius). AGENTS.md §3.2 says don't change default appearance unless asked. | I'm asking. |

---

---

# ⚑ CURRENT STATUS — read this first

Branch `feat/animation-layer`. `npm run validate` green, `npm run audit` clean,
dev server verified (main.tsx + every new/changed showcase module all 200).
HEAD = `f7609ed`.

**Process rule: ONE agent at a time, working in the main checkout, sequentially.**
No parallel batches, no worktrees, no sub-agents. Finish each component completely
(component + `index.ts` + showcase + `src/index.ts` export) before starting the next,
so an interruption never leaves a half-built folder.

### Done

- **Phase A** — full audit/repair (scrollbars, alignment, truncation, dead API, reuse).
- **Phase B + C** — motion engine: driver foundation + 25 primitives, shipped as
  `my-you-eye/motion` (remotion-free) and `my-you-eye/motion/remotion`.
  `packages/motion/` deleted, `apps/video` migrated. MP4 render verified.
- **Phase D2** — charts: `ChartFrame`, `Legend`, and 8 SVG charts on a theme-derived
  `oklch` palette, validated zero-FAIL across 9 themes × light/dark.
- **Owner feedback round 1** — `Port` socket shape, slider smoothing (rAF audio +
  step derivation), `GraphNode` header/footer slots, JSON popover highlighting,
  8 new `CellType` types, label-over-path legibility, demo caption spacing.
- **Guards** — `scripts/check-motion.mjs` wired into `validate`.

### QUEUE — in this order

**Q1. Edge routing — ✅ COMPLETE** (`a5fd018`)
- [x] `variant="orthogonal"` with real obstacle avoidance. A previous agent found and
      was mid-fix on a genuine bug: for a flat edge, a sideways jog does *not* clear a
      centred obstacle — clearing only the vertical spine is insufficient. Horizontal
      legs must be checked too.
- [x] `waypoints?: Point[]` on `ConnectionLine` and `ConnectionLayer` edges.
- [x] Parallel-edge separation (edges sharing a node pair must not overlap).
- [x] Label placement that avoids crossing edges.
- [x] `kind: "sync" | "async" | "data" | "error"` styling union.
- [x] Fix the `ConnectionLayer` demo so no edges cross.
- All geometry stays in the shared `ConnectionPath`/`geometry.ts` — never forked.

**Q2. Feedback round 1 leftovers — ✅ COMPLETE** (`9782d6f`)
- [x] `ArrayDisplay` reuses `DataList` instead of hand-rolled pills.
- [x] Rewrite the `DataList` "Label width" demo — currently unreadable; make the
      `sm`/`md`/`lg` difference and the truncation behaviour obvious.

**Q3. Content components — ✅ COMPLETE** (`1258c25`..`f7609ed`)
- [x] `Terminal` — prompt/command/output/exit code, composing `CodeBlock`. (`1258c25`)
- [x] `DiffBlock` — unified + side-by-side, reusing `CodeBlock`'s tokenizer. (`deb269e`)
- [x] `DeviceFrame` — browser/window/phone chrome. (`906238c`)
- [x] `Timeline` — event sequence with lanes. (`f6b177e`)
- [x] `StatCard` delta/sparkline/icon/size + `StatGrid`. (`936556f`)
- [x] `Comparison` — side-by-side + wipe divider, `progress`-driven. (`42202ae`)
- [x] `Callout` — extend `Alert` with `note`/`tip` + presentation size. (`9fad956`)
- [x] `src/lib/layout.ts` — `layered()` (DAG ranking + crossing reduction) and
      `grid()`. Imports `GRID`/`snap` from `graph-node/grid.ts`, never redeclares.
      Crossing-reduction proven by `scripts/prove-layout-crossings.mjs`
      (13 → 1 crossings on a deliberately scrambled 3-layer graph). (`f7609ed`)

**Q4. Diagram components — ✅ COMPLETE** (depend on Q1)
- [x] `GraphGroup` — labelled boundary regions. (`04bddc0`)
- [x] `SequenceDiagram` — actors, lifelines, messages, activation bars, self-messages,
      notes. Message arrows are `ConnectionLayer` edges (`kind` mapped onto
      sync/async/data/error), never a hand-drawn `<path>`. (`3e14994`)
- [x] `Annotation` — leader line + label. Path math reused from
      `connection-line/geometry.ts`; `progress` strokes the line on via
      `stroke-dashoffset` then fades the label in. (`237c5af`)
- [x] `FileTree` — pattern over `TreeView`. Extended `TreeView` with a
      per-item `trailing` slot (backwards-compatible) instead of forking it;
      also fixed the `TreeView` + `CellType type="image"` row overflow
      (new `size-thumb-sm` token, `compact` prop). (`76bce8f`)

**Q5. Scenes — ✅ COMPLETE** (`2ee262a`..`8db8337`)
- [x] `src/scenes/schema/` — the `Video`/`Scene`/`Step` union, published as `my-you-eye/scenes`.
      Plain JSON-serializable closed unions: no `className`, no `style`, no colors, no frame
      counts, no pixel coordinates. Diagram node positions are grid units and optional, group
      rects are computed from member-node bounds, sequence activation bars are derived — the
      "wired up without care for how it looks" failure mode is unreachable, not just discouraged.
- [x] Runtime validator (`validateVideo`/`assertVideo`) with JSON-path pointers and
      reference-integrity checks across diagram/sequence/chart ids.
- [x] `sceneSteps`/`sceneDuration` — the timing spine `VideoRoot` and the Presenter share,
      so MP4 and click-through pacing cannot drift.
- [x] All 11 scenes + `SceneRenderer` (no placeholder branch remains) + `CodeDiff`.

**Q5 follow-ups deferred to a later pass** (not blocking Q6):
- `ChartStep.focus` dimming only applies to `bar`/`line` — gauge/heatmap/scatter/funnel have
  no comparable "category" concept, and `validate.charts.ts` only builds a category set for
  those two. Either widen both or document the limit in the SKILL reference.
- `DiagramScene` doesn't auto-fit its `Canvas` viewport to content (starts at 0,0 / zoom 1).
- `SequenceScene`'s derived activations are a single active/inactive flag per participant,
  with no call-stack depth: a bar closes on the participant's next outgoing message whether
  or not it is a genuine reply.

**Q6. Presenter / video / packaging**
- [x] **Phase F — ✅ COMPLETE** (`e31c53e`..`04cf5b0`). `src/present/` published as
      `my-you-eye/present`: `useSteps`, `Presenter`, `SpeakerView`, and live-only diagram
      interactivity via `LiveInteractionContext` (inert with no provider — a static or
      Remotion render is byte-identical, verified by rendering to static markup before and
      after the change and diffing). `check-motion.mjs` and `check-showcase.mjs` both extended
      to `src/present/**`; the only wall-clock exception is the speaker view's elapsed timer,
      scoped to that one named file in the guard.
- [x] **Phases G + H — ✅ COMPLETE** (`d2c0332`..`073c707`). `src/video/` published as
      `my-you-eye/video` (`VideoRoot` + `TransitionSeries` + chrome), `PlayerEmbed` at
      `my-you-eye/present/player`, `gen-manifest` covering all four tiers plus the whole
      `Video` schema re-parsed from source, and the reference video **rendered to a real MP4**
      (1072 frames = 1132 scene frames − 60 frames of transition overlap, matching `nb_frames`).
      Remotion isolation verified at the artifact level: no chunk reachable from the built
      `index`/`motion`/`scenes`/`present` entries references `remotion` or `@remotion/*`.
      `npx my-you-eye render <file>` was dropped (TODO marked it a nice-to-have).

**P1 resolved:** `@remotion/player` and `@remotion/transitions` approved and installed
(`a09bfc4`) as optional peers + devDependencies, alongside `remotion`. `PlayerEmbed` is
built in Phase G/H, not Phase F.

**Q7. SKILL set — ✅ COMPLETE** (`ece1924`..`f0ee584`)
- [x] `SKILL.md` rewritten as a short router across all four tiers + decision table.
- [x] `references/{diagrams,motion,scenes,data-display}.md`. `diagrams.md` is prescriptive:
      20 numbered rules, a wrong-vs-right example, and a runnable pre-flight checklist.
- [x] `references/` ships in `package.json` `files`; `my-you-eye init`/`sync` copy it.
- [x] Fixed the manifest parser dropping any field whose doc comment contains a `;`
      (`DiagramStep.focus` was missing from `COMPONENTS.md`).

### Open, not blocking — for a later pass

- **`frosted` theme is orphaned.** `src/styles/themes/frosted.css` exists but is absent from
  `src/lib/themes.ts`, so it is selectable neither in the showcase picker nor as
  `VideoMeta.theme`. Left alone deliberately — themes are out of scope until the owner says
  otherwise. (`dark.css` is not a profile; it backs the `.dark` class, and `meta.appearance`
  covers it.)
- **Scene-schema field names differ from the `src/ui/` props they wrap** in three places:
  `ChartSpec` `columns`/`rows` vs `Heatmap` `xLabels`/`yLabels`; `ChartSpec` `trend` vs
  `ScatterPlot` `trendLine`; `CompareScene` `mode: "columns"` vs `Comparison`
  `"side-by-side"`. Intentional (the schema reads better), documented in
  `references/data-display.md`, and invisible to consumers — noted so nobody "fixes" one side.
- **`countCrossings` takes pre-grouped `layers: string[][]`**, not the flat `LayoutPosition[]`
  that `layered()` returns, so a caller has to re-derive layers to use them together. See
  `scripts/prove-layout-crossings.mjs` for the pattern.

### Known issues

- `ScatterPlot`/`PieChart` don't compose `ChartFrame` (needs a continuous `xDomain` mode).
- `CodeBlock.highlight.tsx` exceeds the 250-line lint warning (pre-existing).
- Unbuilt guards: `check-tokens.mjs` (no raw px/hex), dead-CVA-variant check in `audit.mjs`.

---

## Phase A — Audit & repair (COMPLETE)

Findings from reading the current source. Each is a discrete task.
**None of these are speculative — all were read off the code.**

### A0. Enforce the new tier boundary (do before any motion code lands)

- [ ] `eslint.config.js`: add `no-restricted-imports` for `files: ["src/ui/**"]` forbidding
  `remotion`, `@remotion/*`, and `../motion`/`../scenes`/`../present` paths.
- [ ] Same for `src/motion/**` → may not import `../ui/**` (motion stays child-agnostic,
  AGENTS.md §9c rule 3).
- [ ] `scripts/check-showcase.mjs`: extend coverage to `src/motion/**` and `src/scenes/**`
  (each primitive/scene needs a showcase entry, same rule as `src/ui`).
- [ ] `src/showcase/registry.ts`: widen the `import.meta.glob` to pick those up.

### A1. Correctness bugs

- [ ] **`CodeBlock` substring highlights use magic metrics.**
  `CodeBlock.tsx` hardcodes `CHAR_W = 7.2`, `LINE_H = 19.5`, `PAD = 16` to position the
  `highlightRanges` overlay. Any theme changing `--font-mono`, `--text-xs`, or
  `--leading-relaxed` silently misaligns every substring highlight. **Fix:** measure a
  hidden reference glyph + line box with `ResizeObserver`, or drop the absolute overlay in
  favour of splitting the line into spans. Must survive a font switch in the showcase.
- [ ] **`CodeBlock` substring highlights break under `wrap` (which is the default).**
  Overlay rects assume one visual line per logical line. With `wrap = true` and a long
  line, every rect below it is off by one row. **Fix:** force `wrap = false` whenever
  `highlightRanges` is set, or measure real client rects.
- [ ] **`CodeBlock` gutter scrolls away horizontally.** The line-number gutter is inside
  the `overflow-x-auto` flex container, so with `wrap={false}` + long lines the numbers
  slide out of view. **Fix:** `sticky left-0` on the gutter with an opaque background.
- [ ] **`CodeBlock` no-header layout uses a `-mb-7` negative-margin hack** plus `sticky` to
  float the copy button. Fragile against any padding change. **Fix:** absolute positioning
  in the existing `relative` root.
- [ ] **`ConnectionLine` label is not on the line.** `lx/ly` linearly interpolate between
  `from` and `to`, but the path is a cubic bezier (or stepped). At `labelPosition = 50` the
  badge floats off a curved edge. **Fix:** evaluate the actual cubic at `t` (closed form),
  and walk the stepped polyline for `variant="stepped"`.
- [ ] **`ConnectionLine` label uses `backdropFilter: blur(2px)` inline.** Violates
  AGENTS.md §0.12 (no `backdrop-filter` inside `Canvas`'s transforming subtree — this is
  exactly the drag-repaint failure mode) *and* §6 (no inline style for static values).
  **Fix:** drop it; use the opaque `bg-canvas-surface` already on the badge.
- [ ] **`ConnectionLine` label uses `rounded-sm`** — a raw Tailwind radius, not a token.
  Should be `rounded-ui-sm` (§0.2).
- [ ] **`ConnectionLine` label width is guessed** as `label.length * 3.5 + 6`. Wrong for
  any non-monospace or wide-glyph label; clips or over-reserves. **Fix:** `foreignObject`
  sized to content, or measure.
- [ ] **`GraphNode` legacy `ports` vertical distribution is wrong.**
  `yPos = ((HEADER * GRID) + GRID) / (total + 1) * (idx + 1)` distributes ports across
  *header height + one cell*, ignoring body height entirely — so on any node taller than
  48px all legacy ports bunch near the top. **Fix:** distribute across the node's real
  height, on grid lines, per the §7 formula.
- [ ] **`TableHeader sticky` uses `bg-bg`.** Tables usually sit on `surface` /
  `surface-elevated`, so the sticky header is a different colour from the table it belongs
  to and rows show through at the seam. **Fix:** inherit the table's surface
  (`bg-surface` + a `supports`-safe fallback), verify on all 10 themes.
- [ ] **`DataTable` sticky header vs. CHANGELOG.** CHANGELOG `[Unreleased]` claims "sticky
  header restructured to render outside ScrollArea", but `DataTable.tsx` still renders
  `<TableHeader sticky>` *inside* `<ScrollArea><Table>`. Either the fix regressed or the
  entry is false. Resolve and correct the changelog.
- [ ] **`TreeItem` elbow connectors misalign on tall rows.** `ElbowColumn` draws the
  vertical stub at `height: isLast ? "50%" : "100%"` of the *row*, and the row is
  `items-stretch` — so a row whose value renders taller (an audio player, a JSON popover
  trigger) puts its elbow join below the chevron centre, and the guide line kinks.
  **Fix:** position the elbow off a fixed row-content height (grid-unit multiple), not a
  percentage of intrinsic height.
- [ ] **`TreeItem` double-truncates.** The value wrapper is
  `truncate overflow-hidden shrink min-w-0 text-right` *and* `CellType`'s
  `TruncatedCellValue` does its own `scrollWidth > clientWidth` detection inside it. The
  outer clip fires first, so the "…" affordance and the popover never trigger correctly.
  **Fix:** outer wrapper provides width only (`min-w-0`), `CellType` owns truncation.

### A2. Dead / inconsistent API surface

- [ ] **`Table` `density` variant is a no-op** — both `compact` and `normal` map to `""`.
  Same for **`TableRow` `density`**. They advertise control that does nothing; `DataTable`
  passes them through, so callers believe they work. **Fix:** either implement (row height)
  or remove from the CVA and pass density only to `TableHead`/`TableCell` (which do use it).
- [ ] **`Table` `variant="striped"` class string starts with a stray space.**
- [ ] **`Table.showcase.tsx` has `demos: []`** — an empty showcase that only exists to
  satisfy `check-showcase.mjs`. Violates §4 ("demos must cover every variant"). Either give
  Table a real showcase or stop exporting it as a standalone and let `DataTable` own it.
- [ ] **Density vocabulary is inconsistent across data components.** `Table`/`DataTable`
  use `density: "compact" | "normal"`; `DataList` uses `variant: "compact"`; `TreeView`
  uses `variant: "condensed"`. Three names for one concept. **Fix:** standardise on
  `density: "compact" | "normal"` across `Table`, `DataTable`, `DataList`, `TreeView`,
  keeping the old prop as a deprecated alias for one minor version.
- [ ] **`TreeView` `indent` is a raw px number.** A design constant passed as an untyped
  number from the call site — the opposite of the stability contract, and off-grid values
  break the guide columns. **Fix:** `indent: "sm" | "md" | "lg"` mapped to `--grid-unit`
  multiples.
- [ ] **`DataList` "striped" only exists in the showcase** as a call-site
  `[&>div:nth-child(odd)]` hack. Per AGENTS.md §Step-B that is variant territory.
  **Fix:** add `striped` to `DataList` (matching `Table`'s), use it in the showcase.
- [ ] **`DataList` label column is a hardcoded `w-36`.** Wraps or crushes in narrow
  containers. **Fix:** `labelWidth: "sm" | "md" | "lg"` on a two-column grid.
- [ ] **`patterns/graph/GraphNode.tsx` exports `GraphNodeRenderer`** — filename doesn't
  match the export, and it sets `className="max-w-40"` on a node whose base is
  `min-w-40`, pinning every editor node to exactly 160px while `NODE_WIDTH` from
  `types.ts` sizes the wrapper independently. Two sources of truth for node width.
  **Fix:** rename the file to match, single width source.

### A3. Reuse — components that should be composed, not re-implemented

*(Your example was right: this is a real pattern in the codebase.)*

- [ ] **`CellType.AudioDisplay` hand-rolls a raw `<input type="range">`** for its seek bar
  instead of using `Slider`. Also hand-rolls the play/pause `<button>` instead of `Button`
  (`variant="ghost" size="sm"` + icon).
- [ ] **`CellType.ImageDisplay` hand-rolls `<img>` twice** (thumbnail + lightbox) instead
  of using the `Image` component, which already owns fit modes, radius, and aspect ratio.
- [ ] **`ScrollArea` is bypassed** — `CodeBlock` uses a bare `overflow-x-auto` div,
  `TreeView` has no scroll container at all, `Canvas` rolls its own. Route every scrolling
  surface through `ScrollArea` so the fade/inset behaviour added in A4 applies everywhere.
- [ ] **Audit `CellType` for further CodeBlock/TreeView reuse.** `JsonDisplay` already
  composes `CodeBlock` + `TreeView` correctly — use it as the reference and confirm
  `ArrayDisplay` / `TreeDisplay` follow the same shape rather than re-tokenising.
- [ ] **`ConnectionLine` renders one `<svg>` per edge**, each `absolute inset-0 w-full
  h-full`. For a 30-edge architecture diagram that's 30 full-size stacked SVGs — layout
  cost, and z-order fights with nodes. **Fix:** add a `ConnectionLayer` that renders one
  SVG with N `<path>`s; `ConnectionLine` keeps working standalone.

### A4. Scrollbar & spacing consistency (your specific complaint)

- [ ] **Global scrollbar CSS hardcodes design values.** `globals.css` has
  `width: 6px; height: 6px` and `border-radius: 3px` — literal px in the one place
  AGENTS.md §0.2 forbids them, and unthemeable. **Fix:** `--scrollbar-width` /
  `--scrollbar-radius` tokens (§0.10's "token-driven" claim becomes true).
- [ ] **Scrollbar gutter overlaps rounded corners.** `CodeBlock` is `overflow-clip` with an
  inner `overflow-x-auto`, so the horizontal bar renders inside the rounded border and
  clips at the corner. Same class of bug as the `DataTable` one in the CHANGELOG.
  **Fix:** `scrollbar-gutter: stable` where appropriate + inset the scroll container from
  the radius. Verify: CodeBlock, DataTable, DataList, TreeView, ScrollArea, Canvas, Drawer,
  CommandPalette, Select/Combobox/MultiSelect popovers.
- [ ] **Add `ScrollArea` affordances:** `orientation: "vertical" | "horizontal" | "both"`
  and optional edge-fade masks so a scrollable region is visibly scrollable. No
  per-component scrollbar styling (§0.10 holds).
- [ ] **Sweep for arbitrary spacing.** `CellType` alone mixes token spacing (`size-icon`,
  `gap-tight`) with raw `size-3.5`, `w-24`, `min-w-48`, `size-8`. Map to tokens; add tokens
  where genuinely missing.
- [ ] **Alignment pass across `Table` / `DataTable` / `DataList` / `TreeView`.** Verify:
  numeric columns right-aligned and `tabular-nums`; the label column baseline matches the
  value column; the same vertical rhythm at each density; header/row padding identical, so
  columns line up between a sticky header and its body.

### A5. Visual modernization (restrained — simplicity is the point)

Additive variants only; defaults stay recognisable.

- [ ] Elevation: audit `--shadow-card` / `--shadow-elevated` for a softer two-layer shadow;
  add `--shadow-subtle` for hover-lift states.
- [ ] Focus rings: single consistent `ring` + offset treatment everywhere (some components
  use `ring-inset`, some don't).
- [ ] `CodeBlock`: quieter header (thinner rule, less contrast on the language badge),
  optional filename-tab framing.
- [ ] `Card`, `Alert`, `StatCard`: tighten default padding to the grid; add `size` where
  missing so density is uniform.
- [ ] Micro-transitions on hover/press for `Button`, `TableRow`, `TreeItem` — all via
  `--duration-fast` / `--ease-standard` tokens. **Static components only** — motion
  components remain frame-driven with no CSS transitions (§9c rule 1).

**Acceptance (Phase A):** `npm run validate` green. `npm run audit` clean. Showcase walked
in light + dark × all 10 themes × the font picker, with specific attention to the scroll,
truncation and alignment demos. No hardcoded px/hex introduced. CHANGELOG updated.

---

## Phase B — Motion foundation + rewrite of the existing 5

The current 5 primitives ship real defects and cannot be extended as-is.

### B1. Foundation (`src/motion/core/`)

- [ ] `TimelineContext` + `useTimeline()` → `{ frame, fps, durationInFrames }`.
- [ ] `<RemotionDriver>` — calls `useCurrentFrame()`/`useVideoConfig()` at its own top level.
- [ ] `<DomDriver>` — rAF clock; `play/pause/seek/reverse/rate`; respects
  `prefers-reduced-motion` by jumping to end state.
- [ ] `<MotionRoot mode="video" | "live">` — the single entry point.
- [ ] `Timing` interface — **one prop shape for every primitive**:
  `{ delay?: Beat; duration?: Beat; easing?: EasingName; spring?: SpringName }`.
  `Beat` is a semantic unit (`"instant" | "quick" | "normal" | "slow"` or frames), so
  consumers cannot pick a janky duration. `EasingName`/`SpringName` are closed unions
  mapped to the `--ease-*` tokens.
- [ ] `useProgress(timing) → number` (0→1) — the single place frame→progress happens.
- [ ] `useSequence(steps)` — declarative timeline builder returning
  `{ [name]: { startFrame, endFrame } }`; auto-derives durations from content length and
  the scene's `pace`. This is the shared spine for MP4 and the Presenter.

### B2. Rewrite the 5

- [ ] **`Reveal`** — currently hardcodes a 16px offset, offers no scale/blur, has no
  spring, and wraps children in a bare `<div>` that breaks a flex/grid parent. Rewrite on
  `useProgress`; add `from: "fade" | "up" | "down" | "left" | "right" | "scale" | "blur"`,
  `distance` as a token multiple, `as`/`asChild` so it doesn't inject a layout box.
- [ ] **`Stagger`** — currently just flips `opacity: 0 → undefined` per child. There is no
  animation at all, and the wrapper `<div>`s break the parent's layout. Rewrite to
  orchestrate a per-child `Reveal` with offset timing; add `each`, `from: "first" | "last"
  | "center"`, `layout` passthrough.
- [ ] **`TypeText`** — hardcodes `fontFamily: "monospace"` (ignoring `--font-mono` and any
  theme font), and computes `showCursor` then re-derives the same blink condition inside
  the JSX. Rewrite: inherit typography, token-driven caret, `mode: "char" | "word" |
  "line"`, `preserveLayout` (reserve final size so nothing reflows while typing).
- [ ] **`Highlight`** — `display: inline-block` + `borderRadius: "inherit"` on an
  absolutely-positioned overlay inside a plain `<div>` resolves to radius `0`, so the
  highlight has square corners over rounded children. Rewrite with
  `mode: "fill" | "underline" | "box" | "glow" | "strike"`, `color` from the token set only.
- [ ] **`SlideTransition`** → **`Slide`**. `overflow: hidden` on the element that is itself
  translating does nothing. Rewrite with a proper clipping parent; add `mode: "in" | "out"`.

**Acceptance (Phase B):** every primitive renders identically in Remotion Studio
(`mode="video"`) and in the showcase (`mode="live"`), verified side by side. MP4 renders
byte-stable across two runs (determinism check). No `useCurrentFrame` outside
`src/motion/core/`.

---

## Phase C — Motion primitive expansion

Grouped by what they express. Each: own folder, own showcase entry, `Timing` prop shape,
driver-agnostic.

### C1. Entrance / reveal
- [ ] **`Wipe`** — `clip-path` reveal (linear/radial, 4 directions). For images, diagrams, panels.
- [ ] **`Draw`** — `stroke-dashoffset` on any SVG path. Pairs with `ConnectionLine`/`ConnectionLayer`
  so edges draw themselves. Needs `pathLength` normalisation to be resolution-independent.
- [ ] **`Unmask`** — soft-edged mask sweep for headings and pull quotes.

### C2. Attention
- [ ] **`Spotlight`** (was `FocusBlur`) — dim + blur everything except a rect/element.
  Must not use `backdrop-filter` inside a `Canvas` subtree (§0.12) — use an overlay with a
  punched-out mask instead.
- [ ] **`Pulse`** — looping scale/opacity breathing; loop count or infinite.
- [ ] **`Shake`** — oscillation; `axis: "x" | "y" | "rotate"`, decaying amplitude.
- [ ] **`Ripple`** — expanding ring at a point. Marks clicks and events.
- [ ] **`Trace`** — a token travelling along an SVG path. **The data-flow primitive**:
  packets moving through an architecture diagram. `count`, `spacing`, `loop`, `shape`.

### C3. Camera
- [ ] **`Camera`** — one component subsuming CameraPan + CameraZoom. Keyframes as
  `{ at: step, focus: rect | elementId, zoom?: number }`; `fit` mode computes zoom from a
  bounding box. GPU-composited transform only, per the §7 canvas performance contract.

### C4. Text & code
- [ ] **`CodeDiff`** — animate added/removed/changed lines inside `CodeBlock`: rows slide
  in, removed rows collapse, changed rows cross-fade. **Highest-value primitive for coding
  videos.** Reuses the `CodeBlock` highlight engine; needs the A1 metrics fix first.
- [ ] **`CountUp`** — numeric tween. **Must reuse `CellType`'s `Intl` formatting** (number,
  percentage, bytes, currency, duration, compact notation) rather than re-implementing —
  refactor that formatting into a shared `src/lib/format.ts` both consume.
- [ ] **`TextSwap`** — cross-fade / roll between strings (changing labels, counters).
- [ ] **`Caption`** — timed lower-third text tied to a step range.

### C5. Structural
- [ ] **`Morph`** — FLIP between two layouts. Before/after architecture, refactor diffs.
- [ ] **`Cursor`** — fake pointer along a path with `click` / `dblclick` / `drag` /
  `type` events, rendering a `Ripple` on click. Simulated UI walkthroughs.
- [ ] **`Beat`** — a no-op hold, so a step can pause on a frame without an empty animation.

**Acceptance (Phase C):** every primitive has a Remotion composition *and* a live showcase
demo. One "kitchen sink" composition renders all of them to MP4 without dropped frames.

---

## Phase D — Static components the video content needs

These are `src/ui/` components under the normal AGENTS.md §2 rules (folder, showcase,
export, validate). They are the coverage list for your content types.

### D1. Code & terminal
- [ ] **`Terminal`** — prompt, command, output, exit code, spinner line, `cwd`/user chrome.
  Composes `CodeBlock` for output bodies. (Was deferred; it's core to coding videos.)
- [ ] **`DiffBlock`** — unified + side-by-side diff. Reuses `CodeBlock`'s tokenizer and
  gutter; `CodeDiff` (C4) animates it.
- [ ] **`FileTree`** (pattern) — `TreeView` + file-type icons + status badges
  (added/modified/untracked). No new tree logic.

### D2. Charts *(needs P2 + P3)*
Each is SVG, token-coloured, and takes an `animate` prop that internally uses the motion
primitives — **charts own their own reveal**, so scenes don't have to orchestrate bars.
- [ ] **`BarChart`** — vertical/horizontal, grouped/stacked.
- [ ] **`LineChart`** — multi-series, optional area fill, point markers.
- [ ] **`Sparkline`** — inline micro-chart (feeds `StatCard`).
- [ ] **`PieChart`** — pie + donut, centre label.
- [ ] **`Gauge`** — arc meter with threshold bands. Metrics/SLOs.
- [ ] **`Heatmap`** — matrix with the sequential ramp. Latency grids, activity calendars.
- [ ] **`ScatterPlot`** — points + optional trend line.
- [ ] **`Funnel`** — stage conversion.
- [ ] **`ChartFrame`** (pattern) — shared axes/grid/legend/tooltip/empty-state chrome, so
  the eight charts share one visual language instead of eight near-copies. **Build this
  first**; the charts are then thin.
- [ ] **`Legend`** — standalone, shared by charts and diagrams.

> Implementation note: load the `dataviz` skill before writing the first chart — form
> heuristics, palette validation, axis/legend/tooltip rules.

### D3. Diagrams, architecture & systems
- [ ] **`GraphGroup`** — a labelled container region on the `Canvas` ("VPC", "Cluster",
  "Service boundary"). Architecture diagrams need grouping; nothing provides it today.
- [ ] **`SequenceDiagram`** (pattern) — actors, lifelines, sync/async/return messages,
  activation bars, notes. **The "systems interaction" gap.** Data-driven; steps reveal
  messages one at a time.
- [ ] **`ConnectionLine` extensions** — `variant="orthogonal"` with real routing (the
  current `stepped` is a naive mid-X elbow that crosses nodes), `dashFlow` for animated
  flow direction, `waypoints`, edge `kind: "sync" | "async" | "data" | "error"` styling.
- [ ] **`ConnectionLayer`** — from A3; one SVG for N edges.
- [ ] **`Annotation`** — pointer/leader line + label attached to a region or element.
  Essential for calling things out on screen.
- [ ] **`Timeline`** — horizontal/vertical event sequence with lanes. Roadmaps, git
  history, request traces.
- [ ] **`layout` helpers** (`src/lib/layout.ts`, pure functions, no deps) — `layered` (DAG
  ranking) and `grid`, so a diagram scene can be authored without hand-placed coordinates.
  Explicit `x`/`y` always wins.

### D4. Presentation chrome
- [ ] **`DeviceFrame`** — `variant: "browser" | "window" | "phone"` with a URL bar / title
  bar. For showing web UI inside a video without a screen recording.
- [ ] **`Callout`** — extend **`Alert`** with `variant="note" | "tip"` and a large
  presentation `size` rather than adding a near-duplicate component.
- [ ] **`StatCard` extensions** — `delta` (± with trend arrow, reusing `CellType`'s
  `signed`), inline `Sparkline`, `icon`, `size`. Plus a **`StatGrid`** pattern so a KPI row
  is one component, not a call-site grid.
- [ ] **`Comparison`** (pattern) — before/after two-column or wipe-slider, built from
  existing primitives.

**Acceptance (Phase D):** every component has a showcase covering all variants, both modes,
all 10 themes. `npm run validate` green. Charts pass the `dataviz` colour validator and
`check-contrast.mjs`.

---

## Phase E — `src/scenes/` (data-driven scene templates)

This is where the stability contract is enforced. Scenes accept **data only** — no
`className`, no `style`, no colours, no frame numbers.

- [ ] **`src/scenes/schema.ts`** — the `Video` / `Scene` / `Step` discriminated union (D4).
  Exported types are the consuming project's entire API. Add a runtime validator with
  useful error messages (a bad scene should fail loudly at author time, not render a blank
  frame).
- [ ] **`TitleScene`** — title, subtitle, chapter number, optional brand mark.
- [ ] **`CodeScene`** — filename tab + `CodeBlock` + per-step `focus` ranges + `Camera`
  zoom to the focused region + optional `TypeText` authoring + `CodeDiff` between steps.
- [ ] **`DiagramScene`** — nodes (`GraphNode variant="simple"`), edges
  (`ConnectionLine` + `Draw`), `GraphGroup` regions, per-step reveal / flow / spotlight.
  `preset: "architecture" | "dataflow" | "state" | "flowchart"` picks node shape, edge
  style and layout defaults.
- [ ] **`SequenceScene`** — wraps `SequenceDiagram`, one message per step.
- [ ] **`ChartScene`** — wraps any chart + `CountUp` callouts + per-step series reveal.
- [ ] **`StatScene`** — `StatGrid` with staggered `CountUp`.
- [ ] **`TerminalScene`** — typed commands, streamed output, exit codes.
- [ ] **`BulletScene`** — heading + staggered bullets (with inline `Kbd`/`Badge`/code).
- [ ] **`CompareScene`** — before/after.
- [ ] **`UiWalkthroughScene`** — `DeviceFrame` + `Cursor` + `Ripple` + `Spotlight`.
- [ ] **`OutroScene`** — end card, links, subscribe prompt.
- [ ] **`SceneRenderer`** — `Scene` → component. The single switch consumers never touch.

**Acceptance (Phase E):** every scene renders from sample JSON in Remotion Studio *and* in
the showcase's live preview. A deliberately malformed scene produces a clear validation
error, not a broken frame.

---

## Phase F — `src/present/` (live, reactive mode)

- [ ] **`Presenter`** — `<Presenter video={data} />`. Renders `SceneRenderer` under
  `MotionRoot mode="live"`. Click / `→` / `Space` advances a step, `←` reverses,
  `Esc` overview. Steps come from `useSequence`, so timing is identical to the video.
- [ ] **`useSteps`** — headless step-navigation hook, for embedding in your own UI.
- [ ] **Speaker view** — current + next step, elapsed timer, notes from `step.say`.
- [ ] **`PlayerEmbed`** — the `@remotion/player` path for scrubbing the exact video
  timeline in a browser (complements, doesn't replace, live mode).
- [ ] **Interactivity that only live mode can do** — hover a diagram node to highlight its
  edges, click to expand, drag to explore. Proves D2's rationale.

**Acceptance (Phase F):** click through a multi-step presentation in the browser; forward
and back; the same data renders to MP4 with matching pacing.

---

## Phase G — Video assembly

- [ ] **`VideoRoot`** — `Video` data → `<TransitionSeries>` of scenes with per-scene
  duration from `useSequence`.
- [ ] **Transitions** — `@remotion/transitions`: fade, slide, wipe, none. Closed union in
  scene data (`transition: "fade"`), not a config object.
- [ ] **Chrome** — optional progress bar, chapter markers, persistent watermark.
- [ ] **Audio hooks** — `step.say` as timing metadata for later narration/TTS. No audio
  work now, but reserve the field.
- [ ] **`apps/video` becomes a thin harness** — registers `VideoRoot` from a local
  `video.ts`, plus the primitive/scene dev compositions. Delete the `packages/motion`
  `file:` dependency; import `my-you-eye/motion` instead.
- [ ] **One full reference video** — Title → Code (with diff) → Diagram (with data flow) →
  Chart → Outro, rendered to MP4.

**Acceptance (Phase G):** one `Video` object produces both a complete MP4 and a working
click-through presenter.

---

## Phase H — Packaging & the stability contract

The "I can't break it from the consuming project" requirement.

- [ ] **Subpath exports** in `package.json`: `.`, `./motion`, `./scenes`, `./present`,
  `./styles.css`, `./styles.compiled.css`. `tsup` multi-entry, `remotion`/`@remotion/player`
  external + optional peer.
- [ ] **Escape hatches closed on scenes.** Scene props are data + closed unions. No
  `className`/`style` passthrough on any scene or chart. (`src/ui/` primitives keep
  `className` for layout — that's the documented §Step-B contract and consuming *apps* need
  it; scenes do not.)
- [ ] **`gen-manifest.mjs` covers motion + scenes** — `components.json` / `COMPONENTS.md`
  list primitives, scenes, and every scene's data schema, so an agent in the consuming
  project can author a video from the manifest alone.
- [ ] **`SKILL.md` rewrite** — three sections: static UI, live presentations, video export.
  Include the `Video` schema and a worked example. This is what makes the library
  self-describing in your other project.
- [ ] **Version + changelog discipline** — one version for everything. Document that
  consumers only ever pass data, so a version bump is safe by construction.
- [ ] **`npx my-you-eye render <file>`** — render a `Video` data file to MP4 from the
  consuming project without wiring Remotion by hand. *(Nice-to-have; drop if it bloats.)*

**Acceptance (Phase H):** in a scratch project, `npm i my-you-eye` + a `Video` data file
produces an MP4 and a live presenter, with zero styling code in the consuming project.

---

## Validation additions (wired into `npm run validate`)

- [ ] `check-showcase.mjs` — extend to `src/motion/**`, `src/scenes/**`.
- [ ] `check-motion.mjs` — no `useCurrentFrame` / `Date.now` / `setTimeout` /
  CSS `transition` / `@keyframes` outside `src/motion/core/`; every primitive accepts
  `Timing`; no `src/ui` import from `src/motion`.
- [ ] `check-tokens.mjs` — no raw px/hex in `src/**` including `globals.css` (would have
  caught the scrollbar `6px` and the `CodeBlock` `CHAR_W` constants).
- [ ] `check-contrast.mjs` — extend to the derived chart palette across all themes.
- [ ] `audit.mjs` — add checks for the A2/A3 findings (dead CVA variants where all values
  are `""`; duplicated magic metrics).
- [ ] A render smoke test: `apps/video` renders 1 s of the reference video in CI.

---

## Delegation plan

Large sequential batches — one agent each, run in order. Sequential rather than parallel
because `npm run validate` writes to `dist/` and every batch touches `src/index.ts`, so
concurrent agents would corrupt each other's validation runs.

| # | Batch | Covers |
|---|---|---|
| 1 | **Tokens, boundaries & data-component repair** | A0, A2, A4, A5-partial, A1 Table/Tree items |
| 2 | **Code, canvas & reuse repair** | A1 CodeBlock/ConnectionLine/GraphNode, A3, A5-partial |
| 3 | **Motion engine** | B1, B2, C1–C5 |
| 4 | **Charts** | D2 (`ChartFrame` first, then the eight + `Legend`) |
| 5 | **Content components** | D1, D3, D4 |
| 6 | **Scenes** | E (schema + validator + all scenes + `SceneRenderer`) |
| 7 | **Presenter, video & packaging** | F, G, H |

Per batch I: read the full diff, run `npm run validate` + `npm run audit`, render from
`apps/video`, and check the batch against the AGENTS.md rule it was most likely to bend.
Agents do **not** edit `CHANGELOG.md` (concurrent-edit hazard) — they report their entry and
I write it.

**Reporting:** one consolidated report at the end with a single visual-verification
checklist, not a report per batch.

---

## Explicitly out of scope

- Themes — you'll decide later. Phase A/D add *tokens*, never new theme files.
- Storybook / `apps/docs`.
- Audio, narration, TTS (only the `step.say` metadata field is reserved).
- Auto-layout beyond `layered`/`grid` (no graph-layout dependency).
- The monorepo migration — cancelled, see D1.
