import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const alertVariants = cva(
  "relative w-full rounded-ui border p-panel",
  {
    variants: {
      variant: {
        info: "border-primary/20 bg-primary/5 text-primary",
        success: "border-success/20 bg-success/5 text-success",
        warning: "border-warning/20 bg-warning/5 text-warning",
        danger: "border-danger/20 bg-danger/5 text-danger",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  icon?: ReactNode;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, icon, children, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <div className="flex gap-stack">
        {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
        <div className="flex flex-col gap-tight">
          {title && <h5 className="text-sm font-semibold">{title}</h5>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  ),
);
Alert.displayName = "Alert";

export { Alert, alertVariants };
