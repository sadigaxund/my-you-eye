# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added

- **Design tokens system** — `--spacing-*`, `--opacity-*`, `--shadow-*`, `--font-serif` tokens for consistent sizing, spacing, and shadows across all components.
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
