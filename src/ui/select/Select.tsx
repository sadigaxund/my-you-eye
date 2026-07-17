import { forwardRef } from "react";
import {
  Root,
  Trigger,
  Value,
  Icon,
  Content,
  Viewport,
  Item,
  ItemText,
  ItemIndicator,
} from "@radix-ui/react-select";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const triggerVariants = cva(
  "flex w-full items-center justify-between rounded-ui border bg-bg px-3 py-2 text-sm ring-offset-bg placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted",
  {
    variants: {
      size: {
        sm: "h-8 text-xs",
        md: "h-10 text-sm",
      },
      invalid: {
        true: "border-danger ring-danger/30",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof Trigger>,
    VariantProps<typeof triggerVariants> {}

const SelectTrigger = forwardRef<React.ComponentRef<typeof Trigger>, SelectTriggerProps>(
  ({ className, size, invalid, children, ...props }, ref) => (
    <Trigger ref={ref} className={cn(triggerVariants({ size, invalid }), className)} {...props}>
      {children}
      <Icon className="ml-2 shrink-0 opacity-50">
        <svg viewBox="0 0 8 8" className="size-3 fill-current">
          <path d="M0 2l4 4 4-4" />
        </svg>
      </Icon>
    </Trigger>
  ),
);
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = forwardRef<React.ComponentRef<typeof Content>, React.ComponentPropsWithoutRef<typeof Content>>(
  ({ className, children, position = "popper", ...props }, ref) => (
    <Content
      ref={ref}
      position={position}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-ui border border-border bg-bg text-fg shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out",
        className,
      )}
      {...props}
    >
      <Viewport className="p-1">{children}</Viewport>
    </Content>
  ),
);
SelectContent.displayName = "SelectContent";

export interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof Item> {
  showIndicator?: boolean;
}

const SelectItem = forwardRef<React.ComponentRef<typeof Item>, SelectItemProps>(
  ({ className, children, showIndicator = true, ...props }, ref) => (
    <Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-ui-sm py-1.5 pr-2 text-sm outline-none focus:bg-secondary focus:text-secondary-fg data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        showIndicator ? "pl-8" : "pl-2",
        className,
      )}
      {...props}
    >
      {showIndicator && (
        <span className="absolute left-2 flex size-3.5 items-center justify-center">
          <ItemIndicator>
            <svg viewBox="0 0 8 8" className="size-3 fill-current">
              <path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </ItemIndicator>
        </span>
      )}
      <ItemText>{children}</ItemText>
    </Item>
  ),
);
SelectItem.displayName = "SelectItem";

export { Root as Select, SelectTrigger, SelectContent, SelectItem, Value as SelectValue };
