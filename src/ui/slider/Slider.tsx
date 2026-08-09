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

// A `step` of 1 over the default 0–100 range means the thumb can only land
// on ~1% increments — on a typical ~200-400px track that's a jump every
// few px, which reads as low-fps/jittery dragging even though nothing is
// actually dropping frames (AGENTS.md TODO A11: this is quantization, not
// jitter). Deriving a default from the actual range gives ~500 steps
// across it regardless of what that range is, fine enough granularity
// that dragging reads as continuous on any realistic track width. Any
// caller that wants coarse, meaningful steps (e.g. an integer count 1–10)
// still passes `step` explicitly and gets exactly that.
function defaultStep(min: number, max: number): number {
  return Math.max((max - min) / 500, 0.001);
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue, size, value, min = 0, max = 100, step, ...props }, ref) => {
    const resolvedMin = Number(min);
    const resolvedMax = Number(max);
    const resolvedStep = step ?? defaultStep(resolvedMin, resolvedMax);
    return (
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
          step={resolvedStep}
          className={trackVariants({ size })}
          {...props}
        />
      </div>
    );
  },
);
Slider.displayName = "Slider";

export { Slider, trackVariants };
