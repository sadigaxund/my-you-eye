import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const trackVariants = cva(
  "w-full rounded-full bg-secondary appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg [&::-webkit-slider-thumb]:shadow-card",
  {
    variants: {
      // "sm" is the compact/unlabelled track used when a Slider is composed
      // inline (e.g. CellType's AudioDisplay seek bar) rather than shown as
      // its own labelled control.
      size: {
        sm: "h-1 [&::-webkit-slider-thumb]:size-3",
        md: "h-2 [&::-webkit-slider-thumb]:size-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">, VariantProps<typeof trackVariants> {
  label?: string;
  showValue?: boolean;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue, size, value, min = 0, max = 100, step = 1, ...props }, ref) => (
    <div className={cn("flex flex-col gap-1", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm text-fg">{label}</span>}
          {showValue && <span className="text-sm text-muted font-mono">{String(value ?? 0)}</span>}
        </div>
      )}
      <input
        ref={ref}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        className={trackVariants({ size })}
        {...props}
      />
    </div>
  ),
);
Slider.displayName = "Slider";

export { Slider, trackVariants };
