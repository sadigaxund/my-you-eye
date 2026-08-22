import { forwardRef } from "react";
import {
  Root,
  Trigger,
  Portal,
  Content,
  Item,
  Separator,
} from "@radix-ui/react-context-menu";
import { cn } from "../../lib/cn";

// Pointer-position (right-click / long-press) menu — the sibling primitive
// to DropdownMenu, restyled with that family's exact classes so the two are
// visually indistinguishable (#3). Same a11y model: role=menu/menuitem,
// arrow/typeahead/Escape/Enter keyboard contract straight from Radix.
//
// Menus opened from a row the selected action may REMOVE (rename/delete)
// should suppress the default refocus:
//
//   <ContextMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
//
// so focus doesn't jump back to a node that no longer exists.

const ContextMenuContent = forwardRef<React.ComponentRef<typeof Content>, React.ComponentPropsWithoutRef<typeof Content>>(
  ({ className, ...props }, ref) => (
    <Portal>
      <Content
        ref={ref}
        className={cn(
          "backdrop-blur-ui z-[var(--z-overlay)] min-w-[10rem] overflow-hidden rounded-ui border border-border bg-bg p-1 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className,
        )}
        {...props}
      />
    </Portal>
  ),
);
ContextMenuContent.displayName = "ContextMenuContent";

const ContextMenuItem = forwardRef<React.ComponentRef<typeof Item>, React.ComponentPropsWithoutRef<typeof Item> & { destructive?: boolean }>(
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
ContextMenuItem.displayName = "ContextMenuItem";

const ContextMenuSeparator = forwardRef<React.ComponentRef<typeof Separator>, React.ComponentPropsWithoutRef<typeof Separator>>(
  ({ className, ...props }, ref) => (
    <Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
  ),
);
ContextMenuSeparator.displayName = "ContextMenuSeparator";

export {
  Root as ContextMenu,
  Trigger as ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
};
