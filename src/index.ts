// Public API — `my-you-eye`. The ONLY module a consuming app imports from.
//
// Organised by the showcase taxonomy (`ShowcaseGroup` in src/showcase/types.ts),
// alphabetical within each section. Every component contributes exactly two
// lines — its values (component + subcomponents + CVA variants object) and its
// types — so a reader can find any symbol by group, and `scripts/check-exports.mjs`
// can prove nothing a component folder calls public is missing here.
//
// Adding a component: add it to its group below, then run `npm run validate`.
// `check-exports.mjs` fails if a folder's index.ts exports anything this file
// does not re-export. Never use `export *` here — the explicit list IS the API.
//
// Sibling entry points, each with its own index: `my-you-eye/motion`,
// `/scenes`, `/present`, `/video`. Styles: `my-you-eye/styles.css` (Tailwind v4
// source) or `my-you-eye/styles.compiled.css` (pre-built), plus
// `my-you-eye/tokens.css` and `my-you-eye/themes/<name>.css`.

// ---------------------------------------------------------------------------
// Library helpers — framework-agnostic utilities, no component attached.
// ---------------------------------------------------------------------------
export { cn } from "./lib/cn";
export { clamp, clamp01 } from "./lib/math";
export { layered, grid, countCrossings } from "./lib/layout";
export type { LayoutNode, LayoutEdge, LayoutPosition, LayeredOptions, GridOptions } from "./lib/layout";

// ---------------------------------------------------------------------------
// Inputs — form controls and anything the user types into or picks from.
// ---------------------------------------------------------------------------
export { Button, buttonVariants } from "./ui/button";
export type { ButtonProps } from "./ui/button";
export { Checkbox, checkboxVariants } from "./ui/checkbox";
export type { CheckboxProps } from "./ui/checkbox";
export { CheckboxTree } from "./ui/checkbox-tree";
export type { CheckboxTreeProps, CheckboxTreeNode } from "./ui/checkbox-tree";
export { EditorTabBar } from "./ui/editor-tab-bar";
export type { EditorTabBarProps, EditorTab } from "./ui/editor-tab-bar";
export { Combobox } from "./ui/combobox";
export type { ComboboxProps, ComboboxOption } from "./ui/combobox";
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "./ui/context-menu";
export { FileDrop, fileDropVariants } from "./ui/file-drop";
export type { FileDropProps } from "./ui/file-drop";
export { Input, inputVariants } from "./ui/input";
export type { InputProps } from "./ui/input";
export { Label, labelVariants } from "./ui/label";
export type { LabelProps } from "./ui/label";
export { MultiSelect } from "./ui/multi-select";
export type { MultiSelectProps, MultiSelectOption } from "./ui/multi-select";
export { RadioGroup, RadioGroupItem, radioGroupItemVariants } from "./ui/radio-group";
export type { RadioGroupProps, RadioGroupItemProps } from "./ui/radio-group";
export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";
export type { SelectTriggerProps, SelectItemProps } from "./ui/select";
export { SegmentedControl, segmentedControlVariants } from "./ui/segmented-control";
export type { SegmentedControlProps, SegmentedOption } from "./ui/segmented-control";
export { Slider, sliderTrackVariants } from "./ui/slider";
export type { SliderProps } from "./ui/slider";
export { Switch, switchVariants } from "./ui/switch";
export type { SwitchProps } from "./ui/switch";
export { Textarea, textareaVariants } from "./ui/textarea";
export type { TextareaProps } from "./ui/textarea";

// ---------------------------------------------------------------------------
// Display — static presentation surfaces: content, code, media, chrome.
// ---------------------------------------------------------------------------
export { Avatar, avatarVariants } from "./ui/avatar";
export type { AvatarProps } from "./ui/avatar";
export { Badge, badgeVariants } from "./ui/badge";
export type { BadgeProps } from "./ui/badge";
export {
  Card,
  cardVariants,
  CardHeader,
  cardHeaderVariants,
  CardTitle,
  CardContent,
  cardContentVariants,
  CardFooter,
  cardFooterVariants,
} from "./ui/card";
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps } from "./ui/card";
export { CodeBlock, codeBlockVariants, CodeHeaderBar, LanguageBadge } from "./ui/code-block";
export type {
  CodeBlockProps,
  CodeBlockHighlightGroup,
  HighlightRangeDef,
  CodeHeaderBarProps,
} from "./ui/code-block";
export { DeviceFrame, deviceFrameVariants } from "./ui/device-frame";
export type { DeviceFrameProps, DeviceFrameVariant } from "./ui/device-frame";
export {
  DiffBlock,
  diffBlockVariants,
  pairDiffLines,
  wordDiff,
  lcsDiffFlags,
} from "./ui/diff-block";
export type {
  DiffBlockProps,
  DiffLine,
  DiffLineType,
  DiffRow,
  WordDiffSegment,
  WordDiffResult,
  LcsDiffFlags,
} from "./ui/diff-block";
export { DiffStatChip, diffStatChipVariants } from "./ui/diff-stat-chip";
export type { DiffStatChipProps } from "./ui/diff-stat-chip";
export { EmptyState } from "./ui/empty-state";
export type { EmptyStateProps } from "./ui/empty-state";
export { Image, imageVariants } from "./ui/image";
export type { ImageProps } from "./ui/image";
export { Kbd } from "./ui/kbd";
export type { KbdProps } from "./ui/kbd";
export { Markdown, renderInline } from "./ui/markdown";
export type { MarkdownProps } from "./ui/markdown";
export { ScrollArea, scrollAreaVariants } from "./ui/scroll-area";
export type { ScrollAreaProps } from "./ui/scroll-area";
export { Separator, separatorVariants } from "./ui/separator";
export type { SeparatorProps } from "./ui/separator";
export { StatusDot, statusDotVariants } from "./ui/status-dot";
export type { StatusDotProps } from "./ui/status-dot";
export { Terminal, terminalVariants } from "./ui/terminal";
export type { TerminalProps, TerminalEntry, TerminalPromptGlyph } from "./ui/terminal";

// ---------------------------------------------------------------------------
// Feedback — transient status: loading, progress, alerts, toasts.
// ---------------------------------------------------------------------------
export { Alert, alertVariants } from "./ui/alert";
export type { AlertProps } from "./ui/alert";
export { Progress } from "./ui/progress";
export type { ProgressProps } from "./ui/progress";
export { Skeleton, skeletonVariants } from "./ui/skeleton";
export type { SkeletonProps } from "./ui/skeleton";
export { Spinner, spinnerVariants } from "./ui/spinner";
export type { SpinnerProps } from "./ui/spinner";
export { Toaster, useToast } from "./ui/toast";

// ---------------------------------------------------------------------------
// Overlay — anything that renders in a portal above the page.
// ---------------------------------------------------------------------------
export { CommandPalette } from "./ui/command-palette";
export type { CommandPaletteProps, CommandAction } from "./ui/command-palette";
export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
export type { DialogContentProps } from "./ui/dialog";
export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from "./ui/drawer";
export type { DrawerContentProps } from "./ui/drawer";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownSubmenu,
  DropdownSubmenuTrigger,
  DropdownSubmenuContent,
} from "./ui/dropdown-menu";
export { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "./ui/popover";
export { TooltipProvider, Tooltip, TooltipContent } from "./ui/tooltip";

// ---------------------------------------------------------------------------
// Navigation — moving between places.
// ---------------------------------------------------------------------------
export { ActivityBar } from "./ui/activity-bar";
export type { ActivityBarProps, ActivityBarItem } from "./ui/activity-bar";
export { Breadcrumbs } from "./ui/breadcrumbs";
export type { BreadcrumbsProps, BreadcrumbItem } from "./ui/breadcrumbs";
export { Link, linkVariants } from "./ui/link";
export type { LinkProps } from "./ui/link";
export { Pagination } from "./ui/pagination";
export type { PaginationProps } from "./ui/pagination";
export { StatusBar, StatusBarItem } from "./ui/status-bar";
export type { StatusBarProps, StatusBarItemProps } from "./ui/status-bar";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps } from "./ui/tabs";

// ---------------------------------------------------------------------------
// Canvas — the node-graph editor tier: pannable surface, nodes, ports, edges.
// ---------------------------------------------------------------------------
export { Annotation } from "./ui/annotation";
export type { AnnotationProps } from "./ui/annotation";
export { Canvas, Edge, edgeVariants } from "./ui/canvas";
export type { CanvasProps, EdgeProps } from "./ui/canvas";
export { ConnectionLayer } from "./ui/connection-layer";
export type { ConnectionLayerProps, ConnectionLayerEdge } from "./ui/connection-layer";
export {
  ConnectionLine,
  ConnectionPath,
  connectionLineVariants,
  ConnectionLabelPortalContext,
  generatePath,
  getArrowAngle,
  getPointAtT,
  getRoutePoints,
  generateGappedPath,
  getRouteLength,
  computeBundleOffsets,
  findClearLabelT,
  ALL_ANCHORS,
  CORNER_ANCHORS,
  SIDE_ANCHORS,
  anchorNormal,
  anchorPoint,
  isAnchoredEnd,
  radialBorderPoint,
  rectCenter,
  resolveEnds,
  ARROWHEADS,
  ARROWHEAD_SHAPES,
  resolveArrowhead,
} from "./ui/connection-line";
export type {
  ConnectionLineProps,
  Point,
  ObstacleRect,
  ConnectionKind,
  ConnectionVariant,
  AnchorName,
  AnchorRect,
  AnchoredEnd,
  EdgeEnd,
  ResolvedEnds,
  ArrowheadShape,
  ArrowheadProp,
  ArrowheadDef,
} from "./ui/connection-line";
export { Graph } from "./ui/patterns/graph";
export type { GraphProps, EditorNode, EditorEdge, PortRef } from "./ui/patterns/graph";
export { GraphGroup, graphGroupVariants } from "./ui/graph-group";
export type { GraphGroupProps } from "./ui/graph-group";
export { GraphNode, graphNodeVariants } from "./ui/graph-node";
export type { GraphNodeProps, PortDef, GraphNodeRow } from "./ui/graph-node";
export { Port, portVariants } from "./ui/port";
export type { PortProps } from "./ui/port";

// ---------------------------------------------------------------------------
// Charts — the data-visualisation family plus its shared frame and scales.
// These take a domain-props API and own their subtree (AGENTS.md §2.3).
// ---------------------------------------------------------------------------
export { BarChart } from "./ui/bar-chart";
export type { BarChartProps, BarChartSeries } from "./ui/bar-chart";
export {
  ChartFrame,
  ChartGhost,
  useReadableForeground,
  measureTextWidth,
  truncateToWidth,
  CHART_COLOR_TOKENS,
  CHART_SEQUENTIAL_TOKENS,
  chartColorToken,
  chartFill,
  chartStroke,
  chartBg,
  formatCompactNumber,
  formatTickNumber,
  formatTickPercentage,
  formatTickBytes,
  formatTickCurrency,
  niceTicks,
} from "./ui/patterns/chart-frame";
export type {
  ChartFrameProps,
  ChartFrameLegendItem,
  ChartFrameRenderCtx,
  ChartGhostProps,
  ChartColorToken,
  ChartSequentialToken,
} from "./ui/patterns/chart-frame";
export { Funnel } from "./ui/funnel";
export type { FunnelProps, FunnelStage } from "./ui/funnel";
export { Gauge } from "./ui/gauge";
export type { GaugeProps, GaugeThresholdBand } from "./ui/gauge";
export { Heatmap } from "./ui/heatmap";
export type { HeatmapProps } from "./ui/heatmap";
export { Legend } from "./ui/legend";
export type { LegendProps, LegendItem } from "./ui/legend";
export { LineChart } from "./ui/line-chart";
export type { LineChartProps, LineChartSeries } from "./ui/line-chart";
export { PieChart } from "./ui/pie-chart";
export type { PieChartProps, PieChartSlice } from "./ui/pie-chart";
export { ScatterPlot } from "./ui/scatter-plot";
export type { ScatterPlotProps, ScatterSeries, ScatterPoint } from "./ui/scatter-plot";
export { Sparkline } from "./ui/sparkline";
export type { SparklineProps } from "./ui/sparkline";

// ---------------------------------------------------------------------------
// Data — tabular and hierarchical data presentation.
// ---------------------------------------------------------------------------
export { CellType } from "./ui/cell-type";
export type { CellTypeProps, CellValueType, UrlReplacement } from "./ui/cell-type";
export { DataList } from "./ui/data-list";
export type { DataListProps, DataListItem } from "./ui/data-list";
export { DataTable, dataTableVariants } from "./ui/patterns/data-table";
export type { DataTableProps, DataTableColumn } from "./ui/patterns/data-table";
export {
  Table,
  tableVariants,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./ui/table";
export type {
  TableProps,
  TableHeaderProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
} from "./ui/table";
export { Timeline } from "./ui/timeline";
export type {
  TimelineProps,
  TimelineEvent,
  TimelineEventState,
  TimelineDensity,
  TimelineLabelPlacement,
} from "./ui/timeline";
export { TreeView } from "./ui/tree-view";
export type { TreeViewProps, TreeNode, TreeNodeValue } from "./ui/tree-view";

// ---------------------------------------------------------------------------
// Patterns — compositions built FROM the primitives above (src/ui/patterns/).
// ---------------------------------------------------------------------------
export { Comparison } from "./ui/patterns/comparison";
export type { ComparisonProps } from "./ui/patterns/comparison";
export { ConfirmDialog } from "./ui/patterns/confirm-dialog";
export type { ConfirmDialogProps } from "./ui/patterns/confirm-dialog";
export { FileTree } from "./ui/patterns/file-tree";
export type { FileTreeProps, FileTreeNode, FileGitStatus } from "./ui/patterns/file-tree";
export { FormField } from "./ui/patterns/form-field";
export type { FormFieldProps } from "./ui/patterns/form-field";
export { PageShell } from "./ui/patterns/page-shell";
export type { PageShellProps } from "./ui/patterns/page-shell";
export { SequenceDiagram } from "./ui/patterns/sequence-diagram";
export type {
  SequenceDiagramProps,
  SequenceParticipant,
  SequenceMessage,
  SequenceNote,
  SequenceItem,
  SequenceActivation,
} from "./ui/patterns/sequence-diagram";
export { StatCard } from "./ui/patterns/stat-card";
export type { StatCardProps, StatCardDelta, StatCardSparklineProps } from "./ui/patterns/stat-card";
export { StatGrid, STAT_GRID_COLUMNS_CLASS } from "./ui/patterns/stat-grid";
export type { StatGridProps, StatGridItem } from "./ui/patterns/stat-grid";
export { TexturedSurface, texturedSurfaceVariants } from "./ui/patterns/textured-surface";
export type { TexturedSurfaceProps, TextureName } from "./ui/patterns/textured-surface";
export { Toolbar } from "./ui/patterns/toolbar";
export type { ToolbarProps, ToolbarFilterChip } from "./ui/patterns/toolbar";

// ---------------------------------------------------------------------------
// Typography.
// ---------------------------------------------------------------------------
export { TitleBar } from "./ui/title-bar";
export type { TitleBarProps } from "./ui/title-bar";
export { Typography } from "./ui/typography";
export type { TypographyProps } from "./ui/typography";
export { VirtualList, computeVirtualWindow, DEFAULT_OVERSCAN } from "./ui/virtual-list";
export type { VirtualListProps, VirtualWindow } from "./ui/virtual-list";
