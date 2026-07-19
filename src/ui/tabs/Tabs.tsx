import { createContext, useContext, forwardRef } from "react";
import { Root, List, Trigger, Content } from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

type TabsVariant = "underline" | "pills" | "filing";

const TabsVariantContext = createContext<TabsVariant>("underline");

const tabsListVariants = cva("inline-flex items-center", {
  variants: {
    variant: {
      underline: "border-b border-border gap-0",
      pills: "gap-1",
      filing:
        "flex items-end gap-0 overflow-x-auto scrollbar-gutter-stable w-fit max-w-full",
    },
  },
  defaultVariants: {
    variant: "underline",
  },
});

const tabsTriggerVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-bg transition-all focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        underline:
          "border-b-2 border-transparent px-3 py-2 -mb-px data-[state=active]:border-primary data-[state=active]:text-primary",
        pills:
          "rounded-ui-sm px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-fg",
        filing:
          "rounded-t-ui-lg px-4 py-2 flex-shrink-0 border border-border " +
          "data-[state=active]:bg-surface-elevated data-[state=active]:text-fg " +
          "data-[state=active]:border-b-surface-elevated data-[state=active]:z-20 " +
          "data-[state=inactive]:bg-surface data-[state=inactive]:text-muted data-[state=inactive]:z-10",
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  },
);

const tabsContentVariants = cva(
  "relative ring-offset-bg focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring",
  {
    variants: {
      variant: {
        underline: "mt-2",
        pills: "mt-2",
        filing:
          "bg-surface-elevated border border-border rounded-b-ui-lg rounded-tr-ui-lg -mt-px z-0 p-4",
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  },
);

export type TabsProps = React.ComponentPropsWithoutRef<typeof Root> &
  VariantProps<typeof tabsListVariants>;
export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof List>,
    VariantProps<typeof tabsListVariants> {}
export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}
export type TabsContentProps = React.ComponentPropsWithoutRef<typeof Content> &
  VariantProps<typeof tabsContentVariants>;

const Tabs = forwardRef<React.ComponentRef<typeof Root>, TabsProps>(
  ({ variant, ...props }, ref) => (
    <TabsVariantContext.Provider value={variant ?? "underline"}>
      <Root ref={ref} {...props} />
    </TabsVariantContext.Provider>
  ),
);
Tabs.displayName = "Tabs";

const TabsList = forwardRef<React.ComponentRef<typeof List>, TabsListProps>(
  ({ className, variant: explicitVariant, ...props }, ref) => {
    const ctxVariant = useContext(TabsVariantContext);
    const variant = explicitVariant ?? ctxVariant;
    return (
      <List
        ref={ref}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    );
  },
);
TabsList.displayName = "TabsList";

const TabsTrigger = forwardRef<React.ComponentRef<typeof Trigger>, TabsTriggerProps>(
  ({ className, variant: explicitVariant, onFocus, ...props }, ref) => {
    const ctxVariant = useContext(TabsVariantContext);
    const variant = explicitVariant ?? ctxVariant;
    return (
      <Trigger
        ref={ref}
        className={cn(tabsTriggerVariants({ variant }), className)}
        onFocus={(e) => {
          if (variant === "filing") {
            e.currentTarget.scrollIntoView({
              block: "nearest",
              inline: "nearest",
            });
          }
          onFocus?.(e);
        }}
        {...props}
      />
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = forwardRef<React.ComponentRef<typeof Content>, TabsContentProps>(
  ({ className, ...props }, ref) => {
    const variant = useContext(TabsVariantContext);
    return (
      <Content
        ref={ref}
        className={cn(tabsContentVariants({ variant }), className)}
        {...props}
      />
    );
  },
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
