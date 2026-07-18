import { forwardRef } from "react";
import { Root, Trigger, Portal, Overlay, Content, Title, Description, Close } from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const dialogOverlay =
  "fixed inset-0 z-[var(--z-overlay)] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out";

const dialogContentVariants = cva(
  "fixed left-1/2 top-1/2 z-[var(--z-overlay)] w-full -translate-x-1/2 -translate-y-1/2 rounded-ui bg-surface-elevated p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof Content>,
    VariantProps<typeof dialogContentVariants> {}

const dialogOverlayWithBlur = `${dialogOverlay} [backdrop-filter:blur(var(--backdrop-blur))]`;

const DialogContent = forwardRef<React.ComponentRef<typeof Content>, DialogContentProps>(
  ({ className, size, children, ...props }, ref) => (
    <Portal>
      <Overlay className={dialogOverlayWithBlur} />
      <Content ref={ref} className={cn(dialogContentVariants({ size }), className)} style={{ backdropFilter: "blur(var(--backdrop-blur))", borderWidth: "var(--border-width)" }} {...props}>
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
DialogContent.displayName = "DialogContent";

const DialogHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 mb-4", className)} {...props} />
  ),
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = forwardRef<React.ComponentRef<typeof Title>, React.ComponentPropsWithoutRef<typeof Title>>(
  ({ className, ...props }, ref) => (
    <Title ref={ref} className={cn("text-lg font-semibold leading-tight", className)} {...props} />
  ),
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = forwardRef<React.ComponentRef<typeof Description>, React.ComponentPropsWithoutRef<typeof Description>>(
  ({ className, ...props }, ref) => (
    <Description ref={ref} className={cn("text-sm text-muted", className)} {...props} />
  ),
);
DialogDescription.displayName = "DialogDescription";

const DialogFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-end gap-inline mt-6", className)} {...props} />
  ),
);
DialogFooter.displayName = "DialogFooter";

export {
  Root as Dialog,
  Trigger as DialogTrigger,
  Close as DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
