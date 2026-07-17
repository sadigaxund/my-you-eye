# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added

- **FileDrop component** — drag-and-drop file upload zone with drag-over/error/success visual states, file type/size validation, click-to-browse fallback. `src/ui/file-drop/`.
- **Avatar showcase demos** — image grid with all sizes, fallback variants, colored ring frames (primary/success/warning), status dot overlays (online/away/offline).
- **Custom scrollbar utility** — Firefox (`scrollbarWidth`/`scrollbarColor`) and webkit (`::-webkit-scrollbar` pseudo-elements) scrollbar styling applied to `<textarea>` and `<pre>` elements via CVA base classes and inline style.

### Changed

- **Header controls** — native `<select>` elements replaced with reusable `Select` component (Radix-based) for theme and font pickers.
- **Combobox scrollbar** — options list now wrapped in `<ScrollArea>` instead of plain `overflow-y-auto` div.
- **CommandPalette scrollbar** — results list now wrapped in `<ScrollArea>` instead of plain `overflow-y-auto` div.
- **DrawerBody scrollbar** — content area now wraps children in `<ScrollArea>` for consistent custom scrollbar appearance.
- **CodeBlock scrollbar** — `<pre>` element now uses the same custom scrollbar styling classes as ScrollArea.

- **Single-source font list** — `src/lib/fonts.ts` exports the canonical `fontOptions` array and derived `FontMode` type. `src/showcase/App.tsx` consumes it instead of duplicating option tags. AGENTS.md now documents the font maintenance contract.
- **Showcase masonry layout** — CSS columns (columns-1/2/3) replacing grid, column-rule divider. Short and tall components pack without ragged gaps.
- **Grid-locked GraphNode** — height derived from row count formula (HEADER + rows*ROW + FOOTER), row-anchored ports via `portLeft`/`portRight` on each row. Multiple same-side ports distributed vertically.
- **Snapping helper** — `snap()`/`useSnap` in canvas folder for 16px grid snapping. Draggable node demo.
- **Theme/profile system** — profiles defined in `src/styles/themes/*.css` as complete token-override blocks. `--border-width`, `--backdrop-blur` tokens wired to Card and Dialog. Profile switcher in showcase header.
- **Theme validation** — `scripts/check-themes.mjs` asserts every profile defines the full color token set; wired into `npm run validate`.
- **CellValue numeric types** — `number` (monospace, right-align, Intl.NumberFormat), `date`/`datetime` (relative + absolute), `bytes`, `duration`, `array` (chips via Badge).
- **CellValue JSON copy button** — copy-to-clipboard button in the JSON popover header.
- **Table alignment** — `align` prop on TableCell and TableHead (left/center/right). Numbers now render right-aligned.
- **Table sticky header** — `sticky` prop on TableHeader for scrollable tables.
- **DataTable pattern** — auto-rendering table from `columns: {key, header, type, align}` + rows array. Each cell rendered via CellValue.
- **TreeView depth-based expand** — `defaultExpandedDepth` (default 1) replaces all-collapsed default.
- **TreeView guide lines** — vertical indent guides connecting parent to children.
- **TreeView controlled state** — `expandedKeys`/`onToggle` props for external expand control.
- **TreeView keyboard navigation** — arrow keys, Home/End for focus movement.
- **AGENTS.md rules** — §4 showcase layout fixed infrastructure; §0.9 theme/profile token-override contract.
- **Sample profiles** — neon (frosted, cyan glow) and high-contrast (bold borders, no shadows) shipped.

### Changed

- **Dark mode** — moved from inline in tokens.css to `src/styles/themes/dark.css`.
- **GraphNode ports** — removed left-full/right-full label rendering that overlapped neighbors. Ports now anchored to their row.
- **GraphNode height** — content-driven height replaced with grid-derived height when `rows` prop is used.
- **AGENTS.md groups** — updated groups list to include `canvas` and `typography`.
- **GraphNode header dots** — changed from three gray circles to red/yellow/green traffic-light window control colors.
- **GraphNode row hover** — added `hover:bg-muted/10 transition-colors` to rows for subtle interactive feedback.
- **GraphNode footer** — removed diamond icon prefix; footer content now renders cleanly without a prefix.
- **Canvas showcase** — merged 3 separate demos (empty grid, static nodes, draggable nodes) into a single "Pipeline canvas" demo with 3 draggable ETL nodes using the row-based GraphNode design.
- **GraphNode showcase** — all 3 demos now use the consistent row-accent-footer design with meaningful metadata instead of disconnected children-based layouts.
- **Port showcase** — "Sides" and "Row-aligned ports" demos now use node-border-like containers with ports positioned at edge midpoints, matching GraphNode's port dot layout.

### Fixed

- **Canvas showcase white screen** — extracted `DraggableCanvasDemo` into a module-level component to avoid hooks-in-render-function bug (same root cause as previous Combobox/TreeView tab-switch crash).
- **Showcase layout** — removed md:grid-cols-2 grid and column-divider hack; CSS columns pack uneven heights without ragged whitespace.
- **Port overlap** — multiple ports on same side no longer stack at top-1/2; distributed vertically by index.
- **Canvas pan & zoom** — drag-to-pan, ctrl+scroll zoom (0.25–3x), floating zoom controls at bottom-right.
- **GraphNode** — node box with header/body/footer slots, accent bar, port anchors outside border. Variants: `default | selected | muted`.
- **Port** — small circle handle for node edges. Variants: `in | out`; states: `default | connected | highlighted`.
- **TreeView** — collapsible nested tree with CellValue leaf rendering. Variants: `default | condensed`.
- **CodeBlock** — code display with optional header/language bar, hover-to-copy button. Variants: `default | elevated`.
- **DataList** — key-value list with type-aware CellValue rendering. Variants: `default | compact`.
- **Slider** — styled range input with optional label and value display.
- **Markdown** — lightweight markdown renderer (headings, bold, italic, code, links, lists, code blocks). Zero npm dependencies. Code blocks reuse CodeBlock component.
- **Showcase font switcher** — dropdown to toggle between Sans, Serif, Mono across the entire showcase.
- **Showcase token reference** — color swatches, spacing bars, radius samples, text sizes under the `typography` tab.
- **Showcase 2-column layout** — responsive grid with vertical column separator and horizontal section dividers.
- **Canvas showcase group** — new `canvas` tab for Canvas, GraphNode, Port components.
- **URL replacements** — `replacements` prop on CellValue for pattern-based label display on URLs.
- **Global scale CSS hook** — `html { font-size: calc(1rem * var(--scale, 1)) }` ready for a scale slider.
- **Drawer** — slide-in panel from left/right via Radix Dialog. Sizes: `sm | md | lg`. Subcomponents: Header, Title, Description, Body, Footer.
- **Combobox** — autocomplete with search input inside Popover. Keyboard navigation, filtered options list.
- **CommandPalette** — ⌘K-style fuzzy search overlay with grouped actions, keyboard navigation, and keyboard shortcut hints.
- **GitHub Actions publish workflow** — auto-publishes to npm when a `v*` tag is pushed.
- **Select `showIndicator` prop** — suppress the checkmark indicator on SelectItem.
- **GraphNode `rows` prop** — structured two-column key-value table body inside graph nodes.

### Changed

- **Magic values → tokens** — replaced hardcoded `p-4`, `gap-3`, `gap-2`, `gap-1`, `opacity-60`, `shadow-sm` etc. with semantic token-mapped Tailwind classes across all component files.
- **Badge soft variants** — rewritten with proper Tailwind v4 `/15` opacity syntax (was a silent no-op).
- **GraphNode ports** — repositioned outside node border using `right-full`/`left-full`, labels never overlap node content.
- **CellValue JSON display** — now renders as headerless CodeBlock inside the Popover. Preview text truncated to prevent overflow.
- **Showcase demo containers** — DataList and TreeView variants displayed side-by-side instead of separate wide containers.
- **GraphNode rows alignment** — keys left-aligned with truncation, values right-aligned.
- **Package renamed** — from `@sadigaxund/ui` to `my-you-eye`.
- **Showcase URL demos** — replaced privacy masking with visual link labels (e.g. `example.com/path`, `API Docs →`).

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
