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
      overriding `--backdrop-blur`, `--texture-opacity`, `--texture-opacity-surface` and
      `--texture-suppress` to `0` as inline custom properties on its transforming layer — every
      component already reads these via `var(...)`, so the override cascades to any descendant
      automatically. Do not reintroduce a hardcoded `backdropFilter` value inside
      `src/ui/canvas/**` or `src/ui/graph-node/**`. This guarantee only reaches `TexturedSurface`
      instances rendered with `texture="theme"` — an inline texture (`paper-grain` /
      `frosted-glass` / `brushed-aluminium`) paints via a numeric React `opacity` style that no
      CSS override can reach, so a non-theme `TexturedSurface` must never be placed inside
      `Canvas`.
    - **Canvas surfaces are always opaque.** `GraphNode` (and anything else rendered as a
      canvas-space surface) uses `bg-canvas-surface` (the `--color-canvas-surface` token), never
      `bg-surface`. Every theme must define an opaque `--color-canvas-surface` (enforced by
      `scripts/check-themes.mjs`) so nodes render solid regardless of the active theme's surface
      translucency.

---

## 1. Decision tree — follow it top to bottom, stop at first match

### Category map — decide the home BEFORE anything else

Everything in this repo is exactly **one** of five categories. Put work in the right one:

| Category | Home | What it is | Delivered as | Rules |
|---|---|---|---|---|
| **Components** | `src/ui/<name>/`, `src/ui/patterns/<name>/` | Self-contained UI (Button, Dialog) or a composition of primitives (FormField) | CVA variants + Radix behavior | §2 |
| **Themes** | `src/styles/themes/<name>.css` | A complete token-override preset that restyles everything | `data-theme` + `.dark` | §0.9, §7 |
| **Decorators** | `src/ui/decorators/<name>/` | A composable *visual effect* that WRAPS arbitrary children without knowing what they are (TexturedSurface, and the planned Elevate3d / Glow / HandDrawn border) | wrapper component (CVA + tokens), nested to compose | §2 + §2-decorator |
| **Motion** | `packages/motion/` | Frame-driven, deterministic animation for the **scripted story** (video export + live presenter) | Remotion wrappers (`useCurrentFrame`) | §9 |
| **Effects** | `src/ui/effects/` | Live, DOM-native **ambient/interactive** motion (hover-press, scroll-entrance, pulse) — NOT a scripted timeline | CSS transitions / `@keyframes` + hooks (IntersectionObserver). No Remotion. | §9 (effects tier) |

Two distinctions people get wrong:
- **Component vs Decorator** — renders specific UI content → **component**. Takes `children` and
  only changes how they *look* (surface, border, glow, depth) without caring what they are →
  **decorator**.
- **Motion vs Effects** — frame-driven & deterministic for capture (video/presenter) →
  `packages/motion` (Remotion). Live & interaction-driven on the page (hover/scroll/pulse) →
  `src/ui/effects` (CSS + hooks). They share no runtime — **never merge them**. See §9.

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

### Triage — "I found this HTML/component elsewhere. Can we build it?"

Do **not** paste foreign HTML in. Decompose it against the five categories, in this order:

1. **Structure / behavior** → is it (or can it be built from) an existing **component**? Missing
   primitive → create it (§2).
2. **Look** (color/radius/spacing/shadow) → expressible as **theme tokens**? Missing visual
   constant → add the token first (§0.2), then every theme defines it (§0.9).
3. **Surface effect** (texture/border/glow/depth/translucency) → a **decorator** (existing or new,
   §2-decorator).
4. **Motion** → scripted & deterministic → **motion** (§9); live & interaction-driven → **effects**
   (§9 effects tier).

If every piece maps → compose them; done. If a piece maps to **nothing**, that gap IS the new
entry you must add **first** — a token, a component, a decorator, or a primitive — in its own
category, following its rules. Never inline the foreign markup to "make it work." Unsure which
category a piece belongs to → §8 (stop and ask).

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

A file exceeding **250 lines** is flagged by lint (warning). If a component
legitimately needs more, split subparts into additional files **inside the same
folder** (e.g. `Table.Row.tsx`) — never into a shared file elsewhere.

### 2-decorator. Creating a decorator

A decorator lives under `src/ui/decorators/<kebab-name>/` with the same file layout and the
**full §2 checklist**, plus these extra rules. **TexturedSurface is the reference implementation.**

1. **It wraps children it does not understand.** Signature is
   `({ children, ...effectProps }) => <wrapper>{children}</wrapper>`. Never import or assume a
   specific `src/ui` component inside a decorator — it decorates *any* `ReactNode`.
2. **Composable by nesting.** Two decorators must stack
   (`<Glow><Elevate3d>{x}</Elevate3d></Glow>`) without fighting. Prefer effects that live on the
   wrapper element, a pseudo-element, or an absolutely-positioned overlay — not ones that
   restructure children.
3. **Token-driven, own namespace.** Tunable constants become `--decorator-*` (or a specific
   `--glow-*` / `--elevate-*`) tokens in `tokens.css`, themed where a theme should be able to
   art-direct them. No hardcoded values (§0.2).
4. **Respect the Canvas performance boundary (§0.12).** No `backdrop-filter`/`filter` inside a
   transforming subtree. A decorator that uses them must document that it cannot be used inside
   `Canvas`, and read the Canvas-overridden tokens where applicable.
5. **Showcase group is `decorators`.** Demo the effect on neutral sample content (a Card, a box)
   with all variants, and demonstrate it composing with at least one other decorator.
6. Export from `src/index.ts`; `npm run validate` green; visual check in the **decorators** tab,
   light + dark, across themes.

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
| Types | `tsc -p tsconfig.app.json --noEmit` | type errors |
| Lint | `eslint .` | native elements outside `src/ui/`, files >250 lines, restricted imports, arbitrary Tailwind color values |
| Showcase coverage | `node scripts/check-showcase.mjs` | any `src/ui/**` component folder missing a `*.showcase.tsx`, any `ui/` folder not exported from `src/index.ts` |
| Contrast | `node scripts/check-contrast.mjs` | WCAG AA contrast ratio failures |
| Theme tokens | `node scripts/check-themes.mjs` | theme files missing required token set |
| Manifest | `node scripts/gen-manifest.mjs` (prebuild hook) | stale components.json / COMPONENTS.md |
| Build | `npm run build:lib && vite build` | broken exports, unresolvable imports |

Rules about validation itself:

- **Do not "simplify" the Types step back to bare `tsc --noEmit`.** Root `tsconfig.json`
  uses project references with `files: []`, so a bare `tsc --noEmit` traverses nothing and
  silently type-checks zero files — a no-op that looks green. `tsconfig.app.json` is the
  config that actually `include`s `src`, so `npm run validate` must invoke
  `tsc -p tsconfig.app.json --noEmit` to get a real type-check. This was a confirmed hole
  (fixed 2026-07-23, surfaced 6 pre-existing errors) — reverting it to bare `tsc --noEmit`
  is a weakening of validation and is forbidden by the rule above.
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

Token categories: `--color-*`, `--radius-*`, `--spacing-*`, `--opacity-*`, `--shadow-*`, `--font-*`, `--font-weight-*`, `--text-*`, `--leading-*`, `--tracking-*`, `--border-width`, `--backdrop-blur`, `--grid-unit`, `--duration-*`, `--ease-*`, `--z-*`, `--focus-ring-*`, `--density-*`, `--texture-*`, `--texture-type`, `--scale`.

### TexturedSurface — layer × strength system

**Files:** `src/ui/decorators/textured-surface/TexturedSurface.tsx`, `svg-utils.ts`, `ParamTable.tsx`, `texture-factory.ts`

> TexturedSurface is the **reference decorator** (§1 category map, §2-decorator). It lives under
> `src/ui/decorators/`, not `src/ui/patterns/`.

**Three-tier hierarchy** — every textured surface belongs to one of three layers, each with distinct SVG noise parameters (frequency, octaves, contrast stretch, tile size):

| Layer | Noise character | Tile size | Opacity multiplier (`LAYER_OPACITY`) |
|---|---|---|---|
| `page` | Coarsest, highest contrast (low freq, few octaves, high stretch) | 110–1250px | 0.55× |
| `surface` | Medium grain | 110–300px | 0.30× |
| `foreground` | Finest, subtle (high freq, more octaves, low stretch) | 65–100px | 0.25× |

**Current paper-grain params (do not change without cross-checking all themes):**

```
page.subtle:     freq=0.16, octaves=4, stretch=1.8, tile=110
page.medium:     freq=0.14, octaves=3, stretch=2.0, tile=130
page.strong:     freq=0.11, octaves=3, stretch=2.2, tile=150

frosted.page.subtle:  freq=0.015, octaves=2, stretch=2.0, tile=667
frosted.page.medium:  freq=0.010, octaves=2, stretch=2.2, tile=1000
frosted.page.strong:  freq=0.008, octaves=2, stretch=2.4, tile=1250

surface.subtle:  freq=0.55, octaves=6, stretch=2.1, tile=210
surface.medium:  freq=0.40, octaves=5, stretch=2.6, tile=255
surface.strong:  freq=0.30, octaves=5, stretch=3.0, tile=300

foreground.subtle:   freq=0.24, octaves=5, stretch=1.4, tile=65
foreground.medium:   freq=0.20, octaves=4, stretch=1.5, tile=80
foreground.strong:   freq=0.18, octaves=4, stretch=1.6, tile=100
```

**Strength within each layer** — each strength selects both the SVG preset (from the 9-combo matrix above) AND the CSS opacity:

| Strength | `TEXTURE_STRENGTHS` values (paper / frosted / metallic) | SVG character |
|---|---|---|
| `strong` | 0.75 / 0.55 / 0.45 | Coarser freq, higher stretch within the layer |
| `medium` | 0.50 / 0.35 / 0.28 | Default params |
| `subtle` | 0.30 / 0.22 / 0.15 | Finer freq, lower stretch within the layer |

**Opacity formula — inline textures only** (`texture="paper-grain" | "frosted-glass" | "brushed-aluminium"`; read this before adjusting any value):
```
FINAL = TEXTURE_STRENGTHS[texture][strength] × LAYER_OPACITY[layer]
```
Example: `<TexturedSurface texture="paper-grain" strength="subtle" layer="foreground">` = `0.30 × 0.25 = 0.075`.

When layering textures (nested TexturedSurfaces), the cumulative effect is multiplicative. A foreground card inside a surface panel inside a page-backed view: the card's own texture at 0.075 compounds with the panel's texture at its opacity. The values are chosen so foreground textures are noticeably lighter — never override `LAYER_OPACITY` or `TEXTURE_STRENGTHS` to flatten this hierarchy.

**`texture="theme"` does NOT use this formula for opacity.** In theme mode, `strength` only selects which SVG noise preset to draw (`LAYER_SVGS["paper-grain"][layer][strength]`) — it has no effect on opacity. Theme-mode opacity is `calc(var(--texture-opacity-surface) * LAYER_OPACITY[layer])`, i.e. `TEXTURE_STRENGTHS` is never consulted for this path. This is intentional, not a bug: the active theme (not `strength`) owns the surface's base opacity via `--texture-opacity-surface`, and only the layer multiplier + the theme's chosen intensity apply. Do not "fix" this by multiplying in `strength` — that would change every themed surface's tuned opacity.

**SVG preset matrix** — defined in `svg-utils.ts` as `LAYER_SVGS[texture][layer][strength]`, returning `{ primary, secondary, tileSize }`. Each material defines 9 presets (3 layers × 3 strengths). Presets are pre-generated at module level via helper functions (`pAssets`, `mAssets`, `fAssets`) that call `dataUri(paperSvg(...))` etc. — no runtime SVG generation. `LAYER_SVGS`, `TEXTURE_STRENGTHS` and `TEXTURE_CONFS` are all typed against the `TextureKey` union (`svg-utils.ts`), so adding a texture that misses one of the three tables fails to compile rather than silently falling through at runtime. A `getComputedStyle`-derived value (e.g. `--texture-type`) is untyped at the CSS boundary — narrow it with the exported `isTextureKey` guard before indexing any of these tables.

**Two rendering paths:**
- **Inline textures** (`texture="paper-grain" | "brushed-aluminium" | "frosted-glass"`): React-rendered `<div>` overlays with `backgroundImage: url("${svg}")`. Theme-independent. Conf is built by `TEXTURE_CONFS[texture](opacity, layer, strength)`. In DEV (`import.meta.env?.DEV`), a missing `TEXTURE_STRENGTHS`/`TEXTURE_CONFS` entry for the given `texture` logs a `console.warn` instead of silently falling through to theme rendering.
- **Theme-driven** (`texture="theme"`): `::after` pseudo-element reads `--texture-paper-resolved` / `--texture-opacity-resolved` (with fallback to `--texture-paper` / `--texture-opacity-surface`). Component writes `--texture-paper-resolved` from `LAYER_SVGS["paper-grain"][layer][strength]` and `--texture-opacity-resolved` from `calc(var(--texture-opacity-surface) * layerOpacity)`.

**ParamTable subcomponent** — `<TexturedSurface.ParamTable texture="paper-grain" />` renders a 3×3 grid (layers × strengths) for any texture, filling container width with aspect-square cells. No labels inside cells — just bare texture swatches. Always use literal JSX in showcase files (no `.map()` loops) so the code extractor produces copyable output.

**CRITICAL — no self-reference cycles in CSS custom properties:**
- Never write to the same CSS custom property that the `::after` reads. The CVA reads `--texture-paper-resolved` (fallback to `--texture-paper`), and the component writes to `--texture-paper-resolved` — never to `--texture-paper`. Same for `--texture-size-resolved` and `--texture-opacity-resolved`.
- Self-reference example (DO NOT DO): setting `--texture-opacity-surface: calc(var(--texture-opacity-surface) * 0.5)` creates a dependency cycle → guaranteed-invalid → property falls back to initial value (opacity: 1).
- The `html::before` page texture (Comic theme) uses `--texture-paper` directly — this is fine because the component never writes to the base `--texture-paper` token. The indirection only exists for the `::after` path.

**`--texture-suppress` — nested-texture suppression, without poisoning:**
- The inline-texture path (above) renders its own visuals via numeric React `opacity` on plain `<div>`s, but it still carries the shared `texturedSurfaceVariants` classes (including the `::after` theme-texture pseudo-element) on its root — so it must suppress its *own* `::after`, or a themed texture would render behind its inline layers too.
- It does this by setting `--texture-suppress: "0"` (only on itself). The CVA's opacity expression is `calc(var(--texture-opacity-resolved,var(--texture-opacity-surface)) * var(--texture-suppress,1))` — multiplying by `0` zeroes that one element's own `::after`, no matter what it inherited.
- Because CSS custom properties inherit, `--texture-suppress: 0` also reaches any descendant that doesn't redeclare it. Every `texture="theme"` render therefore unconditionally re-declares `--texture-suppress: "1"` on itself, undoing whatever it inherited from an ancestor inline surface — so a `texture="theme"` surface nested inside an inline one always shows its own texture (see the "Nested inline → theme" showcase demo).
- **Do not use `--texture-suppress` to intentionally hide a nested theme surface's texture** — a `texture="theme"` render always resets it to `1`. The only real (and correct) way to suppress a nested theme texture is `Canvas`'s override of `--texture-opacity-surface` itself (§0.12), which the theme path never resets.
- This is a different mechanism from the *former* bug where the inline path zeroed `--texture-opacity-surface` directly as its kill switch — that inherited into nested theme children and silently zeroed their real opacity too. `--texture-suppress` exists so "kill switch" and "real opacity input" are never the same variable.

**Theme tokens for texture:**
```
--texture-paper          CSS url() data URI — used by html::before (page overlay), NOT by TexturedSurface's ::after
--texture-size           Tile size for the page overlay
--texture-opacity        Opacity for the page overlay (html::before). Comic: 0.5.
--texture-opacity-surface Opacity for surface-level ::after. Comic: 0.35.
--texture-blend          mix-blend-mode for both page overlay and surface ::after
```
All per-layer SVG textures use the JS-side `LAYER_SVGS` factory pattern (see TexturedSurface — layer × strength system). Never define per-layer texture SVG data URIs in CSS theme files.

**Comic theme page texture stacking:**
- `html[data-theme="comic"]` sets the background color + repeating line pattern.
- `html[data-theme="comic"]::before` overlays the SVG noise texture at `z-index: -1` with `--texture-opacity: 0.5` — sits behind body content but in front of the html background.
- The page SVG (`--texture-paper`) comes from the DS factory (`PAGE_MEDIUM_URI` in `svg-utils.ts`), **not** from a hardcoded string in CSS. The showcase's `handleThemeChange` sets it via JS on `document.documentElement.style`. `PAGE_MEDIUM_URI` sources directly from `LAYER_SVGS["paper-grain"]["surface"]["medium"]` (`layerPaper.surface.medium.primary`) — **not** `["page"]["medium"]` as the name suggests. This is a known naming drift (`NOTE(human)` at its declaration in `svg-utils.ts`): the constant's params have always matched `surface.medium`, and the owner likes the shipped look, so the reference points at the preset it actually reproduces rather than being changed to the `page.medium` params its name implies. Still a single source of truth — just not the one the name suggests.
- `html[data-theme="comic"] body { background-color: transparent; }` ensures the page texture shows through.
- The showcase root `<div>` must NOT have `bg-bg` (or must be overridden per theme) — it blocks the html background.

**Showcase layering hierarchy (App.tsx):**
- **Sidebar** — wrapped in `<TexturedSurface texture="theme" layer="surface" strength="subtle">` so the navigation panel appears as a surface-level textured panel beside the page background.
- **Header** — wrapped in `<TexturedSurface texture="theme" layer="foreground" strength="subtle">` — interactive controls get the lightest texture.
- **Main content** — transparent, shows the page texture from `html::before`.
- **Demo panels** — already wrapped via `DemoSection.tsx` in `<TexturedSurface texture="theme" layer="surface">`.

This creates a visual depth gradient: page (heaviest behind content) → surface sidebar/panels (medium) → foreground header (lightest).

**The texture-factory.ts pattern** — the `PaperGrain`, `BrushedAluminium`, `FrostedGlassNoise` classes take a `PaperState` / `MetallicState` / `FrostedBlurState` object and expose:
- `.uri`: the SVG data URI
- `.tile`: tile size
- `.style(opacity)`: a `LayerStyle` object `{ backgroundImage, backgroundSize, opacity, mixBlendMode }`
- `.codeStyle(opacity)`: a JS code string for copy-paste (`new PaperGrain({...}).style(0.5)`)

The `LAYER_SVGS` presets in `svg-utils.ts` are the module-level factory output — they call `paperSvg()` + `dataUri()` at module evaluation time. This is equivalent to `new PaperGrain(params).uri` but avoids class instantiation for the 9 pre-generated assets per material.

**Extending with a new texture type** (e.g., "linen", "denim"):
1. Add SVG generator to `svg-utils.ts` (or use existing `paperSvg` with different params).
2. Add 9 presets to `LAYER_SVGS` (3 layers × 3 strengths) using the helper function pattern (`pAssets`, `mAssets`, `fAssets`).
3. Add the texture name to the `texture` prop union type in `TexturedSurfaceProps`.
4. Add entry to `TEXTURE_CONFS` and `TEXTURE_STRENGTHS`.
5. Add `ParamTable` support by updating the texture key (it reads from `LAYER_SVGS` automatically).
6. Add single-instance demo + `<TexturedSurface.ParamTable texture="..." />` to showcase file. Never use `.map()` loops in `render` — literal JSX only.
7. `npm run validate` must pass.

### Font maintenance contract

When adding a new font family, update **both** places (they are not auto-synced):
1. `src/styles/globals.css` — add the `@font-face` block(s) and a `[data-font="<name>"]` rule setting the appropriate font-family token.
2. `src/lib/fonts.ts` — add an entry to the `fontOptions` array (value matches the `data-font` attribute value, label is the display name).

`src/showcase/App.tsx` reads from `fonts.ts` — no separate update needed.

### Rotated page texture oversize rule (Comic/Metallic etc.)

When a page-level texture (`html::before`) uses a CSS `transform: rotate(…)` to apply directional grain (brushed aluminium, paper grain, etc.), the pseudo-element must be **oversized** so the rotated rectangle's bounding box still covers the entire viewport. The diagonal (corner-to-corner) of the rotated element grows with rotation:

```
extent = s/2 · (|cos θ| + |sin θ|)   // half-bounding-box from center
```

A `top:-100%; left:-100%; width:300%; height:300%` element (3× viewport, centered) covers every viewport corner for any rotation angle up to 45°. For 60° (Metallic), 300% is safe — the bounding box half-extent is `150% · (0.5 + 0.866) ≈ 205%`, far beyond the viewport's 50% half-extent. Without oversizing, the rotated element's clipped corners leave empty triangles at the viewport edges.

**Do not** use `inset:0` with a rotated page texture — it guarantees empty corners. Always use the `top:-100%; left:-100%; width:300%; height:300%` pattern (or larger for extreme angles >60°).

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

---

## 9. Animation / motion / video system

This section governs the emerging Remotion-based animation layer. It extends — not replaces
— all rules in §0–§8. When a motion rule and a base rule conflict, the stricter one wins.

### 9a. Package architecture

```
repo/
  src/ui/          # EXISTING — static primitives ($0–§8 rules apply unchanged)
  src/ui/patterns/ # EXISTING — composed patterns
  apps/
    video/         # NEW — Remotion project, compositions, MP4 rendering
  packages/
    motion/        # NEW — frame-driven animation wrappers (pure, no ui deps)
    scenes/        # NEW — composed scene templates (ui + motion)
```

### 9b. Tier separation — NEVER cross the streams

| Tier | Can import from | Must NOT |
|---|---|---|
| `src/ui/` (static) | `src/lib/`, Radix, CVA | motion, scenes, remotion |
| `packages/motion/` | remotion, react | `src/ui/` components (no dependency) |
| `packages/scenes/` | `src/ui/`, `packages/motion/`, remotion | nothing restricted |
| `apps/video/` | ui, motion, scenes, remotion | nothing restricted |

**The ui package is the design-system source of truth.** Motion never imports from it.
Scenes composes both. Video is the runtime.

### 9c. Hard rules for animation code

1. **Frame-driven only.** Every animation must use `useCurrentFrame()`, `interpolate()`,
   `spring()` from `remotion` — never CSS `transition`, `@keyframes`, `animation-delay`,
   or `setTimeout()` with wall-clock time. Remotion captures frame-by-frame; wall-clock
   animation will NOT render deterministically in the mp4 output.

2. **No side effects in render.** `useCurrentFrame()` is a React hook — call it at the
   top level of a component, never inside event handlers, `useEffect`, loops, or
   conditionals that depend on user interaction.

3. **Every animation primitive is a wrapper around `React.ReactNode`.** It must not know
   or care what children it receives. No `import { Button } from "@lib/ui"` inside
   `packages/motion/`.

4. **Every prop has a TypeScript interface.** No `any`, no implicit return types, no
   `PropsWithChildren` used alone without a named interface.

5. **Packages are workspace-scoped.** No relative cross-package imports like
   `"../../src/ui/button"`. Use `"my-you-eye"` (pre-monorepo) or `"@lib/ui"` (post-monorepo).

### 9d. Phased rollout — do not skip ahead

| Phase | What | Depends on |
|---|---|---|
| 0 | Pre-requisite additions to `src/ui` (CodeBlock `highlightLines`/`highlightRanges`, GraphNode `variant="simple"`, ConnectionLine `arrowhead` + `label`) | — |
| 1 | Remotion PoC in `apps/video` — import existing components, render static composition to MP4 with correct Tailwind styling | Phase 0 |
| 2 | `packages/motion` — 5 animation primitives (Reveal, Stagger, TypeText, Highlight, SlideTransition), smoke-test compositions | Phase 1 |
| 3 | `packages/present` — interactive presenter via `@remotion/player`. Step = frame range. `seek()` + `play()` + `outFrame`. No `core/` extraction needed unless Player proves insufficient. | Phase 1 + 2 |
| 4 | `packages/scenes` — CodeWalkthrough, Diagram scene templates (compose ui + motion). Data-driven. | Phase 0 + 2 |
| 5 | Monorepo migration (pnpm workspaces, Turborepo) — mechanical only | Phases 3+4 proven |
| 6 | Video composition + transitions (`@remotion/transitions`). Same scene data powers both MP4 export AND interactive presenter. | Phase 4 + 5 |

**Do not start a phase until the previous phase's acceptance check passes.** Stop and
report back after each phase with a short summary: what was done, verification results,
and how to visually confirm it works.

### 9e. Interactive mode — `@remotion/player` (preferred architecture)

The primary approach for live click-to-advance uses `@remotion/player`, NOT a
separate `core/remotion/interactive` layer:

1. Define each presentation "step" as a frame range in a Remotion composition.
2. Embed the composition via `<Player ref={playerRef} />`.
3. On click → `playerRef.current.seek(step.startFrame)` → `play()`.
4. `outFrame={step.endFrame}` stops playback automatically at the step boundary.
5. Animation primitives (`Reveal`/`Stagger`/`TypeText`/etc.) stay exactly as they
   are today with `useCurrentFrame()` — zero duplication.

**Only if `@remotion/player` proves insufficient** (e.g. per-primitive
interruption/reversal that frame-seeking can't express smoothly) should you build
the `core/remotion/interactive` extraction. That fallback is documented in
`TODO.md` but is NOT the current plan.

### 9f. Future animation primitives

After the current 5 are proven in both video and interactive contexts, the next
highest-value additions:

**Priority (express patterns the current 5 cannot):**
- `CameraPan` / `CameraZoom` — translate + scale container for zooming into
  diagram regions or code functions
- `PathDraw` — `stroke-dashoffset` animation on SVG paths for edge/connection
  drawing (pairs with ConnectionLine)

**Fit existing `progress: 0→1` model:**
- `Pulse` — looping scale/opacity breathing
- `Shake` — oscillating error/attention indicator
- `CountUp` — numeric tween for stats/metrics

**Need extra params (from/to pairs or path data):**
- `Morph` — FLIP-based cross-fade between two diagram states
- `CursorMove` — fake pointer along a path
- `FocusBlur` — dim/blur everything except a focused region
