import { forwardRef } from "react";
import { Root, Trigger, Portal, Overlay, Content, Title, Description, Close } from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const dialogOverlay =
  "fixed inset-0 z-[var(--z-overlay)] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out";

const dialogContentVariants = cva(
  "fixed left-1/2 top-1/2 z-[var(--z-overlay)] w-full -translate-x-1/2 -translate-y-1/2 rounded-ui bg-surface-elevated p-6 shadow-lg overscroll-contain data-[state=open]:animate-in data-[state=closed]:animate-out",
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

const dialogOverlayWithBlur = `${dialogOverlay} backdrop-blur-ui`;

const DialogContent = forwardRef<React.ComponentRef<typeof Content>, DialogContentProps>(
  ({ className, size, children, ...props }, ref) => (
    <Portal>
      <Overlay className={dialogOverlayWithBlur} />
      <Content ref={ref} className={cn("backdrop-blur-ui", dialogContentVariants({ size }), className)} style={{ borderWidth: "var(--border-width)" }} {...props}>
        {children}
        {/* Icon-only control: the accessible name is mandatory (#29). Radix's
            DialogContent already warns when DialogTitle is missing — a title
            is REQUIRED; consumers hiding it visually use
            <DialogTitle className="sr-only">. */}
        <Close
          aria-label="Close"
          className="absolute right-panel top-panel rounded-ui-sm opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring"
        >
          <svg viewBox="0 0 15 15" aria-hidden="true" className="size-4 fill-current">
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
