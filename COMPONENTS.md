# Components

> Auto-generated from `*.showcase.tsx` by `scripts/gen-manifest.mjs`. Do not edit by hand.

All components import from the package root:

```tsx
import { Button, Card } from "my-you-eye";
import "my-you-eye/styles.css";
```

**54 components** across 9 groups.

## canvas

| Component | Variants | Demos |
|---|---|---|
| `Canvas` | — | Empty grid |
| `Edge` | variant: bezier / stepped / straight<br>state: connected | Path variants, Edge states |
| `Graph` | type: button | Pipeline editor (drag nodes, connect ports, delete selected) |
| `GraphNode` | variant: muted / selected | Variants |
| `Port` | state: connected / default / highlighted | States |

## data

| Component | Variants | Demos |
|---|---|---|
| `CellValue` | type: array / audio / badge / boolean / bytes / date / datetime / duration / email / image / json / null / number / percentage / status / text / tree / url | Data types in a table, foo, Project X, Numeric types |
| `DataList` | variant: compact | Default & Compact, Long values |
| `DataTable` | variant: striped<br>density: compact | Alice, Bob, Charlie, Diana, Default, Status variants, Striped + compact |
| `Table` | align: right | Row ${i + 1}, Sticky header (scroll down) |
| `TreeView` | type: button<br>variant: condensed | Default & Condensed (depth-based expand), Controlled expand state, Leading icons (click a row, then use arrow keys), Messy nested payload (hover to trace depth guides) |

## display

| Component | Variants | Demos |
|---|---|---|
| `Avatar` | size: lg / md / sm | Sizes, Fallback variants, With image, With ring, With status dot |
| `Badge` | variant: danger / neutral / primary / success / warning<br>style: soft | Variants (solid), Variants (soft) |
| `Card` | variant: danger / default / elevated / ghost / outlined<br>size: sm | Variants, With footer actions |
| `CodeBlock` | variant: elevated | Bare (no header, no language), Language-only (badge overlay, no header bar), With header + language, Elevated, Line numbers, No wrap (horizontal scroll) |
| `EmptyState` | variant: secondary | Default, With icon and action |
| `Image` | — | Fit modes, Border radius, Aspect ratio, Styles, With caption |
| `Kbd` | — | Default, Combinations |
| `Markdown` | — | Rendered markdown |
| `ScrollArea` | — | Vertical scroll, Horizontal scroll |
| `Separator` | orientation: vertical | Horizontal, Vertical |
| `StatusDot` | variant: danger / info / neutral / success / warning<br>size: md / sm | Variants, Sizes, Pulsing |

## feedback

| Component | Variants | Demos |
|---|---|---|
| `Alert` | variant: danger / info / success / warning | Variants, With title, With icon |
| `Progress` | variant: danger / default / success / warning | Variants, No label |
| `Saved` | variant: danger / secondary | Trigger toasts |
| `Skeleton` | shape: circle / rect / text | Shapes |
| `Spinner` | size: lg / md / sm | Sizes |

## inputs

| Component | Variants | Demos |
|---|---|---|
| `Button` | variant: danger / ghost / primary / secondary<br>size: lg / md / sm | Variants, Sizes, Disabled & loading |
| `Checkbox` | size: md / sm | Sizes, States |
| `Combobox` | — | Basic, Disabled |
| `FileDrop` | — | Default, Single image only |
| `Input` | variant: filled<br>size: md / sm | Variants, Sizes, States |
| `Label` | — | Default |
| `MultiSelect` | — | Basic, Empty, Disabled |
| `RadioGroup` | — | Default |
| `Select` | size: md / sm | Sizes, States, No indicator |
| `Slider` | — | Basic slider |
| `Switch` | size: md / sm | Sizes, States |
| `Textarea` | variant: filled | Variants, States |

## navigation

| Component | Variants | Demos |
|---|---|---|
| `Breadcrumbs` | — | Default, Custom separator |
| `Pagination` | — | Default (10 pages), Few pages |
| `Tabs` | variant: pills / underline | Underline, Pills |

## overlay

| Component | Variants | Demos |
|---|---|---|
| `CommandPalette` | variant: secondary | Basic, With groups |
| `Dialog` | size: lg / md / sm<br>variant: ghost | Sizes, Form example |
| `Drawer` | side: left / right<br>size: md / sm<br>variant: secondary | Left & Right |
| `DropdownMenu` | variant: secondary | Default |
| `Popover` | variant: secondary<br>size: sm | Default |
| `Tooltip` | side: bottom / left / right / top<br>variant: secondary | Directions |

## patterns

| Component | Variants | Demos |
|---|---|---|
| `ConfirmDialog` | variant: danger / secondary | Variants |
| `FormField` | type: password | Default, With hint, Required with error |
| `PageShell` | variant: secondary | Default, With actions |
| `StatCard` | — | Default |
| `TexturedSurface` | variant: elevated / neutral / surface<br>style: soft | Theme-driven (default), Texture × Strength matrix, Custom colors + paper texture, Radii |
| `Toolbar` | size: sm<br>variant: primary / secondary<br>style: soft | All slots filled, With leading label, Result count + removable filter chips, Narrow / responsive collapse |

## typography

| Component | Variants | Demos |
|---|---|---|
| `Typography & Tokens` | — | Font families, Text sizes, Colors, Radius & spacing |

