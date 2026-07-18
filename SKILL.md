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
