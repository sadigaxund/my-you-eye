# Components

> Auto-generated from `*.showcase.tsx` by `scripts/gen-manifest.mjs`. Do not edit by hand.

All components import from the package root:

```tsx
import { Button, Card } from "my-you-eye";
import "my-you-eye/styles.css";
```

**65 components** across 10 groups.

## canvas

| Component | Variants | Demos |
|---|---|---|
| `Canvas` | — | Empty grid |
| `ConnectionLayer` | — | Many edges, one svg, Edge states share the same visual language as ConnectionLine |
| `ConnectionLine` | variant: bezier / stepped / straight<br>state: connected / highlighted / pending | Path variants, Edge states, Decorations (arrowheads + labels), Label positions, Label on a genuinely curved path, ConnectionLayer (one svg, many edges) |
| `Graph` | type: button | Pipeline editor (drag nodes, connect ports, delete selected) |
| `GraphNode` | variant: muted / selected / simple | Variants, Simple variant, Legacy ports on a tall node, Free-form body |
| `Port` | state: connected / default / highlighted | States |

## charts

| Component | Variants | Demos |
|---|---|---|
| `BarChart` | orientation: horizontal | Single series (vertical), Grouped, multi-series, Stacked, Horizontal, Horizontal, grouped, Long category label, Empty, Draw-on progress (50%) |
| `ChartFrame` | — | Axes, gridlines & a custom plot, Loading, Empty |
| `Funnel` | — | Four stages, Two stages, Long stage labels, Empty, Draw-on progress (50%) |
| `Gauge` | — | Basic, Threshold bands — healthy, Threshold bands — critical, Custom range, Long label, Draw-on progress (50%) |
| `Heatmap` | — | Activity calendar, Single column, Long row label, Empty, Draw-on progress (50%) |
| `Legend` | orientation: vertical | Rect swatches (bar / area fills), Line swatches, Dot swatches (scatter / points), Vertical orientation |
| `LineChart` | — | Single series, Multi-series, Area fill, No point markers, Long category label, Empty, Draw-on progress (50%) |
| `PieChart` | — | Pie, Donut with center label, Single category (no legend), Long labels, Empty, Draw-on progress (50%) |
| `ScatterPlot` | — | Single series, With trend line, Multi-series (3, all-pairs cap), Long point label (tooltip), Loading, Empty, Draw-on progress (50%) |
| `Sparkline` | — | Basic, Area fill, Downward trend, danger token, Inside StatCard, Empty, Draw-on progress (50%) |

## data

| Component | Variants | Demos |
|---|---|---|
| `CellType` | type: array / audio / badge / boolean / bytes / currency / date-human / date-system / datetime-tz / duration / email / image / json / null / number / percentage / signed / status / text / tree / url | Data Types, Project X, Project X, Numeric types |
| `DataList` | density: compact | Density (normal vs compact), Striped, Label width, Alignment, Scrolling |
| `DataTable` | variant: striped<br>density: compact | Default, Striped, Scrolling + sticky header, Alignment, Row A, Row B, Row C, Row D, Alpha, Beta, Alpha, Beta, Truncation |
| `Table` | align: right<br>variant: striped<br>density: compact | Composition, Variants, Density, Sticky header |
| `TreeView` | type: button<br>density: compact<br>variant: condensed | Density (normal vs compact), Tall values (elbow/chevron alignment), Depth-based expand, Controlled expand state, Leading icons (click a row, then use arrow keys), Messy nested payload (hover to trace depth guides) |

## display

| Component | Variants | Demos |
|---|---|---|
| `Avatar` | size: lg / md / sm | Sizes, Fallback variants, With image, With ring, With status dot |
| `Badge` | variant: danger / neutral / primary / success / warning<br>style: soft | Variants (solid), Variants (soft) |
| `Card` | variant: danger / default / elevated / ghost / outlined<br>size: lg / md / sm | Variants, With footer actions, Size |
| `CodeBlock` | variant: elevated | Bare (no header, no language), Language-only (badge overlay, no header bar), With header + language, Elevated, Line numbers, No wrap (horizontal scroll), Syntax highlighting (TS), Line highlights, Line highlights (implicit gutter), Multi-color highlights, Substring highlights, Substring highlights on a long line (wrap forced off), Merged highlights, Syntax highlighting (CSS / HTML / SQL / YAML / Python) |
| `EmptyState` | variant: secondary | Default, With icon and action |
| `Image` | — | Fit modes, Border radius, Aspect ratio, Styles, With caption |
| `Kbd` | — | Default, Combinations |
| `Markdown` | — | Rendered markdown |
| `ScrollArea` | orientation: horizontal / vertical | Vertical scroll, Horizontal scroll, Rounded corners (radius on ScrollArea itself, not a wrapper), Edge fade |
| `Separator` | orientation: vertical | Horizontal, Vertical |
| `StatusDot` | variant: danger / info / neutral / success / warning<br>size: md / sm | Variants, Sizes, Pulsing |

## feedback

| Component | Variants | Demos |
|---|---|---|
| `Alert` | variant: danger / info / success / warning<br>size: lg / md / sm | Variants, With title, With icon, Size |
| `Progress` | variant: danger / default / success / warning | Variants, No label |
| `Skeleton` | shape: circle / rect / text | Shapes |
| `Spinner` | size: lg / md / sm | Sizes |
| `Toast` | variant: danger / secondary | Trigger toasts |

## inputs

| Component | Variants | Demos |
|---|---|---|
| `Button` | variant: danger / ghost / primary / secondary<br>size: icon-sm / lg / md / sm | Variants, Sizes, Icon-only (compact), Disabled & loading |
| `Checkbox` | size: md / sm | Sizes, States |
| `Combobox` | — | Basic, Disabled |
| `FileDrop` | — | Default, Single image only |
| `Input` | variant: filled<br>size: md / sm | Variants, Sizes, States |
| `Label` | — | Default |
| `MultiSelect` | — | Basic, Empty, Disabled |
| `RadioGroup` | — | Default |
| `Select` | size: md / sm | Sizes, States, No indicator |
| `Slider` | size: md / sm | Basic slider, Sizes |
| `Switch` | size: md / sm | Sizes, States |
| `Textarea` | variant: filled | Variants, States |

## navigation

| Component | Variants | Demos |
|---|---|---|
| `Breadcrumbs` | — | Default, Custom separator |
| `Pagination` | — | Default (10 pages), Few pages |
| `Tabs` | variant: filing / pills / underline | Underline, Pills, Filing |

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
| `StatCard` | size: lg / md / sm | Default, Size |
| `TexturedSurface` | variant: elevated / ghost / primary / surface<br>size: sm | Tuner, Paper grain, Frosted glass, Brushed aluminium, Paper grain — full matrix, Frosted glass — full matrix, Brushed aluminium — full matrix, Theme-driven, Composed |
| `Toolbar` | size: sm<br>variant: primary / secondary<br>style: soft | All slots filled, With leading label, Result count + removable filter chips, Narrow / responsive collapse |

## typography

| Component | Variants | Demos |
|---|---|---|
| `Typography & Tokens` | — | Font families, Text sizes, Colors, Radius & spacing |

