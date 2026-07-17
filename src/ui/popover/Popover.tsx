import { forwardRef } from "react";
import { Root, Trigger, Portal, Content, Close } from "@radix-ui/react-popover";
import { cn } from "../../lib/cn";

const PopoverContent = forwardRef<React.ComponentRef<typeof Content>, React.ComponentPropsWithoutRef<typeof Content>>(
  ({ className, ...props }, ref) => (
    <Portal>
      <Content
        ref={ref}
        sideOffset={4}
        updatePositionStrategy="always"
        className={cn(
          "z-50 w-72 rounded-ui border border-border bg-bg p-panel shadow-lg outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className,
        )}
        {...props}
      />
    </Portal>
  ),
);
PopoverContent.displayName = "PopoverContent";

export { Root as Popover, Trigger as PopoverTrigger, PopoverContent, Close as PopoverClose };
