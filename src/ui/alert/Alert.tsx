import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const alertVariants = cva(
  "relative w-full rounded-ui border",
  {
    variants: {
      variant: {
        info: "border-primary/20 bg-primary/5 text-primary",
        success: "border-success/20 bg-success/5 text-success",
        warning: "border-warning/20 bg-warning/5 text-warning",
        danger: "border-danger/20 bg-danger/5 text-danger",
        // Presentation callouts (TODO.md Q3), not status alerts — a
        // left-accent card rather than a fully-tinted banner, so a
        // narrative "aside"/"pro tip" in a video reads as a distinct
        // visual family from the four status variants above.
        note: "border-border border-l-4 border-l-primary/60 bg-surface text-fg",
        tip: "border-border border-l-4 border-l-success/60 bg-surface text-fg",
      },
      // Same sm/md/lg padding scale as Card (--spacing-panel-sm/-panel/-panel-lg)
      // so density is uniform across Card/Alert/StatCard. md (unchanged) is
      // still the default. xl is a "presentation" density for large-format
      // video callouts (see also the title/body text bump below) — its own
      // --spacing-panel-xl token, not a reuse of -lg.
      size: {
        sm: "p-panel-sm",
        md: "p-panel",
        lg: "p-panel-lg",
        xl: "p-panel-xl",
      },
    },
    defaultVariants: {
      variant: "info",
      size: "md",
    },
  },
);

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  icon?: ReactNode;
}

// sm/md/lg keep the original text-sm/text-sm scale byte-for-byte; only xl
// steps the title/body typography up, since "large presentation size" is
// primarily about legibility at video scale, not just outer padding.
const TITLE_TEXT_BY_SIZE = { sm: "text-sm", md: "text-sm", lg: "text-sm", xl: "text-xl" } as const;
const BODY_TEXT_BY_SIZE = { sm: "text-sm", md: "text-sm", lg: "text-sm", xl: "text-base" } as const;

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, size, title, icon, children, ...props }, ref) => {
    const resolvedSize = size ?? "md";
    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ variant, size }), className)} {...props}>
        <div className="flex gap-stack">
          {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
          <div className="flex flex-col gap-tight">
            {title && <h5 className={cn(TITLE_TEXT_BY_SIZE[resolvedSize], "font-semibold")}>{title}</h5>}
            <div className={BODY_TEXT_BY_SIZE[resolvedSize]}>{children}</div>
          </div>
        </div>
      </div>
    );
  },
);
Alert.displayName = "Alert";

export { Alert, alertVariants };
