---
name: my-you-eye
description: Use the my-you-eye component library. Invoke before building ANY UI — buttons, inputs, cards, dialogs, tables, tree views, canvas/graph/pipeline editors — AND before authoring any animation, diagram, chart, or recorded/presented video (coding walkthroughs, architecture diagrams, data flows, stats) in a project that depends on this package. Read the manifest first.
---

# my-you-eye — UI + motion + scenes + video library

One package, one version number, four tiers: static UI components
(`my-you-eye`), frame-driven animation primitives (`my-you-eye/motion`),
data-driven video/presentation scene templates (`my-you-eye/scenes`), and
the renderers that turn scene data into an MP4 or a live click-through
(`my-you-eye/present`, `my-you-eye/video`). **Never hand-roll a styled
`<button>`, `<input>`, `<select>`, `<table>`, `<a>`, a bespoke card/dialog/
menu, or a hand-drawn diagram/chart.** There is almost certainly already a
component for it.

## Step 1 — find the component (always do this first)

Read `COMPONENTS.md` (human-readable) or `components.json` (machine-readable)
at the package root. Both are auto-generated from the library's showcases
**and** `src/scenes/schema/*.ts`, and list every component (all four tiers),
its group, its variant props, and the entire `Video` scene schema
field-by-field. Pick the component whose name/group matches what you need —
or run `npx my-you-eye list` for a quick terminal overview.

## Step 2 — route the task to the right reference

| Task | Read |
|---|---|
| Static UI: buttons, inputs, cards, tables, dialogs, overlays, nav | `COMPONENTS.md`'s catalog (below) — usually enough on its own |
| A diagram: architecture, dataflow, state machine, flowchart, sequence diagram | **`references/diagrams.md`** — read this even if you think you already know the schema |
| A custom animation: entrance/attention effects, camera pans, a hand-built motion component | `references/motion.md` |
| Authoring a whole video/presentation (title → code → diagram → chart → outro) | `references/scenes.md` |
| Charts, `CodeBlock`/`Terminal`/`DiffBlock`, stat tiles, data tables/lists/trees | `references/data-display.md` |

## Step 3 — use it

```tsx
import { Button, Card, Table } from "my-you-eye";
import { Reveal, Stagger } from "my-you-eye/motion";
import { CodeScene, DiagramScene, SceneRenderer, assertVideo } from "my-you-eye/scenes";
import { Presenter, SpeakerView, useSteps } from "my-you-eye/present";
import { VideoRoot } from "my-you-eye/video";
import "my-you-eye/styles.css"; // once, at the app root
```

**Setup requirements:**
- Your project must use Tailwind CSS v4 (the library's CSS imports `@import "tailwindcss"`).
- Wrap your app root in `<TooltipProvider>` if you use Tooltip.
- Render `<Toaster />` somewhere in your app if you use toasts.
- `my-you-eye/motion/remotion` and `my-you-eye/video` pull in Remotion —
  only import them in a project that actually renders MP4s (or
  `my-you-eye/present/player`, which embeds the exact MP4 timeline in a
  browser `<Player>`). Plain UI and the live `Presenter` never need it.

## The rules that matter most

1. **Two different stability contracts — do not cross them.** `my-you-eye/scenes`
   data (a `Video` object: scenes, steps, diagram nodes/edges, chart specs)
   accepts **no** `className`, `style`, color, pixel coordinate, or frame
   count — only plain data and closed unions. `src/ui/` components (the
   plain `my-you-eye` entry, and the raw diagram/chart/motion primitives
   used *outside* the scene system) DO accept `className` for one-off
   layout, same as any normal component library. Mixing the two habits up —
   reaching for `className` on scene data, or expecting a `Video` schema's
   closed unions on a raw `GraphNode` — is the single most common mistake.
2. **Validate before you render.** `assertVideo(video)` /
   `validateVideo(video)` (`my-you-eye/scenes`) is a required step before
   `VideoRoot`/`Presenter`, not an optional debugging tool — it catches a
   broken reference or a missing field with a precise path, before it
   becomes a broken frame.
3. **A diagram is data with grid-unit-or-omitted coordinates, not a canvas
   you position by hand.** `references/diagrams.md` exists specifically
   because the failure mode this library is built to prevent is "create
   nodes, wire up lines, never look at how it reads" — read it before
   writing a `diagram`/`sequence` scene, even a small one.
4. **Pick behavior with variant props from the manifest's allowed set.**
   Use `className` only for one-off layout (width, margin) on `src/ui/`
   components — never to restyle. If you keep re-adding the same
   `className`, the right fix is a new variant upstream, not a local
   override.
5. **Customize by theme, not by fork.** All color/radius/spacing/typography
   come from CSS variables. Override tokens at the app root or set
   `data-theme="<name>"` / `.dark` on `<html>` — never copy component code
   or wrap components in style overrides.

## Component catalog (static UI — `my-you-eye`)

### inputs
Button, Checkbox, Combobox, FileDrop, Input, Label, MultiSelect, RadioGroup, Select, Slider, Switch, Textarea

### display
Avatar, Badge, Card, CodeBlock, DeviceFrame, DiffBlock, EmptyState, Image, Kbd, Markdown, ScrollArea, Separator, StatusDot, Terminal

### feedback
Alert, Progress, Skeleton, Spinner, Toast

### overlay
CommandPalette, Dialog, Drawer, DropdownMenu, Popover, Tooltip

### navigation
Breadcrumbs, Link, Pagination, Tabs

### canvas
Annotation, Canvas, ConnectionLayer, ConnectionLine, Graph, GraphGroup, GraphNode, Port

### charts
BarChart, ChartFrame, Funnel, Gauge, Heatmap, Legend, LineChart, PieChart, ScatterPlot, Sparkline

### data
CellType, DataList, DataTable, Table, Timeline, TreeView

### patterns
Comparison, ConfirmDialog, FileTree, FormField, PageShell, SequenceDiagram, StatCard, StatGrid, TexturedSurface, Toolbar

### typography
Typography

Full variant lists and demo names for every one of these live in
`COMPONENTS.md`/`components.json` — this list is only for picking a name to
look up.

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

## Available themes

`default`, `dark`, `neon`, `contrast`, `glass`, `comic`, `brutal`, `stark`, `frosted`, `metallic`.

```tsx
document.documentElement.dataset.theme = "glass"; // switch theme
document.documentElement.classList.toggle("dark"); // toggle dark mode
```

Note: a video/presentation's `meta.theme` (`my-you-eye/scenes`) currently
supports a subset of these — see `references/scenes.md`'s "Theme caveat".

## CLI tool

```
npx my-you-eye init [--force]   Copy SKILL.md + references/ + components.json to skills/
npx my-you-eye list             List all components with groups and variants
npx my-you-eye sync             Re-copy SKILL.md + references/ + components.json (overwrite)
npx my-you-eye --help           Show usage
```

## If a component genuinely does not exist

It belongs in the library, not in the consuming app. Add it upstream in
`src/ui/` (or `src/motion/`/`src/scenes/` for animation/scene work)
following that repo's `AGENTS.md`, then consume it here. Do not inline a new
primitive locally.
