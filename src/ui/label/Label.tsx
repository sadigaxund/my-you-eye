import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Root } from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

export interface LabelProps
  extends ComponentPropsWithoutRef<typeof Root>,
    VariantProps<typeof labelVariants> {}

const Label = forwardRef<React.ComponentRef<typeof Root>, LabelProps>(
  ({ className, ...props }, ref) => (
    <Root ref={ref} className={cn(labelVariants(), className)} {...props} />
  ),
);
Label.displayName = "Label";

export { Label, labelVariants };
