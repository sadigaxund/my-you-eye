import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const inputVariants = cva(
  "flex w-full rounded-ui border bg-bg px-3 py-2 text-sm ring-offset-bg placeholder:text-muted focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border",
        filled: "border-transparent bg-secondary",
      },
      size: {
        sm: "h-8 text-xs",
        md: "h-10 text-sm",
      },
      invalid: {
        true: "border-danger ring-danger/30",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(inputVariants({ variant, size, invalid }), className)}
      style={{ backdropFilter: "blur(var(--backdrop-blur))" }}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input, inputVariants };
