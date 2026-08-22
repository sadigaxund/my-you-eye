import { forwardRef, useId } from "react";
import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Tooltip } from "../tooltip";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

const segmentedControlVariants = cva("inline-flex items-center rounded-ui border border-border bg-bg p-0.5 gap-0.5", {
  variants: {
    size: {
      xs: "h-5",
      sm: "h-7",
      md: "h-8",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

const segmentedSegmentVariants = cva(
  // Native <input type="radio"> inside the label carries the semantics and
  // the radiogroup's arrow-key model; the visible segment is this label,
  // which rings via focus-within when the hidden radio takes focus.
  "inline-flex h-full cursor-pointer select-none items-center justify-center rounded-[calc(var(--radius-ui)-3px)] px-2 text-sm text-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] outline-none hover:text-fg focus-within:ring-[length:var(--focus-ring-width)] focus-within:ring-ring focus-within:ring-inset",
  {
    variants: {
      size: {
        xs: "px-1.5 text-xs",
        sm: "px-2.5 text-sm",
        md: "px-3 text-sm",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

export interface SegmentedControlProps<T extends string>
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof segmentedControlVariants> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T | undefined;
  onValueChange?: (value: T) => void;
  /** Hide label text; each label moves into its segment's Tooltip instead.
   *  Requires <TooltipProvider> like any Tooltip usage. */
  iconOnly?: boolean;
}

function SegmentedControlInner<T extends string>(
  { options, value, onValueChange, size, className, iconOnly = false, "aria-label": ariaLabel, ...props }: SegmentedControlProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const name = useId();
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(segmentedControlVariants({ size }), className)}
      {...props}
    >
      {options.map((option) => {
        const active = option.value === value;
        const segment = (
          <label
            className={cn(
              segmentedSegmentVariants({ size }),
              active ? "bg-primary/15 font-medium text-primary" : "",
              option.disabled && "cursor-not-allowed opacity-40 hover:text-muted",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={active}
              disabled={option.disabled}
              onChange={() => onValueChange?.(option.value)}
              className="sr-only"
            />
            {option.icon && (
              <span aria-hidden="true" className="[&>svg]:size-3.5">
                {option.icon}
              </span>
            )}
            {!iconOnly && <span className="whitespace-nowrap">{option.label}</span>}
          </label>
        );
        // In iconOnly mode the label text survives as the tooltip content
        // instead of disappearing entirely (#9).
        return iconOnly ? (
          <Tooltip key={option.value} content={option.label}>
            {segment}
          </Tooltip>
        ) : (
          segment
        );
      })}
    </div>
  );
}

// Generic forwardRef wrapper: TS can't carry a component's own generic
// through forwardRef's fixed type parameters, so the inner function owns the
// generic and this cast restores it per call site (the standard pattern).
const SegmentedControlBase = forwardRef(SegmentedControlInner) as <T extends string>(
  props: SegmentedControlProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => React.JSX.Element;

export const SegmentedControl = Object.assign(
  function SegmentedControl<T extends string>(props: SegmentedControlProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }) {
    return SegmentedControlBase(props);
  },
  { displayName: "SegmentedControl" },
);

export { segmentedControlVariants };
