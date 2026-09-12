import { forwardRef } from "react";
import { Root, Thumb } from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

// #37: unchecked track needs a fill-independent edge in dark themes where
// --color-secondary can sit close to --color-bg (near-zero contrast). A
// persistent 1px border + 1px padding (2px inset, border-box) is pixel-
// identical to the old 2px transparent border, so thumb position/travel is
// unchanged; checked state sets border-primary so the border color matches
// the fill and stays invisible under it, keeping that look unchanged too.
const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border border-border p-px bg-secondary ring-offset-bg transition-colors focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[length:var(--focus-ring-offset)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary",
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
