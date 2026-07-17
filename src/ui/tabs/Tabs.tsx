import { forwardRef } from "react";
import { Root, List, Trigger, Content } from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const tabsListVariants = cva("inline-flex items-center", {
  variants: {
    variant: {
      underline: "border-b border-border gap-0",
      pills: "gap-1",
    },
  },
  defaultVariants: {
    variant: "underline",
  },
});

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-bg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        underline:
          "border-b-2 border-transparent px-3 py-2 -mb-px data-[state=active]:border-primary data-[state=active]:text-primary",
        pills:
          "rounded-ui-sm px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-fg",
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  },
);

export type TabsProps = React.ComponentPropsWithoutRef<typeof Root>;
export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof List>, VariantProps<typeof tabsListVariants> {}
export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof Trigger>, VariantProps<typeof tabsTriggerVariants> {}
export type TabsContentProps = React.ComponentPropsWithoutRef<typeof Content>;

const Tabs = Root;

const TabsList = forwardRef<React.ComponentRef<typeof List>, TabsListProps>(
  ({ className, variant, ...props }, ref) => (
    <List ref={ref} className={cn(tabsListVariants({ variant }), className)} {...props} />
  ),
);
TabsList.displayName = "TabsList";

const TabsTrigger = forwardRef<React.ComponentRef<typeof Trigger>, TabsTriggerProps>(
  ({ className, variant, ...props }, ref) => (
    <Trigger ref={ref} className={cn(tabsTriggerVariants({ variant }), className)} {...props} />
  ),
);
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = forwardRef<React.ComponentRef<typeof Content>, TabsContentProps>(
  ({ className, ...props }, ref) => (
    <Content ref={ref} className={cn("mt-2 ring-offset-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} {...props} />
  ),
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
