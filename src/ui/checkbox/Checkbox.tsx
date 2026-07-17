import { forwardRef } from "react";
import { Root, Indicator } from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const checkboxVariants = cva(
  "peer shrink-0 rounded-ui-sm border border-border bg-bg ring-offset-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-fg data-[state=checked]:border-primary",
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = forwardRef<React.ComponentRef<typeof Root>, CheckboxProps>(
  ({ className, size, ...props }, ref) => (
    <Root ref={ref} className={cn(checkboxVariants({ size }), className)} {...props}>
      <Indicator className="flex items-center justify-center text-current">
        <svg viewBox="0 0 12 12" className="size-3 fill-current">
          <path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </Indicator>
    </Root>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox, checkboxVariants };
