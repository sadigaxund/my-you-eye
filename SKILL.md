---
name: my-you-eye
description: Use the my-you-eye UI component library. Invoke before building ANY UI — buttons, inputs, cards, dialogs, tables, tree views, canvas/graph/pipeline editors — in a project that depends on this package, so you reuse an existing component instead of hand-rolling native HTML. Read the manifest first.
---

# my-you-eye — UI component library

This project ships a fixed set of themeable, accessible UI components. **Never hand-roll a
styled `<button>`, `<input>`, `<select>`, `<table>`, `<a>`, or a bespoke card/dialog/menu.**
There is almost certainly already a component for it.

## Step 1 — find the component (always do this first)

Read `COMPONENTS.md` (human-readable) or `components.json` (machine-readable) at the package
root. Both are auto-generated from the library's showcases and list **every** component, its
group, and its variant props. Pick the component whose name/group matches what you need.

You can also run `npx my-you-eye list` for a quick terminal overview.

## Component catalog

### inputs
Button, Checkbox, Combobox, FileDrop, Input, Label, MultiSelect, RadioGroup, Select, Slider, Switch, Textarea

### display
Avatar, Badge, Card, CodeBlock, EmptyState, Image, Kbd, Markdown, ScrollArea, Separator, StatusDot

### feedback
Alert, Progress, Skeleton, Spinner, Toast

### overlay
CommandPalette, Dialog, Drawer, DropdownMenu, Popover, Tooltip

### navigation
Breadcrumbs, Pagination, Tabs

### canvas
Canvas, ConnectionLine, Graph, GraphNode, Port

### data
CellType, DataList, DataTable, Table, TreeView

### patterns
ConfirmDialog, FormField, PageShell, StatCard, TexturedSurface, Toolbar

### typography
Typography

## Step 2 — use it

```tsx
import { Button, Card, Table } from "my-you-eye";
import "my-you-eye/styles.css"; // once, at the app root

<Button variant="primary" size="md">Save</Button>
```

**Setup requirements:**
- Your project must use Tailwind CSS v4 (the library's CSS imports `@import "tailwindcss"`).
- Wrap your app root in `<TooltipProvider>` if you use Tooltip.
- Render `<Toaster />` somewhere in your app if you use toasts.

Pick behavior with **variant props** from the manifest's allowed set. Use `className` only for
one-off **layout** (width, margin) — never to restyle. If you keep re-adding the same
`className`, the right fix is a new variant in the library, not a local override.

## Multi-part components

Some components export sub-parts. Import them by name:

**Dialog:** `Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter`
**Drawer:** `Drawer, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter`
**DropdownMenu:** `DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel`
**Popover:** `Popover, PopoverTrigger, PopoverContent, PopoverClose`
**Tooltip:** `TooltipProvider, Tooltip, TooltipContent`
**Select:** `Select, SelectTrigger, SelectContent, SelectItem, SelectValue`
**Tabs:** `Tabs, TabsList, TabsTrigger, TabsContent`
**Card:** `Card, CardHeader, CardTitle, CardContent, CardFooter`
**Table:** `Table, TableHeader, TableBody, TableRow, TableHead, TableCell`
**RadioGroup:** `RadioGroup, RadioGroupItem`
**Toast:** `Toaster, useToast` (hook — `const { toast } = useToast()`)

## Step 3 — customize by theme, not by fork

All color, radius, spacing, typography, border, and surface values come from CSS variables.
To restyle globally, override the tokens at your app root or set `data-theme="<name>"` /
`.dark` on `<html>` — do not copy component code or wrap components in style overrides.

Available themes: `default`, `dark`, `neon`, `contrast`, `glass`, `comic`, `brutal`, `stark`, `frosted`, `metallic`.

```tsx
// Switch theme
document.documentElement.dataset.theme = "glass";
// Toggle dark mode
document.documentElement.classList.toggle("dark");
```

## CLI tool

```
npx my-you-eye init [--force]   Copy SKILL.md + components.json to skills/
npx my-you-eye list             List all components with groups and variants
npx my-you-eye sync             Re-copy SKILL.md + components.json (overwrite)
npx my-you-eye --help           Show usage
```

`init` places `SKILL.md` and `components.json` in a local `skills/` directory so your AI
agent can discover them automatically.

## If a component genuinely does not exist

It belongs in the library, not in the consuming app. Add it upstream in `src/ui/` following
that repo's `AGENTS.md`, then consume it here. Do not inline a new primitive locally.
