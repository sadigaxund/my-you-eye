import { forwardRef } from "react";
import { Root, List, Trigger, Content } from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/cn";

const filingListVariants = cva(
  "relative overflow-visible flex items-end -mb-px gap-0",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const filingTriggerVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap " +
    "rounded-t-[var(--radius-ui-lg)] px-4 py-2 text-sm font-medium " +
    "ring-offset-bg transition-all focus-visible:outline-none " +
    "focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "min-w-[calc(var(--radius-ui-lg)*3)] " +
    "data-[state=inactive]:z-0 data-[state=inactive]:bg-surface data-[state=inactive]:text-muted " +
    "data-[state=active]:z-20 data-[state=active]:bg-surface-elevated data-[state=active]:text-fg " +
    "data-[state=active]:before:content-[''] data-[state=active]:before:absolute " +
    "data-[state=active]:before:bottom-0 data-[state=active]:before:-left-[var(--radius-ui-lg)] " +
    "data-[state=active]:before:w-[var(--radius-ui-lg)] data-[state=active]:before:h-[var(--radius-ui-lg)] " +
    "data-[state=active]:before:[background:radial-gradient(circle_at_top_left,transparent_var(--radius-ui-lg),var(--color-surface-elevated)_var(--radius-ui-lg))] " +
    "data-[state=active]:after:content-[''] data-[state=active]:after:absolute " +
    "data-[state=active]:after:bottom-0 data-[state=active]:after:-right-[var(--radius-ui-lg)] " +
    "data-[state=active]:after:w-[var(--radius-ui-lg)] data-[state=active]:after:h-[var(--radius-ui-lg)] " +
    "data-[state=active]:after:[background:radial-gradient(circle_at_top_right,transparent_var(--radius-ui-lg),var(--color-surface-elevated)_var(--radius-ui-lg))]",
  {
    variants: {},
  },
);

const filingContentVariants = cva(
  "rounded-b-[var(--radius-ui-lg)] bg-surface-elevated p-4 " +
    "ring-offset-bg focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type FilingTabsProps = React.ComponentPropsWithoutRef<typeof Root>;
export interface FilingTabsListProps extends React.ComponentPropsWithoutRef<typeof List>, VariantProps<typeof filingListVariants> {}
export interface FilingTabsTriggerProps extends React.ComponentPropsWithoutRef<typeof Trigger>, VariantProps<typeof filingTriggerVariants> {}
export interface FilingTabsContentProps extends React.ComponentPropsWithoutRef<typeof Content>, VariantProps<typeof filingContentVariants> {}

const FilingTabs = Root;

const FilingTabsList = forwardRef<React.ComponentRef<typeof List>, FilingTabsListProps>(
  ({ className, variant, ...props }, ref) => (
    <List ref={ref} className={cn(filingListVariants({ variant }), className)} {...props} />
  ),
);
FilingTabsList.displayName = "FilingTabsList";

const FilingTabsTrigger = forwardRef<React.ComponentRef<typeof Trigger>, FilingTabsTriggerProps>(
  ({ className, ...props }, ref) => (
    <Trigger ref={ref} className={cn(filingTriggerVariants(), className)} {...props} />
  ),
);
FilingTabsTrigger.displayName = "FilingTabsTrigger";

const FilingTabsContent = forwardRef<React.ComponentRef<typeof Content>, FilingTabsContentProps>(
  ({ className, variant, ...props }, ref) => (
    <Content ref={ref} className={cn(filingContentVariants({ variant }), className)} {...props} />
  ),
);
FilingTabsContent.displayName = "FilingTabsContent";

export { FilingTabs, FilingTabsList, FilingTabsTrigger, FilingTabsContent };
