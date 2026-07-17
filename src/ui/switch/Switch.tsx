import { forwardRef } from "react";
import { Root, Thumb } from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-secondary ring-offset-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary",
  {
    variants: {
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-bg shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-full",
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

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof Root>,
    VariantProps<typeof switchVariants> {}

const Switch = forwardRef<React.ComponentRef<typeof Root>, SwitchProps>(
  ({ className, size, ...props }, ref) => (
    <Root ref={ref} className={cn(switchVariants({ size }), className)} {...props}>
      <Thumb className={cn(thumbVariants({ size }))} />
    </Root>
  ),
);
Switch.displayName = "Switch";

export { Switch, switchVariants };
