import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const portVariants = cva(
  "size-3 rounded-full border-2 bg-bg transition-colors",
  {
    variants: {
      side: {
        in: "",
        out: "",
      },
      state: {
        default: "border-muted",
        connected: "border-primary bg-primary",
        highlighted: "border-primary ring-2 ring-primary/30",
      },
    },
    defaultVariants: {
      side: "in",
      state: "default",
    },
  },
);

export interface PortProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof portVariants> {
  label?: string;
}

const Port = forwardRef<HTMLDivElement, PortProps>(
  ({ className, side, state, label, ...props }, ref) => (
    <div ref={ref} className={cn("relative flex items-center", side === "in" ? "flex-row" : "flex-row-reverse")}>
      <div className={cn(portVariants({ side, state }), className)} {...props} />
      {label && <span className={cn("text-xs text-muted px-1.5", side === "in" ? "pl-0" : "pr-0")}>{label}</span>}
    </div>
  ),
);
Port.displayName = "Port";

export { Port, portVariants };
