# Original Instructions:
Good, precise pushback — this is exactly the kind of thing worth resolving before code gets written. Here are the decisions:

**Q1 — Tokens: Option A (CSS-only).** Tailwind v4's `@theme` block *is* the token system — don't fight it with a parallel JS object. `packages/tokens` becomes a thin package that just exports/re-exports `tokens.css` (and any other theme files), and `motion`/`scenes` reference the same CSS custom properties the rest of the codebase already uses (`var(--color-primary)`). No JS token object, no divergence risk. Drop Option B entirely — "fragile, they'll diverge" is exactly right and not worth the abstraction.

**Q2 — Prototype first, defer full monorepo conversion.** Your agent's risk list is correct and I was wrong to sequence it as Phase 0. Revised order: build the Remotion PoC in an isolated sibling package/branch that imports directly from the existing repo (relative path or `file:` link) *without* renaming, moving, or restructuring `packages/ui`'s internals. Prove one static component renders through Remotion end-to-end. Only convert to full pnpm workspaces + Turborepo once that's proven — at that point it's a mechanical migration you're doing with confidence, not a leap of faith blocking everything else.

**Q3 — Variant of `GraphNode`, not a new component.** A second component with separately-maintained box/label styling will drift from `GraphNode` the first time you restyle one and forget the other. Add a `simple` (or `variant="minimal"`) prop/mode to `GraphNode` that hides ports/footer and renders just header+label. `DiagramNode` in `scenes` becomes a thin wrapper that calls `GraphNode` with that variant — not a sibling component in `ui`.

**Q4 — Extend `ConnectionLine`, not a new component.** Same reasoning — the bezier path logic already exists and is the thing most likely to have subtle correctness issues (arrowhead angle math, etc.) that you don't want two copies of. Add `arrowhead?: boolean` and `label?: string` props to `ConnectionLine`. `DiagramEdge` in `scenes` wraps it.

**Q5 — Remotion license is fine, confirmed.** I checked their current terms: individuals and for-profit orgs up to 3 employees get the free license, commercial use included — that explicitly covers a solo creator monetizing YouTube videos. You only need the paid Company License if you're a 4+ person for-profit org. If you're solo, no license cost. (Worth a final glance at remotion.dev/docs/license/faq yourself since terms can change, but as of now you're clear.)

**Q6 — Interactive mode is a separate, later package — don't build it now.** Your agent's read is correct: Remotion is batch/frame-capture, click-to-advance is DOM-state-driven — genuinely different runtimes, not a variant of the same thing. Scope Phase 3 to `packages/motion` (Remotion) only. `packages/present` (or `timeline`) is a distinct, later effort — possibly even reusing the same `scenes` components if you design scene props to not assume Remotion's `useCurrentFrame`, but don't architect for that yet. Note it as a future direction, not a current requirement.

**Q7 — Add `highlightLines` now, and it's not a "visual edit" violation.** It's an additive, opt-in prop with no effect on existing usage (default renders unchanged) — that's within the "don't touch visuals without approval" rule's intent, not against it. It genuinely blocks Phase 4, so do it now.

# TODOs

> Governed by AGENTS.md §9. Each phase has its own acceptance check — do not start
> the next phase until the current one passes.

### Phase 0 — Pre-requisites (additive changes to existing `src/ui`)

- [x] **0a. CodeBlock `highlightLines`** — prop `highlightLines?: number[]` (1-indexed).
  Renders `bg-primary/10` behind specified line numbers. Add showcase demo.
- [x] **0b. GraphNode `variant="simple"`** — new CVA variant. Hides ports, footer,
  accent bar. Keeps header + body. Add showcase demo.
- [x] **0c. ConnectionLine `arrowhead` + `label`** — `arrowhead?: boolean` renders SVG
  arrowhead at `to` point. `label?: string` renders centered text. Add showcase demo.

**Acceptance:** `npm run validate` green. No visual change to existing defaults.

### Phase 1 — Remotion PoC

- [x] Create `apps/video` as sibling Remotion project.
- [x] One static composition: renders a `Button` + `Card` from `my-you-eye`.
- [x] Confirm `remotion render` produces MP4 with correct styling.
- [x] Compiled CSS pipeline (dist/styles.compiled.css) for Remotion consumption.

**Acceptance:** Valid MP4 on disk showing styled components. ✅

### Phase 2 — `packages/motion` (5 animation primitives)

- [x] **Reveal** — fade + translate on entrance (direction prop).
- [x] **Stagger** — sequential delay for list children.
- [x] **TypeText** — character-by-character text reveal.
- [x] **Highlight** — animate opacity/scale of a highlight overlay.
- [x] **SlideTransition** — slide-in/out for scene transitions.

Code in `packages/motion/src/`. Smoke-test compositions in `apps/video/src/compositions/`. All 5 render to MP4 confirmed.

**Acceptance:** All 5 primitives render in Remotion Studio and to MP4. ✅

---

## Foundation hardening + decorator framework (Tracks A–D — precede Phase 3)

> Added 2026-07-23 after a full repo audit. Design decisions confirmed by the human:
> decorators = wrapper components; harden bugs before new features; prove the decorator
> framework with 2 cheap effects first; showcase code-view = per-item catalog primitive.
> Sequencing: **A → B → C → D, then resume Phase 3** on a hardened base.

### Track A — Foundation hardening (BLOCKS everything below)

> Audit found silent "renders plausible-but-wrong" bugs — no exceptions, no blank screens,
> which is why they went unnoticed. Fix before building effects on this base.

**A1 — TexturedSurface backend**
- [ ] **Nesting poison** — stop reusing `--texture-opacity-surface` as the inline-path kill
  switch (it inherits and zeroes nested `texture="theme"` children → invisible texture).
  Use a dedicated `--texture-suppress` flag the `::after` opacity multiplies by.
  (`TexturedSurface.tsx:114,124`)
- [ ] **Opacity formula** — theme path ignores `strength` for opacity, contradicting
  AGENTS.md `FINAL = strength × layer`. Either multiply the theme path by
  `TEXTURE_STRENGTHS[type][strength]` too, OR amend AGENTS.md to say `strength` is
  SVG-only in theme mode. Make code + doc agree. (`TexturedSurface.tsx:112-127`, `AGENTS.md:309-315`)
- [ ] **Wrong source-of-truth** — `PAGE_MEDIUM_URI` is built from `surface.medium` params,
  not `page.medium` (Comic page bg silently wrong). Reference `layerPaper.page.medium`
  directly. (`svg-utils.ts:161` vs `:175`)
- [ ] **Silent fallthrough + types** — type `TEXTURE_STRENGTHS`/`TEXTURE_CONFS`/`LAYER_SVGS`
  against the existing `TextureKey` union (not `Record<string,…>`) so a new texture won't
  compile until all maps are updated; add a dev warning for an unknown non-`"theme"` texture
  instead of silently rendering the theme default. (`TexturedSurface.tsx:6,29`; `svg-utils.ts:232`)
- [ ] **NaN opacity** — guard `LAYER_OPACITY[layer]` against `undefined` (bad JS caller →
  `opacity: NaN` → drops to 1). (`TexturedSurface.tsx:104`)
- [ ] **Duplicate gen paths** — `Presets.tsx` (and `Tuner.tsx`) carry independent magic
  numbers that drift from the 9-preset matrix. Source presets from `LAYER_SVGS`/
  `TEXTURE_STRENGTHS`; keep Tuner as a playground but label it explicitly non-canonical.
- [ ] **Canvas rule-12 false safety** — Canvas zeroes `--texture-opacity`/`--backdrop-blur`,
  but TexturedSurface reads `--texture-opacity-resolved` and the inline path uses a numeric
  `opacity` immune to CSS override. Either make the override reach the real tokens + inline
  path, or fix the Canvas comment + lint/doc that inline-texture TexturedSurface must never
  live inside Canvas. (`Canvas.tsx:151-152`)

**A2 — Theme contrast**
- [x] Add `--color-warning-fg` to `tokens.css` + all 9 theme files; `Badge` uses it instead
  of the `text-bg` hack (currently 2.0–2.6:1, fails AA). (`tokens.css:17`, `Badge.tsx:40,45`)
- [x] Fix `Badge.tsx:50` + `Button.tsx:15` — `text-danger-fg`, not `text-primary-fg`, on
  danger (glass-dark 3.09:1, fails AA).
- [x] Extend `check-contrast.mjs`: add `warning-fg/warning`, `fg/surface`, `muted/surface`;
  validate the class pairs components actually render, not only declared tokens.
- [x] `Card` "elevated" variant should consume `--color-surface-elevated` + a
  `--shadow-elevated` token, not raw `shadow-lg` — ONLY if it produces no visible change;
  else leave a `NOTE(human)`. (`Card.tsx:11`) — left as `NOTE(human)`; `--shadow-elevated`
  differs visibly from Tailwind's `shadow-lg` in every theme, so the swap was deferred.

**A3 — Validation harness hole (discovered during A1, 2026-07-23)**
- [x] `npm run validate`'s `tsc --noEmit` is a **NO-OP**: root `tsconfig.json` uses project
  references + `files: []`, and bare `tsc` (no `-b`) never traverses them → app source has
  NEVER been type-checked by "the definition of done." Change the type step to
  `tsc -p tsconfig.app.json --noEmit` (or `tsc -b`). This STRENGTHENS the guard — aligned
  with §5 intent (§5 forbids *weakening* a check to pass; this is the inverse).
- [x] Fix the 6 pre-existing type errors it surfaces — 3 shipped-lib, 3 showcase:
  `CellType.complex-displays.tsx:207` (`unknown[]` → `UrlReplacement[]`),
  `CodeBlock.highlight.tsx:276,307` (`Cannot find namespace 'JSX'` — React 19),
  `App.tsx:90` / `DemoSection.tsx:44` / `Sidebar.tsx:26` (theme-selector `string` vs
  texture-prop union — investigate the real runtime value, fix the type honestly, no `as any`).
- [x] AGENTS.md §5: note the type step now uses `tsconfig.app.json`.

**Acceptance:** `npm run validate` green with the REAL type-check wired in (`tsc -p
tsconfig.app.json --noEmit` reports 0 errors), incl. extended contrast. No visual regression
in the showcase across all 9 themes, light + dark. A new showcase demo proves a nested
inline→theme TexturedSurface renders visible texture.

### Track B — Governance framework (§5)

**B1 — Category model.** Formalize five first-class categories:

| Category | Location | What | Delivery |
|---|---|---|---|
| components | `src/ui/`, `src/ui/patterns/` | default primitives + compositions | CVA + Radix |
| themes | `src/styles/themes/` | global token-override presets | `data-theme` + `.dark` |
| **decorators** | `src/ui/decorators/` (NEW) | composable visual effects | wrapper components |
| motion | `packages/motion/` | frame-driven **scripted** animation (video + live presenter) | Remotion wrappers |
| **effects** | `src/ui/effects/` (NEW) | realtime **ambient / interactive** motion | CSS transitions + hooks, **no dep** |

> **Two motion systems, deliberately separate — never merge.** `motion` = Remotion,
> frame-driven, deterministic (scripted story → `@remotion/player` live + MP4 export).
> `effects` = DOM-native, live, interaction-driven (hover/press/scroll/pulse/glow). They share
> no runtime. See Track E and the amended AGENTS.md §9c.

- [x] Retrofit `TexturedSurface` as the first decorator (keep its public export path stable).
- [x] Extend AGENTS.md §1 decision tree with "which category does this belong to," and add a
  §2-analog checklist for creating a decorator.
- [x] Add an AGENTS.md triage workflow: "extracted HTML/component from elsewhere → decompose
  into (existing component? token? decorator? motion?) → if nothing fits, which new entry to
  add first."
- [x] Update SKILL.md (consumer-facing): add decorators to the catalog + how to apply/compose
  them. No dev details.

**Acceptance:** A fresh agent given only AGENTS.md places a new border-effect → decorator and
a new data display → component, correctly. Docs self-consistent.

### Track C — Decorator framework + first effects

- [ ] **C1 Scaffolding** — `src/ui/decorators/<name>/` convention, wrapper pattern (CVA,
  token-driven, composable by nesting, one showcase each). New `--decorator-*` token
  category. Wire decorators into `check-showcase.mjs` + `gen-manifest.mjs` as their own
  category in `components.json`.
- [ ] **C2 Elevate3d** — token-driven layered shadow/transform depth (variant sm/md/lg).
  GPU-friendly (transform + box-shadow only, no filter). Showcase.
- [ ] **C3 Glow / backlight** — colored glow/backlight via token-driven box-shadow /
  drop-shadow (color + strength). Respect Canvas rule 12 (no filter inside a transform
  subtree). Showcase.
- [ ] **C4 HandDrawn border** — irregular pen-line border via SVG overlay (feTurbulence
  displacement on a stroked rect, or a rough-path generator). Token-driven roughness. No new
  npm dep without approval. Showcase.
- [ ] **C5 Refraction / translucency (later — scoped separately)** — advanced background
  pass-through + corner light refraction (backdrop-filter + SVG displacement). Perf-sensitive,
  Canvas-incompatible. Gate behind its own design pass; do NOT bundle into C1–C4.

**Acceptance:** Elevate3d + Glow + HandDrawn compose (nest) on any component, render in the
showcase across all themes light + dark, `validate` green, appear in the manifest.

### Track D — Showcase code-view catalog primitive (§1)

- [ ] **D1** — Add a `catalog` showcase helper: a demo renders a list where each item has its
  own `{ label, render, code }`; code view shows a per-item copyable one-liner (own copy
  button), never the whole hand-built grid scaffold.
- [ ] **D2** — Migrate `CellType` (and other big hand-built-table demos) to the catalog
  primitive.
- [ ] **D3** — One-line comment in `Table.showcase.tsx` explaining `demos: []` (real demos
  live in `DataTable.showcase.tsx` via `parent`).

**Acceptance:** In the CellType code view, each data-type row copies as a standalone
`<CellType type=… value=… />` line. `validate` green.

### Track E — Ambient motion / effects tier (realtime webpage motion)

> Confirmed 2026-07-23. Engine = **dependency-free**: CSS transitions + token-driven
> `@keyframes` + `IntersectionObserver` hooks. No new npm dep. Sequenced **after decorators
> (C)** — effects animate the decorator looks — and **before Remotion Phases 3-6**.

- [ ] **E0 AGENTS.md tier rules** — amend §9c: its "frame-driven only, never CSS
  `transition`/`@keyframes`" ban is **scoped to `packages/motion` (Remotion)**. Add an
  explicit effects-tier subsection stating the inverse: CSS transitions / `@keyframes` /
  `IntersectionObserver` are REQUIRED here, Remotion `useCurrentFrame` is FORBIDDEN. Two
  explicit "use / never" lists so the rules can't read as contradictory.
- [ ] **E1 Scaffolding + tokens** — `src/ui/effects/` (behavior wrappers + hooks). Reuse the
  existing `--duration-*` / `--ease-*` tokens; add any missing loop timing as `--effect-*`.
  Respect Canvas rule 12 (no filter-based effect inside a transform subtree). Manifest +
  showcase support for the new category.
- [ ] **E2 Decorator-bound motion** — live-behavior props on Track C decorators:
  `Elevate3d pressable` (press animates depth), `Glow pulse` (breathing). CSS-driven.
- [ ] **E3 Standalone interaction effects** — `ScrollReveal` (IntersectionObserver entrance),
  `HoverLift` — wrappers/hooks not bound to a specific look; compose with any child.
- [ ] **E4 Attention loops** — `Pulse`, `Shake` as DOM `@keyframes` effects. Keep **distinct**
  from the future Remotion `Pulse`/`Shake` in `packages/motion` — do NOT unify via the
  deferred `progress:0→1` core yet. Two runtimes, two impls, shared token timing; accept the
  minor conceptual overlap.

**Acceptance:** Hover / press / scroll / pulse effects run live in the showcase (all themes,
light + dark), compose with decorators, `validate` green, **zero new dependencies**, and no
effect degrades Canvas drag perf (rule 12).

---

### Architecture Decision: @remotion/player for interactive mode

External input confirmed: **`@remotion/player`** (npm package, 54+ dependents) embeds
Remotion compositions live in any React app with `seek(frame)`, `play()`, `pause()`,
and `frameupdate` events. It renders compositions using `useCurrentFrame()` directly —
**no `core/remotion/interactive` layer needed** unless the Player proves insufficient.

**Approach:** Each "step" in a presentation = a frame range in the SAME composition.
Click handler → `playerRef.current.seek(stepStartFrame)` → `play()` → `outFrame` stops
at the step boundary. Zero duplication of animation primitives. Same `Reveal`/`Stagger`/
`TypeText` code renders in both Remotion Studio AND the live presenter.

**Fallback:** If `@remotion/player` can't express a smooth click-to-advance flow (e.g.
per-primitive interruption/reversal that frame-seeking can't handle), THEN extract a
`core/` layer: primitives accept `progress: number` (0→1), Remotion wrappers convert
`useCurrentFrame()` → progress, interactive wrappers use `requestAnimationFrame` →
progress. But do NOT build this until the Player is proven insufficient.

### Phase 3 — `packages/present` (interactive presenter via @remotion/player)

- [ ] **3a. Player PoC** — install `@remotion/player` in `apps/video`. Create a thin
  presenter shell that renders one composition inside `<Player>` with play/pause/seek
  controls. Prove seek-to-frame + play-to-outFrame = usable click-to-advance.
- [ ] **3b. Step mapping** — define a scene data format mapping "steps" to frame ranges
  `{ label, startFrame, endFrame }`. Render step titles in a sidebar. Click →
  `seek(startFrame)` → `play()` → `outFrame={endFrame}` stops automatically.
- [ ] **3c. Full presenter** — load the `CodeWalkthrough` or `Diagram` composition from
  Phase 5, map its steps to frame ranges, test end-to-end click-to-advance flow.

**Acceptance:** Click through a multi-step presentation live in the browser. Each click
advances to the next step and plays its animation segment, pausing at the boundary.

---

### Phase 4 — `packages/scenes` (composed scene templates)

- [ ] **CodeWalkthrough** — title + CodeBlock (with highlightLines/highlightRanges) +
  TypeText typing reveal. Data-driven (typed content props). Composes `my-you-eye` +
  `@lib/motion`. Steps map naturally to frame ranges for the presenter.
- [ ] **Diagram** — nodes (GraphNode variant="simple") + edges (ConnectionLine
  arrowhead+label) from `{ nodes: { id, label, x, y }[], edges: { from, to, label? }[] }`.
  Staggered entrance via Stagger primitive.

**Acceptance:** Both scenes render animated from sample JSON data in Remotion Studio AND
in the `packages/present` shell.

---

### Phase 5 — Monorepo migration (mechanical, after PoC proven)

- [ ] Add `pnpm-workspace.yaml`, root `turbo.json`.
- [ ] Move `src/` → `packages/ui/src/`, `packages/motion/`, `packages/scenes/`,
  `apps/video/`, `apps/present/` into place.
- [ ] Rename packages: `my-you-eye` → `@lib/ui`, keep `@lib/motion`, add `@lib/scenes`.
- [ ] Update all import paths, tsconfig paths, Tailwind content paths.
- [ ] Verify `pnpm -F ui build` + `pnpm -F video render smoke-test` pass.

**Acceptance:** `pnpm -F ui build` + `pnpm -F video render smoke-test` pass. Zero visual
regressions in the showcase.

---

### Phase 6 — Video composition + transitions

- [ ] Video data definitions (JSON/TS) driving scene selection, ordering, and step timing.
- [ ] `@remotion/transitions` `<TransitionSeries>` chaining scenes with fade/slide.
- [ ] One end-to-end example video: CodeWalkthrough → transition → Diagram.
- [ ] Same scene data powers both the `apps/video` composition AND the `packages/present`
  presenter shell.

**Acceptance:** Full MP4 renders with animated scenes + smooth transitions between them.
The same JSON scene data produces both a click-through presenter AND a video export.

---

### Future animation primitives (after core 5 proven)

**Highest priority — express patterns the current 5 can't:**
- [ ] **CameraPan / CameraZoom** — translate + scale on a wrapping container to
  "zoom into" a diagram region or code function. Highest-value addition for
  code-walkthrough videos.
- [ ] **PathDraw** — animated `stroke-dashoffset` on SVG paths, for diagram edges
  drawing themselves on. Pairs with ConnectionLine.

**Fit the existing `progress: 0→1` model:**
- [ ] **Pulse** — looping scale/opacity breathing (draw attention to a node).
- [ ] **Shake** — short oscillating error/attention indicator.
- [ ] **CountUp** — numeric tween from 0 to target (stat/metric scenes).

**Need extra params (from/to pairs or path data):**
- [ ] **Morph** — FLIP-based cross-fade/reposition between two diagram states
  (before/after architecture).
- [ ] **CursorMove** — fake pointer animating along a path, for simulated clicks.
- [ ] **FocusBlur** — dim + blur everything except a focused region (complement to
  Highlight).

---

### Deferred (not in any phase)

- Storybook / `apps/docs`
- Additional components: Callout, Cursor (static), ComparisonTable, Terminal,
  Avatar/speaker
- `core/remotion/interactive` extraction (only if @remotion/player proves insufficient)

---

## How to start (for the human)

1. Give the agent Phase 0 only. Verify guardrails via task 0.12 before any component work.
2. Then hand out components **one or two at a time**, phase order. Prompt template:
   > Read AGENTS.md fully. Then implement `<Component>` from TODO.md Phase N following
   > AGENTS.md §2 exactly. Do not touch anything else. Show me `npm run validate` output.
3. After each batch: open the showcase yourself, eyeball light + dark, then check the box.
4. If the agent "fixed" a validation config — reject the batch, revert, re-prompt with §5.
