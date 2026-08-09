// Public API — only what's exported here is consumable by apps

export { cn } from "./lib/cn";
export { Spinner } from "./ui/spinner";
export { Button } from "./ui/button";
export { Input } from "./ui/input";
export { Label } from "./ui/label";
export { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
export { Badge } from "./ui/badge";
export { Alert } from "./ui/alert";
export { Checkbox } from "./ui/checkbox";
export { RadioGroup, RadioGroupItem } from "./ui/radio-group";
export { Switch } from "./ui/switch";
export { Textarea } from "./ui/textarea";
export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";
export { FormField } from "./ui/patterns/form-field";
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
export { TooltipProvider, Tooltip, TooltipContent } from "./ui/tooltip";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
export { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "./ui/popover";
export { Toaster, useToast } from "./ui/toast";
export { ConfirmDialog } from "./ui/patterns/confirm-dialog";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
export { Breadcrumbs } from "./ui/breadcrumbs";
export { Pagination } from "./ui/pagination";
export { Avatar } from "./ui/avatar";
export { Skeleton } from "./ui/skeleton";
export { EmptyState } from "./ui/empty-state";
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";
export { PageShell } from "./ui/patterns/page-shell";
export { Toolbar } from "./ui/patterns/toolbar";
export { StatCard } from "./ui/patterns/stat-card";
export type { StatCardProps, StatCardDelta, StatCardSparklineProps } from "./ui/patterns/stat-card";
export { StatGrid } from "./ui/patterns/stat-grid";
export type { StatGridProps, StatGridItem } from "./ui/patterns/stat-grid";
export { Comparison } from "./ui/patterns/comparison";
export type { ComparisonProps } from "./ui/patterns/comparison";
export { layered, grid, countCrossings } from "./lib/layout";
export type { LayoutNode, LayoutEdge, LayoutPosition, LayeredOptions, GridOptions } from "./lib/layout";
export { Separator } from "./ui/separator";
export { Progress } from "./ui/progress";
export { StatusDot } from "./ui/status-dot";
export { Kbd } from "./ui/kbd";
export { CellType } from "./ui/cell-type";
export { Canvas } from "./ui/canvas";
export { GraphNode } from "./ui/graph-node";
export { GraphGroup } from "./ui/graph-group";
export type { GraphGroupProps } from "./ui/graph-group";
export { Port } from "./ui/port";
export { Typography } from "./ui/typography";
export { TreeView } from "./ui/tree-view";
export { CodeBlock } from "./ui/code-block";
export { Combobox } from "./ui/combobox";
export { MultiSelect } from "./ui/multi-select";
export { CommandPalette } from "./ui/command-palette";
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
export { DataList } from "./ui/data-list";
export { DataTable } from "./ui/patterns/data-table";
export { Slider } from "./ui/slider";
export { Markdown } from "./ui/markdown";
export { ScrollArea } from "./ui/scroll-area";
export { ConnectionLine } from "./ui/connection-line";
export type { ConnectionLineProps } from "./ui/connection-line";
export { ConnectionLayer } from "./ui/connection-layer";
export type { ConnectionLayerProps, ConnectionLayerEdge } from "./ui/connection-layer";
export { FileDrop } from "./ui/file-drop";
export { Image } from "./ui/image";
export { Graph } from "./ui/patterns/graph";
export type { GraphProps, EditorNode, EditorEdge } from "./ui/patterns/graph";
export { TexturedSurface } from "./ui/patterns/textured-surface";
export { ChartFrame } from "./ui/patterns/chart-frame";
export type {
  ChartFrameProps,
  ChartFrameLegendItem,
  ChartFrameRenderCtx,
  ChartColorToken,
  ChartSequentialToken,
} from "./ui/patterns/chart-frame";
export {
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
export { Legend } from "./ui/legend";
export type { LegendProps, LegendItem } from "./ui/legend";
export { BarChart } from "./ui/bar-chart";
export type { BarChartProps, BarChartSeries } from "./ui/bar-chart";
export { LineChart } from "./ui/line-chart";
export type { LineChartProps, LineChartSeries } from "./ui/line-chart";
export { Sparkline } from "./ui/sparkline";
export type { SparklineProps } from "./ui/sparkline";
export { PieChart } from "./ui/pie-chart";
export type { PieChartProps, PieChartSlice } from "./ui/pie-chart";
export { Gauge } from "./ui/gauge";
export type { GaugeProps, GaugeThresholdBand } from "./ui/gauge";
export { Heatmap } from "./ui/heatmap";
export type { HeatmapProps } from "./ui/heatmap";
export { ScatterPlot } from "./ui/scatter-plot";
export type { ScatterPlotProps, ScatterSeries, ScatterPoint } from "./ui/scatter-plot";
export { Funnel } from "./ui/funnel";
export type { FunnelProps, FunnelStage } from "./ui/funnel";
export { Terminal, terminalVariants } from "./ui/terminal";
export type { TerminalProps, TerminalEntry, TerminalPromptGlyph } from "./ui/terminal";
export { DiffBlock, diffBlockVariants, pairDiffLines, wordDiff } from "./ui/diff-block";
export type { DiffBlockProps, DiffLine, DiffLineType, DiffRow, WordDiffSegment, WordDiffResult } from "./ui/diff-block";
export { DeviceFrame, deviceFrameVariants } from "./ui/device-frame";
export type { DeviceFrameProps, DeviceFrameVariant } from "./ui/device-frame";
export { Timeline } from "./ui/timeline";
export type { TimelineProps, TimelineEvent, TimelineEventState } from "./ui/timeline";
export { SequenceDiagram } from "./ui/patterns/sequence-diagram";
export type {
  SequenceDiagramProps, SequenceParticipant, SequenceMessage, SequenceNote,
  SequenceItem, SequenceActivation,
} from "./ui/patterns/sequence-diagram";
export { Annotation } from "./ui/annotation";
export type { AnnotationProps } from "./ui/annotation";
export { FileTree } from "./ui/patterns/file-tree";
export type { FileTreeProps, FileTreeNode, FileGitStatus } from "./ui/patterns/file-tree";
