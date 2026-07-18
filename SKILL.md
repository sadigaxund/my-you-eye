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
