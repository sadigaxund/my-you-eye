# my-you-eye — UI Component Library

A reusable React + TypeScript component library built with Tailwind v4, Radix primitives, and CVA variants.

## Importing

All components are exported from the package root:

```tsx
import { Button, Dialog, Select } from "my-you-eye";
```

Use the `cn()` utility from the library for class merging:

```tsx
import { cn } from "my-you-eye/cn";
```

## Component Groups

### inputs
Button, Checkbox, Combobox, FileDrop, Input, Label, MultiSelect, RadioGroup, Select, Slider, Switch, Textarea

### display
Avatar, Badge, Card, CodeBlock, DataList, EmptyState, Image, Kbd, Markdown, ScrollArea, Separator, Skeleton, StatusDot, Typography

### feedback
Alert, Progress, Spinner, Toast

### overlay
CommandPalette, Dialog, Drawer, DropdownMenu, Popover, Tooltip

### navigation
Breadcrumbs, Pagination, Tabs

### canvas
Canvas, ConnectionLine, Edge, GraphNode, Orchestrator, Port

### data
CellValue, Table, TreeView

### patterns
ConfirmDialog, DataTable, FormField, PageShell, StatCard, Toolbar

## Usage Rules

- **Components use CVA variants.** Most have a `variant` and/or `size` prop. Use them instead of raw class overrides.
- **Use semantic Tailwind classes only.** Colors come from tokens (`bg-primary`, `text-muted`, `border-border`). Never use arbitrary color values.
- **Overlay components** (Dialog, Drawer, Popover, Tooltip, DropdownMenu, Select, Combobox) use Radix primitives. Their content areas auto-apply backdrop blur when the active theme supports it.
- **Themes** are token-override blocks. Switch themes via `data-theme` attribute on `<html>`.
- **Fonts** are switched via `data-font` attribute.
=======
---
name: my-you-eye
description: Use the my-you-eye UI component library. Invoke before building ANY UI — buttons, inputs, cards, dialogs, tables, tree views, canvas/graph/pipeline editors — in a project that depends on this package, so you reuse an existing component instead of hand-rolling native HTML. Read the manifest first.
---

# my-you-eye — UI component library

This project ships a fixed set of themeable, accessible UI components. **Never hand-roll a
styled `<button>`, `<input>`, `<select>`, `<table>`, `<a>`, or a bespoke card/dialog/menu.**
There is almost certainly already a component for it.

## Step 1 — find the component (always do this first)

Read `components.json` (or the human-readable `COMPONENTS.md`) at the package root. It is
auto-generated from the library's showcases and lists **every** component, its group, and its
variant props. Pick the component whose name/group matches what you need.

- Inputs: Button, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, Combobox…
- Display: Card, Badge, Avatar, Separator, StatusDot, Kbd, EmptyState…
- Feedback: Alert, Toast, Spinner, Skeleton, Progress…
- Overlay: Dialog, Drawer, Popover, Tooltip, DropdownMenu, CommandPalette…
- Navigation: Tabs, Breadcrumbs, Pagination.
- Data: Table, CellValue, DataList, TreeView, CodeBlock, Markdown.
- Canvas: Canvas, GraphNode, Port, Edge, ConnectionLine — plus the `Orchestrator` pattern
  for a full drag/connect/pan/zoom pipeline editor.
- Patterns: FormField, ConfirmDialog, PageShell, Toolbar, StatCard, Orchestrator.

## Step 2 — use it

```tsx
import { Button, Card, Table } from "my-you-eye";
import "my-you-eye/styles.css"; // once, at the app root

<Button variant="primary" size="md">Save</Button>
```

Pick behavior with **variant props** from the manifest's allowed set. Use `className` only for
one-off **layout** (width, margin) — never to restyle. If you keep re-adding the same
`className`, the right fix is a new variant in the library, not a local override.

## Step 3 — customize by theme, not by fork

All color, radius, spacing, typography, border, and surface values come from CSS variables.
To restyle globally, override the tokens at your app root or set `data-theme="<name>"` /
`.dark` on `<html>` — do not copy component code or wrap components in style overrides.

## If a component genuinely does not exist

It belongs in the library, not in the consuming app. Add it upstream in `src/ui/` following
that repo's `AGENTS.md`, then consume it here. Do not inline a new primitive locally.
