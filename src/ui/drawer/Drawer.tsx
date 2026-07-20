import { forwardRef } from "react";
import { Root, Trigger, Portal, Overlay, Content, Title, Description, Close } from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { ScrollArea } from "../scroll-area";
import { cn } from "../../lib/cn";

const drawerOverlay = "fixed inset-0 z-[var(--z-overlay)] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out";

const drawerContentVariants = cva(
  "fixed z-[var(--z-overlay)] flex flex-col bg-surface-elevated shadow-lg transition-transform duration-[var(--duration-slow)] ease-[var(--ease-standard)]",
  {
    variants: {
      side: {
        left: "left-0 top-0 bottom-0 data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full",
        right: "right-0 top-0 bottom-0 data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full",
      },
      size: {
        sm: "w-72",
        md: "w-96",
        lg: "w-120",
      },
    },
    defaultVariants: {
      side: "right",
      size: "md",
    },
  },
);

export interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof Content>,
    VariantProps<typeof drawerContentVariants> {}

const DrawerContent = forwardRef<React.ComponentRef<typeof Content>, DrawerContentProps>(
  ({ className, side, size, children, ...props }, ref) => (
    <Portal>
      <Overlay className={drawerOverlay} />
      <Content ref={ref} className={cn(drawerContentVariants({ side, size }), className)} style={{ backdropFilter: "blur(var(--backdrop-blur))" }} {...props}>
        {children}
        <Close className="absolute right-panel top-panel rounded-ui-sm opacity-70 hover:opacity-100">
          <svg viewBox="0 0 15 15" className="size-4 fill-current">
            <path d="M2 2l11 11M13 2L2 13" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </Close>
      </Content>
    </Portal>
  ),
);
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-panel border-b border-border", className)} {...props} />
  ),
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerTitle = forwardRef<React.ComponentRef<typeof Title>, React.ComponentPropsWithoutRef<typeof Title>>(
  ({ className, ...props }, ref) => (
    <Title ref={ref} className={cn("text-lg font-semibold leading-tight", className)} {...props} />
  ),
);
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = forwardRef<React.ComponentRef<typeof Description>, React.ComponentPropsWithoutRef<typeof Description>>(
  ({ className, ...props }, ref) => (
    <Description ref={ref} className={cn("text-sm text-muted", className)} {...props} />
  ),
);
DrawerDescription.displayName = "DrawerDescription";

const DrawerBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1", className)} {...props}>
      <ScrollArea className="h-full p-panel">{children}</ScrollArea>
    </div>
  ),
);
DrawerBody.displayName = "DrawerBody";

const DrawerFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-end gap-inline p-panel border-t border-border", className)} {...props} />
  ),
);
DrawerFooter.displayName = "DrawerFooter";

export {
  Root as Drawer,
  Trigger as DrawerTrigger,
  Close as DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
};
