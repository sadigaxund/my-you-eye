import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const inputVariants = cva(
  "flex w-full rounded-ui border bg-bg px-3 py-2 text-sm ring-offset-bg placeholder:text-muted focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:border-danger",
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
    VariantProps<typeof inputVariants> {
  /** Slot rendered inside the field's left edge (icon, unit prefix). */
  leading?: ReactNode;
  /** Slot rendered inside the field's right edge — shortcut hints via Kbd,
   * unit suffixes. Decorative slot content should be aria-hidden by the
   * caller when it repeats the input's accessible label (#29 rule). */
  trailing?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, invalid, leading, trailing, ...props }, ref) => {
    const control = (
      <input
        ref={ref}
        className={cn(
          "backdrop-blur-ui",
          inputVariants({ variant, size, invalid }),
          leading && "pl-9",
          trailing && "pr-11",
          className,
        )}
        {...props}
      />
    );
    if (!leading && !trailing) return control;
    return (
      <span className="relative inline-flex w-full items-center">
        {leading && (
          <span className="pointer-events-none absolute left-3 inline-flex items-center">
            {leading}
          </span>
        )}
        {control}
        {trailing && (
          <span className="absolute right-2.5 inline-flex items-center">
            {trailing}
          </span>
        )}
      </span>
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
