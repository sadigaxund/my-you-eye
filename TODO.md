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

### Phase 3 — `packages/scenes` (composed scene templates)

- [ ] **CodeWalkthrough** — title + code block + highlight steps.
- [ ] **Diagram** — nodes (GraphNode variant="simple") + edges (ConnectionLine) from data.

**Acceptance:** Both scenes render animated from sample JSON data.

### Phase 4 — Monorepo migration

- [ ] Move existing code to `packages/ui/`.
- [ ] Add `pnpm-workspace.yaml`, root `turbo.json`.
- [ ] Update package names (`@lib/ui`, `@lib/motion`, `@lib/scenes`).
- [ ] Update all import paths.

**Acceptance:** `pnpm -F ui build` + `pnpm -F video render smoke-test` pass.

### Phase 5 — Video composition + transitions

- [ ] Video data definitions (JSON) driving scene selection/ordering.
- [ ] `@remotion/transitions` `<TransitionSeries>` chaining scenes.
- [ ] One end-to-end example video: CodeWalkthrough → Diagram.

**Acceptance:** Full MP4 renders with animated scenes + working transitions.

### Deferred (not in any phase)

- `packages/present` (interactive click-to-advance) — separate runtime
- Storybook / `apps/docs`
- Additional animation types: Pulse, DrawLine, CameraPan, CursorMove, CountUp, Morph
- Additional components: Callout, Cursor, ComparisonTable, Terminal, Avatar/speaker

---

## How to start (for the human)

1. Give the agent Phase 0 only. Verify guardrails via task 0.12 before any component work.
2. Then hand out components **one or two at a time**, phase order. Prompt template:
   > Read AGENTS.md fully. Then implement `<Component>` from TODO.md Phase N following
   > AGENTS.md §2 exactly. Do not touch anything else. Show me `npm run validate` output.
3. After each batch: open the showcase yourself, eyeball light + dark, then check the box.
4. If the agent "fixed" a validation config — reject the batch, revert, re-prompt with §5.
