# TODO — Bootstrap Plan & Component Backlog

Work phases **in order**. Within a phase, tasks are ordered by dependency.
Every task's definition of done: `npm run validate` green + rules in [AGENTS.md](./AGENTS.md) followed.
Check items off (`[x]`) as they complete.

---

## Phase 0 — Repo scaffold (infrastructure, no components yet)

- [x] **0.1 Init project** — Vite + React + TS scaffolded
- [x] **0.2 Install dependencies** — all planned deps installed
- [x] **0.3 Tailwind v4 setup** — `@tailwindcss/vite` plugin in vite.config.ts, globals.css imports tailwindcss + tokens
- [x] **0.4 Design tokens** — `src/styles/tokens.css` with all colors, radius, typography; dark mode under `.dark`
- [x] **0.5 `cn()` helper** — `src/lib/cn.ts` (clsx + tailwind-merge)
- [x] **0.6 Showcase shell** — `src/showcase/types.ts` + `src/showcase/App.tsx` with glob discovery, group tabs, dark toggle
- [x] **0.7 ESLint flat config** — bans styled native elements outside src/ui/, restricted imports, arbitrary colors, 250-line limit
- [x] **0.8 Showcase coverage script** — `scripts/check-showcase.mjs` checks each component folder has showcase + export
- [x] **0.9 Package setup for consumption** — `my-you-eye`, exports map, tsup build, files: ["dist"]
- [x] **0.10 `validate` script** — `tsc --noEmit && eslint . && node scripts/check-showcase.mjs && npm run build:lib && vite build` (all green)
- [x] **0.11 CI** — `.github/workflows/validate.yml` (push + PR)
- [x] **0.12 Smoke test guardrails** — lint blocks styled `<button>` outside src/ui/; coverage script blocks Dummy.tsx without showcase

## Phase 1 — Core primitives

> For each component: follow AGENTS.md §2 checklist. Radix packages listed per item are
> pre-approved to install. Variants listed are the required minimum.

- [x] **Button** — no Radix. Variants: `primary | secondary | ghost | danger`; sizes `sm | md | lg`; states: disabled, `loading` (spinner + disabled). Group: `inputs`.
- [x] **Spinner** — no Radix. Sizes `sm | md | lg`. Group: `feedback`. (Before Button's `loading` state — Button uses it.)
- [x] **Input** — no Radix. Variants: `default | filled`; sizes `sm | md`; states: disabled, `invalid` (danger ring). Group: `inputs`.
- [x] **Label** — `@radix-ui/react-label`. Group: `inputs`.
- [x] **Card** — no Radix. Variants: `default | outlined | elevated`. Subcomponents in same folder: `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`. Group: `display`.
- [x] **Badge** — no Radix. Variants: `neutral | primary | success | warning | danger`; styles `solid | soft`. Group: `display`.
- [x] **Alert** — no Radix. Variants: `info | success | warning | danger`; optional title + icon slot. Group: `feedback`.

## Phase 2 — Form controls

- [x] **Checkbox** — `@radix-ui/react-checkbox`. Sizes `sm | md`; indeterminate state. Group: `inputs`.
- [x] **RadioGroup** — `@radix-ui/react-radio-group`. Group: `inputs`.
- [x] **Switch** — `@radix-ui/react-switch`. Sizes `sm | md`. Group: `inputs`.
- [x] **Textarea** — no Radix. Variants match Input; `autoResize?` prop. Group: `inputs`.
- [x] **Select** — `@radix-ui/react-select`. Sizes `sm | md`; invalid state. Group: `inputs`.
- [x] **FormField** (pattern) — composes Label + slot + help/error text. Props: `label`, `error?`, `hint?`, `required?`. Group: `patterns`.

## Phase 3 — Overlays & feedback

- [x] **Dialog** — `@radix-ui/react-dialog`. Sizes `sm | md | lg`; header/footer subcomponents. Group: `overlay`.
- [x] **Tooltip** — `@radix-ui/react-tooltip`. Single provider exported too. Group: `overlay`.
- [x] **DropdownMenu** — `@radix-ui/react-dropdown-menu`. Items, separators, destructive item style. Group: `overlay`.
- [x] **Popover** — `@radix-ui/react-popover`. Group: `overlay`.
- [x] **Toast** — `@radix-ui/react-toast`. Variants: `default | success | danger`; exported `useToast()` + `<Toaster/>`. Group: `feedback`.
- [x] **ConfirmDialog** (pattern) — Dialog + Buttons; props: `title`, `description`, `confirmLabel`, `destructive?`, `onConfirm`. Group: `patterns`.

## Phase 4 — Navigation & data

- [x] **Tabs** — `@radix-ui/react-tabs`. Variants: `underline | pills`. Group: `navigation`.
- [x] **Breadcrumbs** — no Radix. Group: `navigation`.
- [x] **Pagination** — no Radix (uses Button internally). Group: `navigation`.
- [x] **Avatar** — `@radix-ui/react-avatar`. Sizes `sm | md | lg`; fallback initials. Group: `display`.
- [x] **Skeleton** — no Radix. Shapes: `text | circle | rect`. Group: `feedback`.
- [x] **EmptyState** — no Radix. Icon slot + title + description + action slot. Group: `display`.
- [x] **Table** — no Radix. Variants: `default | striped`; density `compact | normal`. Subcomponents in same folder (mind the 250-line limit — split files). Group: `data`.

## Phase 5 — App patterns

- [x] **PageShell** (pattern) — page header (title, description, actions slot) + content area. Group: `patterns`.
- [x] **Toolbar** (pattern) — search Input + filter slots + actions, responsive row. Group: `patterns`.
- [x] **StatCard** (pattern) — label + value + optional delta badge. Group: `patterns`.

## Phase 6 — Missing primitives & rich data

> Base primitives useful across any app, plus a cell renderer for data-heavy tables.
> No new Radix packages needed.

- [x] **Separator** — no Radix. Variants: `horizontal | vertical`. Group: `display`.
- [x] **Progress** — no Radix. Variants: `default | success | warning | danger`; optional label. Group: `feedback`.
- [x] **StatusDot** — no Radix. Variants: `neutral | success | warning | danger | info`; sizes `sm | md`. Group: `display`.
- [x] **Kbd** — no Radix. Renders `<kbd>` with styling. Group: `display`.
- [x] **CellValue** — no Radix. Type-aware cell renderer for `<TableCell>`. Props: `type: "text" | "boolean" | "email" | "url" | "json" | "null" | "badge" | "status"`, `value`. Group: `data`.

## Phase 7 — Canvas & graph primitives

> Minimal visual building blocks for node-based UIs (pipelines, lineage, graphs).
> No Radix — pure layout components. Consuming apps add interactivity on top.

- [x] **Canvas** — positioned container with drag-to-pan, ctrl+scroll zoom, zoom controls, dot-grid background. Group: `canvas`.
- [x] **GraphNode** — node box with header/body/footer slots, accent bar, port anchor zones outside border. Variants: `default | selected | muted`. Group: `canvas`.
- [x] **Port** — small circle handle. Variants: `in | out`; states: `default | connected | highlighted`. Group: `canvas`.

---

## Phase 8 — Polish, tokens & showcase overhaul

- [x] **Badge soft variant fix** — `bg-opacity-15` was a silent no-op in Tailwind v4. Replaced with `bg-{variant}/15` via compoundVariants.
- [x] **GraphNode floating fix** — missing `position: relative` on non-Canvas demos.
- [x] **Alert icon width fix** — added `max-w-lg` to "With icon" demo for consistency.
- [x] **New `canvas` showcase group** — added to types & App; moved Canvas/GraphNode/Port.
- [x] **Dot grid visibility** — `0.5px` → `1px` dot + `color-mix` for subtle opacity.
- [x] **Design tokens audit** — added `--spacing-*`, `--opacity-*`, `--shadow-*`, `--font-serif` tokens.
- [x] **Magic value audit** — replaced `p-4` → `p-panel`, `gap-3` → `gap-stack`, `gap-2` → `gap-inline`, `gap-1` → `gap-tight`, `opacity-60` → `opacity-dim`, `shadow-sm` → `shadow-card` across all component code.
- [x] **Tokens showcase tab** — color swatches, spacing bars, radius shapes, text sizes under `typography` group.
- [x] **Font switcher** — cycle button in header toggles `sans → serif → mono` across entire showcase via `data-font`.
- [x] **Global scale CSS** — `html { font-size: calc(1rem * var(--scale, 1)) }` ready for scale slider.
- [x] **2-column showcase layout** — `grid-cols-1 md:grid-cols-2`. Single-demo entries span full width.
- [x] **Canvas: drag-to-pan** — left-click drag; offset applied to transform + grid background.
- [x] **Canvas: ctrl+scroll zoom** — 0.25–3 range, step 0.1; inner layer scale transform.
- [x] **Canvas zoom controls** — floating bar: `−` `100%` `+` at bottom-right.
- [x] **Port label redesign** — ports use `right-full`/`left-full`, labels never overlap node content.
- [x] **JSON cell → Popover** — replaces inline expand with Popover containing scrollable JSON.
- [x] **URL replacements** — `UrlReplacement[]` prop for pattern-based masking on URL type.

## Phase 9 — New components

- [x] **TreeView** — collapsible nested tree. Leaf values reuse CellValue. Variants: `default | condensed`.
- [x] **CodeBlock** — code display with header/language bar. Variants: `default | elevated`.
- [x] **DataList** — key-value list with CellValue rendering. Variants: `default | compact`.
- [x] **Slider** — styled range input with label + value display.
- [x] **Markdown** — lightweight renderer (headings, bold, italic, code, links, lists, code blocks). Zero npm deps.

## Phase 10 — Feedback fixes

- [x] **MD render typography** — rewrite to parse into React blocks, clean semantic HTML, reuse CodeBlock for fences.
- [x] **CodeBlock copy button** — clipboard icon on hover, no header conflict.
- [x] **2-column layout fixes** — removed col-span-2, horizontal section separators, vertical sep with clever offset, overflow-visible on demo containers.
- [x] **Port spacing** — added `gap-2` between circle and label.
- [x] **GraphNode variants overlap** — staggered x positions (0, 200, 400).
- [x] **Remove duplicate canvas demo** — deleted "On canvas" from GraphNode showcase.
- [x] **Vertical column separator** — `::before` pseudo top-4 bottom-4.
- [x] **Merge DataList/TreeView showcase demos** — side-by-side with vertical divider, `max-w-2xl`, `gap-6`.
- [x] **Font switcher dropdown** — `<select>` with all three options instead of cycle button.
- [x] **Canvas dots** — removed color-mix, `1.5px` dots with `var(--color-border)`.
- [x] **StatCard margins** — removed `p-panel` override, uses CardContent default `p-6 pt-0` + `pt-4`.
- [x] **URL masking showcase** — added API key redaction example.
- [x] **CHANGELOG.md** — created with full history from TODO.md phases.
- [x] **AGENTS.md rule 8** — added changelog update requirement.

## Phase 11 — Remaining

- [x] **Drawer** — slide-in panel from left/right, Radix Dialog-based.
- [x] **Combobox** — autocomplete/select-with-search, Popover + Input.
- [x] **MultiSelect** — multi-select combobox with search, checkboxes, and badge tags.
- [x] **Command palette** — ⌘K-style fuzzy search overlay.
- [x] **GitHub Actions publish workflow** — auto-publish on `v*` tags via npm.
- [x] Tag `v0.1.0` — version bumped, prepared for publishing.
- [ ] Consume from a real app.
- [ ] Add `AUDIT.md` procedure.
- [ ] Consider versioned releases with changesets.

## Phase 12 — Showcase & data overhaul

- [x] **A — Showcase masonry layout** — CSS columns (masonry) replacing grid, column-rule divider, `break-inside-avoid` sections. 3 columns on xl.
- [x] **B — Grid-locked GraphNode** — `--grid-unit: 16px`, height derived from row count, row-anchored ports via `portLeft`/`portRight` on each row, port overlap fixed.
- [x] **C — Snapping + drag on Canvas** — `snap()`/`useSnap` helper, draggable node demo with 16px grid snap.
- [x] **D — Theme/profile system** — `src/styles/themes/*.css` for dark/neon/contrast profiles, `--border-width`/`--backdrop-blur` tokens wired to Card/Dialog, profile switcher in header, `check-themes.mjs` validation script.
- [x] **E1 — CellValue upgrades** — `number` (monospace, right-align, Intl.NumberFormat), `date`/`datetime` (relative + absolute), `bytes`, `duration`, `array` (chips via Badge). Copy button on JSON popover.
- [x] **E2 — Table upgrades** — `align` prop on TableCell/TableHead, `sticky` prop on TableHeader.
- [x] **E3 — DataTable pattern** — auto-renders rows via CellValue from column definitions.
- [x] **E4 — TreeView upgrades** — `defaultExpandedDepth`, guide lines, controlled `expandedKeys`/`onToggle`, arrow-key navigation.

## Phase 13 — Themes, CLI & Orchestrator fixes

- [x] **Glass theme** — `glass.css` with semi-transparent surfaces, 24px backdrop blur, gradient backgrounds, edge highlights.
- [x] **Comic theme** — `comic.css` with paper texture, warm colors, thick borders, playful shadows, Comic Sans font.
- [x] **Comic Sans font option** — `--font-comic` token, `[data-font="comic"]` rule, font selector entry.
- [x] **CellValue truncation** — all render paths wrap text in `truncate` elements for column overflow.
- [x] **Toast background fix** — default variant uses `bg-surface-elevated`, success/danger use `text-primary-fg`.
- [x] **Orchestrator node width fix** — wrapper `position: relative` + `max-w-[160px]` on GraphNode prevents port detachment.
- [x] **CLI tool** — `bin/my-you-eye.mjs` with `init`, `list`, `sync` commands. SKILL.md + components.json shipped with package.

---

## How to start (for the human)

1. Give the agent Phase 0 only. Verify guardrails via task 0.12 before any component work.
2. Then hand out components **one or two at a time**, phase order. Prompt template:
   > Read AGENTS.md fully. Then implement `<Component>` from TODO.md Phase N following
   > AGENTS.md §2 exactly. Do not touch anything else. Show me `npm run validate` output.
3. After each batch: open the showcase yourself, eyeball light + dark, then check the box.
4. If the agent "fixed" a validation config — reject the batch, revert, re-prompt with §5.
