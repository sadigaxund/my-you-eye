import { forwardRef } from "react";
import {
  Root,
  Trigger,
  Portal,
  Content,
  Item,
  Separator,
  Label,
} from "@radix-ui/react-dropdown-menu";
import { cn } from "../../lib/cn";

const DropdownMenuContent = forwardRef<React.ComponentRef<typeof Content>, React.ComponentPropsWithoutRef<typeof Content>>(
  ({ className, ...props }, ref) => (
    <Portal>
      <Content
        ref={ref}
        sideOffset={4}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-ui border border-border bg-bg p-1 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className,
        )}
        {...props}
      />
    </Portal>
  ),
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = forwardRef<React.ComponentRef<typeof Item>, React.ComponentPropsWithoutRef<typeof Item> & { destructive?: boolean }>(
  ({ className, destructive, ...props }, ref) => (
    <Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-ui-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        destructive
          ? "text-danger focus:bg-danger/10"
          : "text-fg focus:bg-secondary focus:text-secondary-fg",
        className,
      )}
      {...props}
    />
  ),
);
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuSeparator = forwardRef<React.ComponentRef<typeof Separator>, React.ComponentPropsWithoutRef<typeof Separator>>(
  ({ className, ...props }, ref) => (
    <Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
  ),
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuLabel = forwardRef<React.ComponentRef<typeof Label>, React.ComponentPropsWithoutRef<typeof Label>>(
  ({ className, ...props }, ref) => (
    <Label ref={ref} className={cn("px-2 py-1.5 text-xs font-semibold text-muted", className)} {...props} />
  ),
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export {
  Root as DropdownMenu,
  Trigger as DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
