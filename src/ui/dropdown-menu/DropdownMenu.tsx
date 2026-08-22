import { forwardRef } from "react";
import {
  Root,
  Trigger,
  Portal,
  Content,
  Item,
  Separator,
  Label,
  Sub,
  SubTrigger,
  SubContent,
} from "@radix-ui/react-dropdown-menu";
import { cn } from "../../lib/cn";

// DropdownMenuContent forwards every Radix Content prop — including
// onCloseAutoFocus (#23). Radix's default close behavior refocuses the
// trigger; when a selected action intentionally moves focus elsewhere (an
// editor a Format action just edited, a field an "Insert" targeted),
// suppress that with:
//
//   <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
//
// The same override applies to any sibling menu surface where an action
// manages its own focus destination.
const DropdownMenuContent = forwardRef<React.ComponentRef<typeof Content>, React.ComponentPropsWithoutRef<typeof Content>>(
  ({ className, ...props }, ref) => (
    <Portal>
      <Content
        ref={ref}
        sideOffset={4}
        className={cn(
          "backdrop-blur-ui z-[var(--z-overlay)] min-w-[8rem] overflow-hidden rounded-ui border border-border bg-bg p-1 shadow-lg",
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

// Nested submenu (#21): same a11y model as the top-level menu (arrow-right /
// hover opens, arrow-left / Escape closes, typeahead spans both levels).
// `disabled` on the trigger grays out the entire submenu at once — sanctioned
// over disabling every leaf item individually.
const DropdownSubmenu = Sub;

const DropdownSubmenuTrigger = forwardRef<React.ComponentRef<typeof SubTrigger>, React.ComponentPropsWithoutRef<typeof SubTrigger>>(
  ({ className, children, ...props }, ref) => (
    <SubTrigger
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-ui-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "focus:bg-secondary focus:text-secondary-fg data-[state=open]:bg-secondary data-[state=open]:text-secondary-fg",
        className,
      )}
      {...props}
    >
      {children}
      <svg viewBox="0 0 8 8" aria-hidden="true" className="ml-auto size-3 shrink-0 fill-current pl-2">
        <path d="M2.5 0.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.25" fill="none" />
      </svg>
    </SubTrigger>
  ),
);
DropdownSubmenuTrigger.displayName = "DropdownSubmenuTrigger";

const DropdownSubmenuContent = forwardRef<React.ComponentRef<typeof SubContent>, React.ComponentPropsWithoutRef<typeof SubContent>>(
  ({ className, ...props }, ref) => (
    <Portal>
      <SubContent
        ref={ref}
        sideOffset={2}
        alignOffset={-4}
        className={cn(
          "backdrop-blur-ui z-[var(--z-overlay)] min-w-[8rem] overflow-hidden rounded-ui border border-border bg-bg p-1 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className,
        )}
        {...props}
      />
    </Portal>
  ),
);
DropdownSubmenuContent.displayName = "DropdownSubmenuContent";

export {
  Root as DropdownMenu,
  Trigger as DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownSubmenu,
  DropdownSubmenuTrigger,
  DropdownSubmenuContent,
};
