import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const barVariants = cva("h-full rounded-full transition-all duration-300", {
  variants: {
    variant: {
      default: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-danger",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ProgressProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof barVariants> {
  value: number;
  label?: string;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, variant, label, className, ...props }, ref) => (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {label && (
        <div className="flex justify-between text-xs">
          <span className="text-muted">{label}</span>
          <span className="text-fg font-medium">{Math.round(value)}%</span>
        </div>
      )}
      <div ref={ref} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(barVariants({ variant }))}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  ),
);
Progress.displayName = "Progress";

export { Progress };
