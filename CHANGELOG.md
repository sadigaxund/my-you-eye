# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Changed

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
- **`--color-success-fg` and `--color-danger-fg` tokens** — new token layer across all themes (tokens.css, dark.css, neon.css, high-contrast.css, comic.css, glass.css). Each theme defines appropriate foreground colors for success and danger semantic backgrounds, matching each theme's primary-fg pattern. Toast uses `text-success-fg` / `text-danger-fg` instead of `text-primary-fg`, giving every theme independent control over toast variant text colors.
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
- **Showcase profile switcher** — dropdown in header to toggle between light/dark/neon/high-contrast profiles.
- **Showcase font switcher** — dropdown to toggle between Sans, Serif, Mono across the entire showcase.
- **Showcase token reference** — color swatches, spacing bars, radius samples, text sizes under the `typography` tab.
- **Showcase `canvas` group** — new tab for Canvas, GraphNode, Port components.
- **Theme/profile system** — profiles defined in `src/styles/themes/*.css` as complete token-override blocks. `--border-width`, `--backdrop-blur` tokens wired to Card and Dialog.
- **Theme validation** — `scripts/check-themes.mjs` asserts every profile defines the full color token set; wired into `npm run validate`.
- **Sample profiles** — neon (frosted, cyan glow) and high-contrast (bold borders, no shadows) shipped.
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
