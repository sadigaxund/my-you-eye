# Changelog

All notable changes to this project are documented here.

## [Unreleased]

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
