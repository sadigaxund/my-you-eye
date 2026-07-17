import { forwardRef } from "react";
import { Root, Item, Indicator } from "@radix-ui/react-radio-group";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const radioVariants = cva(
  "aspect-square size-4 rounded-full border border-border bg-bg ring-offset-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary",
);

export type RadioGroupProps = React.ComponentPropsWithoutRef<typeof Root>;

const RadioGroup = forwardRef<React.ComponentRef<typeof Root>, RadioGroupProps>(
  ({ className, ...props }, ref) => (
    <Root ref={ref} className={cn("grid gap-2", className)} {...props} />
  ),
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof Item>,
    VariantProps<typeof radioVariants> {}

const RadioGroupItem = forwardRef<React.ComponentRef<typeof Item>, RadioGroupItemProps>(
  ({ className, ...props }, ref) => (
    <Item ref={ref} className={cn(radioVariants(), className)} {...props}>
      <Indicator className="flex items-center justify-center">
        <span className="size-2 rounded-full bg-primary" />
      </Indicator>
    </Item>
  ),
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem, radioVariants };
