# AGENTS.md — Binding Rules for AI Agents

You are working in a UI template repository. Its purpose is a single, consistent, reusable
set of components. Your job is to keep it that way. These rules are not suggestions.

**Read this entire file before making any change. When in doubt, the stricter reading wins.**

---

## 0. Golden rules (absolute, no exceptions)

1. **Never hand-roll a styled native element.** No `<button>`, `<input>`, `<select>`,
   `<textarea>`, `<table>`, `<a>` with styling outside `src/ui/`. ESLint enforces this.
   If lint flags it, fix the code — **never disable, weaken, or work around a lint rule.**
2. **Never hardcode a design value.** No hex/rgb/oklch colors, no px font sizes, no raw
   border radii in component code. Every visual constant comes from `src/styles/tokens.css`
   via a Tailwind theme mapping. If a token is missing, add the token first.
3. **One component = one folder.** Never add a second component to an existing component's
   files. Never create a shared "misc.tsx", "helpers.tsx" or "components.tsx" grab-bag.
4. **Every exported component has a showcase file.** No exceptions. The validate script
   fails without it.
5. **`npm run validate` must pass before you declare any task done.** If it is red, the
   task is not done — no matter how "obviously correct" the change looks.
6. **Never edit `dist/`, lockfiles (except via `npm install`), or generated files.**
7. **Do not add dependencies** without an explicit instruction from the human. Radix
   per-component packages needed for a planned component are pre-approved (see TODO.md).
8. **Keep CHANGELOG.md updated.** Every time a phase, component, or significant change is
   completed, add or update an entry under the `[Unreleased]` section. Follow the
   [keepachangelog.com](https://keepachangelog.com) format (Added / Changed / Fixed / Removed).
9. **A theme/profile is a token-override block only** — never a component fork or per-theme
   className. Every profile must define the complete color token set (enforced by
   `scripts/check-themes.mjs` wired into `npm run validate`). Any new visual constant must
   become a base token in `src/styles/tokens.css` first, then every profile defines it.
10. **Scrollbars are styled globally** from `globals.css` via `*::-webkit-scrollbar` + Firefox
    `scrollbar-color`/`scrollbar-width`, all token-driven. Never add per-component scrollbar
    styling. If a container needs scrolling, just use `overflow-auto` — the global CSS handles
    the visual.
11. **Node elements (GraphNode) use a fixed corner radius** (`--radius-node` in `tokens.css`,
    mapped as `rounded-node` utility). Themes must never override `--radius-node` — the node
    corner radius is invariant across all themes. Only `--radius-ui*` tokens (buttons, cards,
    dialogs, etc.) may be themed.
12. **Canvas performance boundary** (see also §7 "Canvas drag performance contract"):
    - **Never** use `background-attachment: fixed` in a theme file. It forces the background to
      be re-evaluated as part of the document's own paint, which is exactly what
      `backdrop-filter` has to resample on every composite — the same failure mode as
      transforming a blurred subtree. If a theme wants a full-viewport mesh/gradient
      background, render it on a `position: fixed; pointer-events: none;` pseudo-element
      instead (see `html[data-theme="glass"]::before` in `glass.css`) — it never moves, so it
      never repaints, and `backdrop-filter` can sample it cheaply.
    - **Never** let an element with `backdrop-filter` live inside a transforming subtree (i.e.
      inside `Canvas`'s pannable/zoomable layer). `Canvas` enforces this structurally by
      overriding `--backdrop-blur` (and `--texture-opacity`) to `0` as inline custom properties
      on its transforming layer — every component already reads these via `var(...)`, so the
      override cascades to any descendant automatically. Do not reintroduce a hardcoded
      `backdropFilter` value inside `src/ui/canvas/**` or `src/ui/graph-node/**`.
    - **Canvas surfaces are always opaque.** `GraphNode` (and anything else rendered as a
      canvas-space surface) uses `bg-canvas-surface` (the `--color-canvas-surface` token), never
      `bg-surface`. Every theme must define an opaque `--color-canvas-surface` (enforced by
      `scripts/check-themes.mjs`) so nodes render solid regardless of the active theme's surface
      translucency.

---

## 1. Decision tree — follow it top to bottom, stop at first match

You need a UI element. Do this **in order**:

### Step A — Does it already exist?

1. Run: `ls src/ui src/ui/patterns`
2. Read `src/index.ts` (the public API).
3. Open the component's `*.showcase.tsx` to see its variants and intended usage.

**If it exists → import it from the public API. You are done. Do not create anything.**

### Step B — It exists but needs a small difference?

Classify the difference:

| Difference | Action |
|---|---|
| Layout only (width, margin, alignment, flex placement) | Use `className` at the call site. Done. |
| A visual style that other usages might also want (new color emphasis, new size, new density) | **Add a variant** in this repo. Follow §3 (Modifying a component). |
| A global look change (all buttons rounder, new brand color) | **Change a token** in `src/styles/tokens.css`. Never restyle per-component. |
| New behavior (loading state, icon slot, clearable input) | **Extend the component** with a prop in this repo. Follow §3. |

**Never** fork a component, copy-paste its JSX to a new place, or override its look
with a pile of `className` utilities. If you are writing more than ~3 utility classes
on a `ui/` component, you are in variant territory — go to §3.

### Step C — It does not exist at all?

Create it **in this repo** (never inline in a consuming app), following §2 exactly.

---

## 2. Creating a new component — checklist

Work through every step. Do not skip. Do not reorder.

1. **Confirm it's a primitive or a pattern.**
   - Primitive (self-contained interaction unit: Button, Select, Tooltip) → `src/ui/<kebab-name>/`
   - Pattern (composition of existing primitives: FormField, ConfirmDialog) → `src/ui/patterns/<kebab-name>/`
   - A pattern must be built **from existing primitives**. If it needs a missing primitive,
     create the primitive first as its own task.
2. **Create the folder with exactly these files:**
   ```
   src/ui/<kebab-name>/
     <PascalName>.tsx            # component + CVA variants
     <PascalName>.showcase.tsx   # showcase entry (see §4)
     index.ts                    # re-exports
   ```
3. **Implement using the shadcn/ui pattern:**
   - Radix primitive for behavior if one exists for this component (Dialog, Select,
     Tooltip, Checkbox, Switch, Tabs, Dropdown, Popover…). Plain elements only for
     purely visual components (Card, Badge, Spinner, Skeleton).
   - Variants declared with CVA. Include `variant` and (where sensible) `size`.
     2–3 design variants unless TODO.md specifies otherwise.
   - Merge classes with `cn()` from `src/lib/cn.ts`. Always accept and merge a
     `className` prop last.
   - Forward refs. Spread rest props. Type props explicitly (exported interface).
   - Colors/spacing/radius via token-mapped Tailwind classes only (e.g. `bg-primary`,
     `rounded-ui`) — never arbitrary values like `bg-[#3b82f6]`.
4. **Write the showcase file** per §4.
5. **Export from the public API:** add a line to `src/index.ts`
   (`export * from "./ui/<kebab-name>";`).
6. **Run `npm run validate`.** Fix everything until green.
7. **Visually verify:** `npm run dev`, open the showcase, confirm the component renders
   in its group with all variants, in both light and dark mode (toggle in showcase header).
8. **Update TODO.md:** check the component off the backlog list.

A file exceeding **250 lines** fails lint. If a component legitimately needs more,
split subparts into additional files **inside the same folder** (e.g. `Table.Row.tsx`)
— never into a shared file elsewhere.

## 3. Modifying an existing component — checklist

1. Read the component file AND its showcase file first. Understand existing variants.
2. Make the change **additive** whenever possible: new variant value, new optional prop.
   Do not change the default variant's appearance unless explicitly asked — other apps
   depend on it.
3. If you change or add any variant/prop: **update the showcase file** to demonstrate it.
4. If you change a token: check the showcase visually — tokens affect everything.
5. `npm run validate` green + visual check in showcase (§2.6–7).

## 4. Showcase rules

**Showcase layout is fixed infrastructure.** A new component adds exactly one `<section>` inside the `<main>`; never add per-component layout hacks (col-span, margins, positioning, custom widths). The CSS columns (masonry) layout handles packing automatically.

The showcase app auto-discovers every `*.showcase.tsx` under `src/ui/` via
`import.meta.glob`. There is **no manual registration list** — the file itself is the
registration.

Every showcase file exports exactly one default `ShowcaseEntry` (typed in
`src/showcase/types.ts`):

```tsx
import type { ShowcaseEntry } from "../../showcase/types";
import { Button } from ".";

const entry: ShowcaseEntry = {
  title: "Button",
  group: "inputs",            // must be one of the groups below
  demos: [
    { name: "Variants", render: () => (
      <div className="flex gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
    )},
    { name: "Sizes", render: () => ( /* ... */ )},
    { name: "Disabled & loading", render: () => ( /* ... */ )},
  ],
};
export default entry;
```

**Groups (fixed):** `inputs` | `display` | `feedback` | `overlay` | `navigation` | `canvas` | `data` | `patterns` | `typography`

- Add your component to the group that fits. Every group is a tab in the showcase.
- **Do not invent a new group** unless: (a) you have 3+ components that genuinely fit no
  existing group, AND (b) the human approved it. Then add the group name to the union type
  in `src/showcase/types.ts` and the tab order list in `src/showcase/App.tsx` — those are
  the only two places.
- Demos must cover: every variant, every size, disabled/edge states where applicable.

## 5. Validation — the definition of done

```bash
npm run validate
```

Runs, in order — ALL must pass:

| Step | Command | Catches |
|---|---|---|
| Types | `tsc --noEmit` | type errors |
| Lint | `eslint .` | native elements outside `src/ui/`, files >250 lines, restricted imports, arbitrary Tailwind color values |
| Showcase coverage | `node scripts/check-showcase.mjs` | any `src/ui/**` component folder missing a `*.showcase.tsx`, any showcase entry with an invalid group, any `ui/` folder not exported from `src/index.ts` |
| Build | `tsup && vite build` | broken exports, unresolvable imports |

Rules about validation itself:

- **Never** modify `scripts/check-showcase.mjs`, `eslint.config.js`, or `tsconfig.json`
  to make a failure pass. If you believe a rule is wrong, stop and report to the human.
- **Never** use `eslint-disable` without a `-- reason:` comment on the same line, and only
  for genuine edge cases (e.g. an unstyled native element inside a `ui/` wrapper is already
  allowed — you should almost never need a disable).
- If validate is red for reasons unrelated to your change (pre-existing breakage), stop
  and report — do not "fix" unrelated code to get green.

## 6. Forbidden actions — quick list

- ❌ Styled native elements outside `src/ui/`
- ❌ Hex/rgb/arbitrary color classes (`bg-[#...]`, `text-[rgb(...)]`) anywhere
- ❌ Importing `@radix-ui/*`, `class-variance-authority`, or `tailwind-merge` outside `src/ui/` and `src/lib/`
- ❌ New npm dependencies without human approval
- ❌ New showcase groups without human approval
- ❌ Copy-pasting a component's JSX instead of importing it
- ❌ Inline `style={{...}}` except for genuinely dynamic values (e.g. computed progress width)
- ❌ Editing validation configs to silence failures
- ❌ Declaring a task done with `npm run validate` red or without visual showcase check
- ❌ Business logic, data fetching, routing, or app state inside `src/ui/`

## 7. Project memory — contracts future sessions should not re-derive

### Grid / Port formula (GraphNode)

Constants (TS mirror in `src/ui/graph-node/grid.ts`, CSS in `--grid-unit`):
- `GRID = 16` (px)
- `HEADER = 2` (cells)
- `ROW = 2` (cells per body row)
- `FOOTER = 1` (cell)

Node height is a **function of row count**, never content-driven or free-drag:
```
heightCells = HEADER + rows.length * ROW + (footer ? FOOTER : 0)
heightPx    = heightCells * GRID      // always a grid multiple
portY(i)    = (HEADER + i * ROW + ROW / 2) * GRID   // row center on grid line
snap(v)     = Math.round(v / GRID) * GRID
```

Why it works: `ROW` is even → `ROW / 2` is a whole cell → every port center lands on a grid line. Snap two node tops to the grid → ports across nodes are colinear. Same-row-count nodes are identical height by construction. Overflow scrolls/clips inside a fixed band.

When `rows` is provided, node height is locked. Each row can have `portLeft?: PortDef` and `portRight?: PortDef` — dots render on the node border at the row's vertical center. Labels are the row content inside the node.

When `rows` is NOT provided, the legacy `ports?: PortDef[]` prop works but distributes multiple same-side ports vertically by index (not all at top-1/2).

### Theme / Profile contract

A profile is a **token-override block only** — never a component fork or per-theme className.

```
[data-theme="<name>"] { ... }       // light variant
[data-theme="<name>"].dark { ... }  // dark variant (orthogonal)
```

Every profile must define the complete color token set (enforced by `scripts/check-themes.mjs`, wired into `npm run validate`). Any new visual constant must:
1. Become a base token in `src/styles/tokens.css` inside `@theme`
2. Be defined in every theme file

Token categories: `--color-*`, `--radius-*`, `--spacing-*`, `--opacity-*`, `--shadow-*`, `--font-*`, `--text-*`, `--border-width`, `--backdrop-blur`, `--grid-unit`.

### Font maintenance contract

When adding a new font family, update **both** places (they are not auto-synced):
1. `src/styles/globals.css` — add the `@font-face` block(s) and a `[data-font="<name>"]` rule setting the appropriate font-family token.
2. `src/lib/fonts.ts` — add an entry to the `fontOptions` array (value matches the `data-font` attribute value, label is the display name).

`src/showcase/App.tsx` reads from `fonts.ts` — no separate update needed.

### Canvas drag performance contract

**Never** change `backgroundPosition` during drag — it triggers full repaint every frame.
**Never** let React re-render on every mousemove — use refs + direct DOM manipulation.

Pattern (see `src/ui/canvas/Canvas.tsx`):

1. Store offset/zoom in refs (`offsetRef`, `zoomRef`) updated on every mousemove.
2. Keep a ref to the children div (`childrenRef`). In the mousemove handler, directly set
   `childrenRef.current.style.transform` — bypass React entirely during drag.
3. Sync ref → React state only on mouseup (for children that need offset in props).
4. **Grid layer lives INSIDE the children div** — it inherits the parent's GPU-composited
   `transform`. The grid's `backgroundPosition` is always `0 0` (never changes). Use a
   very large grid div (`left/right: -100vw`, `top/bottom: -100vh`) so the tiled pattern
   always covers the viewport regardless of pan offset.
5. Use `backgroundSize: ${gridSize}px` (not `gridSize * zoom`) because the parent's
   `scale(zoom)` handles visual scaling.

Why this is fast:
- `transform` is GPU-composited — no repaint on position change
- Grid is inside the transformed layer — zero style updates on it during drag
- No React reconciliation during drag (direct DOM only)

Themes with expensive backgrounds (Glass: `background-attachment: fixed` with multiple
radial gradients; Comic: SVG `feTurbulence` noise filter) expose the drag repaint problem
because every frame composites through the complex HTML background layer. The fix above
eliminates repaints entirely — everything is GPU-composited.

## 8. If you are unsure

Stop. Say exactly what you were trying to do, which rule blocks you, and what options you
see. A question costs nothing; silent rule-bending costs the repo its integrity.
